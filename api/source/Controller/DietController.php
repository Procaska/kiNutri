<?php

namespace source\Controller;

use source\Models\Diet;

class DietController
{
    public function listarDietas(): void
    {
        $dietModel = new Diet();

        echo json_encode([
            "status" => "success",
            "data" => $dietModel->findAll()
        ]);
    }

    public function buscarDieta(int $id): void
    {
        $dietModel = new Diet();
        $dieta = $dietModel->findById($id);

        if (!$dieta) {
            echo json_encode([
                "status" => "error",
                "message" => "Dieta não encontrada"
            ]);
            return;
        }

        echo json_encode([
            "status" => "success",
            "data" => $dieta
        ]);
    }

    public function cadastrarDieta(array $dados): void
    {
        if (empty($dados["name"]) || empty($dados["goal"])) {
            echo json_encode([
                "status" => "error",
                "message" => "Preencha os campos obrigatórios"
            ]);
            return;
        }

        $dietModel = new Diet();

        $resultado = $dietModel->create([
            "user_id" => $dados["user_id"] ?? null,
            "name" => $dados["name"],
            "goal" => $dados["goal"],
            "calories" => $dados["calories"] ?? 0,
            "protein" => $dados["protein"] ?? 0,
            "carbs" => $dados["carbs"] ?? 0,
            "fat" => $dados["fat"] ?? 0
        ]);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Dieta cadastrada com sucesso!"
                : "Erro ao cadastrar dieta"
        ]);
    }

    public function atualizarDieta(int $id, array $dados): void
    {
        $dietModel = new Diet();

        if (!$dietModel->findById($id)) {
            echo json_encode([
                "status" => "error",
                "message" => "Dieta não encontrada"
            ]);
            return;
        }

        $resultado = $dietModel->update($id, [
            "user_id" => $dados["user_id"] ?? null,
            "name" => $dados["name"],
            "goal" => $dados["goal"],
            "calories" => $dados["calories"] ?? 0,
            "protein" => $dados["protein"] ?? 0,
            "carbs" => $dados["carbs"] ?? 0,
            "fat" => $dados["fat"] ?? 0
        ]);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Dieta atualizada com sucesso!"
                : "Erro ao atualizar dieta"
        ]);
    }

    public function excluirDieta(int $id): void
    {
        $dietModel = new Diet();

        if (!$dietModel->findById($id)) {
            echo json_encode([
                "status" => "error",
                "message" => "Dieta não encontrada"
            ]);
            return;
        }

        $resultado = $dietModel->delete($id);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Dieta excluída com sucesso!"
                : "Erro ao excluir dieta"
        ]);
    }

    public function listarDietasUsuario(int $userId): void
    {
        $dietModel = new Diet();

        echo json_encode([
            "status" => "success",
            "data" => $dietModel->findByUser($userId)
        ]);
    }
}