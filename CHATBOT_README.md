# EasyCom Chatbot with Gemini AI

This chatbot integration provides an AI-powered assistant for your EasyCom e-commerce platform using Google's Gemini AI.

## Features

- 🤖 **AI-Powered Responses**: Uses Google Gemini AI for intelligent responses
- 💬 **Real-time Chat**: Interactive chat interface with message history
- 🎨 **Modern UI**: Material-UI based design that matches your platform theme
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔄 **Chat History**: Maintains conversation context
- ⚡ **Quick Questions**: Pre-defined quick question chips for common queries
- 🔧 **Customizable**: Easy to modify and extend

## Components Structure

```
src/
├── components/
│   └── Chatbot/
│       ├── index.js
│       └── ChatbotWidget.jsx
├── hooks/
│   └── useChatbot.js
├── services/
│   └── geminiService.js
└── app/
    └── api/
        └── chatbot/
            └── route.js
```

## Installation & Setup

The chatbot is already integrated into your platform. Here's what was added:

### 1. Dependencies
The `@google/generative-ai` package is already installed in your `package.json`.

### 2. API Key Configuration
The Gemini API key is configured in:
- `src/services/geminiService.js`
- `src/app/api/chatbot/route.js`

**Important**: For production, move the API key to environment variables:

```javascript
// In .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

// In the code
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
```

### 3. Integration
The chatbot is automatically available on all pages through the root layout (`src/app/[lang]/layout.jsx`).

## Usage

### For Users
1. Click the chat icon (bottom-right corner) to open the chatbot
2. Type your question or select a quick question chip
3. The AI will respond with helpful information about the platform
4. Use the refresh button to start a new conversation

### For Developers

#### Customizing the Chatbot

1. **Modify Platform Context** (`src/services/geminiService.js`):
```javascript
const PLATFORM_CONTEXT = `
  // Update this with your specific platform information
  You are a helpful AI assistant for [Your Platform Name]...
`;
```

2. **Add Quick Questions** (`src/components/Chatbot/ChatbotWidget.jsx`):
```javascript
const quickQuestions = [
  'Your custom question 1',
  'Your custom question 2',
  // Add more questions
];
```

3. **Customize Styling**:
The chatbot uses Material-UI theming. You can customize colors, spacing, and layout by modifying the styled components.

#### Adding New Features

1. **Voice Input**: Integrate with Web Speech API
2. **File Upload**: Add support for image/product uploads
3. **Multi-language**: Add translation support
4. **Analytics**: Track user interactions

#### API Endpoints

- `POST /api/chatbot`: Send a message and get AI response
- `GET /api/chatbot`: Check if the API is running

#### Example API Usage

```javascript
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'How do I place an order?',
    chatHistory: [] // Optional: previous messages for context
  }),
});

const data = await response.json();
console.log(data.message); // AI response
```

## Configuration Options

### Gemini AI Settings
You can modify the AI behavior in `src/services/geminiService.js`:

```javascript
generationConfig: {
  maxOutputTokens: 500,    // Maximum response length
  temperature: 0.7,        // Creativity level (0-1)
  topP: 0.8,              // Response diversity
  topK: 40,               // Token selection
}
```

### UI Customization
Modify the chatbot appearance in `src/components/Chatbot/ChatbotWidget.jsx`:

```javascript
// Change position
const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),  // Adjust position
  right: theme.spacing(3),   // Adjust position
  // ... other styles
}));

// Change size
PaperProps={{
  sx: {
    borderRadius: 3,
    height: '600px',        // Adjust height
    maxHeight: '80vh',      // Adjust max height
  },
}}
```

## Security Considerations

1. **API Key Protection**: Move API keys to environment variables
2. **Rate Limiting**: Implement rate limiting for the API endpoint
3. **Input Validation**: Validate user inputs before sending to AI
4. **Content Filtering**: Add content filtering for inappropriate requests

## Troubleshooting

### Common Issues

1. **Chatbot not appearing**:
   - Check if the component is properly imported in the layout
   - Verify no console errors

2. **API errors**:
   - Check if the API key is valid
   - Verify the API endpoint is accessible
   - Check network connectivity

3. **Styling issues**:
   - Ensure Material-UI theme is properly configured
   - Check for CSS conflicts

### Debug Mode

Add debug logging to the chatbot:

```javascript
// In useChatbot.js
console.log('Sending message:', messageText);
console.log('API response:', data);
```

## Performance Optimization

1. **Message Caching**: Cache common responses
2. **Lazy Loading**: Load chatbot only when needed
3. **Debouncing**: Debounce user input to reduce API calls
4. **Connection Pooling**: Reuse API connections

## Future Enhancements

- [ ] Voice input/output
- [ ] Multi-language support
- [ ] File/image upload
- [ ] User authentication integration
- [ ] Conversation analytics
- [ ] Custom AI training
- [ ] Integration with help desk systems

## Support

For issues or questions about the chatbot integration:
1. Check the console for error messages
2. Verify API key and network connectivity
3. Review the configuration settings
4. Test with simple questions first

## License

This chatbot integration is part of the EasyCom platform and follows the same licensing terms. 
