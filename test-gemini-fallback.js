// Test script to verify Gemini fallback functionality
const { analyzeWithGemini, chatWithGemini } = require("./dist/server/services/gemini.js");

async function testGeminiAnalysis() {
  console.log("🧪 Testing Gemini Analysis Fallback...");
  
  try {
    // Test analysis with sample data
    const samplePayload = {
      text: `Meeting Notes - Project Alpha Launch
      
Tasks identified:
- John will complete the API integration by Friday
- Sarah needs to finish the UI components by Thursday  
- Mike should deploy the database changes by Wednesday

Risks:
- API rate limits might cause issues
- UI design approval is pending

Timeline: Complete by end of next week`,
      file: null
    };

    console.log("📊 Calling Gemini analysis...");
    const result = await analyzeWithGemini(samplePayload);
    
    console.log("✅ Analysis successful!");
    console.log("📈 Project Title:", result.projectTitle);
    console.log("📝 Tasks Found:", result.tasks?.length || 0);
    console.log("⚠️ Risks Found:", result.risks?.length || 0);
    console.log("💡 Recommendations:", result.recommendations?.length || 0);
    
    return true;
  } catch (error) {
    console.error("❌ Analysis failed:", error.message);
    return false;
  }
}

async function testGeminiChat() {
  console.log("💬 Testing Gemini Chat Fallback...");
  
  try {
    const sampleProjectData = {
      projectTitle: "Project Alpha Launch",
      tasks: [
        { name: "API Integration", owner: "John", deadline: "Friday" }
      ]
    };
    
    const reply = await chatWithGemini(
      "What are the main risks for this project?",
      sampleProjectData,
      []
    );
    
    console.log("✅ Chat successful!");
    console.log("🤖 AI Response length:", reply.length, "characters");
    
    return true;
  } catch (error) {
    console.error("❌ Chat failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Gemini Fallback Tests...\n");
  
  const analysisResult = await testGeminiAnalysis();
  console.log("");
  const chatResult = await testGeminiChat();
  
  console.log("\n📊 Test Results:");
  console.log("Analysis:", analysisResult ? "✅ PASS" : "❌ FAIL");
  console.log("Chat:", chatResult ? "✅ PASS" : "❌ FAIL");
  
  if (analysisResult && chatResult) {
    console.log("\n🎉 All Gemini fallback tests passed!");
  } else {
    console.log("\n⚠️ Some tests failed. Check the Gemini API key configuration.");
  }
}

// Run tests only if GEMINI_API_KEY is configured
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
  main().catch(console.error);
} else {
  console.log("⚠️ GEMINI_API_KEY not configured. Please set your API key in .env file.");
  console.log("Get your key from: https://makersuite.google.com/app/apikey");
}