// Import Firebase modules
//
// import { 
//   collection, 
//   doc, 
//   getDocs, 
//   Timestamp,
//   updateDoc,
//   deleteDoc,
// } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

import { openLoginDialog } from "./scripts/authDialogs.js";
import { 
  auth, 
  db, 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
  deleteDoc,
  onAuthStateChanged, 
} from "./scripts/firebaseConfig.js";

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
                      const oldDocRef = doc(db, "users", userId, "projects", fileId);
                      const newDocRef = doc(db, "users", userId, "projects", newName);
                      
                      // Get old data
                      const oldDocSnap = await getDoc(oldDocRef);
                      if (oldDocSnap.exists()) {
                        const oldData = oldDocSnap.data();
                      
                        // Create new doc with updated name
                        await setDoc(newDocRef, {
                          ...oldData,
                          name: newName,
                          timestamp: Timestamp.now()
                        });
                      
                        // Delete old doc
                        await deleteDoc(oldDocRef);
                      
                        location.reload(); // Refresh dashboard
                      } else {
                        alert("Original file not found.");
                      }
                      
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

// New project button
document.getElementById("newProjectButton").addEventListener("click", () => {
  localStorage.removeItem("loadedFileName");
  localStorage.removeItem("loadedFileContent");
  window.location.href = "index.html";
});

document.getElementById("settingsButton").addEventListener("click", () => {
  document.getElementById("settingsModal").style.display = "block";
});

document.getElementById("cancelSettings").addEventListener("click", () => {
  document.getElementById("settingsModal").style.display = "none";
});

document.getElementById("darkModeBtn").addEventListener("click", () => {
  document.body.classList.add("dark-mode");
  document.getElementById("settingsModal").style.display = "none";
});

document.getElementById("lightModeBtn").addEventListener("click", () => {
  document.body.classList.remove("dark-mode");
  document.getElementById("settingsModal").style.display = "none";
});
