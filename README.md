# Genesis AI
An AI health companion 

## Overview
The **Genesis-AI** is an AI-powered assistant designed to help users with preliminary diagnosis and doctor consultation. Users can describe their symptoms or upload images (for supported conditions), and the chatbot will analyze the input to provide possible medical insights, guidance, and suggest consultation with healthcare professionals when necessary.

## Features
- **Symptom Analysis**: Users enter symptoms, and the chatbot provides possible conditions and advice.
- **Image-Based Analysis**: Users can upload images (e.g., skin conditions) for AI-based evaluation.
- **Doctor Consultation Guidance**: The chatbot suggests when to consult a doctor and provides links to professional medical help.
- **Thematic UI Customization**: Users can switch between different themes like Space, Ocean, and Forest.
- **Multimodal Interaction**: Supports text-based, image-based, and mixed input modes.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: Node.js / Python (Flask or FastAPI)
- **AI Model**: OpenAI API / TensorFlow / Custom ML Model
- **Database**: Firebase / PostgreSQL / MongoDB
- **Hosting**: Vercel / AWS / DigitalOcean

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/medical-chatbot.git
   cd medical-chatbot
   ```
2. Install dependencies:
   ```sh
   npm install  # If using Node.js
   pip install -r requirements.txt  # If using Python
   ```
3. Start the server:
   ```sh
   npm start  # Node.js
   python app.py  # Flask/FastAPI
   ```
4. Open the web interface in a browser:
   ```sh
   http://localhost:3000  # Adjust based on setup
   ```

## How to Use
1. **Enter Symptoms**: Type symptoms in the input box and press "Generate."
2. **Upload Image (if applicable)**: Click the "Upload" button to add an image for analysis.
3. **Receive Insights**: The chatbot will process the input and display potential conditions or advice.
4. **Consult a Doctor**: If required, the bot suggests professional consultation with links to nearby doctors or telemedicine services.

## API Endpoints
| Method | Endpoint         | Description                      |
|--------|----------------|----------------------------------|
| POST   | `/api/generate` | Takes text/image input and returns AI analysis |
| GET    | `/api/doctors`  | Returns a list of doctors/clinics |

## Future Improvements
- **Voice Input Support**
- **Integration with Medical Databases**
- **Multi-language Support**
- **User Accounts & Medical History Tracking**

## Disclaimer
This chatbot is **not a replacement for professional medical advice**. It provides insights based on AI predictions and should be used as a preliminary tool. Always consult a healthcare provider for accurate diagnosis and treatment.


