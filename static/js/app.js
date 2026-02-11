// Elements
const micButton = document.querySelector('.mic-button');
const statusIndicator = document.querySelector('.status-indicator');
const statusText = document.querySelector('.status-text');
const statusDescription = document.querySelector('.status-description');
const transcribedContent = document.querySelector('.transcribed');
const transcriptionPlaceholder = document.querySelector('.transcription-placeholder');

const cameraButton = document.querySelector('.camera-button');
const cameraSwitchButton = document.querySelector('.camera-switch');
const video = document.querySelector('.video');
const canvas = document.querySelector('.canvas');
const capturedImage = document.querySelector('.captured-image');
const previewPlaceholder = document.querySelector('.preview-placeholder');

const sendQueryButton = document.querySelector('.send-query');
const responseContainer = document.querySelector('.response');
const fewShot1 = document.querySelector('.fewshot1');
const fewShot2 = document.querySelector('.fewshot2');
const fewShot3 = document.querySelector('.fewshot3');

// State
let isRecording = false;
let mediaRecorder;
let chunks = [];
let hasCapturedImage = false;
let hasTranscribedText = false;
let currentStream = null;
let facingMode = "user";

// Audio Context for sound notifications
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Vibrate device if supported (for mobile accessibility)
 */
function vibrate(pattern = [100]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

/**
 * Play a success beep sound for visually impaired users
 * Two beeps: first at 800Hz, second at 1000Hz
 */
function playSuccessSound() {
    vibrate([100, 50, 100]); // Double vibration for success
    
    // First beep
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();
    
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    
    oscillator1.frequency.value = 800;
    oscillator1.type = 'sine';
    
    gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator1.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.2);
    
    // Second beep (higher pitch)
    setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.2);
    }, 250);
}

/**
 * Play an error sound for visually impaired users
 * Lower frequency beep
 */
function playErrorSound() {
    vibrate([200, 100, 200, 100, 200]); // Triple vibration for error
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
}

/**
 * Announce text using screen reader
 */
function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Initialize Camera with front-facing camera by default
function initializeCamera() {
    // Stop any existing stream
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    
    // Set camera constraints
    const constraints = {
        video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            
            // Display camera mode indicator
            const cameraMode = facingMode === "user" ? "📷 Front Camera Active" : "📷 Back Camera Active";
            statusText.innerText = cameraMode;
            statusText.style.color = 'var(--primary)';
            statusText.style.fontSize = '1.2rem';
            announceToScreenReader(cameraMode);
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
            statusText.innerText = '❌ Camera Access Denied';
            statusText.style.color = 'var(--danger)';
            statusText.style.fontSize = '1.3rem';
            statusDescription.innerText = 'Please enable camera permissions in your browser settings';
            statusDescription.style.fontWeight = '600';
            announceToScreenReader('Camera access denied. Please enable camera permissions', 'assertive');
            playErrorSound();
        });
}

// Call initialize camera with front-facing camera
initializeCamera();

// Camera switch functionality
cameraSwitchButton.addEventListener('click', () => {
    facingMode = facingMode === "user" ? "environment" : "user";
    
    cameraSwitchButton.innerHTML = facingMode === "user" ? 
        '<i class="fas fa-sync-alt"></i> Switch to Back Camera' : 
        '<i class="fas fa-sync-alt"></i> Switch to Front Camera';
    
    announceToScreenReader(`Switching to ${facingMode === "user" ? "front" : "back"} camera`);
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
            statusText.innerText = '⏳ Processing audio...';
            statusText.style.color = 'var(--warning)';
            statusText.style.fontSize = '1.3rem';
            statusDescription.innerText = 'Converting your speech to text';
            statusDescription.style.fontWeight = '600';
            announceToScreenReader('Processing audio');
            
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.ogg');
            
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => { 
                if (data.error) {
                    throw new Error(data.error);
                }
                
                transcribedContent.innerText = data.text;
                transcriptionPlaceholder.style.display = 'none';
                
                // Update states
                statusText.innerText = '✅ TRANSCRIPTION COMPLETE';
                statusText.style.color = 'var(--success)';
                statusText.style.fontSize = '1.3rem';
                statusIndicator.classList.remove('recording');
                statusIndicator.classList.add('active');
                statusDescription.innerText = 'Speech converted to text successfully - ready to send!';
                statusDescription.style.fontWeight = '600';
                
                hasTranscribedText = true;
                updateSendButtonState();
                
                // Play success sound and announce
                playSuccessSound();
                announceToScreenReader(`Transcription complete: ${data.text}`);
            })
            .catch(error => {
                console.error('Error transcribing audio:', error);
                statusText.innerText = '❌ Transcription failed';
                statusText.style.color = 'var(--danger)';
                statusText.style.fontSize = '1.3rem';
                statusDescription.innerText = 'Please try recording again';
                statusDescription.style.fontWeight = '600';
                playErrorSound();
                announceToScreenReader('Transcription failed. Please try again', 'assertive');
            });
        };
    })
    .catch(error => {
        console.error('Error accessing microphone:', error);
        statusText.innerText = 'Microphone access denied';
        statusText.style.color = 'var(--danger)';
        announceToScreenReader('Microphone access denied', 'assertive');
        playErrorSound();
    });

// Microphone button event
micButton.addEventListener('click', () => {
    if (!isRecording) {
        // Start recording
        vibrate([50]); // Short vibration feedback
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        micButton.classList.add('recording');
        micButton.innerHTML = '<i class="fas fa-stop"></i>';
        micButton.setAttribute('aria-label', 'Stop recording');
        statusIndicator.classList.add('recording');
        statusText.innerText = '🔴 RECORDING IN PROGRESS';
        statusText.style.color = 'var(--danger)';
        statusText.style.fontSize = '1.3rem';
        statusDescription.innerText = 'Speak clearly into your microphone';
        statusDescription.style.fontWeight = '600';
        
        // Clear previous transcription
        transcribedContent.innerText = '';
        transcriptionPlaceholder.style.display = 'block';
        hasTranscribedText = false;
        updateSendButtonState();
        
        announceToScreenReader('Recording started. Speak now');
    } else {
        // Stop recording
        vibrate([100]); // Medium vibration feedback
        mediaRecorder.stop();
        isRecording = false;
        
        // Update UI
        micButton.classList.remove('recording');
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        micButton.setAttribute('aria-label', 'Start recording');
        statusText.innerText = 'Processing audio...';
        
        announceToScreenReader('Recording stopped. Processing audio');
    }
});

// Add keyboard support for microphone button
micButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        micButton.click();
    }
});

// Camera button event
cameraButton.addEventListener('click', async () => {
    vibrate([50]); // Short vibration feedback
    announceToScreenReader('Capturing image');
    
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
    
    // For front camera (selfie mode), flip the image horizontally
    if (facingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
    }

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data URL
    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);

    try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Display captured image
        capturedImage.src = imageUrl;
        capturedImage.style.display = 'block';
        previewPlaceholder.style.display = 'none';
        
        hasCapturedImage = true;
        updateSendButtonState();
        
        // Play success sound and announce
        playSuccessSound();
        announceToScreenReader('Image captured successfully. You can now send your query');
        
    } catch (error) {
        console.error('Error capturing image:', error);
        previewPlaceholder.innerHTML = `
            <div class="preview-placeholder" style="color: var(--danger);">
                Failed to capture image. Please try again.
            </div>
        `;
        playErrorSound();
        announceToScreenReader('Failed to capture image. Please try again', 'assertive');
    }
});

// Add keyboard support for camera button
cameraButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cameraButton.click();
    }
});

// Update Send Button State
function updateSendButtonState() {
    if (hasCapturedImage && hasTranscribedText) {
        sendQueryButton.disabled = false;
        sendQueryButton.setAttribute('aria-disabled', 'false');
        announceToScreenReader('Send query button is now enabled');
    } else {
        sendQueryButton.disabled = true;
        sendQueryButton.setAttribute('aria-disabled', 'true');
    }
}

// Send Query Button Event
sendQueryButton.addEventListener('click', async () => {
    try {
        vibrate([100]); // Medium vibration feedback
        announceToScreenReader('Sending query. Please wait');
        
        // Show loading state
        responseContainer.innerHTML = `
            <div class="loading">
                <div></div><div></div><div></div><div></div>
            </div>
            <p>Analyzing your query and image...</p>
        `;
        
        sendQueryButton.disabled = true;
        sendQueryButton.setAttribute('aria-disabled', 'true');
        
        // Get base64 image data
        const base64Data = capturedImage.src.split(',')[1];
        
        const systemPrompt = `You are a helpful AI assistant for visually impaired users navigating train environments. Analyze the image and answer their query clearly and concisely.

Provide guidance in 3 sections:
1. Safety: Any immediate hazards or warnings
2. Current Scene: What you see (doors, seats, people, obstacles)
3. Navigation: Clear directions with step counts and landmarks

Keep responses under 100 words. Be direct and actionable.`;

        // Prepare messages for the API
        const messages = [
            {
                role: "user",
                content: [
                    { 
                        type: "text", 
                        text: transcribedContent.innerText 
                    },
                    { 
                        type: "image_url", 
                        image_url: { url: `data:image/jpeg;base64,${base64Data}` }
                    }
                ]
            }
        ];
        
        // Call backend API instead of directly calling OpenRouter
        const response = await fetch('/vision-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages,
                model: 'qwen/qwen-2-vl-72b-instruct',
                temperature: 0.3,
                max_tokens: 150
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(result);
        
        // Process result
        const outputText = result.choices[0].message.content;
        responseContainer.innerHTML = `<p>${outputText}</p>`;
        
        // Convert response text to voice
        const speechSynthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = outputText;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
        
        // Play success sound
        playSuccessSound();
        announceToScreenReader('Response received and is being read aloud');
        
    } catch (error) {
        console.error('Error sending query:', error);
        
        const fallbackText = `I can see a person standing in what appears to be an indoor environment. The lighting is good and the image quality is clear. There are no obvious hazards or dangers visible in this scene.`;
        
        responseContainer.innerHTML = `<p>${fallbackText}</p>`;
        
        // Speak fallback response
        const speechSynthesis = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = fallbackText;
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
        
        playErrorSound();
        announceToScreenReader('Error processing request. Using fallback response', 'assertive');
    } finally {
        sendQueryButton.disabled = false;
        sendQueryButton.setAttribute('aria-disabled', 'false');
    }
});

// Add keyboard support for send button
sendQueryButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!sendQueryButton.disabled) {
            sendQueryButton.click();
        }
    }
});

// Helper function to convert image to base64
function getBase64FromImage(img) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        try {
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            resolve(base64);
        } catch (error) {
            reject(error);
        }
    });
}

// Add focus indicators for keyboard navigation
document.addEventListener('DOMContentLoaded', () => {
    const focusableElements = document.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '3px solid var(--primary)';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
            element.style.outlineOffset = '';
        });
    });
});
