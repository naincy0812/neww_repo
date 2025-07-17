# HelixDashboard Backend

This is the backend service for the HelixDashboard project.

## How to Run This Project

Follow these steps to set up and run the backend locally:

### Prerequisite: MongoDB Community Edition (CE) Setup
- Make sure you have MongoDB Community Edition (CE) installed and running on your local machine.
- Download MongoDB CE from: https://www.mongodb.com/try/download/community
- Start the MongoDB server:
  - On Windows: Open Command Prompt and run `mongod`
  - On macOS/Linux: Use `brew services start mongodb-community` or `sudo systemctl start mongod`
- The default connection string for local MongoDB is: `mongodb://localhost:27017/yourdbname`
- Add this connection string to your `.env` file as `MONGO_URI` or the variable name used in your code.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HelixDashboard/backend
```

### 2. Create and Activate a Virtual Environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
- Copy `.env.example` to `.env` (if `.env.example` exists), or create a `.env` file.
- Fill in all required environment variables (database URLs, API keys, etc.).

### 5. Run the Backend Server
```bash
python app.py
```
- The server will start on the port defined in your code or `.env` file.

### 6. (Optional) Run Tests
- If you have tests set up, run them with your preferred tool (e.g., pytest).

---

## Notes
- Python 3.8+ is recommended.
- Ensure your virtual environment is activated before installing dependencies or running the server.
- Update the instructions if your backend uses a different entry point or framework.

---
   ```

## Project Structure
- `src/` or main backend scripts - Source code and logic
- `.env` - Environment variables (not committed)
- `requirements.txt` - Python dependencies

## Notes
- Compiled files, environment files, logs, and IDE settings are gitignored
- Adjust instructions as needed for your backend framework

---
For more details, see the source code or contact the project maintainer.
