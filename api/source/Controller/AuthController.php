<?php
namespace source\Controller;

use source\Models\User;
use source\Core\JWTToken;

class AuthController
{
    public function login(array $dados): void
    {
        if (empty($dados["email"]) || empty($dados["password"])) {
            echo json_encode([
                "code" => 400,
                "type" => "error",
                "status" => "error",
                "message" => "E-mail e senha são obrigatórios",
                "data" => null
            ]);

            return;
        }

        $userModel = new User();
        $usuario = $userModel->findByEmail(
            $dados["email"]
        );


        if (!$usuario || $usuario->password !== $dados["password"]) {
            echo json_encode([
                "code" => 401,
                "type" => "error",
                "status" => "error",
                "message" => "E-mail ou senha inválidos",
                "data" => null
            ]);

            return;
        }

        // Dados que serão utilizados dentro do token
        $payload = [
            "id" => $usuario->id,
            "typeId" => $usuario->typeId,
            "name" => $usuario->name,
            "email" => $usuario->email
        ];

        // Cria o JWT
        $jwt = new JWTToken();
        $token = $jwt->encode($payload);

        // Retorno da API
        echo json_encode([
            "code" => 200,
            "type" => "success",
            "status" => "success",
            "message" => "Login realizado com sucesso!",
            "data" => [
                "token" => $token,

                "user" => [
                    "id" => $usuario->id,
                    "typeId" => $usuario->typeId,
                    "name" => $usuario->name,
                    "email" => $usuario->email,
                    "photo" => $usuario->photo
                ]
            ]
        ]);
    }
}