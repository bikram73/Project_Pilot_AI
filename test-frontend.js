// Simple test to mimic the frontend API call
const testPayload = {
  text: `Meeting Notes: Sprint Review
- Sarah completed user authentication module 
- Mike needs to fix database connection issues by Wednesday
- Lisa is blocked on API documentation 
Risks: Server capacity concerns for launch
Next steps: Deploy to staging environment this week`
};

fetch('http://127.0.0.1:3000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Frontend test - Analysis completed successfully');
  console.log('📊 Project Title:', data.projectTitle);
  console.log('📋 Tasks count:', data.tasks?.length || 0);
  console.log('⚠️  Risks count:', data.risks?.length || 0);
  console.log('💡 Recommendations count:', data.recommendations?.length || 0);
  console.log('🎯 Analysis Mode:', data._analysisMode);
  
  if (data.tasks?.length > 0) {
    console.log('📝 First task:', data.tasks[0]);
  }
  if (data.risks?.length > 0) {
    console.log('⚠️  First risk:', data.risks[0]);
  }
})
.catch(error => {
  console.error('❌ Frontend test failed:', error);
});