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
                users.typeId,
                users.typeId,
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
                users.typeId,
                users.typeId,
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
        $photo = null;

        $stmt->bindParam(":typeId", $typeId);
        $stmt->bindParam(":name", $data["name"]);
        $stmt->bindParam(":email", $data["email"]);
        $stmt->bindParam(":password", $data["password"]);
        $stmt->bindParam(":photo", $photo);

        return $stmt->execute();
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare("UPDATE users SET name = :name, email = :email,
            typeId = :typeId WHERE id = :id");
        return $stmt->execute([
            "id" => $id, "name" => $data["name"], "email" => $data["email"],
            "typeId" => $data["typeId"]
        ]);
    }

    public function lockPhoto(int $id): ?object
    {
        $stmt = $this->db->prepare('SELECT id, photo FROM users WHERE id = ? FOR UPDATE');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function updatePhoto(int $id, string $path): void
    {
        $this->db->prepare('UPDATE users SET photo = ? WHERE id = ?')->execute([$path, $id]);
    }

    public function delete(int $id): bool
    {
        // As FKs existentes removem o perfil e preservam as dietas (user_id NULL).
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute(["id" => $id]);
    }
}
