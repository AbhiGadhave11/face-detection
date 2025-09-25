# 🎯 Real-Time Multi-Camera Face Detection Dashboard

A modern, full-stack web application for real-time face detection across multiple camera feeds using WebRTC streaming and real-time alerts.

## 📸 Demo

### Live Demo
- **Video Demonstration**: [[demo video Link]](https://drive.google.com/file/d/1EhOqUfwlsOiTVsOh8BVxPw-HsjkxE7BW/view?usp=sharing)
- **GitHub Repository**: [[GitHub repo link]](https://github.com/AbhiGadhave11/face-detection)

### Test Credentials
```
Username: admin
Password: secret
```

## 🚀 Features

### ✨ Current Implementation
- **🔐 Authentication System** - JWT-based login with secure password hashing
- **📷 Camera Management** - Complete CRUD operations for camera configuration
  - Add cameras with RTSP URLs
  - Edit camera details (name, location, stream URL)
  - Enable/disable cameras
  - Delete cameras with confirmation
- **🎛️ Real-time Dashboard** - Responsive Material-UI interface
  - Camera grid view with status indicators
  - Start/stop streaming controls
  - Real-time connection status
- **⚡ WebSocket Integration** - Live updates between frontend and backend
  - Real-time camera status changes
  - Connection status monitoring
  - Multi-user synchronization
- **📊 Database Management** - PostgreSQL with Prisma ORM
  - User management
  - Camera configurations
  - Alert storage (structure ready)
- **🎨 Modern UI/UX** - Clean, responsive design
  - Material-UI components
  - Mobile-friendly interface

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **Axios** for HTTP requests
- **WebSocket** for real-time communication

### Backend
- **Node.js** with TypeScript
- **Hono** web framework
- **Prisma ORM** with PostgreSQL
- **WebSocket Server** for real-time updates
- **JWT Authentication**
- **bcrypt** for password hashing

### Database
- **PostgreSQL** (Cloud-hosted on Neon)
- **Prisma** for type-safe database access

## 📁 Project Structure

```
face-detection-project/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── cameras/     # Camera management components
│   │   │   ├── dashboard/   # Dashboard layout
│   │   │   └── common/      # Shared components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── hooks/           # Custom hooks (WebSocket)
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── backend/                 # Node.js TypeScript server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── utils/           # Database, auth, WebSocket utilities
│   │   ├── scripts/         # Database seeding scripts
│   │   └── index.ts         # Main server file
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
└── README.md
```

## 🔧 Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (local or cloud)

### 1. Clone Repository
```bash
git clone https://github.com/AbhiGadhave11/face-detection
cd face-detection-project
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and configurations

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with admin user
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API URLs

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/health

## 🔐 Environment Configuration

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@hostname:5432/database"

# Server
PORT=8000
JWT_SECRET="your-super-secret-jwt-key"

# Admin User
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="secret"
```

### Frontend (.env.local)
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000

# App Configuration
VITE_APP_NAME=Face Detection Dashboard
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### Camera Management
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Create new camera
- `GET /api/cameras/:id` - Get camera details
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Delete camera
- `POST /api/cameras/:id/start` - Start camera stream
- `POST /api/cameras/:id/stop` - Stop camera stream

### System
- `GET /health` - System health check
- `GET /health/websocket` - WebSocket health check

## 🎮 Usage

### 1. Authentication
1. Open the application
2. Login with admin credentials
3. Access the dashboard

### 2. Camera Management
1. Click "Add Camera" to create new camera
2. Fill in camera details:
   - **Name**: Descriptive camera name
   - **RTSP URL**: Camera stream URL (format: `rtsp://username:password@ip:port/path`)
   - **Location**: Physical camera location
3. Use play/stop buttons to control streaming
4. Edit or delete cameras as needed

### 3. Real-time Features
- Camera status updates automatically across all connected browsers
- Connection status indicator shows live/offline status
- WebSocket connection provides instant synchronization

## 🚧 Known Limitations & Future Improvements

### Current Limitations

#### 1. Video Processing & Face Detection
- **Missing Go Worker**: The core face detection worker service is not implemented
- **No Real Video Streams**: Currently shows placeholder video components
- **No Face Detection**: Actual computer vision processing not implemented
- **No WebRTC Integration**: Video streaming infrastructure not connected

#### 2. Alert System
- **Database Structure Only**: Alert tables exist but no alert generation
- **No Real-time Alerts**: Face detection alerts not implemented
- **No Alert Management UI**: Frontend alert components are placeholders

#### 3. Stream Management
- **RTSP Integration**: No actual RTSP stream reading
- **MediaMTX Integration**: Stream server not integrated
- **Video Codec Handling**: No video processing pipeline

### 🔮 Future Improvements

#### Phase 1: Video Processing Core
- **Go Worker Service**: Implement OpenCV-based face detection worker
  - RTSP stream reading with FFmpeg/OpenCV
  - Real-time face detection using go-face or OpenCV DNN
  - Frame processing with bounding box overlays
  - Performance optimization for multiple streams

#### Phase 2: Real-time Video Streaming
- **MediaMTX Integration**: Set up RTMP/WebRTC streaming server
- **WebRTC Frontend**: Implement video player components
- **Stream Quality Management**: Adaptive bitrate and resolution
- **Frame Rate Optimization**: Dynamic frame dropping for real-time performance

#### Phase 3: Advanced Face Detection
- **ML Model Integration**: 
  - Custom face detection models
  - Face recognition capabilities
  - Person tracking across frames
  - Crowd density analysis
- **Alert Intelligence**:
  - Smart alerting (reduce false positives)
  - Alert aggregation and filtering
  - Custom alert rules and thresholds

#### Phase 4: Production Features
- **Scalability**: 
  - Horizontal scaling for multiple workers
  - Load balancing for video processing
  - Database clustering and replication
- **Security**:
  - API rate limiting
  - Role-based access control
  - Encrypted video streams
- **Monitoring**:
  - System performance metrics
  - Stream health monitoring
  - Detailed logging and analytics

#### Phase 5: Advanced UI/UX
- **Advanced Dashboard**:
  - Multi-camera grid view with live video
  - Drag-and-drop camera arrangement
  - Full-screen video modes
  - Picture-in-picture support
- **Mobile Application**: React Native mobile app
- **Notification System**: Push notifications for alerts

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │  Node.js API    │    │  PostgreSQL     │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST APIs     │    │ • Users         │
│ • Camera CRUD   │    │ • WebSocket     │    │ • Cameras       │
│ • Real-time UI  │    │ • JWT Auth      │    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │ (Future Integration)
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Go Worker     │    │   MediaMTX      │
                       │   (Planned)     │◄──►│   (Planned)     │
                       │                 │    │                 │
                       │ • RTSP Reader   │    │ • Stream Server │
                       │ • Face Detection│    │ • WebRTC        │
                       │ • Alert Engine  │    │ • RTMP/HLS      │
                       └─────────────────┘    └─────────────────┘
```

## 🤝 Contributing

This project demonstrates a solid foundation for a face detection system with room for significant expansion. The current implementation provides:

- ✅ **Production-ready** authentication and camera management
- ✅ **Scalable architecture** ready for video processing integration
- ✅ **Modern development practices** with TypeScript and proper project structure
- ✅ **Real-time communication** infrastructure via WebSocket



feel free to use this project as a foundation for your own face detection applications.

---

**Built with ❤️ using React, Node.js, and TypeScript**