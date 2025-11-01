# Rice Disease Detection System

An AI-powered web application for detecting rice plant diseases using deep learning and environmental data analysis.

## **[Try the Live App Here](https://rice-disease-detection-system-dool.vercel.app/)**

> **Live Demo**: [https://rice-disease-detection-system-dool.vercel.app/](https://rice-disease-detection-system-dool.vercel.app/)
> 
> Upload images, detect diseases, and analyze environmental conditions in real-time.

---

![Rice Disease Detection](https://img.shields.io/badge/AI-Powered-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.9-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
[![Frontend Deployment](https://img.shields.io/badge/Frontend-Live%20on%20Vercel-00C7B7?logo=vercel)](https://rice-disease-detection-system-dool.vercel.app/)
[![Backend Deployment](https://img.shields.io/badge/Backend-Live%20on%20Render-46E3B7?logo=render)](https://rdds-backend.onrender.com)

## Features

- **Image-Based Disease Detection**: Upload rice plant images to detect diseases using CNN
- **Environmental Analysis**: Analyze environmental conditions for crop health
- **Secure Authentication**: Firebase-powered login with email and Google sign-in
- **Prediction History**: Track and review past predictions
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Processing**: Fast disease detection with confidence scores

## Live Deployment

### Try the Application Now

**Frontend (Full System)**: [https://rice-disease-detection-system-dool.vercel.app/](https://rice-disease-detection-system-dool.vercel.app/)
- Test the complete Rice Disease Detection System
- Upload images and get instant predictions
- Analyze environmental conditions
- Deployed on **Vercel**

**Backend API**: [https://rdds-backend.onrender.com](https://rdds-backend.onrender.com)
- RESTful API with disease detection endpoints
- Health check and model status
- Deployed on **Render**
- **Backend Repository**: [https://github.com/AJ115-creator/RDDS-backend](https://github.com/AJ115-creator/RDDS-backend)

> **Note**: The backend may take 30-60 seconds to wake up on first request (free tier cold start).

## Architecture

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Hooks
- **Authentication**: Firebase Auth
- **Database**: Firestore for prediction storage

### Backend
- **Framework**: FastAPI
- **ML Models**: 
  - CNN (TensorFlow/Keras) for image classification
  - Random Forest for environmental data
- **Image Processing**: PIL/Pillow
- **API**: RESTful with CORS support

### Detected Diseases
1. Bacterial Leaf Blight
2. Brown Spots
3. Leaf Smut
4. Healthy (no disease)

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Rice-Disease-Detection-System.git
cd Rice-Disease-Detection-System
```

#### 2. Setup Backend
```bash
cd Backend
pip install -r requirements.txt
uvicorn backend:app --reload
```

Backend runs at: `http://localhost:8000`

#### 3. Setup Frontend
```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

#### 4. Open Browser
Visit `http://localhost:5173` and start detecting diseases.

## Project Structure

```
Rice-Disease-Detection-System/
├── Backend/
│   ├── backend.py              # FastAPI application
│   ├── Models/                 # Trained ML models
│   │   ├── cnn_model.h5       # CNN model
│   │   ├── rf_model.pkl       # Random Forest model
│   │   └── scaler.pkl         # Data scaler
│   └── requirements.txt        # Python dependencies
├── Frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── login.jsx          # Login component
│   │   ├── firebaseConfig.jsx # Firebase config
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   └── package.json           # Node dependencies
├── Model creation/
│   ├── Train_cnn.py          # CNN training script
│   └── train_tabular.py      # RF training script
├── Test data/                 # Sample test images
├── DEPLOYMENT.md             # Detailed deployment guide
└── QUICK_DEPLOY.md           # Quick deployment guide
```

## Configuration

### Frontend Environment Variables
Create `.env` in Frontend folder:
```env
VITE_API_URL=http://localhost:8000
```

### Backend Environment Variables
```env
FRONTEND_URL=http://localhost:5173
```

## Deployment

### Current Production Deployment
- **Backend**: Deployed on [Render](https://render.com) - [https://rdds-backend.onrender.com](https://rdds-backend.onrender.com)
  - Repository: [https://github.com/AJ115-creator/RDDS-backend](https://github.com/AJ115-creator/RDDS-backend)
- **Frontend**: Deployed on [Vercel](https://vercel.com) - [https://rice-disease-detection-system-dool.vercel.app/](https://rice-disease-detection-system-dool.vercel.app/)
  - Repository: [https://github.com/AJ115-creator/Rice-Disease-Detection-system](https://github.com/AJ115-creator/Rice-Disease-Detection-system)
- **Database**: Firebase Firestore (Free tier)
- **Authentication**: Firebase Auth (Free tier)

### Deploy Your Own Instance

#### Quick Deploy (15 minutes)
See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for step-by-step instructions.

#### Detailed Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive guide.

#### Recommended Stack (FREE)
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel (Free tier)
- **Database**: Firebase Firestore (Free tier)
- **Auth**: Firebase Auth (Free tier)

## Testing

### Test Image Detection
Use images from `Test data/` folder:
- `bacterial leaf blight/` - Test bacterial infections
- `brown spot/` - Test brown spot disease
- `leaf smut/` - Test leaf smut disease
- `healthy/` - Test healthy plants

### Test Environmental Data
Sample values for good conditions:
```
Maximum Temperature: 35°C
Minimum Temperature: 20°C
Average Temperature: 27.5°C
Precipitation: 150mm
Soil pH: 6.5
Relative Humidity: 75%
```

## API Documentation

### Endpoints

#### Health Check
```http
GET /health
```
Returns API status and model availability.

#### Image Prediction
```http
POST /predict-image/
Content-Type: multipart/form-data

{
  "file": <image file>
}
```

#### Environmental Prediction
```http
POST /predict-tabular/
Content-Type: application/json

{
  "Maximum_Temperature": 35.0,
  "Minimum_Temperature": 20.0,
  "Temperature": 27.5,
  "Precipitation": 150.0,
  "Soil_pH": 6.5,
  "Relative_Humidity": 75.0
}
```

## UI Features

- **Modern Glassmorphism**: Frosted glass effect with backdrop blur
- **Smooth Animations**: Fade-in effects and transitions
- **Tab Navigation**: Easy switch between detection modes
- **Image Preview**: See uploaded images before analysis
- **Real-time Feedback**: Loading states and result display
- **Responsive Design**: Works on mobile, tablet, and desktop

## Security

- Firebase Authentication with email/password and Google OAuth
- Secure API endpoints with CORS configuration
- Environment variable management
- Firestore security rules (configure in Firebase Console)

## Performance

- **Image Processing**: ~2-3 seconds
- **Environmental Analysis**: ~1 second
- **Model Size**: CNN (~15MB), RF (~1MB)
- **Frontend Bundle**: ~500KB gzipped

## Tech Stack

### Frontend
- React 18.3
- Vite 6.0
- Tailwind CSS 3.4
- Axios
- Firebase 11.0

### Backend
- FastAPI 0.95
- TensorFlow 2.12
- Scikit-learn
- NumPy
- Pillow

### DevOps
- Docker support
- GitHub Actions ready
- Multi-platform deployment configs

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Authors

- Your Name - Initial work

## Acknowledgments

- TensorFlow team for deep learning framework
- FastAPI for excellent API framework
- Firebase for authentication and database
- Tailwind CSS for styling utilities

## Support

- **Email**: your.email@example.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/Rice-Disease-Detection-System/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/Rice-Disease-Detection-System/discussions)

## Roadmap

- [ ] Add more disease types
- [ ] Implement real-time detection via camera
- [ ] Add multilingual support
- [ ] Create mobile app (React Native)
- [ ] Add batch image processing
- [ ] Implement user dashboard with analytics
- [ ] Add treatment recommendations
- [ ] Create farmer community features

## Screenshots

### Login Page
Beautiful authentication with email and Google sign-in.

### Image Detection
Upload and analyze rice plant images instantly.

### Environmental Analysis
Check crop conditions based on environmental data.

### History View
Track all your past predictions with timestamps.

---

**Made for farmers and agricultural researchers**

**Help protect rice crops worldwide**
