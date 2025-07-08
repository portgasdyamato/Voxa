// Quick test to see if API is working
const API_URL = 'https://voxa-970tyo7lx-portgasdyamatos-projects.vercel.app';

async function testAPI() {
  try {
    console.log('Testing public API...');
    
    // Test public tasks endpoint
    const tasksResponse = await fetch(`${API_URL}/api/public-tasks`);
    console.log('Public tasks status:', tasksResponse.status);
    console.log('Public tasks headers:', Object.fromEntries(tasksResponse.headers));
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('Public tasks data:', tasksData);
      console.log('Number of tasks:', tasksData.length);
    } else {
      const tasksText = await tasksResponse.text();
      console.log('Public tasks response (first 500 chars):', tasksText.substring(0, 500));
    }
    
    // Test creating a task
    console.log('\nTesting task creation...');
    const newTaskData = {
      title: 'Test Task from API',
      description: 'This is a test task created via the API',
      priority: 'high',
      completed: false
    };
    
    const createResponse = await fetch(`${API_URL}/api/public-tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTaskData)
    });
    
    console.log('Create task status:', createResponse.status);
    if (createResponse.ok) {
      const newTask = await createResponse.json();
      console.log('New task created:', newTask);
    } else {
      const errorText = await createResponse.text();
      console.log('Create task error:', errorText);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
