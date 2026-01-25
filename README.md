# SocialController

A social media broadcasting application that allows managing multiple social accounts and broadcasting content.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, SQLite
- **Database**: SQLite (persisted in `backend/broadcaster.db`)

## Deployment (Docker)

The easiest way to run the application is using Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Running the App

1. Start the services:
   ```bash
   docker-compose up --build -d
   ```

2. Access the application:
   - **Frontend**: [http://localhost:2340](http://localhost:2340)
   - **Backend API**: [http://localhost:56123](http://localhost:56123)

### Configuration

- **Ports**:
  - Frontend maps port `2340` to container port `80`.
  - Backend maps port `56123` to container port `3000`.
- **Data Persistence**:
  - Database is persisted in `./backend/broadcaster.db`.

## Local Development

If you want to run the services locally without Docker:

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`.

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   
   **Note**: For local development, ensure `frontend/src/api.ts` points to the correct backend URL (default logic uses relative path or `VITE_API_URL`).
