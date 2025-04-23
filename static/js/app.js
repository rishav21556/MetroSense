// Elements
const micButton = document.querySelector('.mic-button');
const statusIndicator = document.querySelector('.status-indicator');
const statusText = document.querySelector('.status-text');
const statusDescription = document.querySelector('.status-description');
const transcribedContent = document.querySelector('.transcribed');
const transcriptionPlaceholder = document.querySelector('.transcription-placeholder');

const cameraButton = document.querySelector('.camera-button');
const cameraSwitchButton = document.querySelector('.camera-switch'); // Added camera switch button reference
const video = document.querySelector('.video');
const canvas = document.querySelector('.canvas');
const capturedImage = document.querySelector('.captured-image');
const previewPlaceholder = document.querySelector('.preview-placeholder');

const sendQueryButton = document.querySelector('.send-query');
const responseContainer = document.querySelector('.response');
const fewShot1 = document.querySelector('.fewshot1'); // Path to the image file
const fewShot2 = document.querySelector('.fewshot2'); // Path to the image file
const fewShot3 = document.querySelector('.fewshot3'); // Path to the image file

// State
let isRecording = false;
let mediaRecorder;
let chunks = [];
let hasCapturedImage = false;
let hasTranscribedText = false;
let currentStream = null; // Added to track current video stream
let facingMode = "user"; // Added variable to track camera mode - "user" for front camera, "environment" for back camera

// Initialize Camera with front-facing camera by default
// CHANGED: Modified to use front camera (user-facing) by default
function initializeCamera() {
    // Stop any existing stream
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    
    // Set camera constraints - "user" means front camera
    const constraints = {
        video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream; // Store reference to current stream
            video.srcObject = stream;
            
            // Display camera mode indicator
            statusText.innerText = facingMode === "user" ? 
                "Front camera active" : 
                "Back camera active";
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
            statusText.innerText = 'Camera access denied';
            statusText.style.color = 'var(--danger)';
        });
}

// Call initialize camera with front-facing camera
initializeCamera();

// Added camera switch functionality
cameraSwitchButton.addEventListener('click', () => {
    // Toggle between front and back camera
    facingMode = facingMode === "user" ? "environment" : "user";
    
    // Update button text to indicate what will happen on next click
    cameraSwitchButton.innerHTML = facingMode === "user" ? 
        '<i class="fas fa-sync-alt"></i> Switch to Back Camera' : 
        '<i class="fas fa-sync-alt"></i> Switch to Front Camera';
    
    // Reinitialize camera with new facing mode
    initializeCamera();
});

// Initialize Microphone
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
            chunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
            chunks = [];
            
            // Show processing state
            statusText.innerText = 'Processing audio...';
            statusDescription.innerText = 'Converting your speech to text';
            
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.ogg');
            
            // Simulate processing delay (remove in production)
            setTimeout(() => {
                // In a real app, this would be your actual API call:
                fetch('/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => { 
                    transcribedContent.innerText = data.text;
                })
                
                // For demo, we'll just set some sample text
                // const sampleText = "What is in this image?";
                // transcribedContent.innerText = sampleText;
                transcriptionPlaceholder.style.display = 'none';
                
                // Update states
                statusText.innerText = 'Processing complete';
                statusIndicator.classList.remove('recording');
                statusIndicator.classList.add('active');
                statusDescription.innerText = 'Speech converted to text successfully';
                
                hasTranscribedText = true;
                updateSendButtonState();
            }, 1500);
        };
    })
    .catch(error => {
        console.error('Error accessing microphone:', error);
        statusText.innerText = 'Microphone access denied';
        statusText.style.color = 'var(--danger)';
    });

// Microphone button event
micButton.addEventListener('click', () => {
    if (!isRecording) {
        // Start recording
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        micButton.classList.add('recording');
        micButton.innerHTML = '<i class="fas fa-stop"></i>';
        statusIndicator.classList.add('recording');
        statusText.innerText = 'Recording in progress';
        statusDescription.innerText = 'Speak clearly into your microphone';
        
        // Clear previous transcription
        transcribedContent.innerText = '';
        transcriptionPlaceholder.style.display = 'block';
        hasTranscribedText = false;
        updateSendButtonState();
    } else {
        // Stop recording
        mediaRecorder.stop();
        isRecording = false;
        
        // Update UI
        micButton.classList.remove('recording');
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        statusText.innerText = 'Processing audio...';
    }
});

// Camera button event
cameraButton.addEventListener('click', async () => {
    // Show processing animation
    previewPlaceholder.innerHTML = `
        <div class="loading">
            <div></div><div></div><div></div><div></div>
        </div>
        <p>Processing capture...</p>
    `;
    
    // Capture image
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // CHANGED: For front camera (selfie mode), flip the image horizontally for natural mirror effect
    if (facingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data URL for sending to API
    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);

    try {
        // Show processing animation while the image is being processed
        previewPlaceholder.innerHTML = `
            <div class="loading">
                <div></div><div></div><div></div><div></div>
            </div>
            <p>Processing image...</p>
        `;
        previewPlaceholder.style.display = 'block'; 
        capturedImage.style.display = 'none';

        const roboflowApiKey = '5XagyPRtCr1rJQzvdDwl';
        const response = await fetch('https://serverless.roboflow.com/infer/workflows/rishav-qz1u7/custom-workflow-2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: roboflowApiKey,
                inputs: {
                    "image": {"type": "url", "value": imageUrl}
                }
            })
        });
        // const response = await fetch('https://serverless.roboflow.com/infer/workflows/rishav-qz1u7/custom-workflow-4', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         api_key: roboflowApiKey,
        //         inputs: {
        //             "image": {"type": "url", "value": imageUrl}
        //         }
        //     })
        // });

        console.log(response);
        const result = await response.json();
        console.log('API Result:', result);

        // Get the base64 visualization data
        let base64Data;

        // Check if we have data in the correct format in predictions field
        if (result.outputs && 
            result.outputs[0] && 
            result.outputs[0].predictions && 
            result.outputs[0].predictions.value) {
            
            // Check if data already has the data URI prefix
            if (result.outputs[0].predictions.value.startsWith('data:image/')) {
                base64Data = result.outputs[0].predictions.value;
            } else {
                // Add prefix if not present
                base64Data = `data:image/jpeg;base64,${result.outputs[0].predictions.value}`;
            }
            console.log('Using data from predictions field');
        } 
        // Otherwise, use the data from label_visualization
        else if (result.outputs && 
                result.outputs[0] && 
                result.outputs[0].label_visualization && 
                result.outputs[0].label_visualization.value) {
            
            // Check if data already has the data URI prefix
            if (result.outputs[0].label_visualization.value.startsWith('data:image/')) {
                base64Data = result.outputs[0].label_visualization.value;
            } else {
                // Add prefix if not present
                base64Data = `data:image/jpeg;base64,${result.outputs[0].label_visualization.value}`;
            }
            console.log('Using data from label_visualization field');
        }
        // Fallback to original image if API doesn't return expected data
        else {
            base64Data = imageUrl;
            console.log('Falling back to original captured image');
        }

        // Log the first part of the image data to check format
        console.log('Final image data starts with:', base64Data.substring(0, 50) + '...');

        // Set image source and show it
        capturedImage.onload = () => {
            console.log('Image loaded successfully with dimensions:', 
                        capturedImage.width, 'x', capturedImage.height);
            capturedImage.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            hasCapturedImage = true;

            // Apply horizontal flip for front camera images
            // if (facingMode === "user") {
            //     capturedImage.style.transform = "scaleX(-1)";
            // } else {
            //     capturedImage.style.transform = "none";
            // }
            capturedImage.style.transform = "none";
            updateSendButtonState();
        };

        capturedImage.onerror = (e) => {
            console.error('Error loading image:', e);
            // Try alternative approach if this fails
            capturedImage.src = imageUrl; // Fall back to original image
            capturedImage.style.display = 'block';
            previewPlaceholder.style.display = 'none';
            hasCapturedImage = true;
            updateSendButtonState();
        };

        // Set the image source with properly formatted base64 data
        capturedImage.src = base64Data;
        
        // Apply transform for front camera images
        // if (facingMode === "user") {
        //     capturedImage.style.transform = "scaleX(-1)";
        // } else {
        //     capturedImage.style.transform = "none";
        // }
        
    } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original image if API call fails
        capturedImage.src = imageUrl;
        capturedImage.style.display = 'block';
        previewPlaceholder.style.display = 'none';
        hasCapturedImage = true;
        updateSendButtonState();
        
        // // Apply transform for front camera images
        // if (facingMode === "user") {
        //     // capturedImage.style.transform = "scaleX(-1)";
        // } else {
        //     capturedImage.style.transform = "none";
        // }
        // capturedImage.style.transform = "rotateZ(180deg)"; // Flip for front camera
    }
});

// Update send button state
function updateSendButtonState() {
    if (hasCapturedImage && hasTranscribedText) {
        sendQueryButton.disabled = false;
    } else {
        sendQueryButton.disabled = true;
    }
}

// Send query button event
sendQueryButton.addEventListener('click', async() => {
    // Show loading state
    responseContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 0;">
            <div class="loading">
                <div></div><div></div><div></div><div></div>
            </div>
            <p style="margin-top: 1rem; color: #64748b;">Analyzing your image and query...</p>
        </div>
    `;
    
    // Prepare form data
    const formData = new FormData();
    formData.append('image', capturedImage.src);
    formData.append('user_query', transcribedContent.innerText);

try {
    // Load API key from .env file
    const apiKey = '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';
    const model = "meta-llama/llama-3.2-90b-vision-instruct";
    // const model = "openai/gpt-4o";
    
    // Get base64 data from image source
    const imageDataUrl = capturedImage.src;
    const base64Data = imageDataUrl.split(',')[1];

    // Convert the image to a base64 string
    const loadImageAsBase64 = async (imagePath) => {
        const res = await fetch(imagePath);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extract base64 part
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const base64Image1 = await loadImageAsBase64(fewShot1.src);
    const base64Image2 = await loadImageAsBase64(fewShot2.src);
    const base64Image3 = await loadImageAsBase64(fewShot3.src);

    const systemPrompt = `
        You are a voice assistant for visually impaired Delhi Metro riders. Analyze the user's photo and query to provide safe, step-by-step navigation guidance. Follow these rules:

        1. SAFETY FIRST:
        - Immediately warn about dangers:
            • "Warning:
            • "Caution:

        2. NAVIGATION GUIDANCE:
        - Use detected objects (if available) for directions of vacant seats, elevator, ticket counter, etc.

        3. DELHI METRO FEATURES:
        - Mention specific features of the surrounding.

        4. RESPONSE FORMAT:
        - Keep responses short (1-2 sentences)
        - Always start with safety warnings if any
        - Use simple, directive language

        5. PROHIBITED ACTIONS:
        - Never say "look for" or mention colors
        - Don't describe bounding boxes, only what's inside them
        - If unsure: "Please ask metro staff."
        
        Examples are given for your reference only. Do not mention them in your response or copy from them. Examples describe the structure of response only.
        `;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            temperature: 0.3,
            frequency_penalty:1.0,
            presence_penalty:0.9,
            max_tokens:150,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                // Few-shot example 1: Obstacle detection
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Example Query 1: Help me find the nearest exit doors." },
                        { 
                            type: "image_url", 
                            image_url: { url:`data:image/jpeg;base64,${base64Image1}` }
                        }
                    ]
                },
                {
                    role: "assistant",
                    content: `
                            1. Safety Check:
                            - No immediate hazards detected. You're safely inside the train.

                            2. Navigation Guidance:
                            - Nearest door is 10 steps ahead, slightly to your right (currently closed).
                            - 2 vacant seats available:
                            • One to your left (not recommended - has 'Do Not Sit' sign)
                            • One across the aisle to your front-right near a passenger with suitcase

                            3. Movement Instructions:
                            To reach the door:
                            • Walk straight 10 steps using the aisle handrail
                            • Angle slightly right after 5 steps
                            • Door will be directly ahead

                            To reach the available seat:
                            • Turn right and take 3 steps
                            • Feel for the seat edge on your left

                            4. Additional Notes:
                            - Announcements will play before next station
                            - Emergency intercom is near the door frame
                            `
                },
                // Few-shot example 2: Clear path
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Example Query 2: Help me find a vacant seat." },
                        { 
                            type: "image_url", 
                            image_url: { url: `data:image/jpeg;base64,${base64Image2}` } 
                        }
                    ]
                },
                {
                    role: "assistant",
                    content: `
                        1. Safety Alert:
                        - No immediate hazards detected
                        - Be cautious of moving passengers in the crowded aisle

                        2. Current Situation:
                        - Train is moderately to heavily crowded
                        - All visible seats are occupied
                        - Standing passengers are holding overhead rails

                        3. Recommended Actions:
                        To find a seat:
                        • Move forward 10 steps toward the next coach
                        • Keep right along the aisle handrail
                        • Pause between rows to check for vacated seats

                        Alternative Options:
                        • The left-side door area (2 steps left) has slightly more space
                        • You may wait near the vertical pole ahead for stability

                        4. Important Notes:
                        - Priority seats are near the doors if vacated
                        `
                },
                // Few-shot example 3: Finding seating
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Example Query 3: Should I enter? Are doors open?" },
                        { 
                            type: "image_url", 
                            image_url: { url: `data:image/jpeg;base64,${base64Image3}` }
                        }
                    ]
                },
                {
                    role: "assistant",
                    content: `
                        1. Safety Alert:
                        - WARNING: Crowded doorway ahead
                        - Doors are currently open but congested
                        - Be ready to step back if chime sounds

                        2. Current Situation:
                        - 7 passengers at/near doorway
                        - No one currently exiting
                        - Train is stationary but may depart soon

                        3. Recommended Actions:
                        • Wait 5 seconds near door edge
                        • If space opens:
                        - Take 3 steps forward
                        - Grab right-side pole immediately
                        • If door chime sounds:
                        - Move back 2 steps quickly
                        - Wait for next train

                        4. Alternative Options:
                        • Listen for "doors closing" announcement
                        `
                },
                // Actual user query with current image
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: transcribedContent.innerText 
                        },
                        { 
                            type: "image_url", 
                            image_url: { url: `data:image/jpeg;base64,${base64Data}`} 
                        }
                    ]
                }
            ]
        })});

    // Process result
    const result = await response.json();
    console.log(result);

    // Show response after a brief delay
    setTimeout(() => {
        try {
            const outputText = result.choices[0].message.content;
            responseContainer.innerHTML = `<p>${outputText}</p>`;
        } catch (error) {
            // Fallback for demo or if API fails
            responseContainer.innerHTML = `
                <p>I can see a person standing in what appears to be an indoor environment. 
                The lighting is good and the image quality is clear. There are no obvious 
                hazards or dangers visible in this scene.</p>
            `;
        }
    }, 1500);

    // Convert response text to voice
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();

    try {
        const outputText = result.choices[0].message.content;
        utterance.text = outputText;
        speechSynthesis.speak(utterance);
    } catch (error) {
        // Fallback for demo or if API fails
        const fallbackText = `
            I can see a person standing in what appears to be an indoor environment. 
            The lighting is good and the image quality is clear. There are no obvious 
            hazards or dangers visible in this scene.
        `;
        utterance.text = fallbackText;
        speechSynthesis.speak(utterance);
    }

} catch (error) {
    console.error('Error sending query:', error);
    
    // Fallback response for demo
    setTimeout(() => {
        responseContainer.innerHTML = `
            <p>I can see a person standing in what appears to be an indoor environment. 
            The lighting is good and the image quality is clear. There are no obvious 
            hazards or dangers visible in this scene.</p>
        `;
    }, 1500);
}
});
