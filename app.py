from flask import Flask, render_template, request, jsonify
import os
import base64
import requests
import json
from dotenv import load_dotenv
from pydub import AudioSegment
import speech_recognition as sr
import cv2
import numpy as np
from inference_sdk import InferenceHTTPClient

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 256 * 1024 * 1024 * 1024  # 256MB limit

# API keys from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "5XagyPRtCr1rJQzvdDwl")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY is not set. Please check your .env file.")


@app.route('/')
def index():
    return render_template('index.html')


def write(filename, data):
    with open(filename, 'wb') as file:
        file.write(data)


@app.route('/upload', methods=['POST'])
def upload():
    audio_file = request.files['audio']
    # Save the uploaded audio file
    original_path = 'audio.ogg'
    wav_path = 'audio.wav'
    audio_file.save(original_path)
    # Convert the OGG file to WAV format
    audio = AudioSegment.from_file(original_path)
    audio.export(wav_path, format="wav")

    try:
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Load the audio file
        with sr.AudioFile(wav_path) as source:
            # Record the audio data
            audio_data = recognizer.record(source)  
            
            # Use Google's speech recognition
            text = recognizer.recognize_google(audio_data)
            
            # Clean up temporary WAV file
            if os.path.exists(wav_path):
                os.remove(wav_path)

            return jsonify({"text": text})
    
    except sr.UnknownValueError:
        print("Speech Recognition could not understand the audio")
        return jsonify({"error": "Could not understand the audio"}), 400
    except sr.RequestError as e:
        print(f"Could not request results from Speech Recognition service; {e}")
        return jsonify({"error": "Could not request results from Speech Recognition service"}), 500
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return jsonify({"error": f"Error transcribing audio: {str(e)}"}), 500


@app.route('/vision-query', methods=['POST'])
def vision_query():
    """
    New endpoint to handle OpenRouter API calls securely from backend
    """
    try:
        data = request.get_json()
        
        messages = data.get('messages', [])
        model = data.get('model', 'qwen/qwen-2-vl-72b-instruct')
        temperature = data.get('temperature', 0.3)
        max_tokens = data.get('max_tokens', 150)
        
        # Make request to OpenRouter API
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'model': model,
                'temperature': temperature,
                'frequency_penalty': 1.0,
                'presence_penalty': 0.9,
                'max_tokens': max_tokens,
                'messages': messages
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify(result)
        else:
            return jsonify({
                "error": f"OpenRouter API error: {response.status_code}",
                "details": response.text
            }), response.status_code
            
    except Exception as e:
        print(f"Error in vision query: {e}")
        return jsonify({"error": f"Error processing vision query: {str(e)}"}), 500


@app.route('/query', methods=['POST'])
def process_query():
    # Extract the form data
    image_data = request.form.get('image', '')
    user_query = request.form.get('user_query', '')

    if not image_data or not user_query:
        return jsonify({"error": "Image or query is missing"}), 400
    
    # Decode the Base64 image data
    try:
        # Remove the "data:image/png;base64," prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',', 1)[1]
        image_bytes = base64.b64decode(image_data)
        
        # Save the image to a file (optional, for debugging or further processing)
        image_path = 'captured_image.png'
        with open(image_path, 'wb') as image_file:
            image_file.write(image_bytes)
    except Exception as e:
        return jsonify({"error": f"Failed to decode image: {str(e)}"}), 500

    # Process the query and image
    try:
        response = process_with_vision_model(image_path, False, 'people')
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": f"Error processing query: {str(e)}"}), 500


def process_with_vision_model(img_path, inside, Class):
    CLASS_COLORS = {
        "people": (0, 255, 255),
        "vacant_seats": (255, 0, 0), 
        "train": (0, 0, 255), 
        'traindoor': (128, 128, 128),
        "other": (0, 0, 0),
    }
    
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    client = InferenceHTTPClient(
        api_url="https://detect.roboflow.com",
        api_key=ROBOFLOW_API_KEY
    )

    result = client.run_workflow(
        workspace_name="rishav-qz1u7",
        workflow_id="false-people",
        images={
            "image": img_path
        },
        use_cache=False
    )

    return result[0]['llama_vision']['output']  


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
