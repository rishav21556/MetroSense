# 🔑 API Keys Guide - CORRECTED

## ⚠️ IMPORTANT: You Only Need 1 API Key!

**Your app uses Google's FREE Speech Recognition**, not OpenAI!

## What You Actually Need

### ✅ REQUIRED: OpenRouter API Key

**Purpose:** Powers the AI vision model that analyzes images  
**Cost:** Pay-as-you-go (~$0.02-0.10 per query)  
**Free Credits:** $1-5 for new accounts

**How to get it:**
1. Go to https://openrouter.ai/
2. Sign up (use Google/GitHub for quick signup)
3. Click on your profile → **Keys**
4. Click **"Create Key"**
5. Copy the key (starts with `sk-or-v1-...`)

**Example format:** `sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz...`

---

### ⚙️ OPTIONAL: Roboflow API Key

**Purpose:** Object detection (doors, seats, people)  
**Default:** Already configured with `5XagyPRtCr1rJQzvdDwl`  
**Cost:** FREE tier (1,000 calls/month)

**Only get this if:**
- You want to use your own Roboflow workspace
- You need more than 1,000 calls/month

**How to get it:**
1. Go to https://app.roboflow.com/
2. Sign up (free account)
3. Go to **Settings** → **Roboflow API**
4. Copy your API Key

---

### ❌ NOT NEEDED: OpenAI API Key

**You DON'T need this!**

Your app uses **Google Speech Recognition** which is:
- ✅ Completely FREE
- ✅ No API key required
- ✅ Already configured in your code

```python
# Your code uses this (FREE):
text = recognizer.recognize_google(audio_data)

# NOT this (paid):
# text = recognizer.recognize_whisper(audio_data, api_key=OPENAI_API_KEY)
```

---

## 📝 Your `.env` File

**Minimal setup (just 1 required key):**

```dotenv
# REQUIRED: Get from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-paste_your_actual_key_here

# OPTIONAL: Default works fine
ROBOFLOW_API_KEY=5XagyPRtCr1rJQzvdDwl
```

---

## 💰 Total Cost

| Service | Cost | Required? |
|---------|------|-----------|
| **Google Speech Recognition** | FREE | ✅ Auto-configured |
| **OpenRouter (Vision AI)** | ~$0.05/query | ✅ Need API key |
| **Roboflow** | FREE (1k/month) | ⚙️ Optional |

**Per session cost:** ~$0.05 - $0.15 (just OpenRouter)

---

## 🚀 Quick Setup

1. **Get OpenRouter API key** from https://openrouter.ai/keys
2. **Create `.env` file:**
   ```bash
   copy .env.example .env
   ```
3. **Edit `.env` and paste your OpenRouter key**
4. **Run the app:**
   ```bash
   python app.py
   ```

That's it! Speech recognition will work automatically (FREE via Google).

---

## 🆘 Troubleshooting

### "OPENROUTER_API_KEY is not set"
- Make sure you created `.env` file
- Check you pasted the key correctly
- Restart Flask after creating `.env`

### "Speech recognition failed"
- No API key needed!
- Check your internet connection (Google API requires internet)
- Check microphone permissions in browser

### Want to use OpenAI Whisper instead?
You CAN switch to OpenAI Whisper if you want better accuracy:
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Add to `.env`: `OPENAI_API_KEY=sk-proj-...`
3. Modify `app.py` line 54 to use `recognize_whisper()` instead

But the FREE Google option works great for most cases!

---

## Summary

✅ **You only need 1 API key:** OpenRouter  
✅ **Speech recognition is FREE** (Google)  
✅ **Roboflow is optional** (has working default)  
❌ **OpenAI API key NOT required**

**My apology for the confusion!** I incorrectly added OpenAI to the requirements. Your original code was already using the free option! 🎉
