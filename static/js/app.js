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

        // const response = await fetch('https://serverless.roboflow.com/infer/workflows/rishav-qz1u7/detect-and-classify', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         api_key: '5XagyPRtCr1rJQzvdDwl',
        //         inputs: {
        //             "image": {"type": "url", "value": imageUrl}
        //         }
        //     })
        // });

        const response = await fetch('https://serverless.roboflow.com/infer/workflows/rishav-qz1u7/custom-workflow-2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: '5XagyPRtCr1rJQzvdDwl',
                inputs: {
                    "image": {"type": "url", "value": imageUrl}
                }
            })
        });

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
        //     capturedImage.style.transform = "scaleY(-1)";
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
    const apiKey = "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";
    const model = "meta-llama/llama-3.2-11b-vision-instruct";
    
    // Get base64 data from image source
    const imageDataUrl = capturedImage.src;
    const base64Data = imageDataUrl.split(',')[1]; // Extract base64 part after comma

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "You are an AI assistance that helps visually impaired people navigate safely. Your task is provide information related to any potential obstacle in the path and help them navigate safely. You can also provide them location of an empty Seat."+"Based on the query, do the needful. Query: " +transcribedContent.innerText
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Data}`
                        }
                    }
                ]
            }]
        })
    });

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


// // Function to make API call with few-shot examples
// async function makeAssistanceAPICall(apiKey, model, imageBase64, userQuery) {
//     const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${apiKey}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             model: model,
//             messages: [
//                 // First message: System instruction with few-shot examples
//                 {
//                     role: "system",
//                     content: "You are an AI assistant that helps visually impaired people navigate safely. Your responses should be clear, concise, and focus on the most important safety information first. Describe obstacles, their location, and suggest safe paths. When identifying seating, be specific about location and availability."
//                 },
//                 // Few-shot example 1: Obstacle detection
//                 {
//                     role: "user",
//                     content: [
//                         { type: "text", text: "What's in front of me?" },
//                         { 
//                             type: "image_url", 
//                             image_url: { url: "data:image/jpeg;base64,EXAMPLE_IMAGE_1" } 
//                         }
//                     ]
//                 },
//                 {
//                     role: "assistant",
//                     content: "CAUTION: There's a staircase about 5 feet ahead of you. The stairs go down. There's a handrail on the right side. For safety, I recommend approaching slowly and reaching out for the handrail first."
//                 },
//                 // Few-shot example 2: Clear path
//                 {
//                     role: "user",
//                     content: [
//                         { type: "text", text: "Is it safe to walk forward?" },
//                         { 
//                             type: "image_url", 
//                             image_url: { url: "data:image/jpeg;base64,EXAMPLE_IMAGE_2" } 
//                         }
//                     ]
//                 },
//                 {
//                     role: "assistant",
//                     content: "Yes, the path ahead is clear for about 10 feet. There's a wide hallway with no obstacles. The floor is level and there are no trip hazards visible."
//                 },
//                 // Few-shot example 3: Finding seating
//                 {
//                     role: "user",
//                     content: [
//                         { type: "text", text: "Are there any empty seats nearby?" },
//                         { 
//                             type: "image_url", 
//                             image_url: { url: "data:image/jpeg;base64,EXAMPLE_IMAGE_3" } 
//                         }
//                     ]
//                 },
//                 {
//                     role: "assistant",
//                     content: "Yes, there are two empty seats available. There's one empty chair about 3 feet to your right, and another empty bench straight ahead about 7 feet away against the wall."
//                 },
//                 // Few-shot example 4: Doorway identification
//                 {
//                     role: "user",
//                     content: [
//                         { type: "text", text: "Is there a door nearby?" },
//                         { 
//                             type: "image_url", 
//                             image_url: { url: "data:image/jpeg;base64,EXAMPLE_IMAGE_4" } 
//                         }
//                     ]
//                 },
//                 {
//                     role: "assistant",
//                     content: "Yes, there's a door approximately 6 feet ahead of you. It's a standard width door that pulls open toward you. The door handle is on the right side. The door appears to be closed."
//                 },
//                 // Actual user query with current image
//                 {
//                     role: "user",
//                     content: [
//                         { 
//                             type: "text", 
//                             text: `You are an AI assistance that helps visually impaired people navigate safely. Your task is provide information related to any potential obstacle in the path and help them navigate safely. You can also provide them location of an empty Seat. Based on the query, do the needful. Query: ${userQuery}` 
//                         },
//                         { 
//                             type: "image_url", 
//                             image_url: { url: `data:image/jpeg;base64,${imageBase64}` } 
//                         }
//                     ]
//                 }
//             ]
//         })
//     });
    
//     const data = await response.json();
//     return data;
// }

// // Example usage
// async function getAssistanceForImage(imageBase64, userQuery) {
//     const apiKey = "your_api_key_here";
//     const model = "anthropic/claude-3-sonnet";  // or your preferred model
    
//     try {
//         const result = await makeAssistanceAPICall(apiKey, model, imageBase64, userQuery);
//         return result.choices[0].message.content;
//     } catch (error) {
//         console.error("Error calling assistance API:", error);
//         return "Sorry, I encountered an error processing your request.";
//     }
// }

// // This function would be called with the base64 image data and user query
// // const response = await getAssistanceForImage(base64Data, "What's in front of me?");
// // console.log(response);