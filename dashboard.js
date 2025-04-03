// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    Timestamp,
    updateDoc,
    deleteDoc,
  } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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

function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}


// Wait for authentication state 
onAuthStateChanged(auth, async (user) => {
	// debug
    // console.log("Logged in as:", user.uid);
    // console.log("Fetching from:", `users/${user.uid}/projects`);
    
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

      // debug
    //   console.log("Snapshot empty?", snapshot.empty);
    //   snapshot.forEach(fileDoc => console.log("Project:", fileDoc.data()));

	  const fileListContainer = document.getElementById("file-list");
  
	  if (snapshot.empty) {
		fileListContainer.innerHTML = "<p>You have no saved files.</p>";
	  } else {
		snapshot.forEach(fileDoc => {
            const data = fileDoc.data();
            const fileId = fileDoc.id;
          
            const listItem = document.createElement("div");
            listItem.classList.add("file-list-item");
          
            const name = document.createElement("div");
            name.className = "file-name";
            name.textContent = data.name || "(no name)";
          
            const modified = document.createElement("div");
            modified.className = "file-date";
            
            const updatedDate = data.timestamp?.toDate?.();
            if (updatedDate) {
                const formattedDate = updatedDate.toLocaleString();
                const relativeTime = timeAgo(updatedDate);
                modified.textContent = `Last Modified: ${formattedDate} (${relativeTime})`;
            } else {
                modified.textContent = "Last Modified: N/A";
            }
              
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "file-buttons";
          
            // Open button
            const openBtn = document.createElement("button");
            openBtn.textContent = "Open";
            openBtn.onclick = () => {
              localStorage.setItem("loadedFileName", data.name);
              localStorage.setItem("loadedFileContent", data.code);
              window.location.href = "index.html";
            };
          
            // Rename button
            const renameBtn = document.createElement("button");
            renameBtn.textContent = "Rename";
            renameBtn.onclick = () => {
                const originalName = data.name;
                const input = document.createElement("input");
                input.type = "text";
                input.value = originalName;
                input.className = "inline-rename-input";
              
                name.replaceWith(input);
                input.focus();
              
                const cancelRename = () => {
                  input.replaceWith(name);
                };
              
                const saveRename = async () => {
                  const newName = input.value.trim();
                  if (newName && newName !== originalName) {
                    try {
                      await updateDoc(doc(db, "users", userId, "projects", fileId), {
                        name: newName,
                        timestamp: Timestamp.now()
                      });
                      location.reload(); // Refresh list
                    } catch (err) {
                      alert("Rename failed");
                      console.error(err);
                      cancelRename();
                    }
                  } else {
                    cancelRename();
                  }
                };
              
                input.addEventListener("keydown", (e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") cancelRename();
                });
              
                input.addEventListener("blur", () => {
                  saveRename();
                });
            };
              
            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteFile(userId, fileId);
          
            buttonContainer.append(openBtn, renameBtn, deleteBtn);
            listItem.append(name, modified, buttonContainer);
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


// Delete file
async function deleteFile(userId, fileId) {
  const confirmed = confirm("Are you sure you want to delete this file?");
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "users", userId, "projects", fileId));
    alert("File deleted.");
    location.reload();
  } catch (err) {
    console.error("Error deleting file:", err);
    alert("Failed to delete file.");
  }
}