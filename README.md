# 🌿 EcoPath AI

EcoPath AI is an intelligent Carbon Footprint Tracker that empowers individuals to calculate, analyze, and reduce their environmental impact. Built with a modern tech stack, EcoPath AI moves away from arbitrary activity tracking and uses an **impact-based sustainability scoring matrix** to ensure users are rewarded only for true eco-friendly choices.

🌍 **Live Production App:** [https://gdg-x-gfg-project.uc.r.appspot.com](https://gdg-x-gfg-project.uc.r.appspot.com)

## ✨ Core Features
*   **Intelligent Dashboard:** Visualize your daily CO2 savings, Sustainability Score, and EcoPoints via interactive charts.
*   **Impact-Based Activity Logger:** Log transportation, electricity usage, diet, and shopping. The app calculates real CO2 emissions using dynamically tracked emission factors.
*   **EcoBot AI Coach:** A built-in generative AI assistant that analyzes your logs and offers personalized, highly specific tips to reduce your carbon footprint.
*   **Global Scoreboard:** Compete with users globally on an impact-driven leaderboard.
*   **Universal Search Palette:** Press `Ctrl + K` (or `Cmd + K`) on any page to open a quick-search modal to jump anywhere in the app instantly.
*   **Secure Authentication:** Native Google Sign-In and robust encrypted Email/Password authentication.

---

## 🚀 Try It Out Now
If you just want to test the application, you don't need to run it locally! 
Simply visit the live link below, create a free account, or Sign In with Google:

**🔗 [Access EcoPath AI Here](https://gdg-x-gfg-project.uc.r.appspot.com)**

---

## 💻 Running the App Locally (For Developers)

If you wish to fork this repository or run the application locally on your machine, follow these steps.

### Prerequisites
*   [Node.js](https://nodejs.org/en) (v18 or higher)
*   A MongoDB Cluster URI (or local MongoDB server)
*   A Groq API Key (for the EcoBot AI)

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd ecopath-ai
```

### 2. Setup the Backend
The backend utilizes Express.js and TypeScript, and statically serves the frontend.

```bash
cd backend
npm install
```

### 3. Environment Variables
Create a file named `.env` inside the `backend` folder and add your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/ecopath?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_string
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 4. Build and Run
Compile the TypeScript code and start the local server:
```bash
# Compile TypeScript to JavaScript
npm run build

# Start the server
npm run start
```

You can now open your browser and navigate to `http://localhost:5000` to interact with the local version of EcoPath AI!
