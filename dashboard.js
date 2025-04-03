// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

import {
    openLoginDialog,
    createLoginDialog,
    createSignupDialog,
    attemptLogin,
    attemptSignup,
    logoutUser,
    closeDialogBoxes
  } from "./scripts/authDialogs.js";

// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyCteFAmh1TjbbQB0hsbBwcbqwK8mofMO4Y",
	authDomain: "b-coders-database.firebaseapp.com",
	projectId: "b-coders-database",
	storageBucket: "b-coders-database.appspot.com",
	messagingSenderId: "268773123996",
	appId: "1:268773123996:web:fec77ef63557a9c6b50a59",
	measurementId: "G-92LTT20BXB"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for authentication state 
onAuthStateChanged(auth, async (user) => {
	if (!user) {
		if (typeof openLoginDialog === "function") {
		  openLoginDialog(); // Reuse the existing dialog
		} else {
		  alert("Login functionality is not available.");
		}
		return;
	  }
  
	const userId = user.uid;
	const userProjectsRef = collection(db, "users", userId, "projects");
  
	try {
	  const snapshot = await getDocs(userProjectsRef);
	  const fileListContainer = document.getElementById("file-list");
  
	  if (snapshot.empty) {
		fileListContainer.innerHTML = "<p>You have no saved files.</p>";
	  } else {
		snapshot.forEach(doc => {
		  const data = doc.data();
		  const listItem = document.createElement("div");
		  listItem.classList.add("file-list-item");
		  listItem.textContent = data.name;
		  listItem.addEventListener("click", () => {
			localStorage.setItem("loadedFileName", data.name);
			localStorage.setItem("loadedFileContent", data.code);
			window.location.href = "index.html";
		  });
		  fileListContainer.appendChild(listItem);
		});
	  }
	} catch (err) {
	  console.error("Error loading user files:", err);
	}

    const loginBtn = document.getElementById("loginButton");

    if (loginBtn) {
        if (user) {
          loginBtn.textContent = "Log Out";
          loginBtn.onclick = () => {
            auth.signOut().then(() => {
              window.location.reload();
            });
          };
        } else {
          loginBtn.textContent = "Log In";
          loginBtn.onclick = () => openLoginDialog();
        }
      }
  });