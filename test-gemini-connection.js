// Test script to verify Gemini API connection
// Run this with: node test-gemini-connection.js

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBsVdG5KKbVoJYCiO96NnpFTB9phPl0uKs';

const testGeminiConnection = async () => {
  console.log('🧪 Testing Gemini API connection...');

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Test 1: List available models
    console.log('📋 Checking available models...');
    const models = await genAI.listModels();
    console.log('✅ Available models:', models.models.map(m => m.name));

    // Test 2: Try to use gemini-2.0-flash
    console.log('🤖 Testing gemini-2.0-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent('Hello, can you respond with "Test successful"?');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Model test successful!');
    console.log('🤖 Response:', text);

    // Test 3: Try chat functionality
    console.log('💬 Testing chat functionality...');
    const chat = model.startChat();
    const chatResult = await chat.sendMessage('Say "Chat test successful"');
    const chatResponse = await chatResult.response;
    const chatText = chatResponse.text();

    console.log('✅ Chat test successful!');
    console.log('🤖 Chat response:', chatText);

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.message?.includes('404')) {
      console.log('💡 The model name might be incorrect. Try these alternatives:');
      console.log('   - gemini-pro');
      console.log('   - gemini-1.5-pro');
      console.log('   - gemini-1.5-flash');
      console.log('   - gemini-2.0-flash');
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      console.log('💡 API key might be invalid or expired');
    } else if (error.message?.includes('429')) {
      console.log('💡 Rate limit exceeded. Try again later');
    }
  }
};

// Run the test
testGeminiConnection();
