<?php

namespace source\Controller;

use source\Models\Food;
use source\Core\Connect;
use source\Models\FoodImage;
use source\Support\ImageStorage;

class FoodController
{
    public function buscarAlimento(int $id): void
    {
        $food = (new Food())->findById($id);
        if (!$food) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Alimento não encontrado."]);
            return;
        }
        echo json_encode(["status" => "success", "data" => $food]);
    }

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
        $db = Connect::getInstance();
        $food = new Food();
        try {
            $db->beginTransaction();
            if (!$food->lock($id)) {
                $db->rollBack();
                ImageController::respond(404, 'Alimento não encontrado.');
                return;
            }
            $images = (new FoodImage($db))->listByFood($id);
            $food->delete($id);
            $db->commit();
            foreach ($images as $image) ImageStorage::remove($image->image_path);
            ImageController::respond(200, 'Alimento excluído com sucesso!');
        } catch (\Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            error_log((string) $e);
            ImageController::respond(500, 'Erro ao excluir alimento.');
        }
    }
}
