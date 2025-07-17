# HelixDashboard Frontend

This is the frontend application for the HelixDashboard project, built with React and TypeScript.

## How to Run This Project

Follow these steps to set up and run the frontend locally:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HelixDashboard/frontend
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
- Copy `.env.example` to `.env` (if `.env.example` exists), or create a `.env` file.
- Fill in all required environment variables (API endpoints, client IDs, etc.).

### 4. Start the Development Server
```bash
npm start
```
- The app will be available at `http://localhost:3000` by default.

### 5. Build for Production
```bash
npm run build
```
- The optimized production build will be in the `build` folder.

### 6. Run Tests (Optional)
```bash
npm test
```

---

## Notes
- Node.js (v16 or newer) and npm should be installed on your machine.
- Make sure the backend server is running if the frontend depends on API calls.
- For authentication, ensure Azure AD/MSAL settings in `.env` are correct.

---

## Project Structure
- `src/` - Source code for React components and logic
- `.env` - Environment variables (not committed)
- `package.json` - Project metadata and dependencies

## Scripts
- `npm start` - Start the development server
- `npm run build` - Build the app for production
- `npm test` - Run tests

## Notes
- Node modules and environment files are gitignored
- Uses @azure/msal-react for authentication

---
For more details, see the source code or contact the project maintainer.
