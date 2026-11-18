# KiNutri — API REST

Para foto da conta autenticada e galeria de alimentos, consulte os [contratos da Etapa 07](../README.md#contratos-da-api) e a [migração food_images](../data-base/etapa-07-imagens.sql).

## Sobre o projeto

O KiNutri é um sistema web para gerenciamento nutricional.
A aplicação permite que um nutricionista/admin cadastre pacientes, alimentos e dietas, associando planos alimentares a usuários específicos.

---

## Entidade principal
A entidade principal do sistema é:

```txt
diets
```
A tabela `diets` representa os planos alimentares criados pelo nutricionista. Ela é o ponto central do sistema, pois conecta usuários/pacientes aos alimentos por meio da tabela `diet_foods`.

---

## Banco de dados
```
kinutri_db
```

Principais tabelas:

```txt
user_types
users
user_profiles
food_categories
foods
food_images
diets
diet_foods
```

Relacionamentos principais:

```txt
user_types 1:N users
users 1:1 user_profiles
users 1:N diets
food_categories 1:N foods
foods 1:N food_images
diets 1:N diet_foods
foods 1:N diet_foods
```

---

## Estrutura da API
```txt
api/
├── index.php
├── composer.json
├── vendor/
└── source/
    ├── Config/
    ├── Core/
    ├── Controller/
    └── Models/
```
---

## Tecnologias utilizadas
```
PHP
MySQL
PDO
Composer
API REST
MVC
HTML
CSS
JavaScript
```
---

## Rotas principais
```
source
│
├── Controller
│   ├── Api.php
│   ├── AuthController.php
│   ├── UserController.php
│   ├── FoodController.php
│   └── DietController.php
```

### Login
```http
POST /api/login
```

### Usuários
```http
GET /api/usuarios
GET /api/usuarios/{id}
POST /api/usuarios
PUT /api/usuarios/{id}
DELETE /api/usuarios/{id}
```

### Perfil nutricional
```http
GET /api/usuarios/{id}/perfil
POST /api/usuarios/{id}/perfil
```

### Alimentos
```http
GET /api/alimentos
GET /api/alimentos/{id}
POST /api/alimentos
PUT /api/alimentos/{id}
DELETE /api/alimentos/{id}
```

### Foto de perfil e galeria

```http
GET /api/users/photo
POST /api/users/photo
GET /api/alimentos/{food_id}/imagens
POST /api/alimentos/{food_id}/imagens
DELETE /api/alimentos/{food_id}/imagens/{image_id}
```

Todas exigem JWT. O envio de foto usa o campo multipart `photo` e afeta a própria conta. A inclusão na galeria usa `image` e, opcionalmente, `alt_text`. Somente administradores podem incluir ou remover imagens da galeria.

### Dietas
```http
GET /api/dietas
GET /api/dietas/{id}
POST /api/dietas
PUT /api/dietas/{id}
DELETE /api/dietas/{id}
```

### Dietas de um usuário
```http
GET /api/usuarios/{id}/dietas
```

### Alimentos de uma dieta
```http
GET /api/dietas/{id}/alimentos
POST /api/dietas/{id}/alimentos
DELETE /api/dietas/alimentos/{id}
```

## Exemplo de criação de dieta
```http
POST /api/dietas
```

```json
{
  "user_id": 2,
  "name": "Dieta Emagrecimento",
  "goal": "Emagrecimento",
  "calories": 1800,
  "protein": 120,
  "carbs": 180,
  "fat": 60
}
```

Resposta esperada:

```json
{
  "status": "success",
  "message": "Dieta cadastrada com sucesso!"
}
```

---

## Exemplo de adicionar alimento em uma dieta
```http
POST /api/dietas/1/alimentos
```

```json
{
  "food_id": 1,
  "meal": "Almoço",
  "quantity": 150
}
```

Resposta esperada:

```json
{
  "status": "success",
  "message": "Alimento adicionado à dieta com sucesso!"
}
```

---
## Fluxo principal do sistema
```
Nutricionista/Admin
        ↓
Cadastra paciente
        ↓
Cadastra alimentos
        ↓
Cria dieta
        ↓
Associa a dieta ao paciente
        ↓
Adiciona alimentos à dieta
        ↓
Paciente faz login
        ↓
Paciente visualiza seu plano alimentar
```

---
## Entrega atual
```
Banco de dados implementado
Entidade principal definida
CRUD completo da entidade principal
Relacionamento entre dietas e alimentos
Relacionamento entre dietas e usuários
Documentação da API

```

## Integrante
* Arthur Procaska
