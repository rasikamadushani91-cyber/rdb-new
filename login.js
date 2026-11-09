
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    // Check that both fields are filled in
    if (username === "" || password === "") {
        loginMessage.textContent = "Please enter your username and password.";
        return;
    }

    // Demo only: this does NOT verify the username or password.
    // Replace this with server-side authentication before using it for real.
    loginMessage.style.color = "#087443";
    loginMessage.textContent = "Login form submitted. Opening dashboard...";

    window.location.href = "index.html";
});
