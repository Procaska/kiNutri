<?php

namespace source\Core;

use PDO;
use PDOException;

class Connect
{
    private static ?PDO $instance = null;

    public static function getInstance(): ?PDO
    {
        if (self::$instance === null) {
            try {

                self::$instance = new PDO(
                    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                    DB_USER,
                    DB_PASS,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ
                    ]
                );

            } catch (PDOException $e) {

                header('Content-Type: application/json');

                echo json_encode([
                    "status" => "error",
                    "message" => "Erro de conexão com o banco de dados",
                    "details" => $e->getMessage()
                ]);

                exit;
            }
        }

        return self::$instance;
    }
}