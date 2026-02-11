# Voice & Vision Assistant - Accessibility Enhanced

An AI-powered web application designed specifically for visually impaired individuals to navigate train environments safely using voice commands and camera vision.

## 🆕 Latest Updates

### Security & API Improvements
- ✅ **API Key Security**: Moved OpenRouter API key from frontend to backend
- ✅ **Backend Proxy**: Created `/vision-query` endpoint to handle API calls securely
- ✅ **Environment Variables**: All sensitive keys now stored in `.env` file

### Accessibility Enhancements
- ✅ **Sound Notifications**: 
  - Two-beep success sound (800Hz + 1000Hz) when image processing completes
  - Error sound (400Hz) for failed operations
  - All key actions have audio feedback
  
- ✅ **Screen Reader Support**:
  - ARIA labels on all interactive elements
  - Live regions for dynamic content updates
  - Proper heading hierarchy
  - Role attributes for semantic structure
  
- ✅ **Keyboard Navigation**:
  - Full keyboard support (Enter/Space on all buttons)
  - Visible focus indicators
  - Skip to main content link
  
- ✅ **Voice Feedback**:
  - Slower speech rate (0.9x) for clarity
  - Auto-read responses aloud
  - Status announcements

## 🚀 Setup Instructions

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# OpenRouter API Key for vision model (REQUIRED)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Roboflow API Key (OPTIONAL - default value works fine)
ROBOFLOW_API_KEY=5XagyPRtCr1rJQzvdDwl
```

**Note**: Speech recognition uses Google's FREE service (no API key needed)!

### 2. Install Dependencies

```bash
# Install Python dependencies
pip install flask python-dotenv pydub SpeechRecognition opencv-python numpy inference-sdk requests

# Install system dependencies for audio processing
# On Ubuntu/Debian:
sudo apt-get install ffmpeg

# On macOS:
brew install ffmpeg
```

### 3. Project Structure

```
your-project/
├── app.py                      # Flask backend with secure API endpoints
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.example               # Example environment file
├── static/
│   ├── css/
│   │   └── style.css         # Accessibility-enhanced styles
│   ├── js/
│   │   └── app.js            # Frontend with sound notifications
│   └── pictures/
│       ├── fewshot1.jpg      # Training example images
│       ├── fewshot2.jpg
│       └── fewshot3.jpg
└── templates/
    └── index.html            # Accessible HTML template
```

### 4. Run the Application

**Development:**
```bash
python app.py
```

**Production:**
```bash
gunicorn app:app --bind 0.0.0.0:5000 --workers 2 --timeout 120
```

The application will be available at `http://localhost:5000`

## 🌐 Deployment

### Deploy to Render (Recommended)

This project is configured for one-click deployment to Render:

1. **Quick Deploy**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions
2. **Free Tier**: Deploy on Render's free tier with auto-scaling
3. **System Dependencies**: Automatically installs ffmpeg and OpenCV dependencies

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Key Files for Deployment:**
- `render.yaml` - Render Blueprint configuration
- `Procfile` - Process file for gunicorn
- `Aptfile` - System dependencies (ffmpeg, opencv libs)
- `runtime.txt` - Python version specification

### Other Deployment Options

- **Railway**: Similar to Render, use `Procfile`
- **Fly.io**: Create `fly.toml` configuration
- **DigitalOcean**: Use App Platform with buildpack
- **VPS**: Use nginx + gunicorn + systemd

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for complete deployment guide.

## 🔒 Security Features

### Before (Insecure)
```javascript
// ❌ API key exposed in frontend
const apiKey = 'sk-or-v1-42...';
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

### After (Secure)
```javascript
// ✅ API call goes through backend
const response = await fetch('/vision-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, temperature })
});
```

Backend handles the API key securely:
```python
# app.py
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.route('/vision-query', methods=['POST'])
def vision_query():
    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers={'Authorization': f'Bearer {OPENROUTER_API_KEY}'}
    )
```

## ♿ Accessibility Features

### Audio Feedback
- **Success Sound**: Plays when image is captured and processed
- **Error Sound**: Plays when operations fail
- **Voice Announcements**: Screen reader announces all state changes
- **Response Reading**: AI responses are automatically read aloud

### Visual Accessibility
- **High Contrast Mode**: Supports system high contrast settings
- **Reduced Motion**: Respects prefers-reduced-motion preference
- **Focus Indicators**: Clear 3px outline on focused elements
- **Large Text Support**: Scales properly with browser zoom

### Keyboard Accessibility
- **Tab Navigation**: All interactive elements are keyboard accessible
- **Enter/Space**: Activate buttons without mouse
- **Skip Link**: Jump directly to main content
- **Focus Trap**: Logical focus order throughout the app

### Screen Reader Support
- **ARIA Labels**: Descriptive labels on all controls
- **Live Regions**: Dynamic updates announced automatically
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alt Text**: All images have appropriate alt text

## 🎵 Sound Notification Details

```javascript
// Success sound (image captured/processed)
playSuccessSound(); // Two beeps: 800Hz → 1000Hz

// Error sound (operation failed)  
playErrorSound(); // Single beep: 400Hz
```

These sounds help visually impaired users know when:
- Image has been captured successfully
- Voice transcription is complete
- Send button is now enabled
- API response is ready
- Any errors occur

## 🔧 API Endpoints

### Frontend Endpoints

#### `/` (GET)
Serves the main application interface

#### `/upload` (POST)
Transcribes voice recording to text
- **Input**: Audio file (OGG format)
- **Output**: `{ "text": "transcribed text" }`

#### `/vision-query` (POST) 🆕
Securely handles OpenRouter vision API calls
- **Input**: 
  ```json
  {
    "messages": [...],
    "model": "qwen/qwen-2-vl-72b-instruct",
    "temperature": 0.3,
    "max_tokens": 150
  }
  ```
- **Output**: OpenRouter API response

#### `/query` (POST)
Processes image with Roboflow
- **Input**: Form data with `image` and `user_query`
- **Output**: `{ "response": "analysis result" }`

## 📱 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** for all API keys
3. **Implement rate limiting** on API endpoints (recommended)
4. **Use HTTPS** in production
5. **Validate all inputs** on backend
6. **Set CORS headers** appropriately

## 🐛 Common Issues

### Sound not playing
```javascript
// User must interact with page first (browser security)
// The first button click will initialize AudioContext
```

### API key errors
```bash
# Make sure .env file exists and has correct keys
# Restart Flask server after changing .env
```

### Speech synthesis not working
```javascript
// Some browsers require HTTPS for speech synthesis
// Test in development with http://localhost:5000
```

## 📝 Development Notes

### Testing Accessibility
1. **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
2. **Keyboard Only**: Navigate without mouse
3. **Color Contrast**: Use browser DevTools accessibility audit
4. **Zoom**: Test at 200% zoom level

### Adding New Features
1. Always add sound feedback for state changes
2. Include ARIA labels for new UI elements
3. Test with keyboard navigation
4. Announce changes to screen readers

## 📄 License

© 2025 Voice & Vision Assistant | All Rights Reserved

## 🤝 Contributing

When contributing, please ensure:
- All new features have accessibility support
- API keys remain secure in backend
- Sound feedback is added for user actions
- ARIA labels are included
- Keyboard navigation works properly

## 📞 Support

For issues or questions:
1. Check the Common Issues section
2. Review browser console for errors
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly
