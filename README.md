# Movie Streamer

A full-stack movie streaming application featuring a **React/Vite** frontend and an **Express/Node.js** backend.

## 📁 Repository Structure
```
Movie_Streamer/
├── frontend/  # React/Vite UI
├── backend/   # Express/Node.js proxy server
├── .gitignore
└── package.json (root)
```

## 🚀 Getting Started

### 1. Setup Backend
1. Go to `backend/` folder.
2. Run `npm install`.
3. Create `.env` and add:
   ```env
   TMDB_API_KEY=your_key_here
   PORT=5000
   ```
4. Run `node server.js`.

### 2. Setup Frontend
1. Go to `frontend/` folder.
2. Run `npm install`.
3. Run `npm run dev`.

### 3. (Optional) Run both from root
```bash
npm run frontend # starts vite
npm run backend  # starts the server
```

## 🔒 Security
- TMDB API keys are hidden behind the backend proxy server.
- Firebase keys are restricted by domain in the Google Cloud/Firebase console.
