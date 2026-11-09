
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("projectForm");
    const districtSelect = document.getElementById("district");
    const divisionSelect = document.getElementById("division");
    const gnSelect = document.getElementById("gsDivision");
    const tableBody = document.getElementById("projectTableBody");
    const message = document.getElementById("formMessage");

    const STORAGE_KEY = "rdbPifsProjects";
    let editingId = null;

    document.getElementById("year").textContent =
        new Date().getFullYear();

    /*
     * District list.
     * Add the official DS and GN data to DIVISION_DATA.
     * The examples below are illustrative, not a complete
     * official Sri Lankan administrative dataset.
     */
    const districts = [
        "Ampara", "Anuradhapura", "Badulla", "Batticaloa",
        "Colombo", "Galle", "Gampaha", "Hambantota",
        "Jaffna", "Kalutara", "Kandy", "Kegalle",
        "Kilinochchi", "Kurunegala", "Mannar", "Matale",
        "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
        "Polonnaruwa", "Puttalam", "Ratnapura",
        "Trincomalee", "Vavuniya"
    ];

    const DIVISION_DATA = {
        "Colombo": {
            "Colombo": ["Example GN Division"],
            "Dehiwala": ["Example GN Division"],
            "Homagama": ["Example GN Division"],
            "Kaduwela": ["Example GN Division"],
            "Maharagama": ["Example GN Division"],
            "Moratuwa": ["Example GN Division"],
            "Padukka": ["Example GN Division"],
            "Ratmalana": ["Example GN Division"]
        },
        "Gampaha": {
            "Attanagalla": ["Example GN Division"],
            "Biyagama": ["Example GN Division"],
            "Divulapitiya": ["Example GN Division"],
            "Gampaha": ["Example GN Division"],
            "Ja-Ela": ["Example GN Division"],
            "Katana": ["Example GN Division"],
            "Kelaniya": ["Example GN Division"],
            "Mahara": ["Example GN Division"],
            "Minuwangoda": ["Example GN Division"],
            "Negombo": ["Example GN Division"],
            "Wattala": ["Example GN Division"]
        },
        "Kandy": {
            "Akurana": ["Example GN Division"],
            "Deltota": ["Example GN Division"],
            "Ganga Ihala Korale": ["Example GN Division"],
            "Harispattuwa": ["Example GN Division"],
            "Kandy Four Gravets and Gangawata Korale": [
                "Example GN Division"
            ],
            "Kundasale": ["Example GN Division"],
            "Pathadumbara": ["Example GN Division"],
            "Udunuwara": ["Example GN Division"],
            "Yatinuwara": ["Example GN Division"]
        },
        "Nuwara Eliya": {
            "Ambagamuwa": ["Example GN Division"],
            "Hanguranketha": ["Example GN Division"],
            "Kothmale": ["Example GN Division"],
            "Nuwara Eliya": ["Example GN Division"],
            "Walapane": ["Example GN Division"]
        },
        "Galle": {
            "Akmeemana": ["Example GN Division"],
            "Ambalangoda": ["Example GN Division"],
            "Baddegama": ["Example GN Division"],
            "Balapitiya": ["Example GN Division"],
            "Galle Four Gravets": ["Example GN Division"],
            "Habaraduwa": ["Example GN Division"],
            "Hikkaduwa": ["Example GN Division"],
            "Imaduwa": ["Example GN Division"],
            "Karandeniya": ["Example GN Division"],
            "Yakkalamulla": ["Example GN Division"]
        }
    };

    function populateSelect(select, items, placeholder) {
        select.replaceChildren();

        const first = document.createElement("option");
        first.value = "";
        first.textContent = placeholder;
        select.appendChild(first);

        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    }

    populateSelect(districtSelect, districts, "Select District");
    populateSelect(
        document.getElementById("filterDistrict"),
        districts,
        "All Districts"
    );

    function updateDivisions(selectedDivision = "", selectedGN = "") {
        const district = districtSelect.value;
        const divisions = Object.keys(DIVISION_DATA[district] || {});

        populateSelect(
            divisionSelect,
            divisions,
            divisions.length
                ? "Select DS Division"
                : "DS data not configured"
        );

        divisionSelect.disabled = divisions.length === 0;

        if (selectedDivision && divisions.includes(selectedDivision)) {
            divisionSelect.value = selectedDivision;
        }

        updateGNDivisions(selectedGN);
    }

    function updateGNDivisions(selectedGN = "") {
        const district = districtSelect.value;
        const division = divisionSelect.value;

        const gnList =
            DIVISION_DATA[district]?.[division] || [];

        populateSelect(
            gnSelect,
            gnList,
            gnList.length
                ? "Select GN Division"
                : "GN data not configured"
        );

        gnSelect.disabled = gnList.length === 0;

        if (selectedGN && gnList.includes(selectedGN)) {
            gnSelect.value = selectedGN;
        }
    }

    districtSelect.addEventListener("change", () => {
        updateDivisions();
    });

    divisionSelect.addEventListener("change", () => {
        updateGNDivisions();
    });

    function getProjects() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function saveProjects(projects) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }

    function makeProjectId() {
        const projects = getProjects();
        let id;

        do {
            id = "RDB-" + Date.now().toString().slice(-8);
        } while (projects.some(project => project.projectId === id));

        return id;
    }

    function readForm() {
        const project = {};

        new FormData(form).forEach((value, key) => {
            project[key] = String(value).trim();
        });

        return project;
    }

    function showMessage(text, type = "success") {
        message.textContent = text;
        message.className = type;
    }

    function money(value) {
        return Number(value || 0).toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function addCell(row, text) {
        const cell = document.createElement("td");
        cell.textContent = text || "—";
        row.appendChild(cell);
        return cell;
    }

    function renderProjects() {
        const search = document.getElementById("searchProjects")
            .value.trim().toLowerCase();
        const district = document.getElementById("filterDistrict").value;
        const status = document.getElementById("filterStatus").value;
        const from = document.getElementById("filterFrom").value;
        const to = document.getElementById("filterTo").value;

        const projects = getProjects().filter(project => {
            const matchesSearch =
                (project.projectName || "").toLowerCase().includes(search) ||
                (project.projectId || "").toLowerCase().includes(search);

            const matchesDistrict =
                !district || project.district === district;

            const matchesStatus =
                !status || project.projectStatus === status;

            const date = project.projectDate || "";
            const matchesFrom = !from || (date && date >= from);
            const matchesTo = !to || (date && date <= to);

            return matchesSearch &&
                matchesDistrict &&
                matchesStatus &&
                matchesFrom &&
                matchesTo;
        });

        tableBody.replaceChildren();

        projects.forEach(project => {
            const row = document.createElement("tr");

            addCell(row, project.projectId);
            addCell(row, project.projectName);
            addCell(row, project.district);
            addCell(row, project.division);
            addCell(row, project.gsDivision);

            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className =
                "status-label status-" +
                (project.projectStatus || "pending").toLowerCase();
            badge.textContent = project.projectStatus || "Pending";
            statusCell.appendChild(badge);
            row.appendChild(statusCell);

            addCell(row, money(project.estimatedCost));

            const actions = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "row-action edit-action";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => {
                editProject(project.projectId);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "row-action delete-action";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
                deleteProject(project.projectId);
            });

            actions.append(editButton, deleteButton);
            row.appendChild(actions);
            tableBody.appendChild(row);
        });

        document.getElementById("recordCount").textContent =
            `Showing ${projects.length} of ${getProjects().length} saved projects.`;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const project = readForm();
        const projects = getProjects();

        if (!project.projectName || !project.district ||
            !project.division || !project.gsDivision) {
            showMessage(
                "Complete the required fields and choose a valid location.",
                "error"
            );
            return;
        }

        if (editingId) {
            const index = projects.findIndex(
                item => item.projectId === editingId
            );

            if (index !== -1) {
                project.projectId = editingId;
                projects[index] = project;
            }
        } else {
            project.projectId = project.projectId || makeProjectId();

            if (projects.some(
                item => item.projectId === project.projectId
            )) {
                showMessage(
                    "That project ID already exists. Use a different ID.",
                    "error"
                );
                return;
            }

            projects.push(project);
        }

        try {
            saveProjects(projects);
            form.reset();
            editingId = null;
            updateDivisions();
            showMessage("Project saved successfully.");
            renderProjects();
        } catch {
            showMessage(
                "Unable to save. Browser storage may be full or unavailable.",
                "error"
            );
        }
    });

    function editProject(id) {
        const project = getProjects().find(
            item => item.projectId === id
        );

        if (!project) return;

        editingId = id;

        Object.entries(project).forEach(([key, value]) => {
            const input = form.elements.namedItem(key);
            if (input) input.value = value ?? "";
        });

        updateDivisions(project.division, project.gsDivision);

        document.getElementById("projectId").value = project.projectId;
        showMessage("Editing " + project.projectId + ". Save to update it.");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function deleteProject(id) {
        if (!confirm("Delete project " + id + "? This cannot be undone.")) {
            return;
        }

        saveProjects(
            getProjects().filter(project => project.projectId !== id)
        );

        if (editingId === id) {
            form.reset();
            editingId = null;
            updateDivisions();
        }

        showMessage("Project deleted.");
        renderProjects();
    }

    form.addEventListener("reset", () => {
        editingId = null;
        setTimeout(() => {
            updateDivisions();
            message.textContent = "";
            message.className = "";
        }, 0);
    });

    [
        "searchProjects",
        "filterDistrict",
        "filterStatus",
        "filterFrom",
        "filterTo"
    ].forEach(id => {
        document.getElementById(id).addEventListener(
            "input", renderProjects
        );
        document.getElementById(id).addEventListener(
            "change", renderProjects
        );
    });

    document.getElementById("clearFilters").addEventListener("click", () => {
        document.getElementById("searchProjects").value = "";
        document.getElementById("filterDistrict").value = "";
        document.getElementById("filterStatus").value = "";
        document.getElementById("filterFrom").value = "";
        document.getElementById("filterTo").value = "";
        renderProjects();
    });

    document.getElementById("exportReport").addEventListener("click", () => {
        const rows = Array.from(tableBody.querySelectorAll("tr"));

        if (rows.length === 0) {
            alert("There are no matching projects to export.");
            return;
        }

        const projects = getProjects();
        const search = document.getElementById("searchProjects")
            .value.trim().toLowerCase();
        const district = document.getElementById("filterDistrict").value;
        const status = document.getElementById("filterStatus").value;
        const from = document.getElementById("filterFrom").value;
        const to = document.getElementById("filterTo").value;

        const filtered = projects.filter(project => {
            const date = project.projectDate || "";
            return (
                ((project.projectName || "").toLowerCase().includes(search) ||
                 (project.projectId || "").toLowerCase().includes(search)) &&
                (!district || project.district === district) &&
                (!status || project.projectStatus === status) &&
                (!from || (date && date >= from)) &&
                (!to || (date && date <= to))
            );
        });

        const columns = [
            ["Project ID", "projectId"],
            ["Project Name", "projectName"],
            ["District", "district"],
            ["DS Division", "division"],
            ["GN Division", "gsDivision"],
            ["Sector", "sector"],
            ["Responsible Person", "responsiblePerson"],
            ["Project Date", "projectDate"],
            ["Status", "projectStatus"],
            ["Progress %", "progress"],
            ["Description", "description"],
            ["DS Proposals Received", "receivedDS"],
            ["GN Proposals Received", "receivedGN"],
            ["GN Divisions Approved", "approvedGN"],
            ["GN Divisions Rejected", "rejectedGN"],
            ["Total Concept Projects", "conceptProjects"],
            ["Estimated Cost LKR", "estimatedCost"],
            ["DS Proposals Approved", "approvedDS"],
            ["GN Proposals Approved", "approvedGS"],
            ["Projects Approved", "approvedProjects"],
            ["Direct Beneficiaries", "beneficiaries"],
            ["Project Value LKR", "projectValue"],
            ["Approved Cost LKR", "approvedCost"],
            ["Uncovered Divisions", "uncoveredDivisions"],
            ["Approved Project Value LKR", "approvedProjectValue"],
            ["Approved Allocation LKR", "approvedAllocation"],
            ["CDCs Established", "cdcsEstablished"],
            ["Tractor Projects", "tractorProjects"],
            ["Tractor Details", "tractorDetails"],
            ["Tractor Quantity", "tractorQuantity"],
            ["Tractor Cost LKR", "tractorCost"]
        ];

        const csvCell = value => {
            let text = String(value ?? "");

            // Prevent spreadsheet formula injection.
            if (/^[=+\-@\t\r]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        };

        const csv = [
            columns.map(column => csvCell(column[0])).join(","),
            ...filtered.map(project =>
                columns.map(column => csvCell(project[column[1]])).join(",")
            )
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "RDB-PIFS-Project-Report.csv";
        link.click();
        URL.revokeObjectURL(url);
    });

    updateDivisions();
    renderProjects();

    // Opened from All Projects with ?edit=PROJECT_ID
    const editParam = new URLSearchParams(location.search).get("edit");
    if (editParam) editProject(editParam);
});
