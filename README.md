# MetroSense: A Vision-Language Assistant for Navigation Aid in Urban Metro Systems for the Visually Impaired

## Overview

MetroSense is a web-based personal travel assistant designed to enhance the commute experience for visually impaired persons (VIPs) within the Delhi Metro. The application integrates voice-enabled queries and real-time image capture from a smartphone to provide users with contextual guidance. It uses a fine-tuned YOLOv1l model for object detection and the LLAMA Vision 3.2 model for Visual Question Answering (VQA).

## Features

* **Voice Input:** Users can provide queries using voice commands.
* **Real-time Image Capture:** The application captures images of the user's surroundings.
* **Object Detection:** YOLOv1l model detects objects in the metro environment.
* **Visual Question Answering (VQA):** LLAMA Vision 3.2 model provides descriptive and concise responses to user queries.
* **Text-to-Speech:** Text-based responses are converted to voice output.

## Technologies Used

* **Roboflow:** For data annotation, training, deployment, and integration of the YOLO 11v model.
* **OpenRouter:** Provides API access to the LLAMA 3.2 Vision model.
* **Flask:** Python web framework for backend logic.
* **Frontend:** HTML, CSS, and JavaScript.

## Getting Started

1.  **Input Collection:**
    * Users provide voice queries via the smartphone's microphone.
    * Users capture real-time images using the camera.
2.  **Object Detection:**
    * The YOLO 11v model processes the image to detect relevant objects.
3.  **Visual Question Answering (VQA):**
    * The LLAMA Vision 3.2 model analyzes the visual context and voice query to generate a response.
4.  **Response:**
    * The system provides a voice output response to the user.

## Results

* The YOLOv11 model achieved a mean Average Precision (mAP@50) of 65.1%.
* The VQA model demonstrated strong semantic understanding with a BERT F1 score of 0.85.

## Future Enhancements

* Refine data and models with a more diverse, metro-specific dataset.
* Optimize the UI for better accessibility.
* Integrate safety features like obstacle avoidance and fall detection.
* Expand functionality to include multi-language support and offline capabilities.

## Group Members
* Rishav Raj
* Tanmay Singh
* Garv Makkar
* Vaibhav Tanwar
