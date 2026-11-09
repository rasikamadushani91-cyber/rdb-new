
"use strict";

const STORAGE_KEY = "rdbPifsProjects";

const columns = [
    ["projectId", "Project ID"],
    ["projectName", "Project Name"],
    ["district", "District"],
    ["division", "DS Division"],
    ["gsDivision", "GN Division"],
    ["sector", "Sector"],
    ["responsiblePerson", "Responsible Person"],
    ["projectDate", "Project Date"],
    ["projectStatus", "Status"],
    ["progress", "Progress (%)"],
    ["description", "Description"],
    ["receivedDS", "Received DS Count"],
    ["receivedGN", "Received GN Count"],
    ["approvedGN", "Approved GN Count"],
    ["rejectedGN", "Rejected GN Count"],
    ["conceptProjects", "All Concept Projects"],
    ["estimatedCost", "Estimated Cost (LKR)"],
    ["approvedDS", "Approved DS Count"],
    ["approvedGS", "Approved GN Count"],
    ["approvedProjects", "Approved Projects Count"],
    ["beneficiaries", "Direct Beneficiaries"],
    ["projectValue", "Project Value (LKR)"],
    ["approvedCost", "Approved Cost (LKR)"],
    ["uncoveredDivisions", "Divisions Not Covered"],
    ["approvedProjectValue", "Approved Project Value (LKR)"],
    ["approvedAllocation", "Approved Allocation (LKR)"],
    ["cdcsEstablished", "CDCs Established"],
    ["tractorProjects", "Tractor Projects"],
    ["tractorDetails", "Tractor Details"],
    ["tractorQuantity", "Tractor Quantity"],
    ["tractorCost", "Tractor Cost (LKR)"]
];

const tableBody = document.getElementById("projectsTableBody");
const searchInput = document.getElementById("searchInput");
const districtFilter = document.getElementById("districtFilter");
const statusFilter = document.getElementById("statusFilter");
const recordCount = document.getElementById("recordCount");
const emptyState = document.getElementById("emptyState");

function getProjects() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const projects = savedData ? JSON.parse(savedData) : [];
        return Array.isArray(projects) ? projects : [];
    } catch (error) {
        console.error("Could not read saved projects:", error);
        return [];
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function getStatusClass(status) {
    const normalized = String(status ?? "")
        .trim()
        .toLowerCase();

    const allowedStatuses = [
        "pending",
        "accepted",
        "rejected",
        "returned",
        "completed",
        "ongoing"
    ];

    return allowedStatuses.includes(normalized)
        ? `status-${normalized}`
        : "";
}

function formatValue(key, value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (key === "projectStatus") {
        const status = escapeHTML(value);
        const statusClass = getStatusClass(value);

        return `<span class="status-badge ${statusClass}">${status}</span>`;
    }

    return escapeHTML(value);
}

function updateSummary(projects) {
    document.getElementById("totalProjects").textContent =
        projects.length;

    const countStatus = status =>
        projects.filter(project =>
            String(project.projectStatus ?? "")
                .trim()
                .toLowerCase() === status
        ).length;

    document.getElementById("pendingProjects").textContent =
        countStatus("pending");

    document.getElementById("ongoingProjects").textContent =
        countStatus("ongoing");

    document.getElementById("completedProjects").textContent =
        countStatus("completed");

    document.getElementById("rejectedProjects").textContent =
        countStatus("rejected");
}

function updateDistrictOptions(projects) {
    const selectedDistrict = districtFilter.value;

    const districts = [
        ...new Set(
            projects
                .map(project => String(project.district ?? "").trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    districtFilter.innerHTML =
        '<option value="">All Districts</option>';

    districts.forEach(district => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtFilter.appendChild(option);
    });

    if (districts.includes(selectedDistrict)) {
        districtFilter.value = selectedDistrict;
    }
}

function getFilteredProjects() {
    const projects = getProjects();

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedDistrict = districtFilter.value;
    const selectedStatus = statusFilter.value.toLowerCase();

    return projects.filter(project => {
        const matchesSearch = columns.some(([key]) =>
            String(project[key] ?? "")
                .toLowerCase()
                .includes(searchTerm)
        );

        const matchesDistrict =
            !selectedDistrict ||
            String(project.district ?? "") === selectedDistrict;

        const matchesStatus =
            !selectedStatus ||
            String(project.projectStatus ?? "")
                .trim()
                .toLowerCase() === selectedStatus;

        return matchesSearch && matchesDistrict && matchesStatus;
    });
}

function renderTable() {
    const projects = getFilteredProjects();

    recordCount.textContent =
        `Showing ${projects.length} of ${getProjects().length} projects`;

    emptyState.hidden = projects.length !== 0;
    tableBody.innerHTML = "";

    if (projects.length === 0) {
        return;
    }

    const fragment = document.createDocumentFragment();

    projects.forEach(project => {
        const row = document.createElement("tr");

        columns.forEach(([key]) => {
            const cell = document.createElement("td");
            cell.innerHTML = formatValue(key, project[key]);
            row.appendChild(cell);
        });

        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

function refreshDashboard() {
    const projects = getProjects();

    updateSummary(projects);
    updateTotals(projects);
    renderCharts(projects);
    updateDistrictOptions(projects);
    renderTable();
}

function clearAllFilters() {
    searchInput.value = "";
    districtFilter.value = "";
    statusFilter.value = "";
    renderTable();
}

function exportCSV() {
    const projects = getFilteredProjects();

    if (projects.length === 0) {
        alert("There are no project records to export.");
        return;
    }

    function csvEscape(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const header = columns.map(([, label]) => csvEscape(label));

    const rows = projects.map(project =>
        columns.map(([key]) => csvEscape(project[key]))
    );

    const csvContent = "\uFEFF" +
        [header, ...rows]
            .map(row => row.join(","))
            .join("\r\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "RDB-PIFS-Project-Report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

searchInput.addEventListener("input", renderTable);
districtFilter.addEventListener("change", renderTable);
statusFilter.addEventListener("change", renderTable);

document.getElementById("clearFilters")
    .addEventListener("click", clearAllFilters);

document.getElementById("refreshBtn")
    .addEventListener("click", refreshDashboard);

document.getElementById("exportBtn")
    .addEventListener("click", exportCSV);

// Update the dashboard when returning from another page
// or when another browser tab changes the saved records.
window.addEventListener("pageshow", refreshDashboard);

window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
        refreshDashboard();
    }
});

// ---- Added for the full website ----

// Table header built from the same "columns" list as the rows
document.getElementById("tableHead").innerHTML =
    "<tr>" + columns.map(([, label]) => `<th>${escapeHTML(label)}</th>`).join("") + "</tr>";

// Totals for the Annexure 01 / Annexure 02 panels
function updateTotals(projects) {
    document.querySelectorAll("[data-sum]").forEach(element => {
        const total = projects.reduce(
            (sum, project) => sum + (Number(project[element.dataset.sum]) || 0), 0
        );
        element.textContent = total.toLocaleString("en-LK");
    });
}

// District menu in the header filters the table
document.querySelectorAll("[data-district]").forEach(link => {
    link.addEventListener("click", () => {
        districtFilter.value = link.dataset.district;
        renderTable();
    });
});

// Progress graphs (plain HTML/CSS bars, no chart library needed)
function renderCharts(projects) {
    const statuses = ["Pending", "Ongoing", "Completed", "Rejected"];
    const norm = value => String(value ?? "").trim().toLowerCase();
    const pct = value => Math.min(100, Math.max(0, Number(value) || 0));
    const empty = '<p class="chart-empty">No projects saved yet.</p>';

    const statusChart = document.getElementById("statusChart");
    const districtChart = document.getElementById("districtChart");
    const progressChart = document.getElementById("projectProgressChart");

    // Average progress
    const average = projects.length
        ? Math.round(projects.reduce((sum, p) => sum + pct(p.progress), 0) / projects.length)
        : 0;
    document.getElementById("avgProgress").textContent = average + "%";
    document.getElementById("avgProgressBar").style.width = average + "%";

    if (projects.length === 0) {
        statusChart.innerHTML = districtChart.innerHTML = progressChart.innerHTML = empty;
        return;
    }

    // 1. Projects by status
    const counts = statuses.map(s => projects.filter(p => norm(p.projectStatus) === s.toLowerCase()).length);
    const max = Math.max(1, ...counts);
    statusChart.innerHTML = statuses.map((s, i) => `
        <div class="bar-row">
            <span class="bar-label">${s}</span>
            <div class="bar-track"><div class="bar-fill fill-${s.toLowerCase()}" style="width:${counts[i] / max * 100}%"></div></div>
            <span class="bar-value">${counts[i]}</span>
        </div>`).join("");

    // 2. Status by district (stacked)
    const byDistrict = {};
    projects.forEach(p => {
        const name = String(p.district || "Unknown").trim() || "Unknown";
        (byDistrict[name] ??= []).push(norm(p.projectStatus));
    });
    districtChart.innerHTML = Object.entries(byDistrict)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 8)
        .map(([name, list]) => `
        <div class="bar-row">
            <span class="bar-label" title="${escapeHTML(name)}">${escapeHTML(name)}</span>
            <div class="bar-track">${statuses.map(s => {
                const n = list.filter(x => x === s.toLowerCase()).length;
                return n ? `<div class="bar-fill fill-${s.toLowerCase()}" style="width:${n / list.length * 100}%" title="${s}: ${n}"></div>` : "";
            }).join("")}</div>
            <span class="bar-value">${list.length}</span>
        </div>`).join("");

    // 3. Progress of the latest 10 projects
    progressChart.innerHTML = projects.slice(-10).reverse().map(p => `
        <div class="bar-row">
            <span class="bar-label" title="${escapeHTML(p.projectName)}">${escapeHTML(p.projectName || p.projectId)}</span>
            <div class="bar-track"><div class="bar-fill fill-progress" style="width:${pct(p.progress)}%"></div></div>
            <span class="bar-value">${pct(p.progress)}%</span>
        </div>`).join("");
}

// Initial load
refreshDashboard();
