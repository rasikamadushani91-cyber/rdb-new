
/* ==============================
   1. MOBILE NAVIGATION MENU
============================== */

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

// Open and close the menu
menuButton.addEventListener("click", function () {

    navLinks.classList.toggle("show");

    const menuIsOpen = navLinks.classList.contains("show");

    menuButton.textContent = menuIsOpen ? "✕" : "☰";

    menuButton.setAttribute("aria-expanded", menuIsOpen);

    menuButton.setAttribute(
        "aria-label",
        menuIsOpen ? "Close menu" : "Open menu"
    );

});

// Close menu after clicking a navigation link
const navigationItems = document.querySelectorAll("#navLinks a");

navigationItems.forEach(function (item) {

    item.addEventListener("click", function () {

        navLinks.classList.remove("show");

        menuButton.textContent = "☰";

        menuButton.setAttribute("aria-expanded", "false");

        menuButton.setAttribute("aria-label", "Open menu");

    });

});


/* ==============================
   2. AUTOMATIC COPYRIGHT YEAR
============================== */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* ==============================
   3. HERO IMAGE ERROR HANDLING
============================== */

const heroImage = document.querySelector(".hero-image img");

if (heroImage) {

    heroImage.addEventListener("error", function () {

        this.alt = "Rural landscape image unavailable";

    });

}


/* ==============================
   4. CONSOLE MESSAGE
============================== */

console.log("RDB-PIFS Home Page Loaded Successfully!");
