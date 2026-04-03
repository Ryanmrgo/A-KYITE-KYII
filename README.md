# Movie Streamer - Full-Stack Production Streaming Platform

## Overview
Movie Streamer is a modern, high-performance streaming application designed for seamless media consumption. The platform features an intuitive user interface, real-time watch progress synchronization, and a secure backend proxy to protect API integrity. It leverages a professional distributed cloud architecture for maximum reliability and scalability.

## Core Features
- **Real-Time Synchronized Progress**: Automatically saves and resumes movie and TV episodes across devices using Firestore live listeners.
- **Personalized Experience**: Dedicated Favorites system and "Continue Watching" row for instant access to ongoing content.
- **Top 10 Rankings**: Dynamic weekly rankings for both Movies and TV shows powered by the TMDB API.
- **Secure Backend Proxy**: All external API calls are routed through a Node.js server to ensure sensitive API keys never reach the client-side.
- **Responsive Media Player**: High-definition video player that persists playback state even during background data updates.

## Technology Stack

### Frontend
- **React.js**: Functional components with hooks and context-based state management.
- **React Router**: Client-side routing for seamless page transitions.
- **Vite**: Modern Build tool and development server for rapid iteration.
- **Firebase SDK**: Handles Authentication and real-time NoSQL database operations.

### Backend
- **Node.js & Express**: High-performance backend routing and API proxying.
- **Axios**: Secure communication with the TMDB external API.
- **Docker**: Containerized environment ensuring consistency between local and production stages.

### Cloud Infrastructure (AWS)
- **Amazon S3**: Hosting for the optimized production build of the React frontend.
- **Amazon CloudFront**: Content Delivery Network (CDN) providing global acceleration and SSL termination.
- **Amazon EC2**: Virtual server hosting the containerized backend services.
- **AWS IAM**: Strict permission policies for automated deployment security.

## Infrastructure Architecture
The platform utilizes a decoupled architecture where the frontend and backend are hosted on separate services but unified under a single CloudFront distribution:
1. **Frontend Origin**: CloudFront routes base traffic to the S3 bucket.
2. **Backend Origin**: CloudFront identifies the `/api/*` path pattern and routes requests directly to the EC2 instance via HTTP.

## CI/CD Pipeline
Deployment is fully automated using GitHub Actions. Any push to the main branch triggers specialized workflows:
- **Frontend Workflow**: Installs dependencies, builds the Vite application, syncs files to S3, and triggers a CloudFront cache invalidation.
- **Backend Workflow**: Builds a new Docker image, pushes it to Docker Hub, and executes a remote SSH script on EC2 to pull and restart the updated container.

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- Docker (optional, for backend testing)
- Firebase Account
- TMDB API Key

### Environment Configuration

#### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:5000
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

#### Backend (.env)
```env
TMDB_API_KEY=YOUR_TMDB_API_KEY
PORT=5000
```

### Installation
1. Clone the repository: `git clone https://github.com/PasiAbey/movie_stream_site.git`
2. Install dependencies for the root and subdirectories: `npm install && npm run install-all`
3. Start the backend: `npm run backend`
4. Start the frontend: `npm run frontend`

## License
Distributed under the MIT License. See `LICENSE` for more information.
