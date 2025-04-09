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
app.config['MAX_CONTENT_LENGTH'] = 256 * 1024 *  1024 * 1024  # 16MB limit

# OpenAI API key would be stored in environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set. Please check your .env file.")
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
    # Convert the MP3 file to WAV format
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
            
            # Clean up temporary WAV file if it was created
            if wav_path != wav_path and os.path.exists(wav_path):
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
    # finally:
    #     # Clean up original audio file
    #     if os.path.exists(original_path):
    #         os.remove(original_path)
        

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

    # Process the query and image (e.g., send to a vision model API)
    try:
        img = cv2.imread(image_path)
        response = process_with_vision_model(image_path,False, 'people')
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": f"Error processing query: {str(e)}"}), 500
    # return jsonify({"response": "This is a placeholder response. Replace with actual model response."})
    
def process_with_vision_model(img_path,inside, Class):
    CLASS_COLORS = {
        "people": (0, 255, 255),
        "vacant_seats": (255, 0, 0), 
        "train": (0, 0, 255), 
        'traindoor': (128,128,128),
        "other": (0, 0, 0),
    }
    # client = InferenceHTTPClient(
    #     api_url="https://detect.roboflow.com",
    #     api_key="5XagyPRtCr1rJQzvdDwl"
    # )

    # CLIENT = InferenceHTTPClient(
    # api_url="https://outline.roboflow.com",
    # api_key="5XagyPRtCr1rJQzvdDwl"
    # )

    # segmentation_result = CLIENT.infer(img_path, model_id="-fvyfc/1")

    # result = client.run_workflow(
    #     workspace_name="rishav-qz1u7",
    #     workflow_id="detect-backup",
    #     images={
    #         "image": img_path,
    #     },
    #     use_cache=False
    # )
    image = cv2.imread(img_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # if 'model' in result[0] and 'predictions' in result[0]['model']:
    #     predictions = result[0]['model']['predictions']

    #     for pred in predictions :
    #         if (pred['class']!=Class) : continue
    #         x, y = int(pred['x']), int(pred['y'])  # Center of bounding box
    #         w, h = int(pred['width']), int(pred['height'])  # Width and height
    #         x1, y1 = x - w // 2, y - h // 2  # Top-left corner
    #         x2, y2 = x + w // 2, y + h // 2  # Bottom-right corner
            
    #         # Get color based on class
    #         class_name = pred.get("class", "other")
    #         color = CLASS_COLORS.get(class_name, CLASS_COLORS["other"])
            
    #         # Draw bounding box
    #         cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
    #     # mask = np.zeros_like(image, dtype=np.uint8)  # Create an empty mask
    # if 'predictions' in segmentation_result:
    #     for pred in segmentation_result['predictions']:
    #         # Extract polygon points
    #         points = np.array([(int(pt['x']), int(pt['y'])) for pt in pred['points']], np.int32)
    #         points = points.reshape((-1, 1, 2))  # Reshape for polylines function
            
    #         # Draw only the polygon (without bounding box)
    #         cv2.polylines(image, [points], isClosed=True, color=(0, 255, 0), thickness=2)
    from inference_sdk import InferenceHTTPClient

    client = InferenceHTTPClient(
        api_url="https://detect.roboflow.com",
        api_key="5XagyPRtCr1rJQzvdDwl"
    )

    result = client.run_workflow(
        workspace_name="rishav-qz1u7",
        workflow_id="false-people",
        images={
            "image": img_path
        },
        use_cache=False # cache workflow definition for 15 minutes
    )


    return result[0]['llama_vision']['output']

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)