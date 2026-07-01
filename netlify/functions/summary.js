// Netlify Function for /api/summary endpoint
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
      // Return summary from cached analysis
      const cachedAnalysis = global.cachedAnalysis || {};
      
      const summary = {
        projectTitle: cachedAnalysis.projectTitle || "Project Overview",
        projectSummary: cachedAnalysis.projectSummary || "No summary available.",
        estimatedCompletion: cachedAnalysis.estimatedCompletion || "TBD",
        aiConfidenceOverall: cachedAnalysis.aiConfidenceOverall || 100,
        blockedTasksCount: cachedAnalysis.blockedTasksCount || 0,
        dependenciesCount: cachedAnalysis.dependenciesCount || 0,
        objectives: cachedAnalysis.objectives || [],
        keyDeliverables: cachedAnalysis.keyDeliverables || []
      };
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(summary),
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
    console.error("[Netlify Function Error]:", error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal Server Error' 
      }),
    };
  }
};