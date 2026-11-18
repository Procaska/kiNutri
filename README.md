# KiNutri — Etapa 07: foto de perfil e galeria de alimentos

Refatoração do frontend da Etapa 05 para POO clássica e prototípica. Tecnologias: HTML5, CSS3, JavaScript Vanilla, PHP, MySQL, API REST, JWT e Chart.js. Usuários, planos e alimentos persistem na API; LocalStorage mantém sessão, tema e notificações locais.

## Execução local

1. Coloque o projeto em `C:\xampp\htdocs\kiNutri`.
2. Ligue **Apache e MySQL** no XAMPP.
3. Em uma instalação nova, configure `api/source/Config/Config.php` e importe `data-base/dump.sql` no MySQL. **Não reimporte o dump em um banco existente: ele remove e recria as tabelas.**
4. Execute [a migração da Etapa 07](data-base/etapa-07-imagens.sql) no banco configurado, inclusive em instalações novas, após o dump inicial. Ela cria apenas a tabela filha. No phpMyAdmin, selecione `kinutri_db` e importe esse arquivo.
5. As dependências PHP estão em `api/vendor`; caso ausentes, execute `composer install` em `api`. Chart.js continua carregado por CDN.
6. Abra [KiNutri](http://localhost/kiNutri/index.html). A API fica em `http://localhost/kiNutri/api`.

## Etapa 07 — imagens

- Em **Perfil**, selecione uma imagem, confira a prévia e envie a nova foto da sua conta.
- Em **Admin → Alimentos → Imagens**, adicione uma imagem por envio ou remova uma imagem específica. Cada alimento pode ter zero, uma ou várias imagens. Ao atualizar a página e reabrir a galeria, as imagens são consultadas na API.
- Formatos: **JPEG, PNG e WebP, até 5 MiB por arquivo**. O PHP precisa de Fileinfo, mbstring, PDO MySQL e acesso de escrita em `api/uploads`. Com PHP como módulo do Apache, `api/.htaccess` configura 5 MiB por arquivo e 6 MiB por requisição. Para outra configuração, ajuste os limites equivalentes no PHP. No Apache, habilite as regras de `.htaccess`, `mod_rewrite` e `mod_headers`.

### Contratos da API

Todas as rotas de imagem exigem `Authorization: Bearer <JWT>`. Nos uploads, use `FormData` e deixe o navegador definir `Content-Type: multipart/form-data` com seu boundary.

| Método e rota | Entrada | Permissão | Resposta em sucesso |
| --- | --- | --- | --- |
| GET `/users/photo` | Sem parâmetros | Conta autenticada | 200, `data: {image_path}` (valor nulo sem foto) |
| POST `/users/photo` | Multipart: `photo` | Própria conta, identificada pelo JWT | 200, `data: {image_path}` |
| GET `/alimentos/{food_id}/imagens` | ID do alimento | Conta autenticada | 200, `data` com imagens em ordem de ID, ou `[]` |
| POST `/alimentos/{food_id}/imagens` | Multipart: `image`, `alt_text` opcional (até 255 caracteres) | Administrador | 201, `data` com a imagem criada |
| DELETE `/alimentos/{food_id}/imagens/{image_id}` | IDs do alimento e da imagem | Administrador | 200, `data: {id, food_id}` |

O objeto de imagem contém `id`, `food_id`, `image_path`, `alt_text` e `created_at`. A resposta JSON tem `code`, `type`, `status`, `message` e `data`. Erros: 400 (arquivo ausente ou entrada inválida), 401 (sessão ausente, inválida ou conta removida), 403 (sem permissão), 404 (alimento, conta ou vínculo inexistente), 413 (limite excedido), 415 (conteúdo não aceito) e 500 (falha de armazenamento ou banco).

O cadastro público cria contas comuns. `POST /usuarios` com `typeId: 1` exige um administrador autenticado; a opção permanece em **Admin → Usuários**. `DELETE /alimentos/{id}` também exige administrador, pois remove as imagens do alimento.

### Banco e armazenamento

O **alimento** é o produto do catálogo. `food_images.food_id` referencia `foods.id` com exclusão em cascata. A foto usa `users.photo`. O banco guarda metadados e caminhos como `uploads/<nome-gerado>.png`, relativos à base da API. Os binários ficam em `api/uploads`, fora do Git, servidos por URL pública sem listagem de pasta. Inclua essa pasta e o banco no backup.

`ImageService` estende `HttpClientBase` e usa `postForm`. `ImageController` coordena as operações; `FoodImage` e `User` persistem os metadados. A classe `Upload.php` fornecida valida e grava os arquivos. A foto antiga e os arquivos dos registros removidos são apagados após o commit. Se a gravação no banco falhar, o código remove o arquivo novo; falhas na remoção pelo sistema de arquivos são registradas no log do PHP.

[Testes, capturas e roteiro da Etapa 07](docs/etapa-07.md).

## Etapa 06 — JavaScript orientado a objetos

Use o Apache para que a API funcione. O frontend não exige npm, framework ou compilação.

## Arquitetura

```text
Tela/controller → Service → HttpClientBase → API PHP → MySQL
                      ↕
                   Entidades

Tela/controller → ToastPrototype / FormControllerPrototype
```

| Camada | Arquivos | Responsabilidade |
| --- | --- | --- |
| Entidades | `assets/js/common/classes/{User,Food,Diet,UserProfile,DietFood}.js` | Dados privados, getters/setters, validação e conversão JSON |
| Transporte | `assets/js/common/classes/HttpClientBase.js` | URL base, headers, JWT, GET/POST/PUT/DELETE e respostas HTTP |
| Serviços | `assets/js/common/services/{User,Diet,Food}Service.js` | Endpoints e conversão de payloads em entidades; sem DOM |
| Protótipos | `assets/js/common/prototypes/` | Toast e formulários reutilizáveis |
| Controllers | `assets/js/auth.js`, `alimentos.js`, `planos.js`, `usuarios.js`, etc. | Eventos, formulários, estados, tabelas, modais e gráficos |
| Instâncias | `assets/js/api.js` | userService, dietService e foodService compartilhados |

Os HTML carregam sessão, entidades, transporte, serviços, protótipos, instâncias e controllers nessa ordem. Apenas HttpClientBase chama `fetch`. As telas não chamam o antigo `api.get/post/put/delete`. `admin.js` é exclusivo do dashboard administrativo.

## POO clássica

- **Classes/encapsulamento:** as cinco entidades têm construtor, campos privados `#campo`, getters/setters e validações simples. Nomes vazios, IDs inválidos e valores nutricionais negativos/não numéricos são rejeitados.
- **Herança:** UserService, FoodService e DietService estendem HttpClientBase.
- **Composição:** Diet.foods contém DietFood[], utilizados por `meu-plano.js` para renderizar as refeições; a tela de planos usa os três serviços.
- **Métodos de domínio:** User.isAdmin(), Food.caloriesFor(), Diet.macroCalories(), UserProfile.bmi() e DietFood.portionCalories().
- **JSON:** fromJSON() converte os payloads da API; toJSON() serializa os campos privados. Os serviços preservam o envelope `{status, message, data}`, com entidades em `data` nas leituras.
- **Senha:** enviada separadamente em UserService.create(user, password), sem integrar a entidade, sessão ou exportação.
- **Compatibilidade:** User.fromJSON() tolera e-mails legados da Etapa 05; novos usuários e alterações validam o e-mail.

```js
const result = await foodService.list();
const food = result.data[0]; // instância de Food
food.calories = 150;        // setter com validação
await foodService.update(food.id, food); // toJSON no serviço
```

## POO prototípica

ToastPrototype e FormControllerPrototype são objetos, sem versão equivalente por `class`. Instâncias usam Object.create(...).init(...); métodos ficam no protótipo e cada objeto mantém seu estado.

```js
const toastA = Object.create(ToastPrototype).init("toastA");
const toastB = Object.create(ToastPrototype).init("toastB");
toastA.show === toastB.show; // true
Object.getPrototypeOf(toastA) === ToastPrototype; // true

const userForm = Object.create(FormControllerPrototype)
  .init(document.getElementById("userForm"));
const foodForm = Object.create(FormControllerPrototype)
  .init(document.getElementById("alimentoForm"));
userForm.values === foodForm.values; // true
```

O Toast global appToast atende showToast() e aceita string ou resposta da API com/sem data ou message. Os tipos são exatamente **success**, **warning** e **error**, em verde/amarelo/vermelho. Nunca converte `data` em mensagem; respostas incompletas recebem texto padrão. O timer anterior é cancelado ao exibir nova mensagem.

O FormController é usado nos formulários reais de cadastro, login, CRUD e perfil: serializa por name/id, valida com HTML, limpa campos e controla os botões durante gravações.

## API e CRUDs

| Serviço | Métodos |
| --- | --- |
| UserService | list, find, create, update, remove, login, getProfile, saveProfile |
| FoodService | list, find, create, update, remove |
| DietService | list, find, create, update, remove, listByUser, listFoods, addFood, removeFood |

As rotas anteriores foram preservadas. Para completar o CRUD de usuários, com autorização expressa do responsável, foram acrescentadas **PUT /usuarios/{id}** e **DELETE /usuarios/{id}**. Exigem JWT e conta administrativa atual no banco. O administrador não pode excluir a própria conta nem remover o próprio papel administrativo. A edição não altera a senha.

A exclusão de usuário segue as FKs existentes: remove o perfil e preserva dietas com user_id NULL. Foi implementada **GET /alimentos/{id}**, descrita no contexto mas ausente no router anterior. Nenhuma tabela foi criada.

O JWT é consultado na sessão a cada requisição. Loading, sucesso, erro e estados vazios são mantidos. A exportação usa os dados atuais da API, via serviços. O histórico continua sendo de planos e a apresentação continua orientada ao desktop.

## Testes e evidências

Com Node.js 24 disponível:

```powershell
node --test tests/stage6.test.cjs
node tests/integration-stage6.cjs
node tests/integration-stage7.cjs
```

O primeiro comando testa entidades, encapsulamento, composição, protótipos, Toast, autenticação, rotas, erros HTTP, UTF-8 e dependências dos HTML. O segundo requer XAMPP e usa a conta admin de demonstração do dump; para outra conta, configure KINUTRI_TEST_EMAIL e KINUTRI_TEST_PASSWORD no ambiente. Não imprime JWT ou credenciais. Cria dados temporários, testa os três CRUDs, perfil, vínculos e permissões; remove os próprios registros em finally e confere as contagens originais.

Relatório e roteiro de apresentação: [docs/etapa-06.md](docs/etapa-06.md). Capturas: [docs/evidencias](docs/evidencias).

O terceiro comando exige a migração da Etapa 07 e valida foto, galeria, permissões e limpeza de arquivos com registros temporários. Veja o [relatório da Etapa 07](docs/etapa-07.md).

## Base da etapa

Branch **javascript-poo**, criada a partir da main no commit **f2ec760**, com árvore de trabalho inicialmente limpa. Implementação baseada no contexto KiNutri_Etapa_06_Contexto_Codex.md. O diretório de exemplos do professor (`C:\Projects\docker-dev-env\public\inf-3am-26\poo-javascript`) não estava disponível para comparação.
