"use strict";

const STORAGE_KEY = "rdbPifsProjects";
const $ = id => document.getElementById(id);

const columns = [
    ["Project ID", "projectId"], ["Project Name", "projectName"],
    ["District", "district"], ["DS Division", "division"],
    ["GN Division", "gsDivision"], ["Sector", "sector"],
    ["Responsible Person", "responsiblePerson"], ["Project Date", "projectDate"],
    ["Status", "projectStatus"], ["Progress %", "progress"], ["Description", "description"],
    ["DS Proposals Received", "receivedDS"], ["GN Proposals Received", "receivedGN"],
    ["GN Divisions Approved", "approvedGN"], ["GN Divisions Rejected", "rejectedGN"],
    ["Total Concept Projects", "conceptProjects"], ["Estimated Cost LKR", "estimatedCost"],
    ["DS Proposals Approved", "approvedDS"], ["GN Proposals Approved", "approvedGS"],
    ["Projects Approved", "approvedProjects"], ["Direct Beneficiaries", "beneficiaries"],
    ["Project Value LKR", "projectValue"], ["Approved Cost LKR", "approvedCost"],
    ["Uncovered Divisions", "uncoveredDivisions"],
    ["Approved Project Value LKR", "approvedProjectValue"],
    ["Approved Allocation LKR", "approvedAllocation"],
    ["CDCs Established", "cdcsEstablished"], ["Tractor Projects", "tractorProjects"],
    ["Tractor Details", "tractorDetails"], ["Tractor Quantity", "tractorQuantity"],
    ["Tractor Cost LKR", "tractorCost"]
];

function getProjects() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function money(value) {
    return Number(value || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    });
}

// District filter lists only districts that have saved projects
function fillDistricts() {
    const select = $("filterDistrict");
    const current = select.value;
    const districts = [...new Set(getProjects().map(p => p.district).filter(Boolean))].sort();

    select.replaceChildren(new Option("All Districts", ""));
    districts.forEach(d => select.appendChild(new Option(d, d)));
    if (districts.includes(current)) select.value = current;
}

function getFiltered() {
    const search = $("searchProjects").value.trim().toLowerCase();
    const district = $("filterDistrict").value;
    const status = $("filterStatus").value;
    const from = $("filterFrom").value;
    const to = $("filterTo").value;

    return getProjects().filter(p => {
        const date = p.projectDate || "";
        return ((p.projectName || "").toLowerCase().includes(search) ||
                (p.projectId || "").toLowerCase().includes(search)) &&
            (!district || p.district === district) &&
            (!status || p.projectStatus === status) &&
            (!from || (date && date >= from)) &&
            (!to || (date && date <= to));
    });
}

function addCell(row, text) {
    const td = document.createElement("td");
    td.textContent = text || "—";
    row.appendChild(td);
}

function render() {
    const body = $("projectTableBody");
    const projects = getFiltered();
    body.replaceChildren();

    projects.forEach(p => {
        const row = document.createElement("tr");
        ["projectId", "projectName", "district", "division", "gsDivision"]
            .forEach(key => addCell(row, p[key]));

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "status-label status-" + (p.projectStatus || "pending").toLowerCase();
        badge.textContent = p.projectStatus || "Pending";
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        addCell(row, money(p.estimatedCost));

        const actions = document.createElement("td");
        const edit = document.createElement("a");
        edit.className = "row-action edit-action";
        edit.textContent = "Edit";
        edit.href = "add-project.html?edit=" + encodeURIComponent(p.projectId);

        const del = document.createElement("button");
        del.type = "button";
        del.className = "row-action delete-action";
        del.textContent = "Delete";
        del.addEventListener("click", () => deleteProject(p.projectId));

        actions.append(edit, del);
        row.appendChild(actions);
        body.appendChild(row);
    });

    $("recordCount").textContent =
        `Showing ${projects.length} of ${getProjects().length} saved projects.`;
}

function deleteProject(id) {
    if (!confirm("Delete project " + id + "? This cannot be undone.")) return;
    localStorage.setItem(STORAGE_KEY,
        JSON.stringify(getProjects().filter(p => p.projectId !== id)));
    fillDistricts();
    render();
}

function csvCell(value) {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;   // block formula injection
    return '"' + text.replace(/"/g, '""') + '"';
}

function exportCSV() {
    const projects = getFiltered();
    if (projects.length === 0) {
        alert("There are no matching projects to export.");
        return;
    }
    const csv = [
        columns.map(c => csvCell(c[0])).join(","),
        ...projects.map(p => columns.map(c => csvCell(p[c[1]])).join(","))
    ].join("\r\n");

    const url = URL.createObjectURL(
        new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "RDB-PIFS-Project-Report.csv";
    link.click();
    URL.revokeObjectURL(url);
}

["searchProjects", "filterDistrict", "filterStatus", "filterFrom", "filterTo"]
    .forEach(id => {
        $(id).addEventListener("input", render);
        $(id).addEventListener("change", render);
    });

$("clearFilters").addEventListener("click", () => {
    ["searchProjects", "filterDistrict", "filterStatus", "filterFrom", "filterTo"]
        .forEach(id => { $(id).value = ""; });
    render();
});

$("exportReport").addEventListener("click", exportCSV);

fillDistricts();
render();
