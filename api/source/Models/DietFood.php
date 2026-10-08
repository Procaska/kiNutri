<?php

namespace source\Models;

use source\Core\Connect;
use PDO;

class DietFood
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Connect::getInstance();
    }

    public function findByDiet(int $dietId): array
    {
        $stmt = $this->db->prepare("
            SELECT
                diet_foods.id,
                diet_foods.diet_id,
                diet_foods.food_id,
                diet_foods.meal,
                diet_foods.quantity,
                foods.name AS food_name,
                foods.calories,
                foods.protein
            FROM diet_foods
            INNER JOIN foods ON diet_foods.food_id = foods.id
            WHERE diet_foods.diet_id = :diet_id
            ORDER BY diet_foods.id DESC
        ");

        $stmt->bindParam(":diet_id", $dietId);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function create(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO diet_foods
            (diet_id, food_id, meal, quantity)
            VALUES
            (:diet_id, :food_id, :meal, :quantity)
        ");

        $stmt->bindParam(":diet_id", $data["diet_id"]);
        $stmt->bindParam(":food_id", $data["food_id"]);
        $stmt->bindParam(":meal", $data["meal"]);
        $stmt->bindParam(":quantity", $data["quantity"]);

        return $stmt->execute();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("
            DELETE FROM diet_foods
            WHERE id = :id
        ");

        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }
}