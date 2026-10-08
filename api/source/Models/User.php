<?php

namespace source\Models;

use source\Core\Connect;
use PDO;

class User
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
                users.id,
                users.name,
                users.email,
                users.photo,
                user_types.name AS type
            FROM users  
            INNER JOIN user_types ON users.typeId = user_types.id
        ");

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?object
    {
        $stmt = $this->db->prepare("
            SELECT 
                users.id,
                users.name,
                users.email,
                users.photo,
                user_types.name AS type
            FROM users
            INNER JOIN user_types ON users.typeId = user_types.id
            WHERE users.id = :id
        ");

        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch() ?: null;
    }

    public function findByEmail(string $email): ?object
    {
        $stmt = $this->db->prepare("
            SELECT * FROM users
            WHERE email = :email
        ");

        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->fetch() ?: null;
    }

    public function create(array $data): bool
    {
        $stmt = $this->db->prepare("
            INSERT INTO users (typeId, name, email, password, photo)
            VALUES (:typeId, :name, :email, :password, :photo)
        ");

        $typeId = $data["typeId"] ?? 2;
        $photo = $data["photo"] ?? null;

        $stmt->bindParam(":typeId", $typeId);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":email", $data["email"]);
        $stmt->bindParam(":password", $data["password"]);
        $stmt->bindParam(":photo", $photo);

        return $stmt->execute();
    }
}