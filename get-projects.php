
<?php
header("Content-Type: application/json; charset=UTF-8");

require "db.php";

try {
    $sql = "SELECT
                id,
                project_code,
                project_name,
                district,
                division,
                gs_division,
                development_sector,
                responsible_person,
                estimated_budget,
                proposal_status,
                project_description,
                created_at
            FROM projects
            ORDER BY id DESC";

    $stmt = $pdo->query($sql);

    echo json_encode($stmt->fetchAll());

} catch (PDOException $e) {
    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve projects."
    ]);
}
