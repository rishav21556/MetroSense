# Installation Guide - Python Version Compatibility

## ⚠️ Python Version Issue Detected

You're using **Python 3.14** which is very new. Some packages don't have pre-built wheels for Python 3.14 yet.

## 🔧 Solution: Choose Your Python Version

### Option 1: Use Python 3.14 (Latest) ✨

**Update your requirements.txt:**

```bash
# In your voice-vision-assistant folder
# Replace requirements.txt with these updated versions:

Flask==3.1.0
python-dotenv==1.0.1
pydub==0.25.1
SpeechRecognition==3.10.4
opencv-python==4.10.0.84
numpy>=1.26.0
inference-sdk==0.23.0
requests==2.32.3
gunicorn==23.0.0
```

**Then install:**
```bash
pip install -r requirements.txt
```

### Option 2: Use Python 3.11 or 3.12 (Recommended) ⭐

**Download Python 3.12:**
- Visit: https://www.python.org/downloads/
- Download Python 3.12.x
- Install it

**Create virtual environment with Python 3.12:**
```bash
# Navigate to your project
cd D:\Projects\voice-vision-assistant

# Create venv with Python 3.12
py -3.12 -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies (use original requirements.txt)
pip install -r requirements.txt
```

## 📋 Step-by-Step Fix for Your Current Setup

### Quick Fix (Update requirements.txt):

1. **Open `requirements.txt` in your voice-vision-assistant folder**

2. **Replace ALL content with this:**
```txt
Flask==3.1.0
python-dotenv==1.0.1
pydub==0.25.1
SpeechRecognition==3.10.4
opencv-python==4.10.0.84
numpy>=1.26.0
inference-sdk==0.23.0
requests==2.32.3
gunicorn==23.0.0
```

3. **Save the file**

4. **Install again:**
```bash
pip install -r requirements.txt
```

## 🐛 If Still Getting Errors

### Error: "Cannot import 'setuptools.build_meta'"

**Fix:**
```bash
# Upgrade pip and setuptools first
python -m pip install --upgrade pip setuptools wheel

# Then try again
pip install -r requirements.txt
```

### Error: Building numpy from source

**Fix 1 - Use pre-built wheels:**
```bash
pip install --only-binary :all: -r requirements.txt
```

**Fix 2 - Install Visual Studio Build Tools (Windows):**
- Download: https://visualstudio.microsoft.com/downloads/
- Install "Desktop development with C++"
- Restart computer
- Try installing again

### Error: opencv-python installation fails

**Fix:**
```bash
# Install opencv-python separately first
pip install opencv-python-headless==4.10.0.84

# Then install rest
pip install -r requirements.txt
```

## ✅ Verification After Installation

**Test if packages installed correctly:**
```bash
python -c "import flask; print('Flask:', flask.__version__)"
python -c "import cv2; print('OpenCV:', cv2.__version__)"
python -c "import numpy; print('NumPy:', numpy.__version__)"
python -c "import speech_recognition; print('SpeechRecognition: OK')"
```

**Expected output:**
```
Flask: 3.1.0
OpenCV: 4.10.0
NumPy: 1.26.x
SpeechRecognition: OK
```

## 🎯 Recommended Setup (Foolproof Method)

**Start fresh with Python 3.12:**

```bash
# 1. Download and install Python 3.12 from python.org

# 2. Create new virtual environment
cd D:\Projects\voice-vision-assistant
py -3.12 -m venv venv

# 3. Activate virtual environment
venv\Scripts\activate

# 4. Upgrade pip
python -m pip install --upgrade pip

# 5. Install dependencies
pip install -r requirements.txt

# 6. Verify installation
python -c "import flask, cv2, numpy; print('All packages installed!')"
```

## 📦 Alternative: Install Packages One by One

If bulk installation fails, install one at a time:

```bash
pip install Flask==3.1.0
pip install python-dotenv==1.0.1
pip install pydub==0.25.1
pip install SpeechRecognition==3.10.4
pip install numpy>=1.26.0
pip install opencv-python==4.10.0.84
pip install inference-sdk==0.23.0
pip install requests==2.32.3
pip install gunicorn==23.0.0
```

## 🔍 Check Your Python Version

```bash
python --version
# or
py --version
```

**Supported versions:**
- ✅ Python 3.8 - 3.12 (Recommended: 3.11 or 3.12)
- ⚠️ Python 3.13+ (May need updated package versions)

## 🌐 Windows-Specific Issues

### Issue: ffmpeg not found

**Fix:**
```bash
# Download ffmpeg from: https://www.gyan.dev/ffmpeg/builds/
# Extract and add to PATH, or install via chocolatey:
choco install ffmpeg
```

### Issue: Permission denied

**Fix:**
Run PowerShell as Administrator:
```bash
# Right-click PowerShell -> Run as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Files I've Created for You

I've prepared multiple requirements files:

1. **requirements.txt** - Updated for Python 3.14
2. **requirements-py38-312.txt** - For Python 3.8-3.12
3. **requirements-py314.txt** - Specifically for Python 3.14

**To use specific version:**
```bash
# For Python 3.14
pip install -r requirements-py314.txt

# For Python 3.8-3.12
pip install -r requirements-py38-312.txt
```

## 🚀 Once Installation Works

After successful installation:

```bash
# Create .env file
copy .env.example .env
# Edit .env and add your API keys

# Run the application
python app.py

# Open browser
# http://localhost:5000
```

## 💡 Pro Tips

1. **Always use virtual environment** to avoid conflicts
2. **Python 3.11 or 3.12** is the sweet spot for compatibility
3. **Update pip first**: `python -m pip install --upgrade pip`
4. **Install Visual Studio Build Tools** if you plan to compile packages
5. **Use `--only-binary` flag** to avoid compilation

## 🆘 Still Having Issues?

**Check these:**
- [ ] Python version is 3.8-3.12
- [ ] pip is updated: `python -m pip install --upgrade pip`
- [ ] Virtual environment is activated
- [ ] requirements.txt has correct package versions
- [ ] Internet connection is stable
- [ ] Antivirus isn't blocking pip

**Get detailed error info:**
```bash
pip install -r requirements.txt --verbose
```

---

**Need more help?** Share the full error message and your Python version!
