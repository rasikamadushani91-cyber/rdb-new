document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // Mobile menu
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("siteNav");
    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            const open = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open);
        });
    }

    // Login button becomes "Dashboard" after signing in
    const loginLink = document.getElementById("loginLink");
    if (loginLink && sessionStorage.getItem("rdbLoggedIn") === "yes") {
        loginLink.textContent = "Dashboard";
        loginLink.href = "dashboard.html";
    }
});
