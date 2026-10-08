<?php
namespace source\Core;

use DateTimeImmutable;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTToken
{
    private string $secretKey = JWT_SECRET_KEY;
    private string $headerJWT = "HS512";
    private string $url = CONF_URL_BASE;


    public function encode(array $payLoad): string
    {
        $tokenId = base64_encode(random_bytes(16));
        $issuedAt = new DateTimeImmutable();

        $expire = $issuedAt
            ->modify("+90 minutes")
            ->getTimestamp();

        $data = [
            "iat" => $issuedAt->getTimestamp(),
            "jti" => $tokenId,
            "iss" => $this->url,
            "nbf" => $issuedAt->getTimestamp(),
            "exp" => $expire,
            "data" => $payLoad
        ];

        return JWT::encode(
            $data,
            $this->secretKey,
            $this->headerJWT );
    }

    public function decode(string $token): bool|object{
        try {
            $decodedToken = JWT::decode(
                $token,
                new Key(
                    $this->secretKey,
                    $this->headerJWT
                )
            );
            $now = new DateTimeImmutable();

            if ( $decodedToken->iss !== $this->url ||
                $decodedToken->nbf > $now->getTimestamp() ||
                $decodedToken->exp < $now->getTimestamp()) 
            {
                return false;
            }

            return $decodedToken;

        } catch (Exception) {
            return false;
        }
    }
}