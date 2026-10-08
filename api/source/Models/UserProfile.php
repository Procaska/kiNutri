<?php

namespace source\Models;

use source\Core\Connect;
use PDO;

class UserProfile
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Connect::getInstance();
    }

    public function findByUserId(int $userId): ?object
    {
        $stmt = $this->db->prepare("
            SELECT *
            FROM user_profiles
            WHERE user_id = :user_id
        ");

        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        return $stmt->fetch() ?: null;
    }

    public function createOrUpdate(int $userId, array $data): bool
    {
        $profile = $this->findByUserId($userId);

        if ($profile) {
            $stmt = $this->db->prepare("
                UPDATE user_profiles SET
                    birth_date = :birth_date,
                    gender = :gender,
                    weight = :weight,
                    height = :height,
                    activity_level = :activity_level,
                    goal = :goal
                WHERE user_id = :user_id
            ");
        } else {
            $stmt = $this->db->prepare("
                INSERT INTO user_profiles
                (user_id, birth_date, gender, weight, height, activity_level, goal)
                VALUES
                (:user_id, :birth_date, :gender, :weight, :height, :activity_level, :goal)
            ");
        }

        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":birth_date", $data["birth_date"]);
        $stmt->bindParam(":gender", $data["gender"]);
        $stmt->bindParam(":weight", $data["weight"]);
        $stmt->bindParam(":height", $data["height"]);
        $stmt->bindParam(":activity_level", $data["activity_level"]);
        $stmt->bindParam(":goal", $data["goal"]);

        return $stmt->execute();
    }
}