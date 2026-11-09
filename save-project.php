
<?php
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "POST method required."]);
    exit;
}

require "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid request data."]);
    exit;
}

$required = [
    "projectName", "district", "division", "gsDivision",
    "sector", "responsiblePerson", "budget", "status"
];

foreach ($required as $field) {
    if (!isset($data[$field]) ||
        !is_string($data[$field]) && !is_numeric($data[$field]) ||
        trim((string)$data[$field]) === "") {
        http_response_code(422);
        echo json_encode(["success" => false, "message" => "Complete all required fields."]);
        exit;
    }
}

$budget = filter_var($data["budget"], FILTER_VALIDATE_FLOAT);
$allowedStatuses = ["Pending", "Ongoing", "Completed"];

if ($budget === false || $budget < 0 ||
    !in_array($data["status"], $allowedStatuses, true)) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => "Check the budget and status."]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        "INSERT INTO projects (
            project_name, district, division, gs_division,
            development_sector, responsible_person,
            estimated_budget, proposal_status, project_description
        ) VALUES (
            :name, :district, :division, :gs,
            :sector, :person, :budget, :status, :description
        )"
    );

    $stmt->execute([
        "name" => trim($data["projectName"]),
        "district" => trim($data["district"]),
        "division" => trim($data["division"]),
        "gs" => trim($data["gsDivision"]),
        "sector" => trim($data["sector"]),
        "person" => trim($data["responsiblePerson"]),
        "budget" => $budget,
        "status" => $data["status"],
        "description" => trim((string)($data["description"] ?? ""))
    ]);

    $id = (int)$pdo->lastInsertId();
    $code = "RDB" . str_pad((string)$id, 3, "0", STR_PAD_LEFT);

    $update = $pdo->prepare(
        "UPDATE projects SET project_code = :code WHERE id = :id"
    );
    $update->execute(["code" => $code, "id" => $id]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Project saved successfully.",
        "projectCode" => $code
    ]);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Could not save the project. Check the server error log."
    ]);
}
