# MetroSense: A Vision-Language Assistant for Navigation Aid in Urban Metro Systems for the Visually Impaired

## Overview

MetroSense is a web-based personal travel assistant designed to enhance the commute experience for visually impaired persons (VIPs) within the Delhi Metro. [cite: 3, 4] The application integrates voice-enabled queries and real-time image capture from a smartphone to provide users with contextual guidance. [cite: 4, 5] It uses a fine-tuned YOLOv1l model for object detection and the LLAMA Vision 3.2 model for Visual Question Answering (VQA). [cite: 5]

## Features

* **Voice Input:** Users can provide queries using voice commands. [cite: 37, 38]
* **Real-time Image Capture:** The application captures images of the user's surroundings. [cite: 39, 40]
* **Object Detection:** YOLOv1l model detects objects in the metro environment. [cite: 41, 42, 43, 44, 45]
* **Visual Question Answering (VQA):** LLAMA Vision 3.2 model provides descriptive and concise responses to user queries. [cite: 46, 47, 48, 49, 50]
* **Text-to-Speech:** Text-based responses are converted to voice output. [cite: 50]

## Technologies Used

* **Roboflow:** For data annotation, training, deployment, and integration of the YOLO 11v model. [cite: 51, 52]
* **OpenRouter:** Provides API access to the LLAMA 3.2 Vision model. [cite: 52, 53]
* **Flask:** Python web framework for backend logic. [cite: 53, 54]
* **Frontend:** HTML, CSS, and JavaScript. [cite: 54, 55]

## Getting Started

1.  **Input Collection:**
    * Users provide voice queries via the smartphone's microphone. [cite: 37, 38]
    * Users capture real-time images using the camera. [cite: 39, 40]
2.  **Object Detection:**
    * The YOLO 11v model processes the image to detect relevant objects. [cite: 41, 42, 43, 44, 45]
3.  **Visual Question Answering (VQA):**
    * The LLAMA Vision 3.2 model analyzes the visual context and voice query to generate a response. [cite: 46, 47, 48, 49, 50]
4.  **Response:**
    * The system provides a voice output response to the user. [cite: 50]

## Results

* The YOLOv11 model achieved a mean Average Precision (mAP@50) of 65.1%. [cite: 71, 72, 73]
* The VQA model demonstrated strong semantic understanding with a BERT F1 score of 0.85. [cite: 89, 90, 91, 92, 93]

## Future Enhancements

* Refine data and models with a more diverse, metro-specific dataset. [cite: 99, 100, 101]
* Optimize the UI for better accessibility. [cite: 101, 102, 103, 104]
* Integrate safety features like obstacle avoidance and fall detection. [cite: 101, 102, 103, 104]
* Expand functionality to include multi-language support and offline capabilities. [cite: 104, 105, 106]
