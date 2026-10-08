<?php

namespace source\Models;

use source\Core\Connect;
use PDO;

class Diet
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Connect::getInstance();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT *
            FROM diets
            ORDER BY id DESC
        ");

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?object
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM diets
            WHERE id = :id
        ");

        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch() ?: null;
    }

    public function create(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO diets
            (
                user_id,
                name,
                goal,
                calories,
                protein,
                carbs,
                fat
            )
            VALUES
            (
                :user_id,
                :name,
                :goal,
                :calories,
                :protein,
                :carbs,
                :fat
            )
        ");

        $stmt->bindParam(":user_id", $data["user_id"]);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":goal", $data["goal"]);
        $stmt->bindParam(":calories", $data["calories"]);
        $stmt->bindParam(":protein", $data["protein"]);
        $stmt->bindParam(":carbs", $data["carbs"]);
        $stmt->bindParam(":fat", $data["fat"]);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE diets SET
                user_id = :user_id,
                name = :name,
                goal = :goal,
                calories = :calories,
                protein = :protein,
                carbs = :carbs,
                fat = :fat
            WHERE id = :id
        ");

        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $data["user_id"]);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":goal", $data["goal"]);
        $stmt->bindParam(":calories", $data["calories"]);
        $stmt->bindParam(":protein", $data["protein"]);
        $stmt->bindParam(":carbs", $data["carbs"]);
        $stmt->bindParam(":fat", $data["fat"]);

        return $stmt->execute();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM diets
            WHERE id = :id
        ");

        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function findByUserId(int $userId): array
{
    $stmt = $this->db->prepare("
        SELECT *
        FROM diets
        WHERE user_id = :user_id
        ORDER BY id DESC
    ");

    $stmt->bindParam(":user_id", $userId);
    $stmt->execute();

    return $stmt->fetchAll();
}
}