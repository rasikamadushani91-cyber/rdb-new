/* =====================================================
   RDB-PIFS  login.js
   1. Settings   2. Helpers   3. Tabs
   4. Password rules   5. Create account   6. Login
   ===================================================== */

/* ---------- 1. SETTINGS ---------- */
// The ONE admin account (change these two lines to your own)
const ADMIN = {
    email: "admin@rdb.gov.lk",
    password: "Rdb@Admin#2026",
    name: "Administrator",
    role: "admin"
};

const USERS_KEY = "rdbUsers";   // where user accounts are saved in the browser

/* ---------- 2. HELPERS ---------- */
const $ = id => document.getElementById(id);

// Read and save the list of user accounts
const getUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch (e) { return []; }
};
const saveUsers = list => localStorage.setItem(USERS_KEY, JSON.stringify(list));

// Turn a password into a scrambled code (so it is not saved as plain text)
async function hash(text) {
    if (!window.crypto || !crypto.subtle) return text;   // old browser fallback
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Show a message under a form (add "info" class for a blue message)
function say(id, text, info) {
    $(id).textContent = text;
    $(id).classList.toggle("info", !!info);
}

$("year").textContent = new Date().getFullYear();

/* ---------- 3. TABS (Log in / Create account) ---------- */
function showForm(which) {
    const isLogin = which === "login";
    $("loginForm").hidden = !isLogin;
    $("signupForm").hidden = isLogin;
    $("pageTitle").textContent = isLogin ? "Login" : "Create account";
    document.querySelectorAll(".tab").forEach(t =>
        t.classList.toggle("on", t.dataset.show === which));
    say("loginMessage", "");
    say("signupMessage", "");
}

document.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => showForm(t.dataset.show)));

// Show / hide password (works for every eye button)
document.addEventListener("click", e => {
    const btn = e.target.closest(".eye");
    if (!btn) return;
    const input = btn.parentElement.querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.classList.toggle("on", show);
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

/* ---------- 4. STRONG PASSWORD RULES ---------- */
const RULES = {
    len:   p => p.length >= 10,
    upper: p => /[A-Z]/.test(p),
    lower: p => /[a-z]/.test(p),
    num:   p => /\d/.test(p),
    sym:   p => /[^A-Za-z0-9\s]/.test(p)
};

// Tick the rules, fill the strength bar, return true if all rules pass
function checkPassword(p) {
    let passed = 0;
    document.querySelectorAll("#rules li").forEach(li => {
        const ok = RULES[li.dataset.rule](p);
        li.classList.toggle("ok", ok);
        if (ok) passed++;
    });

    const level = passed <= 2 ? "weak" : passed < 5 ? "medium" : "strong";
    $("meterBar").style.width = (p ? passed / 5 * 100 : 0) + "%";
    $("meterBar").className = p ? level : "";
    $("meterText").textContent = p ? "Strength: " + level : "Password strength";
    return passed === 5;
}

$("signupPassword").addEventListener("input", e => checkPassword(e.target.value));

// Make a random strong password (14 characters)
$("suggestBtn").addEventListener("click", () => {
    const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*?"];
    const all = sets.join("");
    const rand = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;

    const chars = sets.map(s => s[rand(s.length)]);          // one of each kind
    while (chars.length < 14) chars.push(all[rand(all.length)]);
    for (let i = chars.length - 1; i > 0; i--) {              // shuffle
        const j = rand(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    const pw = chars.join("");
    $("signupPassword").value = pw;
    $("confirmPassword").value = pw;
    $("signupPassword").type = "text";                        // show it so it can be copied
    checkPassword(pw);
    say("signupMessage", "Copy this password and keep it safe.", true);
});

/* ---------- 5. CREATE ACCOUNT (user accounts only) ---------- */
$("signupForm").addEventListener("submit", async e => {
    e.preventDefault();

    const data = {
        position:     $("position").value,
        firstName:    $("firstName").value.trim(),
        lastName:     $("lastName").value.trim(),
        ministry:     $("ministry").value,
        organization: $("organization").value.trim(),
        email:        $("signupEmail").value.trim().toLowerCase()
    };
    const pass = $("signupPassword").value;

    // Check everything, stop at the first problem
    if (Object.values(data).some(v => !v))
        return say("signupMessage", "Please fill in every field.");
    if (!/^\S+@\S+\.\S+$/.test(data.email))
        return say("signupMessage", "Enter a valid email address.");
    if (data.email === ADMIN.email || getUsers().some(u => u.email === data.email))
        return say("signupMessage", "This email already has an account.");
    if (!checkPassword(pass))
        return say("signupMessage", "Password is not strong enough. Tick every rule.");
    if (pass !== $("confirmPassword").value)
        return say("signupMessage", "Passwords do not match.");

    // Save the new account. The role is always "user", never "admin".
    const users = getUsers();
    users.push({ ...data, role: "user", passHash: await hash(pass), created: new Date().toISOString() });
    saveUsers(users);

    // Go back to login with the email filled in
    $("signupForm").reset();
    checkPassword("");
    showForm("login");
    $("loginEmail").value = data.email;
    say("loginMessage", "Account created. Please log in.", true);
});

/* ---------- 6. LOGIN (admin or user) ---------- */
// Remember who logged in, then open the dashboard
function startSession(name, role, email) {
    sessionStorage.setItem("rdbLoggedIn", "yes");
    sessionStorage.setItem("rdbRole", role);
    sessionStorage.setItem("rdbName", name);
    sessionStorage.setItem("rdbEmail", email);
    location.href = "dashboard.html";
}

$("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("loginEmail").value.trim().toLowerCase();
    const pass = $("loginPassword").value;

    // Admin account
    if (email === ADMIN.email && pass === ADMIN.password)
        return startSession(ADMIN.name, "admin", email);

    // User account
    const code = await hash(pass);
    const user = getUsers().find(u => u.email === email && u.passHash === code);
    if (user)
        return startSession(user.firstName + " " + user.lastName, "user", email);

    // Wrong details: message + shake
    say("loginMessage", "Incorrect email or password.");
    $("card").classList.add("shake");
    setTimeout(() => $("card").classList.remove("shake"), 400);
});

$("forgotLink").addEventListener("click", e => {
    e.preventDefault();
    say("loginMessage", "Please contact the admin to reset your password.", true);
});