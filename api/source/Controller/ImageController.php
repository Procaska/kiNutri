<?php

namespace source\Controller;

use PDO;
use PDOException;
use RuntimeException;
use Throwable;
use source\Core\Connect;
use source\Models\Food;
use source\Models\FoodImage;
use source\Models\User;
use source\Support\ImageStorage;

class ImageController
{
    public function photo(int $userId, string $method): void
    {
        $this->handle(function (PDO $db, ?string &$newPath) use ($userId, $method) {
            $users = new User();
            if ($method === 'POST') $db->beginTransaction();
            $user = $method === 'POST' ? $users->lockPhoto($userId) : $users->findById($userId);
            if (!$user) throw new RuntimeException('Perfil de usuário não encontrado.', 404);
            if ($method === 'GET') return [200, 'Foto consultada.', ['image_path' => ImageStorage::managed($user->photo)]];
            $newPath = ImageStorage::receive('photo');
            $users->updatePhoto($userId, $newPath);
            $db->commit();
            $path = $newPath;
            $newPath = null;
            ImageStorage::remove($user->photo);
            return [200, 'Foto atualizada com sucesso!', ['image_path' => $path]];
        });
    }

    public function gallery(int $foodId, string $method, ?int $imageId = null): void
    {
        $this->handle(function (PDO $db, ?string &$newPath) use ($foodId, $method, $imageId) {
            $images = new FoodImage($db);
            // Mesmo bloqueio utilizado ao excluir o alimento.
            $db->beginTransaction();
            if (!(new Food())->lock($foodId)) throw new RuntimeException('Alimento não encontrado.', 404);
            if ($method === 'GET') {
                $items = $images->listByFood($foodId);
                $db->commit();
                return [200, 'Galeria consultada.', $items];
            }
            if ($method === 'POST') {
                $alt = $_POST['alt_text'] ?? '';
                if (!is_string($alt) || !mb_check_encoding($alt, 'UTF-8') || mb_strlen(trim($alt), 'UTF-8') > 255) {
                    throw new RuntimeException('O texto alternativo deve ter até 255 caracteres.', 400);
                }
                $alt = trim($alt);
                $newPath = ImageStorage::receive('image');
                $image = $images->create($foodId, $newPath, $alt === '' ? null : $alt);
                $db->commit();
                $newPath = null;
                return [201, 'Imagem adicionada à galeria!', $image];
            }
            $image = $images->find($foodId, $imageId);
            if (!$image) throw new RuntimeException('Imagem não encontrada neste alimento.', 404);
            $images->remove($foodId, $imageId);
            $db->commit();
            ImageStorage::remove($image->image_path);
            return [200, 'Imagem removida da galeria.', ['id' => $imageId, 'food_id' => $foodId]];
        });
    }

    private function handle(callable $action): void
    {
        $db = Connect::getInstance();
        $newPath = null;
        try {
            [$code, $message, $data] = $action($db, $newPath);
            self::respond($code, $message, $data);
        } catch (Throwable $e) {
            try {
                if ($db->inTransaction()) $db->rollBack();
            } catch (Throwable $rollbackError) {
                error_log((string) $rollbackError);
            }
            ImageStorage::remove($newPath);
            $code = $e instanceof RuntimeException && !($e instanceof PDOException)
                && in_array($e->getCode(), [400, 404, 413, 415], true) ? $e->getCode() : 500;
            if ($code === 500) error_log((string) $e);
            self::respond($code, $code === 500 ? 'Não foi possível concluir a operação de imagem.' : $e->getMessage());
        }
    }

    public static function respond(int $code, string $message, mixed $data = null): void
    {
        http_response_code($code);
        $status = $code < 400 ? 'success' : 'error';
        echo json_encode(['code' => $code, 'type' => $status, 'status' => $status, 'message' => $message, 'data' => $data]);
    }
}
