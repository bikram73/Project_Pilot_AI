// Simple Lemma test function for Netlify
const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('[Test] Environment variables check:');
    console.log('LEMMA_POD_ID:', process.env.LEMMA_POD_ID ? 'SET' : 'MISSING');
    console.log('LEMMA_SESSION_TOKEN length:', process.env.LEMMA_SESSION_TOKEN?.length || 0);
    console.log('LEMMA_API_URL:', process.env.LEMMA_API_URL);

    if (!process.env.LEMMA_POD_ID || !process.env.LEMMA_SESSION_TOKEN) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'Missing environment variables',
          debug: {
            podId: process.env.LEMMA_POD_ID ? 'SET' : 'MISSING',
            token: process.env.LEMMA_SESSION_TOKEN ? 'SET' : 'MISSING'
          }
        })
      };
    }

    // Simple API test - just try to create a workflow run
    const apiUrl = process.env.LEMMA_API_URL || 'https://api.lemma.work';
    const podId = process.env.LEMMA_POD_ID;
    const workflowName = 'project-analysis-workflow';
    const token = process.env.LEMMA_SESSION_TOKEN;

    const createUrl = `${apiUrl}/pods/${podId}/workflows/${workflowName}/runs`;
    
    console.log('[Test] Attempting to create workflow run at:', createUrl);

    const result = await new Promise((resolve, reject) => {
      const url = new URL(createUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ProjectPilot-Test/1.0'
        },
        rejectUnauthorized: false
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('[Test] Response status:', res.statusCode);
          console.log('[Test] Response data:', data);
          
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, data: parsed, status: res.statusCode });
            } else {
              resolve({ success: false, error: data, status: res.statusCode });
            }
          } catch (e) {
            resolve({ success: false, error: data, status: res.statusCode });
          }
        });
      });

      req.on('error', error => {
        console.log('[Test] Request error:', error.message);
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(10000, () => {
        console.log('[Test] Request timeout');
        resolve({ success: false, error: 'Timeout' });
      });

      req.end();
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        test: 'lemma-api',
        config: {
          apiUrl,
          podId,
          workflowName,
          tokenLength: token.length
        },
        result
      })
    };

  } catch (error) {
    console.error('[Test] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};