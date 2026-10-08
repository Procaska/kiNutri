<?php

namespace source\Models;

use source\Core\Connect;
use PDO;

class Food
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Connect::getInstance();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("
            SELECT
                foods.id,
                foods.category_id,
                food_categories.name AS category,
                foods.name,
                foods.calories,
                foods.protein,
                foods.carbs,
                foods.fat
            FROM foods
            INNER JOIN food_categories
                ON foods.category_id = food_categories.id
            ORDER BY foods.id DESC
        ");

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?object
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM foods
            WHERE id = :id
        ");

        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch() ?: null;
    }

    public function create(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO foods
            (category_id, name, calories, protein, carbs, fat)
            VALUES
            (:category_id, :name, :calories, :protein, :carbs, :fat)
        ");

        $stmt->bindParam(":category_id", $data["category_id"]);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":calories", $data["calories"]);
        $stmt->bindParam(":protein", $data["protein"]);
        $stmt->bindParam(":carbs", $data["carbs"]);
        $stmt->bindParam(":fat", $data["fat"]);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("
            UPDATE foods SET
                category_id = :category_id,
                name = :name,
                calories = :calories,
                protein = :protein,
                carbs = :carbs,
                fat = :fat
            WHERE id = :id
        ");

        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":category_id", $data["category_id"]);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":calories", $data["calories"]);
        $stmt->bindParam(":protein", $data["protein"]);
        $stmt->bindParam(":carbs", $data["carbs"]);
        $stmt->bindParam(":fat", $data["fat"]);

        return $stmt->execute();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM foods
            WHERE id = :id
        ");

        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }
}