
"use strict";

/* =====================================================
   PART 1: DISTRICT DATA
===================================================== */

const DISTRICTS = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya"
];

/* =====================================================
   PART 2: CREATE DISTRICT BUTTONS
===================================================== */

const grid = document.getElementById("districtGrid");

DISTRICTS.forEach(name => {

    const link = document.createElement("a");

    link.className = "district-btn";
    link.textContent = name;

    // Send selected district name to the next page
    link.href = "district-summary.html?district=" +
                encodeURIComponent(name);

    grid.appendChild(link);

});

/* =====================================================
   PART 3: MOBILE NAVIGATION
===================================================== */

const toggle = document.getElementById("navToggle");
const nav = document.getElementById("siteNav");

toggle.addEventListener("click", () => {

    const open = nav.classList.toggle("open");

    toggle.setAttribute("aria-expanded", open);

    toggle.setAttribute(
        "aria-label",
        open ? "Close menu" : "Open menu"
    );

});

/* =====================================================
   PART 4: LOGOUT
===================================================== */

document.getElementById("logoutLink").addEventListener("click", () => {

    sessionStorage.clear();

});
