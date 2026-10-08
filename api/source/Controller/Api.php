<?php

namespace source\Controller;

use source\Models\User;
use source\Models\UserProfile;
use source\Models\Food;
use source\Models\Diet;
use source\Models\DietFood;

class Api
{
   //ALIMENTOS DA DIETA

    public function listarAlimentosDaDieta(int $dietId): void
    {
        $dietFoodModel = new DietFood();
        $alimentos = $dietFoodModel->findByDiet($dietId);

        echo json_encode([
            "status" => "success",
            "data" => $alimentos
        ]);
    }

    public function adicionarAlimentoNaDieta(int $dietId, array $dados): void
    {
        if (
            empty($dados["food_id"]) ||
            empty($dados["meal"]) ||
            empty($dados["quantity"])
        ) {
            echo json_encode([
                "status" => "error",
                "message" => "Preencha todos os campos obrigatórios"
            ]);
            return;
        }

        $dietFoodModel = new DietFood();

        $resultado = $dietFoodModel->create([
            "diet_id" => $dietId,
            "food_id" => $dados["food_id"],
            "meal" => $dados["meal"],
            "quantity" => $dados["quantity"]
        ]);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Alimento adicionado à dieta com sucesso!"
                : "Erro ao adicionar alimento à dieta"
        ]);
    }

    public function removerAlimentoDaDieta(int $id): void
    {
        $dietFoodModel = new DietFood();
        $resultado = $dietFoodModel->delete($id);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Alimento removido da dieta com sucesso!"
                : "Erro ao remover alimento da dieta"
        ]);
    }

    /*--------------------------------------------------------------------------*/
    
     //PERFIL NUTRICIONAL DO USUÁRIO

    public function buscarPerfilUsuario(int $userId): void
    {
        $profileModel = new UserProfile();
        $perfil = $profileModel->findByUserId($userId);

        if (!$perfil) {
            echo json_encode([
                "status" => "error",
                "message" => "Perfil nutricional não encontrado"
            ]);
            return;
        }

        echo json_encode([
            "status" => "success",
            "data" => $perfil
        ]);
    }

    public function salvarPerfilUsuario(int $userId, array $dados): void
    {
        if (
            empty($dados["birth_date"]) ||
            empty($dados["gender"]) ||
            empty($dados["weight"]) ||
            empty($dados["height"]) ||
            empty($dados["activity_level"]) ||
            empty($dados["goal"])
        ) {
            echo json_encode([
                "status" => "error",
                "message" => "Preencha todos os campos obrigatórios"
            ]);
            return;
        }

        $profileModel = new UserProfile();

        $resultado = $profileModel->createOrUpdate($userId, [
            "birth_date" => $dados["birth_date"],
            "gender" => $dados["gender"],
            "weight" => $dados["weight"],
            "height" => $dados["height"],
            "activity_level" => $dados["activity_level"],
            "goal" => $dados["goal"]
        ]);

        echo json_encode([
            "status" => $resultado ? "success" : "error",
            "message" => $resultado
                ? "Perfil nutricional salvo com sucesso!"
                : "Erro ao salvar perfil nutricional"
        ]);
    }
    public function listarDietasDoUsuario(int $userId): void
    {
        $dietModel = new Diet();
        $dietas = $dietModel->findByUserId($userId);

        echo json_encode([
            "status" => "success",
            "data" => $dietas
        ]);
    }
    }