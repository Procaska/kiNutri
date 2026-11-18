<?php

namespace source\Models;

use PDO;

class FoodImage
{
    public function __construct(private PDO $db) {}

    public function listByFood(int $foodId): array
    {
        $stmt = $this->db->prepare('SELECT id, food_id, image_path, alt_text, created_at
            FROM food_images WHERE food_id = ? ORDER BY id');
        $stmt->execute([$foodId]);
        return $stmt->fetchAll();
    }

    public function create(int $foodId, string $path, ?string $alt): object
    {
        $stmt = $this->db->prepare('INSERT INTO food_images (food_id, image_path, alt_text) VALUES (?, ?, ?)');
        $stmt->execute([$foodId, $path, $alt]);
        return $this->find($foodId, (int) $this->db->lastInsertId());
    }

    public function find(int $foodId, int $imageId): ?object
    {
        $stmt = $this->db->prepare('SELECT id, food_id, image_path, alt_text, created_at
            FROM food_images WHERE food_id = ? AND id = ?');
        $stmt->execute([$foodId, $imageId]);
        return $stmt->fetch() ?: null;
    }

    public function remove(int $foodId, int $imageId): void
    {
        $stmt = $this->db->prepare('DELETE FROM food_images WHERE food_id = ? AND id = ?');
        $stmt->execute([$foodId, $imageId]);
    }
}
