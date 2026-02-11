# Quick Start Guide

Get the Voice & Vision Assistant running in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A webcam and microphone
- API keys (OpenRouter, OpenAI)

## Installation Steps

### 1. Extract the Project
```bash
unzip voice-vision-assistant.zip
cd voice-vision-assistant
```

### 2. Create Virtual Environment (Recommended)
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install System Dependencies
```bash
# On Ubuntu/Debian
sudo apt-get install ffmpeg

# On macOS
brew install ffmpeg

# On Windows
# Download ffmpeg from https://ffmpeg.org/download.html
# Add to PATH
```

### 5. Configure Environment Variables

**Create a `.env` file** in the project root:
```bash
cp .env.example .env
```

**Edit `.env` and add your API keys:**
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
ROBOFLOW_API_KEY=your_roboflow_api_key_here
```

### 6. Add Few-Shot Images (Optional but Recommended)

Place your example images in `static/pictures/`:
- `fewshot1.jpg`
- `fewshot2.jpg`
- `fewshot3.jpg`

See `static/pictures/README.md` for details.

### 7. Run the Application

```bash
# Development mode
python app.py

# Production mode (recommended)
gunicorn --bind 0.0.0.0:5000 app:app
```

### 8. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Quick Test

1. **Click the microphone button** - Record "What do you see?"
2. **Click "Take Picture"** - Capture an image
3. **Click "Send Query"** - Wait for AI response
4. Listen for the success beep sounds!

## Troubleshooting

### "Module not found" errors
```bash
pip install -r requirements.txt
```

### "API key not set" errors
```bash
# Make sure .env file exists
ls -la .env

# Check it has your keys
cat .env
```

### Camera/Microphone not working
- Allow browser permissions when prompted
- Use HTTPS in production (required for camera)
- Test in Chrome/Edge for best compatibility

### No sound notifications
- Click any button first to initialize AudioContext
- Check browser console for errors
- Ensure volume is on

## Next Steps

1. Read the full `README.md` for detailed documentation
2. Check `MIGRATION_GUIDE.md` if upgrading from old version
3. Test with screen reader (NVDA/VoiceOver) for accessibility
4. Deploy to production with HTTPS

## Get Help

- Check browser console (F12) for errors
- Review logs in terminal where Flask is running
- Ensure all dependencies are installed
- Verify API keys are correct

## File Structure
```
voice-vision-assistant/
├── app.py                          # Flask backend
├── requirements.txt                # Python dependencies
├── .env.example                   # Example environment file
├── .env                           # Your API keys (create this)
├── .gitignore                     # Git ignore rules
├── README.md                      # Full documentation
├── MIGRATION_GUIDE.md             # Upgrade guide
├── QUICKSTART.md                  # This file
├── static/
│   ├── css/
│   │   └── style.css             # Styles
│   ├── js/
│   │   └── app.js                # Frontend logic
│   └── pictures/
│       ├── README.md             # Instructions
│       ├── fewshot1.jpg          # Add your images
│       ├── fewshot2.jpg
│       └── fewshot3.jpg
└── templates/
    └── index.html                # Main page
```

## Success! 🎉

Your Voice & Vision Assistant is now running! Test all features and ensure accessibility features work properly.
