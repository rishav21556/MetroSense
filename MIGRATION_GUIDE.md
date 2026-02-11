# Migration Guide: Upgrading to Secure & Accessible Version

## Overview
This guide will help you migrate from the old version (with exposed API keys) to the new secure and accessible version.

## 📋 Pre-Migration Checklist

- [ ] Backup your current code
- [ ] Note your current API keys
- [ ] Install new dependencies
- [ ] Create `.env` file

## 🔧 Step-by-Step Migration

### Step 1: Update Dependencies

```bash
# No new dependencies required!
# Existing dependencies work fine
pip install flask python-dotenv pydub SpeechRecognition opencv-python numpy inference-sdk requests
```

### Step 2: Create Environment File

Create a new file called `.env` in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=sk-or-v1-42...  # YOUR OLD API KEY FROM app.js LINE 411
ROBOFLOW_API_KEY=5XagyPRtCr1rJQzvdDwl
```

**IMPORTANT**: Copy your API key from the old `app.js` file (around line 411) into the `.env` file!

### Step 3: Replace Backend File

Replace your `app.py` with the new version that includes the `/vision-query` endpoint.

**Key Changes:**
```python
# NEW: Import os for environment variables
import os

# NEW: Load environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# NEW: Secure API endpoint
@app.route('/vision-query', methods=['POST'])
def vision_query():
    # Handles OpenRouter API calls securely
    ...
```

### Step 4: Replace Frontend Files

Replace these files:
- `static/js/app.js` - Now calls backend instead of OpenRouter directly
- `static/css/style.css` - Adds accessibility styles
- `templates/index.html` - Adds ARIA labels and semantic HTML

### Step 5: Test the Migration

1. **Start the server:**
   ```bash
   python app.py
   ```

2. **Check for errors:**
   - If you see "OPENROUTER_API_KEY is not set", check your `.env` file
   - Make sure `.env` is in the same directory as `app.py`

3. **Test functionality:**
   - [ ] Record voice → Should transcribe with success beep
   - [ ] Capture image → Should show preview with success beep  
   - [ ] Send query → Should get AI response with voice readout
   - [ ] Test keyboard navigation (Tab key)
   - [ ] Test with screen reader if available

## 🎯 What Changed?

### Security Changes

#### Before (Insecure ❌)
```javascript
// app.js - LINE 411
const apiKey = 'sk-or-v1-42...';  // EXPOSED TO USERS!

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    headers: {
        'Authorization': `Bearer ${apiKey}`,  // VISIBLE IN BROWSER!
    }
});
```

#### After (Secure ✅)
```javascript
// app.js - Calls backend
const response = await fetch('/vision-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, temperature })
});
```

```python
# app.py - Secure backend
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")  # FROM .env FILE

@app.route('/vision-query', methods=['POST'])
def vision_query():
    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers={'Authorization': f'Bearer {OPENROUTER_API_KEY}'}
    )
```

### Accessibility Changes

#### Sound Notifications
```javascript
// NEW: Success sound when image is processed
playSuccessSound();  // Two beeps: 800Hz → 1000Hz

// NEW: Error sound for failures
playErrorSound();  // Single beep: 400Hz

// NEW: Screen reader announcements
announceToScreenReader('Image captured successfully');
```

#### ARIA Labels
```html
<!-- Before -->
<button class="mic-button">
    <i class="fas fa-microphone"></i>
</button>

<!-- After -->
<button 
    class="mic-button" 
    aria-label="Start recording your voice"
    aria-describedby="mic-description">
    <i class="fas fa-microphone" aria-hidden="true"></i>
</button>
```

#### Keyboard Support
```javascript
// NEW: Keyboard events for all buttons
micButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        micButton.click();
    }
});
```

## ⚠️ Breaking Changes

### 1. API Key Location
- **Old**: Hardcoded in `app.js` line 411
- **New**: In `.env` file as `OPENROUTER_API_KEY`

### 2. OpenRouter API Calls
- **Old**: Direct fetch from frontend
- **New**: Proxied through `/vision-query` endpoint

### 3. File Structure
```
# Old structure
your-project/
├── app.py
├── static/
│   ├── css/style.css
│   └── js/app.js
└── templates/
    └── index.html

# New structure (added)
your-project/
├── app.py                 # UPDATED
├── .env                   # NEW - REQUIRED!
├── .env.example          # NEW
├── .gitignore            # NEW - IMPORTANT!
├── README.md             # NEW
├── static/
│   ├── css/style.css     # UPDATED
│   └── js/app.js         # UPDATED  
└── templates/
    └── index.html        # UPDATED
```

## 🔍 Verification Steps

After migration, verify these features work:

### Security Verification
```bash
# 1. Check .env file exists and has API key
cat .env | grep OPENROUTER_API_KEY

# 2. Make sure .gitignore includes .env
cat .gitignore | grep .env

# 3. Test API key is NOT in frontend
# Open browser DevTools → Network tab
# Look for any requests with Authorization header
# ✅ Should only see requests to /vision-query (no auth header visible)
```

### Accessibility Verification
1. **Sound**: Capture image → Should hear two beeps
2. **Keyboard**: Press Tab → Should see focus indicators
3. **Screen Reader**: Enable VoiceOver/NVDA → Should announce actions
4. **Voice**: Send query → Should hear AI response automatically

## 🚨 Common Migration Issues

### Issue 1: "OPENROUTER_API_KEY is not set"
**Solution:**
```bash
# Make sure .env file exists in project root
ls -la | grep .env

# Check the file content
cat .env

# Restart Flask server after creating .env
```

### Issue 2: Sound not playing
**Solution:**
```javascript
// Browser needs user interaction first
// Click any button on the page to initialize AudioContext
// Then sounds will work
```

### Issue 3: API calls failing
**Solution:**
```bash
# Check Flask console for errors
# Verify API key is correct in .env
# Test API key manually:
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen/qwen-2-vl-72b-instruct","messages":[{"role":"user","content":"test"}]}'
```

### Issue 4: Screen reader not announcing
**Solution:**
- Enable screen reader (NVDA on Windows, VoiceOver on Mac)
- Check browser console for errors
- Verify `aria-live` regions are present in HTML

## 📊 Comparison Table

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| API Key Storage | Frontend (exposed) | Backend (.env) |
| API Calls | Direct to OpenRouter | Through backend proxy |
| Sound Feedback | ❌ None | ✅ Success/Error beeps |
| Screen Reader | ❌ Limited | ✅ Full ARIA support |
| Keyboard Nav | ❌ Partial | ✅ Complete |
| Voice Feedback | ❌ None | ✅ Auto-read responses |
| Security | ⚠️ Low | ✅ High |
| Accessibility | ⚠️ Basic | ✅ WCAG 2.1 AA |

## ✅ Post-Migration Checklist

- [ ] `.env` file created with all API keys
- [ ] `.gitignore` includes `.env`
- [ ] Server starts without errors
- [ ] Voice recording works with beep sound
- [ ] Image capture works with beep sound
- [ ] Send query works with voice readout
- [ ] Keyboard navigation functional
- [ ] No API keys visible in browser DevTools
- [ ] Removed old `app.js` with exposed API key
- [ ] Tested with screen reader (optional but recommended)

## 🎉 Migration Complete!

Your application is now:
- ✅ **Secure**: API keys hidden in backend
- ✅ **Accessible**: Full screen reader and keyboard support
- ✅ **User-friendly**: Sound feedback for visually impaired users
- ✅ **Production-ready**: Follow security best practices

## 📚 Next Steps

1. **Deploy to production**: Use gunicorn + nginx
2. **Add HTTPS**: Required for camera access in production
3. **Set up monitoring**: Track API usage and errors
4. **User testing**: Test with actual visually impaired users
5. **Documentation**: Share README.md with your team

## 💡 Tips

- Always test in incognito mode to verify caching issues
- Use browser DevTools → Lighthouse for accessibility audit
- Keep `.env` out of version control
- Consider adding rate limiting to `/vision-query` endpoint
- Monitor your OpenRouter API usage

---

**Need help?** Check the README.md or common issues section!
