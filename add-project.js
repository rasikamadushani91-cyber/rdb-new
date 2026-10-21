
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("projectForm");
    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!form.reportValidity()) return;

        const project = {
            projectName: document.getElementById("projectName").value.trim(),
            district: document.getElementById("district").value,
            division: document.getElementById("division").value.trim(),
            gsDivision: document.getElementById("gsDivision").value.trim(),
            sector: document.getElementById("sector").value,
            responsiblePerson: document.getElementById("responsiblePerson").value.trim(),
            budget: document.getElementById("budget").value,
            status: document.getElementById("status").value,
            description: document.getElementById("description").value.trim()
        };

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Saving project...";

        try {
            const response = await fetch("save-project.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(project)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to save project.");
            }

            alert("Project saved successfully! ID: " + result.projectCode);
            window.location.href = "index.html";

        } catch (error) {
            console.error("Save error:", error);
            alert(error.message || "Unable to connect to the server.");
            submitButton.disabled = false;
            submitButton.textContent = "Submit Project Proposal →";
        }
    });
});
