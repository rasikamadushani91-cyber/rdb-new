/* =====================================================
   district-summary.js : ONE page for ALL districts
   1. Settings   2. District   3. Buttons
   4. Approved projects table  5. District summary table
   ===================================================== */
(() => {

/* ---------- 1. SETTINGS ---------- */
// Use the SAME key your add-project page saves projects with
const STORAGE_KEY = "rdbProjects";

// Names of the fields inside each saved project.
// If your add-project code uses a different name, change it HERE only.
const F = {
    district: "district",       date: "approvedDate",       dsDivision: "dsDivision",
    cdc: "cdc",                 name: "projectName",        approach: "approach",
    sector: "sector",           subSector: "subSector",      item: "item",
    quantity: "quantity",       product: "mainProduct",      units: "productionUnits",
    direct: "directBeneficiaries",  indirect: "indirectBeneficiaries",
    allocation: "approvedAllocation",   physical: "physicalProgress",
    stage: "stage",             // one of A, B1, B2, B3, B4, C, D, E, F, G
    mobilization: "mobilization",   first: "firstPayment",   second: "secondPayment",
    third: "thirdPayment",      final: "finalPayment",       remarks: "remarks",
    status: "status"
};

// Which projects count as "approved"? (change this rule if needed)
const isApproved = p => p[F.status] === "Ongoing" || p[F.status] === "Completed";

const STAGES = ["A", "B1", "B2", "B3", "B4", "C", "D", "E", "F", "G"];

/* ---------- small helpers ---------- */
const $ = id => document.getElementById(id);
const num = v => Number(String(v ?? "").replace(/,/g, "")) || 0;
const money = n => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = n => n.toLocaleString("en-US");

function addRow(body, cells, className) {
    const tr = document.createElement("tr");
    if (className) tr.className = className;
    cells.forEach(c => {
        const td = document.createElement("td");
        td.textContent = c.text;
        if (c.cls) td.className = c.cls;
        tr.appendChild(td);
    });
    body.appendChild(tr);
}

/* ---------- 2. WHICH DISTRICT? ---------- */
// district-summary.html?district=Colombo&view=summary
const params = new URLSearchParams(location.search);
const district = params.get("district") || "";

$("distEn").textContent = district;
document.querySelectorAll(".distSi").forEach(el => el.textContent = district);
document.title = "RDB-PIFS | " + (district || "District");
$("btnAdd").href = "add-project.html?district=" + encodeURIComponent(district);

// Approved projects of this district only
let saved = [];
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) {}
const projects = saved.filter(p =>
    String(p[F.district] || "").trim().toLowerCase() === district.toLowerCase() && isApproved(p));

/* ---------- 3. BUTTONS (switch the two tables) ---------- */
function showView(view) {
    const summary = view === "summary";
    $("viewApproved").hidden = summary;
    $("viewSummary").hidden = !summary;
    $("btnApproved").setAttribute("aria-pressed", !summary);
    $("btnSummary").setAttribute("aria-pressed", summary);
}
$("btnApproved").addEventListener("click", () => showView("approved"));
$("btnSummary").addEventListener("click", () => showView("summary"));

// Column numbers 1 to 24 under the headings
for (let i = 1; i <= 24; i++) {
    const th = document.createElement("th");
    th.textContent = i;
    $("numRow").appendChild(th);
}

// Today's date for "Progress as at"
const today = new Date().toLocaleDateString("en-CA").replace(/-/g, ".");
$("asAt2").textContent = today;

/* ---------- 4. TABLE 1: ALL APPROVED PROJECTS ---------- */
projects
    .sort((a, b) => String(a[F.date]).localeCompare(String(b[F.date])))
    .forEach((p, i) => {
        addRow($("approvedBody"), [
            { text: i + 1 },
            { text: p[F.date] || "" },
            { text: district },
            { text: p[F.dsDivision] || "", cls: "left" },
            { text: p[F.cdc] || "", cls: "left" },
            { text: p[F.name] || "", cls: "left" },
            { text: p[F.approach] || "", cls: "left" },
            { text: p[F.sector] || "", cls: "left" },
            { text: p[F.subSector] || "", cls: "left" },
            { text: p[F.item] || "", cls: "left" },
            { text: p[F.quantity] || "" },
            { text: p[F.product] || "", cls: "left" },
            { text: p[F.units] || "" },
            { text: whole(num(p[F.direct])), cls: "right" },
            { text: whole(num(p[F.indirect])), cls: "right" },
            { text: money(num(p[F.allocation])), cls: "right" },
            { text: num(p[F.physical]) + "%", cls: "right" },
            { text: money(num(p[F.mobilization])), cls: "right" },
            { text: money(num(p[F.first])), cls: "right" },
            { text: money(num(p[F.second])), cls: "right" },
            { text: money(num(p[F.third])), cls: "right" },
            { text: money(num(p[F.final])), cls: "right" },
            { text: p[F.remarks] || "", cls: "left" },
            { text: "" }
        ]);
    });
$("emptyApproved").hidden = projects.length > 0;

/* ---------- 5. TABLE 2: DISTRICT SUMMARY (by DS division) ---------- */
// Add up a list of projects into one summary line
function sumUp(list) {
    const s = {
        count: list.length, direct: 0, allocation: 0, physicalTotal: 0,
        stages: {}, mobilization: 0, first: 0, second: 0, third: 0, final: 0
    };
    STAGES.forEach(st => s.stages[st] = 0);

    list.forEach(p => {
        s.direct       += num(p[F.direct]);
        s.allocation   += num(p[F.allocation]);
        s.physicalTotal += num(p[F.physical]);
        s.mobilization += num(p[F.mobilization]);
        s.first        += num(p[F.first]);
        s.second       += num(p[F.second]);
        s.third        += num(p[F.third]);
        s.final        += num(p[F.final]);
        const st = String(p[F.stage] || "").trim().toUpperCase();
        if (st in s.stages) s.stages[st]++;
    });
    return s;
}

// One table row from a summary line (label = DS name or "Total")
function summaryRow(index, label, s, className) {
    const physical = s.count ? (s.physicalTotal / s.count).toFixed(1) : "0.0";
    // Financial % = payments after the advance, divided by approved allocation
    const paid = s.first + s.second + s.third + s.final;
    const financial = s.allocation ? (paid / s.allocation * 100).toFixed(2) : "0.00";

    const cells = [
        { text: index }, { text: label, cls: "left" },
        { text: whole(s.count) }, { text: whole(s.direct), cls: "right" },
        { text: money(s.allocation), cls: "right" }
    ];
    STAGES.forEach(st => cells.push({ text: s.stages[st] }));
    cells.push({ text: physical + "%" });
    [s.mobilization, s.first, s.second, s.third, s.final].forEach(v =>
        cells.push({ text: money(v), cls: "right" }));
    cells.push({ text: financial + "%" });

    addRow($("summaryBody"), cells, className);
}

if (projects.length) {
    // Group projects by DS division
    const groups = {};
    projects.forEach(p => {
        const ds = String(p[F.dsDivision] || "-").trim();
        (groups[ds] = groups[ds] || []).push(p);
    });

    Object.keys(groups).sort((a, b) => a.localeCompare(b)).forEach((ds, i) =>
        summaryRow(i + 1, ds, sumUp(groups[ds])));

    // Last row: total for the whole district
    summaryRow("", "Total", sumUp(projects), "total");
}
$("emptySummary").hidden = projects.length > 0;

/* ---------- Open the right table (?view=summary) ---------- */
showView(params.get("view") === "summary" ? "summary" : "approved");

})();
