document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("addProjectButton");
    const tableBody = document.getElementById("projectTableBody");
    const searchInput = document.getElementById("projectSearch");
    const statusFilter = document.getElementById("statusFilter");

    const totalElement = document.getElementById("totalProjects");
    const completedElement = document.getElementById("completedProjects");
    const ongoingElement = document.getElementById("ongoingProjects");
    const pendingElement = document.getElementById("pendingProjects");
    const yearElement = document.getElementById("year");

    if (!addButton || !tableBody) {
        console.error("Check addProjectButton and projectTableBody in index.html.");
        return;
    }

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Open the separate Add Project page.
    addButton.addEventListener("click", function () {
        window.location.href = "add-project.html";
    });

    // Read projects saved from the Add Project form.
    let savedProjects = [];

    try {
        savedProjects = JSON.parse(localStorage.getItem("rdbProjects") || "[]");

        if (!Array.isArray(savedProjects)) {
            savedProjects = [];
        }
    } catch (error) {
        console.error("Could not read saved projects:", error);
        savedProjects = [];
    }

    // Add saved projects to the table.
    savedProjects.forEach(function (project) {
        const row = document.createElement("tr");

        const values = [
            project.id || "",
            project.name || "",
            project.district || "",
            Number(project.budget || 0).toLocaleString("en-LK")
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        const status = project.status || "Pending";

        badge.className = "status " + status.toLowerCase();
        badge.textContent = status;
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });

    // Update summary cards using all rows, including saved projects.
    function updateCounts() {
        const rows = tableBody.querySelectorAll("tr");
        let completed = 0;
        let ongoing = 0;
        let pending = 0;

        rows.forEach(function (row) {
            const status = row.cells[4]?.textContent.trim();

            if (status === "Completed") completed++;
            if (status === "Ongoing") ongoing++;
            if (status === "Pending") pending++;
        });

        if (totalElement) totalElement.textContent = rows.length;
        if (completedElement) completedElement.textContent = completed;
        if (ongoingElement) ongoingElement.textContent = ongoing;
        if (pendingElement) pendingElement.textContent = pending;
    }

    // Search by project name and filter by status.
    function filterProjects() {
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;

        tableBody.querySelectorAll("tr").forEach(function (row) {
            const name = row.cells[1]?.textContent.toLowerCase() || "";
            const status = row.cells[4]?.textContent.trim() || "";

            const matchesName = name.includes(searchText);
            const matchesStatus =
                selectedStatus === "all" || status === selectedStatus;

            row.style.display =
                matchesName && matchesStatus ? "" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterProjects);
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", filterProjects);
    }

    updateCounts();

    console.log("RDB-PIFS dashboard loaded.");
});