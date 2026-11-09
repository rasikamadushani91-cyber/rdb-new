// Demo-only guard: load this in <head> of pages that need login.
// It runs in the browser, so it is NOT real security.
const LOGIN_KEY = "rdbLoggedIn";

if (sessionStorage.getItem(LOGIN_KEY) !== "yes") {
    location.replace("login.html");
}

document.addEventListener("click", event => {
    if (event.target.closest("[data-logout]")) {
        event.preventDefault();
        sessionStorage.removeItem(LOGIN_KEY);
        location.href = "login.html";
    }
});
