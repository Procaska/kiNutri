<?php

namespace source\Controller;

use source\Models\Food;

class FoodController
{
    public function listarAlimentos(): void
    {
        $foodModel = new Food();
        $alimentos = $foodModel->findAll();

        echo json_encode([
            "status" => "success",
            "data" => $alimentos
        ]);
    }

    public function cadastrarAlimento(array $dados): void
    {
        if (
            empty($dados["name"]) ||
            empty($dados["category_id"]) ||
            empty($dados["calories"])
        ) {
            echo json_encode([
                "status" => "error",
                "message" => "Preencha todos os campos obrigatórios"
            ]);
            return;
        }

        $foodModel = new Food();

        $resultado = $foodModel->create([
            "category_id" => $dados["category_id"],
            "name" => $dados["name"],
            "calories" => $dados["calories"],
            "protein" => $dados["protein"] ?? 0,
            "carbs" => $dados["carbs"] ?? 0,
            "fat" => $dados["fat"] ?? 0
        ]);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Alimento cadastrado com sucesso!"
                : "Erro ao cadastrar alimento"
        ]);
    }

    public function atualizarAlimento(int $id, array $dados): void
    {
        if (
            empty($dados["name"]) ||
            empty($dados["category_id"]) ||
            empty($dados["calories"])
        ) {
            echo json_encode([
                "status" => "error",
                "message" => "Preencha todos os campos obrigatórios"
            ]);
            return;
        }

        $foodModel = new Food();

        if (!$foodModel->findById($id)) {
            echo json_encode([
                "status" => "error",
                "message" => "Alimento não encontrado"
            ]);
            return;
        }

        $resultado = $foodModel->update($id, [
            "category_id" => $dados["category_id"],
            "name" => $dados["name"],
            "calories" => $dados["calories"],
            "protein" => $dados["protein"] ?? 0,
            "carbs" => $dados["carbs"] ?? 0,
            "fat" => $dados["fat"] ?? 0
        ]);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Alimento atualizado com sucesso!"
                : "Erro ao atualizar alimento"
        ]);
    }

    public function excluirAlimento(int $id): void
    {
        $foodModel = new Food();

        if (!$foodModel->findById($id)) {
            echo json_encode([
                "status" => "error",
                "message" => "Alimento não encontrado"
            ]);
            return;
        }

        $resultado = $foodModel->delete($id);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Alimento excluído com sucesso!"
                : "Erro ao excluir alimento"
        ]);
    }
}