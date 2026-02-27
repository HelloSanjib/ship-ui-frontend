# Ship UI - Frontend

This is the fully custom, modern React + Vite frontend for the AI Component Generator project (**Ship UI**).

## Tech Stack
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS classes
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Icons**: React Icons
- **HTTP Client**: Axios

## Getting Started

1. Set up your `.env` variables:
```
VITE_GEMINI_API_KEY=your_google_gemini_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000/api
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## Features
- Dynamic component generation using Google Gemini 2.5 Flash
- Responsive Dark and Light themes
- Google OAuth Login integration
- Real-time generation code preview
- Custom Monaco Editor to view and copy output code
- Full history management system (Syncs with backend)
