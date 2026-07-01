// Test the polling approach
const testPayload = {
  text: "Test analysis: John finishes API by Tuesday. Mary handles frontend. Risk: deployment issues."
};

console.log("🚀 Starting background analysis...");

// Start analysis in background
fetch('http://127.0.0.1:3000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
}).catch(err => {
  console.log("Background request initiated (errors expected)");
});

console.log("🔄 Starting polling...");

// Poll for results
let attempts = 0;
const maxAttempts = 20;

const pollForResults = async () => {
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`🔍 Polling attempt ${attempts}/${maxAttempts}...`);
    
    try {
      const res = await fetch('http://127.0.0.1:3000/api/analyze/latest');
      if (res.ok) {
        const data = await res.json();
        console.log(`📊 Mode: ${data._analysisMode}, Tasks: ${data.tasks?.length || 0}, Risks: ${data.risks?.length || 0}`);
        
        if (data._analysisMode === "lemma" && 
            (data.tasks?.length > 0 || data.risks?.length > 0)) {
          console.log("✅ SUCCESS! Found fresh Lemma results:");
          console.log("  - Tasks:", data.tasks?.length || 0);
          console.log("  - Risks:", data.risks?.length || 0);
          console.log("  - Summary:", data.projectSummary?.substring(0, 100) + "...");
          return;
        }
      }
    } catch (pollError) {
      console.log(`Polling error: ${pollError.message}`);
    }
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log("❌ Polling timed out");
};

pollForResults();