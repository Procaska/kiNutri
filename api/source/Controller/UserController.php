<?php

namespace source\Controller;

use source\Models\User;

class UserController
{
    public function listarUsuarios(): void
    {
        $userModel = new User();
        $usuarios = $userModel->findAll();

        echo json_encode([
            "status" => "success",
            "data" => $usuarios
        ]);
    }

    public function buscarUsuario(int $id): void
    {
        $userModel = new User();
        $usuario = $userModel->findById($id);

        if (!$usuario) {
            echo json_encode([
                "status" => "error",
                "message" => "Usuário não encontrado"
            ]);
            return;
        }

        echo json_encode([
            "status" => "success",
            "data" => $usuario
        ]);
    }

    public function cadastrarUsuario(array $dados): void
    {
        if (
            empty($dados["name"]) ||
            empty($dados["email"]) ||
            empty($dados["password"])
        ) {
            echo json_encode([
                "status" => "error",
                "message" => "Preencha todos os campos obrigatórios"
            ]);
            return;
        }

        $userModel = new User();

        if ($userModel->findByEmail($dados["email"])) {
            echo json_encode([
                "status" => "error",
                "message" => "E-mail já cadastrado"
            ]);
            return;
        }

        $resultado = $userModel->create($dados);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Usuário cadastrado com sucesso!"
                : "Erro ao cadastrar usuário"
        ]);
    }
}