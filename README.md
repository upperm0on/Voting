# KsTS Ballot System 🗳️

Welcome to the **KsTS Ballot System**! This is a simple and beautiful website that schools can use to hold student elections. 

This guide will teach you how the project is organized and how to run it on your computer. We wrote this so that anyone—even a beginner—can understand it!

---

## 🌟 How the Project is Made

The project is split into two main parts. Think of it like a restaurant:

1. **The Backend (The Kitchen)**: This is built using **Python and Django**. It sits in the background, talks to the database, and processes all the raw data (like candidates, tokens, and votes). It runs on port `1234`.
2. **The Frontend (The Dining Room)**: This is built using **React, TypeScript, and Vite**. This is the beautiful visual screen that voters and administrators click on. It runs on port `5173`.

---

## 📂 Folder Structure

Here is how the files are organized:

* `requirements.txt`: A list of Python libraries needed for the backend kitchen.
* `db.sqlite3`: The small database file where candidate names, voter tokens, and votes are stored.
* `manage.py`: The main Python script used to control the backend server.
* `voting_ksts/`: The core settings and configuration folder for the Django backend.
* `center/`: The main backend app containing database schemas and endpoint views.
* `frontend/`: The React web application codebase.
    * `src/pages/VotePage/`: Screen views where students verify their token and select their candidates.
    * `src/pages/ResultsPage/`: Dashboard showing election vote counts.
    * `src/pages/AdminPage/`: Dashboard where administrators manage the election.
    * `src/App.tsx`: The main navigation page.
    * `src/index.css`: The root style file containing colors and fonts.

---

## 🚀 How to Run the Project

Follow these steps to start the servers on your computer:

### Step 1: Start the Backend (The Brain)

1. Make sure you have **Python** installed on your computer.
2. Open your terminal or command prompt inside the project folder.
3. Install the required Python packages by running:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server by running:
   ```bash
   python manage.py runserver 1234
   ```
5. You should see a message saying the server is running on `http://127.0.0.1:1234/`. Keep this terminal window open!

---

### Step 2: Start the Frontend (The Screens)

1. Make sure you have **Node.js** installed on your computer.
2. Open a **new** terminal window.
3. Move into the `frontend` folder:
   ```bash
   cd frontend
   ```
4. Install the web page packages by running:
   ```bash
   npm install
   ```
5. Start the frontend developer server by running:
   ```bash
   npm run dev
   ```
6. Open your web browser and go to `http://localhost:5173/`. You are ready to vote!

---

## 🔑 Administrative Control Panel

To manage positions, candidates, and voter tokens:

1. Click on **Admin Panel** in the top navigation bar.
2. Enter the administrator credentials:
   * **Username**: `admin`
   * **Password**: `admin123`
3. Click **Authorize Session**.
4. From here, you can generate voter tokens, register candidates, add positions, and view live results.
5. When you are done, click **Log Out** in the top right corner to lock the session.

---

## 🎨 Changing Theme Colors and Fonts

If you want to update the theme to use your school's official colors or fonts, you can change the CSS root variables in the style sheet located at:
`frontend/src/index.css`

Simply look for the `:root` block at the very top of the file:
```css
:root {
  --primary-color: #2563eb;  /* Update this to your primary school color */
  --primary-hover: #1d4ed8;
  --font-sans: 'Outfit', sans-serif; /* Update this to your preferred school font */
}
```
Updating these values will change the colors and font styling across the entire website automatically!
