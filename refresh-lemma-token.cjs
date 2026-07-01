// Simple script to refresh Lemma token with SSL verification disabled
const https = require('https');
const { execSync } = require('child_process');

// Disable SSL verification for this script
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

async function refreshLemmaToken() {
  try {
    console.log("🔄 Attempting to refresh Lemma token...");
    
    // Try to get a fresh token
    const result = execSync('lemma auth print-token', { 
      encoding: 'utf8',
      env: { 
        ...process.env, 
        NODE_TLS_REJECT_UNAUTHORIZED: "0",
        PYTHONHTTPSVERIFY: "0" 
      }
    });
    
    console.log("✅ Fresh Lemma token obtained:");
    console.log(result.trim());
    
    return result.trim();
    
  } catch (error) {
    console.error("❌ Failed to refresh Lemma token:", error.message);
    
    // If refresh fails, try to use existing token for testing
    console.log("⚠️ Using existing token. If chat fails, manually update the token.");
    return null;
  }
}

// Test the token works
async function testLemmaConnection() {
  try {
    const token = process.env.LEMMA_SESSION_TOKEN;
    if (!token) {
      console.log("❌ No LEMMA_SESSION_TOKEN found in environment");
      return false;
    }
    
    console.log("🧪 Testing Lemma connection...");
    
    // Create a simple HTTP request to test the token
    const options = {
      hostname: 'api.lemma.work',
      port: 443,
      path: '/pods/019f0d4a-33ad-75da-bc5d-43561cba9491',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      rejectUnauthorized: false // Disable SSL verification
    };
    
    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        console.log(`✅ Lemma API responded with status: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 401) {
          resolve(res.statusCode === 200);
        } else {
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        console.error('❌ Connection error:', error.message);
        resolve(false);
      });
      
      req.setTimeout(10000, () => {
        console.error('❌ Request timeout');
        resolve(false);
      });
      
      req.end();
    });
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Lemma Token Refresh Utility\n");
  
  // Test current connection
  const isWorking = await testLemmaConnection();
  
  if (isWorking) {
    console.log("✅ Current Lemma token is working fine!");
    console.log("💡 The issue might be with the Gemini API key instead.");
  } else {
    console.log("❌ Current Lemma token is not working.");
    
    // Try to refresh
    const newToken = await refreshLemmaToken();
    
    if (newToken) {
      console.log("\n📝 Update your .env file with this new token:");
      console.log(`LEMMA_SESSION_TOKEN="${newToken}"`);
    }
  }
  
  console.log("\n🔑 Don't forget to get a valid Gemini API key from:");
  console.log("   https://makersuite.google.com/app/apikey");
}

main().catch(console.error);