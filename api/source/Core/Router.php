<?php

namespace source\Core;

use source\Controller\Api;
use source\Controller\DietController;
use source\Controller\AuthController;
use source\Controller\UserController;
use source\Controller\FoodController;
use source\Controller\ImageController;

class Router
{
    private Api $api;
    private ?object $authenticatedUser = null;

    public function __construct()
    {
        $this->api = new Api();
    }

    public function execute(string $route, string $method): void
    {
        $route = $this->normalizeRoute($route);

        /*
        |--------------------------------------------------------------------------
        | ROTAS PÚBLICAS
        |--------------------------------------------------------------------------
        */

        if ($route === "/login" && $method === "POST") {
            $dados = $this->getJsonBody();

            $authController = new AuthController();
            $authController->login($dados);

            return;
        }

        if ($route === "/usuarios" && $method === "POST") {
            $dados = $this->getJsonBody();
            // O cadastro público não pode conceder privilégios de galeria.
            if (in_array($dados['typeId'] ?? null, [1, '1'], true)) {
                if (!$this->validarToken()) return;
                if ((int) $this->authenticatedUser->typeId !== 1) {
                    ImageController::respond(403, 'Apenas administradores podem criar contas administrativas.');
                    return;
                }
                $dados['typeId'] = 1;
            } else {
                $dados['typeId'] = 2;
            }

            $userController = new UserController();
            $userController->cadastrarUsuario($dados);

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | PROTEÇÃO DAS ROTAS
        |--------------------------------------------------------------------------
        */

        if (!$this->validarToken()) {
            return;
        }

        if ($route === '/users/photo' && in_array($method, ['GET', 'POST'], true)) {
            (new ImageController())->photo((int) $this->authenticatedUser->id, $method);
            return;
        }

        if (preg_match('#^/alimentos/([0-9]+)/imagens(?:/([0-9]+))?$#', $route, $imageRoute)) {
            $imageId = isset($imageRoute[2]) ? (int) $imageRoute[2] : null;
            if (($imageId === null && in_array($method, ['GET', 'POST'], true))
                || ($imageId !== null && $method === 'DELETE')) {
                if ($method !== 'GET' && (int) $this->authenticatedUser->typeId !== 1) {
                    ImageController::respond(403, 'Apenas administradores podem alterar a galeria.');
                    return;
                }
                (new ImageController())->gallery((int) $imageRoute[1], $method, $imageId);
                return;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ROTAS DE USUÁRIOS
        |--------------------------------------------------------------------------
        */

        if ($route === "/usuarios" && $method === "GET") {
            $userController = new UserController();
            $userController->listarUsuarios();

            return;
        }

        // Novas operações administrativas necessárias ao CRUD da Etapa 06.
        if (preg_match("#^/usuarios/([0-9]+)$#", $route, $matches) && in_array($method, ["PUT", "DELETE"], true)) {
            if ((int) ($this->authenticatedUser->typeId ?? 0) !== 1) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Apenas administradores podem alterar usuários."]);
                return;
            }
            $id = (int) $matches[1];
            if ($id === (int) $this->authenticatedUser->id &&
                ($method === "DELETE" || (int) ($this->getJsonBody()["typeId"] ?? 0) !== 1)) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Não é possível excluir ou remover o acesso administrativo da própria conta."]);
                return;
            }
            $controller = new UserController();
            if ($method === "PUT") $controller->atualizarUsuario($id, $this->getJsonBody());
            else $controller->excluirUsuario($id);
            return;
        }

        if (
            preg_match(
                "#^/usuarios/([0-9]+)$#",
                $route,
                $matches
            ) &&
            $method === "GET"
        ) {
            $userController = new UserController();

            $userController->buscarUsuario(
                (int) $matches[1]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | ROTAS DE ALIMENTOS
        |--------------------------------------------------------------------------
        */

        if ($route === "/alimentos" && $method === "GET") {
            $foodController = new FoodController();

            $foodController->listarAlimentos();

            return;
        }

        if (preg_match("#^/alimentos/([0-9]+)$#", $route, $matches) && $method === "GET") {
            (new FoodController())->buscarAlimento((int) $matches[1]);
            return;
        }

        if ($route === "/alimentos" && $method === "POST") {
            $dados = $this->getJsonBody();

            $foodController = new FoodController();

            $foodController->cadastrarAlimento($dados);

            return;
        }

        if (
            preg_match(
                "#^/alimentos/([0-9]+)$#",
                $route,
                $matches
            ) &&
            $method === "PUT"
        ) {
            $dados = $this->getJsonBody();

            $foodController = new FoodController();

            $foodController->atualizarAlimento(
                (int) $matches[1],
                $dados
            );

            return;
        }

        if (
            preg_match(
                "#^/alimentos/([0-9]+)$#",
                $route,
                $matches
            ) &&
            $method === "DELETE"
        ) {
            $foodController = new FoodController();

            if ((int) $this->authenticatedUser->typeId !== 1) {
                ImageController::respond(403, 'Apenas administradores podem excluir alimentos.');
                return;
            }
            $foodController->excluirAlimento(
                (int) $matches[1]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | ROTAS DE DIETAS
        |--------------------------------------------------------------------------
        */

        if ($route === "/dietas" && $method === "GET") {
            $dietController = new DietController();

            $dietController->listarDietas();

            return;
        }

        if ($route === "/dietas" && $method === "POST") {
            $dados = $this->getJsonBody();

            $dietController = new DietController();

            $dietController->cadastrarDieta($dados);

            return;
        }

        if (
            preg_match(
                "#^/dietas/([0-9]+)$#",
                $route,
                $matches
            ) &&
            $method === "GET"
        ) {
            $dietController = new DietController();

            $dietController->buscarDieta(
                (int) $matches[1]
            );

            return;
        }

        if (
            preg_match(
                "#^/dietas/([0-9]+)$#",
                $route,
                $matches
            ) &&
            $method === "PUT"
        ) {
            $dados = $this->getJsonBody();

            $dietController = new DietController();

            $dietController->atualizarDieta(
                (int) $matches[1],
                $dados
            );

            return;
        }

        if (
            preg_match(
                "#^/dietas/([0-9]+)$#",
                $route,
                $matches
            ) &&
            $method === "DELETE"
        ) {
            $dietController = new DietController();

            $dietController->excluirDieta(
                (int) $matches[1]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | ROTAS DE ALIMENTOS DA DIETA
        |--------------------------------------------------------------------------
        */

        if (
            preg_match(
                "#^/dietas/([0-9]+)/alimentos$#",
                $route,
                $matches
            ) &&
            $method === "GET"
        ) {
            $this->api->listarAlimentosDaDieta(
                (int) $matches[1]
            );

            return;
        }

        if (
            preg_match(
                "#^/dietas/([0-9]+)/alimentos$#",
                $route,
                $matches
            ) &&
            $method === "POST"
        ) {
            $dados = $this->getJsonBody();

            $this->api->adicionarAlimentoNaDieta(
                (int) $matches[1],
                $dados
            );

            return;
        }

        if (
            preg_match(
                "#^/dietas/alimentos/([0-9]+)$#",
                $route,
                $matches
            ) &&
            $method === "DELETE"
        ) {
            $this->api->removerAlimentoDaDieta(
                (int) $matches[1]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | ROTAS DE PERFIL NUTRICIONAL
        |--------------------------------------------------------------------------
        */

        if (
            preg_match(
                "#^/usuarios/([0-9]+)/perfil$#",
                $route,
                $matches
            ) &&
            $method === "GET"
        ) {
            $this->api->buscarPerfilUsuario(
                (int) $matches[1]
            );

            return;
        }

        if (
            preg_match(
                "#^/usuarios/([0-9]+)/perfil$#",
                $route,
                $matches
            ) &&
            $method === "POST"
        ) {
            $dados = $this->getJsonBody();

            $this->api->salvarPerfilUsuario(
                (int) $matches[1],
                $dados
            );

            return;
        }

        if (
            preg_match(
                "#^/usuarios/([0-9]+)/dietas$#",
                $route,
                $matches
            ) &&
            $method === "GET"
        ) {
            $this->api->listarDietasDoUsuario(
                (int) $matches[1]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | ROTA NÃO ENCONTRADA
        |--------------------------------------------------------------------------
        */

        $this->notFound();
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAÇÃO DO JWT
    |--------------------------------------------------------------------------
    */

    private function validarToken(): bool
    {
        $headers = getallheaders();

        $authorization = $headers["Authorization"]
            ?? $headers["authorization"]
            ?? null;

        if (!$authorization) {
            $this->naoAutorizado(
                "Token de autenticação não informado"
            );

            return false;
        }

        if (
            !preg_match(
                "/^Bearer\s+(.+)$/i",
                $authorization,
                $matches
            )
        ) {
            $this->naoAutorizado(
                "Formato do token inválido"
            );

            return false;
        }

        $token = trim($matches[1]);

        if ($token === "") {
            $this->naoAutorizado(
                "Token de autenticação inválido"
            );

            return false;
        }

        $jwt = new JWTToken();

        $decoded = $jwt->decode($token);

        if ($decoded === false) {
            $this->naoAutorizado(
                "Token de autenticação inválido ou expirado"
            );

            return false;
        }

        // Consulta a conta atual para não aceitar um papel administrativo revogado.
        $account = (new \source\Models\User())->findById((int) ($decoded->data->id ?? 0));
        if (!$account || (int) $account->id !== (int) ($decoded->data->id ?? 0)) {
            $this->naoAutorizado("Conta de usuário não encontrada. Faça login novamente.");
            return false;
        }
        $this->authenticatedUser = $account;
        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA 401
    |--------------------------------------------------------------------------
    */

    private function naoAutorizado(string $mensagem): void
    {
        http_response_code(401);

        echo json_encode([
            "code" => 401,
            "type" => "error",
            "status" => "error",
            "message" => $mensagem,
            "data" => null
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZAÇÃO DA ROTA
    |--------------------------------------------------------------------------
    */

    private function normalizeRoute(string $route): string
    {
        $route = rtrim($route, "/");

        return $route === "" ? "/" : $route;
    }

    /*
    |--------------------------------------------------------------------------
    | JSON BODY
    |--------------------------------------------------------------------------
    */

    private function getJsonBody(): array
    {
        return json_decode(
            file_get_contents("php://input"),
            true
        ) ?? [];
    }

    /*|--------------------------------------------------------------------------
    | 404
    |-------------------------------------------------------------------------- */

    private function notFound(): void
    {
        http_response_code(404);

        echo json_encode([
            "code" => 404,
            "type" => "error",
            "status" => "error",
            "message" => "Rota não encontrada",
            "data" => null
        ]);
    }
}
