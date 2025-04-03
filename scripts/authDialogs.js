import { showNotification } from "../scripts.js";

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// ==========================
// Authencation: Login and Logout + Dialogs
// ==========================

const auth = getAuth();

// Function to open the login dialog
export function openLoginDialog() {
    if (!document.getElementById("login-dialog")) {
      createLoginDialog();
    }
}

// Function to create the login dialog
export function createLoginDialog() {
    closeDialogBoxes(); // Close any existing login dialog

    const loginDialog = document.createElement("div");
    loginDialog.id = "login-dialog";
    loginDialog.classList.add("dialog-container");

    // Create the login dialog content (makes HTML file cleaner by not having to include this in the main HTML file)
    loginDialog.innerHTML = `
        <div class="dialog-box">
            <h2>Log In</h2>
            <label for="login-email">Email:</label><br>
            <input type="email" id="login-email" placeholder="Enter your email"><br>

            <label for="login-password">Password:</label><br>
            <input type="password" id="login-password" placeholder="Enter your password"><br>

            <p id="login-error" class="error-message hidden"></p>

            <p class="switch-auth">
            <span>Don't have an account?</span><br>
            <span id="switch-to-signup" class="auth-link">Click here to make an account!</span>
            </p>

            <div class="dialog-buttons">
                <button id="login-submit">Log In</button>
                <button id="login-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(loginDialog);

    // Add event listeners
    document.getElementById("login-submit").addEventListener("click", attemptLogin);
    document.getElementById("login-cancel").addEventListener("click", closeDialogBoxes);
    document.getElementById("switch-to-signup").addEventListener("click", createSignupDialog);

    // Add event listeners for pressing "Enter" key
    document.getElementById("login-email").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        attemptLogin();
    }
    });

    document.getElementById("login-password").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        attemptLogin();
    }
    });

    // Add event listener to close dialog when clicking outside the dialog box
    loginDialog.addEventListener("click", function (event) {
    if (event.target === loginDialog) {
        closeDialogBoxes();
    }
    });
}

// Function to create Signup dialog
export function createSignupDialog() {
    closeDialogBoxes(); // Close any existing login dialog

    const loginDialog = document.getElementById("login-dialog");
    if (loginDialog) loginDialog.remove(); // Remove login form

    const signupDialog = document.createElement("div");
    signupDialog.id = "login-dialog";
    signupDialog.classList.add("dialog-container");

    signupDialog.innerHTML = `
        <div class="dialog-box" id="signup-box">
            <h2>Create an Account</h2>
            <label for="signup-email">Email:</label><br>
            <input type="email" id="signup-email" placeholder="Enter your email"><br>

            <label for="signup-password">Password:</label><br>
            <input type="password" id="signup-password" placeholder="Enter your password"><br>

            <p id="signup-error" class="error-message hidden"></p>

            <p class="switch-auth">Already have an account?<br>
                <span id="switch-to-login" class="auth-link">Click here to log in</span>
            </p>

            <div class="dialog-buttons">
                <button id="signup-submit">Sign Up</button>
                <button id="signup-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(signupDialog);

    // Add event listeners
    document.getElementById("signup-submit").addEventListener("click", attemptSignup);
    document.getElementById("signup-cancel").addEventListener("click", closeDialogBoxes);
    document.getElementById("switch-to-login").addEventListener("click", createLoginDialog);

    signupDialog.addEventListener("click", function (event) {
        if (event.target === signupDialog) {
        closeDialogBoxes();
        }
    });
}

// Function to attempt user login
export function attemptLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorMsg = document.getElementById("login-error");

    if (!email || !password) {
        errorMsg.textContent = "Please enter email and password.";
        errorMsg.classList.remove("hidden");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        console.log("User logged in:", userCredential.user);
        closeDialogBoxes(); // Close the login dialog
        updateUIAfterLogin(userCredential.user); // Update the UI
        showNotification("Successfully logged in!", "green");
        })
        .catch((error) => {
        console.error("Login Error:", error.message);
        errorMsg.textContent = error.message;
        errorMsg.classList.remove("hidden");
        showNotification("Login failed. Please try again.", "red");
        });
}
  
// Function to attempt user signup
export function attemptSignup() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const errorMsg = document.getElementById("signup-error");

    if (!email || !password) {
        errorMsg.textContent = "Please enter an email and password.";
        errorMsg.classList.remove("hidden");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        console.log("User signed up:", userCredential.user);
        closeDialogBoxes(); // Close signup dialog
        updateUIAfterLogin(userCredential.user); // Update UI
        showNotification("Account created successfully!", "blue");
        })
        .catch((error) => {
        console.error("Signup Error:", error.message);
        errorMsg.textContent = error.message;
        errorMsg.classList.remove("hidden");
        showNotification("Signup failed. Please try again.", "red");
    });
}

// Function to log out the current user
export function logoutUser() {
  auth.signOut()
    .then(() => {
      console.log("User logged out");
      updateUIAfterLogin(null); // Reset UI
      showNotification("Logged out successfully!", "gray");
    })
    .catch((error) => {
      console.error("Logout Error:", error.message);
      showNotification("Error logging out. Try again.", "red");
    });
}

// Function to close the login dialog
export function closeDialogBoxes() {
  const existingDialogs = document.querySelectorAll(".dialog-container");
  existingDialogs.forEach(dialog => dialog.remove());
}