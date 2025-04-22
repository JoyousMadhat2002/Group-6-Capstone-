# Python-PencilCode

**Python-PencilCode** is an interactive web-based coding space built for novice programmers to visually learn Python through a drag-and-drop environment. Built for UNT Capstone 4901/4902. Developed by [2B-Coders](Team-Members-(2B-Coders)). Inspired by [PencilCode](https://pencilcode.net).

---

## Project Overview

Python-PencilCode was built as part of a team project with the goal of lowering the barrier to learning programming. It uses a drag-and-drop interface, block/text conversion, in-browser code execution, and file saving.

---

## Features

- **Block-Based Programming Editor**  
  Drag-and-drop interface for building Python logic visually

- **Block <-> Text Conversion**  
  Converts between blocks and Python code

- **In-Browser Python Execution**  
  Skulpt runs Python directly in the browser

- **User Authentication**  
  Signup and Login using Firebase

- **Project Saving**  
  Save project files to the Firebase database and open/edit later

- **User Dashboard**  
  Manage saved projects: open, rename, and delete

---

## Team Members (2B-Coders)

- Carlos Contreras
- Mohammad Farhat
- Manuel Flores
- Boone Wilder

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Editor:** CodeMirror 6
- **Code Execution:** Skulpt
- **Backend:** Firebase Firestore

---

## How to Run

### Prerequisites:
- Modern browser
- Visual Studio Code and 'Live Server' extension
- Google Firebase database (if you want project files to be saved to your own)

1. Clone the repository
2. Open the directory in Visual Studio Code and open it using 'Live Server'
3. Use the dashboard to open or create new projects
4. View the Help page to learn more about the blocks

### If you want to use Google Firebase functionality:
1. Create a Firebase Project
2. Enable Authentication (Email/Password) and Firestore Database
3. Open Project Settings and replace `firebaseConfig` with your own credentials 
