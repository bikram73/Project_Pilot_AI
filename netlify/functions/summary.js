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
      // Get summary from cached analysis
      const cachedAnalysis = global.cachedAnalysis || {
        projectTitle: "No Analysis Available",
        projectSummary: "No analysis has been performed yet.",
        estimatedCompletion: "TBD",
        aiConfidenceOverall: 100,
        blockedTasksCount: 0,
        dependenciesCount: 0,
        objectives: [],
        keyDeliverables: []
      };
      
      const summary = {
        projectTitle: cachedAnalysis.projectTitle,
        projectSummary: cachedAnalysis.projectSummary,
        estimatedCompletion: cachedAnalysis.estimatedCompletion,
        aiConfidenceOverall: cachedAnalysis.aiConfidenceOverall,
        blockedTasksCount: cachedAnalysis.blockedTasksCount,
        dependenciesCount: cachedAnalysis.dependenciesCount,
        objectives: cachedAnalysis.objectives,
        keyDeliverables: cachedAnalysis.keyDeliverables
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
    console.error("[Netlify Summary Function Error]:", error);
    
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