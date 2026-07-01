// Netlify Function for /api/health endpoint

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        deployment: "netlify",
        functions: {
          analyze: "available",
          chat: "available",
          tasks: "available",
          risks: "available",
          summary: "available"
        },
        integrations: {
          lemma: process.env.LEMMA_POD_ID && process.env.LEMMA_SESSION_TOKEN ? "configured" : "not_configured",
          gemini: process.env.GEMINI_API_KEY ? "configured" : "not_configured"
        }
      };
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(health),
      };
    }

    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };

  } catch (error) {
    console.error("[Netlify Health Function Error]:", error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        status: "unhealthy"
      }),
    };
  }
};