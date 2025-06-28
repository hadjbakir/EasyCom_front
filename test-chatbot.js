// Simple test script for the chatbot API
// Run this with: node test-chatbot.js

const testChatbotAPI = async () => {
  const baseURL = 'http://localhost:3000';

  try {
    // Test 1: Check if API is running
    console.log('🧪 Testing chatbot API...');

    const healthCheck = await fetch(`${baseURL}/api/chatbot`, {
      method: 'GET',
    });

    if (healthCheck.ok) {
      console.log('✅ API health check passed');
    } else {
      console.log('❌ API health check failed');
      return;
    }

    // Test 2: Send a test message
    console.log('📤 Sending test message...');

    const testMessage = {
      message: 'Hello, how can you help me with the EasyCom platform?',
      chatHistory: []
    };

    const response = await fetch(`${baseURL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test message sent successfully');
      console.log('🤖 AI Response:', data.message);
      console.log('⏰ Timestamp:', data.timestamp);
    } else {
      const errorData = await response.json();
      console.log('❌ Test message failed:', errorData.error);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('💡 Make sure the development server is running on port 3000');
  }
};

// Run the test
testChatbotAPI();
