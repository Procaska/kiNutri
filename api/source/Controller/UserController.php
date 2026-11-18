<?php

namespace source\Controller;

use source\Models\User;
use source\Core\Connect;
use source\Support\ImageStorage;

class UserController
{
    public function atualizarUsuario(int $id, array $dados): void
    {
        $model = new User();
        $current = $model->findById($id);
        if (!$current) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Usuário não encontrado."]);
            return;
        }
        $name = trim($dados["name"] ?? "");
        $email = strtolower(trim($dados["email"] ?? ""));
        $typeId = filter_var($dados["typeId"] ?? null, FILTER_VALIDATE_INT);
        if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($typeId, [1, 2], true)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Informe nome, e-mail válido e tipo de usuário."]);
            return;
        }
        $duplicate = $model->findByEmail($email);
        if ($duplicate && (int) $duplicate->id !== $id) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "E-mail já cadastrado."]);
            return;
        }
        $result = $model->update($id, ["name" => $name, "email" => $email,
            "typeId" => $typeId, "photo" => $dados["photo"] ?? $current->photo]);
        echo json_encode(["status" => $result ? "success" : "error",
            "message" => $result ? "Usuário atualizado com sucesso!" : "Erro ao atualizar usuário."]);
    }

    public function excluirUsuario(int $id): void
    {
        $db = Connect::getInstance();
        $model = new User();
        try {
            $db->beginTransaction();
            $user = $model->lockPhoto($id);
            if (!$user) {
                $db->rollBack();
                ImageController::respond(404, 'Usuário não encontrado.');
                return;
            }
            $model->delete($id);
            $db->commit();
            ImageStorage::remove($user->photo);
            ImageController::respond(200, 'Usuário excluído com sucesso!');
        } catch (\Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            error_log((string) $e);
            ImageController::respond(500, 'Erro ao excluir usuário.');
        }
    }

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
