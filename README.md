# Issue Tracker Frontend

This is the frontend for the Issue Tracker application, built with React, TypeScript, and Tailwind CSS. It provides a modern UI for managing projects, tickets, and teams, and communicates with the backend API for all data operations.

## Features
- User registration and login
- Project dashboard and details view
- Kanban board and list view for tickets
- Create, edit, delete, and filter tickets
- Team management (add/remove members)
- Role-based UI (owner/member)
- Responsive and modern design (Tailwind CSS)
- Real-time filtering and search

## Tech Stack
- React (with hooks and context)
- TypeScript
- Tailwind CSS
- @hello-pangea/dnd for drag-and-drop
- Axios and Fetch API for HTTP requests

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd issue_tracker/frontend/my-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the `my-app` directory if you want to override the API base URL:
```env
REACT_APP_API_BASE_URL=https://issue-tracker-backend-3.onrender.com
```
By default, the app uses the deployed backend URL. Update this if your backend is hosted elsewhere.

### Scripts
- `npm start` — Run the app in development mode (http://localhost:3000)
- `npm run build` — Build the app for production
- `npm test` — Run tests

### Development Workflow
1. Start the development server:
   ```bash
   npm start
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration
- All API calls are made to `https://issue-tracker-backend-3.onrender.com` by default.
- If you want to use a different backend, set `REACT_APP_API_BASE_URL` in your `.env` file.

## Deployment
- Build the app: `npm run build`
- Deploy the contents of the `build/` directory to your preferred static hosting (e.g., Vercel, Netlify).
- Ensure your backend CORS settings allow your deployed frontend URL.

## Troubleshooting
- **CORS errors:** Make sure your frontend URL is allowed in the backend CORS config.
- **API errors:** Check the backend is running and the API base URL is correct.
- **Environment variables not working:** Restart the dev server after changing `.env`.
- **UI/UX bugs:** Check browser console for errors and review component props/state.

## License
MIT
