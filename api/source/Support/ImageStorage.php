<?php

namespace source\Support;

use RuntimeException;

class ImageStorage
{
    private const DIRECTORY = __DIR__ . '/../../uploads';

    public static function receive(string $field): string
    {
        $file = $_FILES[$field] ?? null;
        $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        if ($error === UPLOAD_ERR_NO_FILE) {
            $limit = trim((string) ini_get('post_max_size'));
            $scale = match (strtolower(substr($limit, -1))) {
                'k' => 1024, 'm' => 1024 ** 2, 'g' => 1024 ** 3, default => 1,
            };
            $bytes = (int) $limit * $scale;
            if (empty($_FILES) && $bytes > 0 && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > $bytes) {
                throw new RuntimeException('A requisição excede o limite de envio.', 413);
            }
            throw new RuntimeException('Selecione uma imagem para enviar.', 400);
        }
        if (!is_int($error)) throw new RuntimeException('Envie uma imagem por requisição.', 400);
        if (in_array($error, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
            throw new RuntimeException('A imagem excede o limite de 5 MiB.', 413);
        }
        try {
            return 'uploads/' . @(new Upload(self::DIRECTORY))->image($file);
        } catch (RuntimeException $e) {
            $code = match ($e->getMessage()) {
                'O arquivo excede o tamanho máximo permitido.' => 413,
                'O tipo do arquivo enviado não é permitido.',
                'O conteúdo enviado não é uma imagem válida.' => 415,
                default => $error === UPLOAD_ERR_PARTIAL ? 400 : 500,
            };
            throw new RuntimeException($e->getMessage(), $code, $e);
        }
    }

    public static function managed(?string $path): ?string
    {
        return $path && preg_match('~\Auploads/[a-f0-9]{32}\.(jpg|png|webp)\z~', $path) ? $path : null;
    }

    public static function remove(?string $path): void
    {
        if (!self::managed($path)) return;
        $absolute = self::DIRECTORY . '/' . basename($path);
        if (is_file($absolute) && !@unlink($absolute)) {
            error_log('KiNutri: falha ao remover imagem ' . $path);
        }
    }
}
