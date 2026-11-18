function formatarTipo(type) {
  return type === "ADMIN"
    ? "Nutricionista/Admin"
    : "Usuário comum";
}

async function listarUsuarios() {
  const tbody = document.getElementById("usuariosTable");

  if (!tbody) return;

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-row">
          Carregando usuários...
        </td>
      </tr>
    `;

    const result = await userService.list();

    if (result.status !== "success") {
      throw new Error(result.message || "Erro ao carregar usuários.");
    }

    const users = result.data || [];

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-row">
            Nenhum usuário cadastrado ainda.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.name}</td>

        <td>${user.email}</td>

        <td>${formatarTipo(user.type)}</td>

        <td>
          <button
            class="action-btn edit-btn"
            onclick="verDietasUsuario(${user.id}, '${user.name}')"
          >
            Dietas
          </button>
        </td>

        <td>
          <button
            class="action-btn edit-btn"
            onclick="abrirModalEditarUsuario(${user.id})"
          >
            Editar
          </button>

          <button
            class="action-btn delete-btn"
            onclick="excluirUsuario(${user.id})"
          >
            Excluir
          </button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-row">
          Não foi possível carregar os usuários.
        </td>
      </tr>
    `;

    showToast("Erro ao carregar usuários.", "error");
  }
}


async function criarUsuario(event) {
  event.preventDefault();
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();

  const nome = fields.userNome;
  const email = fields.userEmail.toLowerCase();
  const senha = fields.userSenha;
  const tipo = fields.userTipo;

  if (!nome || !email || !senha || !tipo) {
    showToast("Preencha todos os campos obrigatórios.", "error");
    return;
  }

  if (senha.length < 6) {
    showToast("A senha precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  formController.setLoading(true);
  try {
    const result = await userService.create({
      name: nome,
      email: email,
      typeId: tipo === "admin" ? 1 : 2
    }, senha);

    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao criar usuário.",
        "error"
      );
      return;
    }

    formController.reset();

    await listarUsuarios();

    showToast("Usuário criado com sucesso!");

    if (typeof criarNotificacao === "function") {
      criarNotificacao(
        "Novo usuário cadastrado",
        `${nome} foi adicionado ao sistema.`,
        "success"
      );
    }

  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    showToast(
      error.message || "Erro ao criar usuário.",
      "error"
    );
  } finally {
    formController.setLoading(false);
  }
}


async function verDietasUsuario(userId, userName) {
  try {
    const result = await dietService.listByUser(userId);

    if (result.status !== "success") {
      showToast(
        "Erro ao carregar dietas do usuário.",
        "error"
      );
      return;
    }

    const dietas = result.data || [];

    let conteudo = "";

    if (dietas.length === 0) {
      conteudo = `
        <p class="empty-row">
          Este usuário ainda não possui dietas cadastradas.
        </p>
      `;
    } else {
      conteudo = `
        <div class="table-wrapper">
          <table class="admin-table">

            <thead>
              <tr>
                <th>Nome</th>
                <th>Objetivo</th>
                <th>Calorias</th>
                <th>Proteínas</th>
                <th>Carboidratos</th>
                <th>Gorduras</th>
              </tr>
            </thead>

            <tbody>
              ${dietas.map(dieta => `
                <tr>
                  <td>${dieta.name}</td>
                  <td>${dieta.goal}</td>
                  <td>${dieta.calories} kcal</td>
                  <td>${dieta.protein}g</td>
                  <td>${dieta.carbs}g</td>
                  <td>${dieta.fat}g</td>
                </tr>
              `).join("")}
            </tbody>

          </table>
        </div>
      `;
    }

    openModal(
      `Dietas de ${userName}`,
      `
        ${conteudo}

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-outline"
            onclick="closeModal()"
          >
            Fechar
          </button>
        </div>
      `
    );

  } catch (error) {
    console.error("Erro ao carregar dietas:", error);

    showToast(
      error.message || "Erro ao carregar dietas do usuário.",
      "error"
    );
  }
}


document.addEventListener("DOMContentLoaded", () => {

  listarUsuarios();

  const userForm = document.getElementById("userForm");

  if (userForm) {
    userForm.addEventListener(
      "submit",
      criarUsuario
    );
  }

  const searchUsuarios =
    document.getElementById("searchUsuarios");

  if (searchUsuarios) {

    searchUsuarios.addEventListener("input", (e) => {

      const termo =
        e.target.value.toLowerCase();

      const linhas =
        document.querySelectorAll(
          "#usuariosTable tr"
        );

      linhas.forEach(linha => {

        const texto =
          linha.textContent.toLowerCase();

        linha.style.display =
          texto.includes(termo)
            ? ""
            : "none";

      });

    });

  }

});

async function abrirModalEditarUsuario(id) {
  try {
    const result = await userService.find(id);
    if (result.status !== "success" || !result.data) {
      showToast(result, "error");
      return;
    }
    const user = result.data;
    openModal("Editar usuário", `
      <form class="modal-form" onsubmit="salvarEdicaoUsuario(event, ${id})">
        <input id="editUserNome" value="${escapeHTML(user.name)}" placeholder="Nome" required>
        <input id="editUserEmail" type="email" value="${escapeHTML(user.email)}" placeholder="E-mail" required>
        <select id="editUserTipo" required>
          <option value="2" ${!user.isAdmin() ? "selected" : ""}>Usuário comum</option>
          <option value="1" ${user.isAdmin() ? "selected" : ""}>Nutricionista/Admin</option>
        </select>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>`);
  } catch (error) { showToast(error.message, "error"); }
}

async function salvarEdicaoUsuario(event, id) {
  event.preventDefault();
  const form = Object.create(FormControllerPrototype).init(event.target);
  if (!form.validate()) return;
  const fields = form.values();
  form.setLoading(true);
  try {
    const current = await userService.find(id);
    if (current.status !== "success" || !current.data) throw new Error(current.message || "Usuário não encontrado.");
    const user = current.data;
    user.name = fields.editUserNome;
    user.email = fields.editUserEmail.toLowerCase();
    user.typeId = Number(fields.editUserTipo);
    const result = await userService.update(id, user);
    showToast(result);
    if (result.status !== "success") return;
    if (storage.getUser()?.id == id) storage.saveSession(storage.getToken(), user);
    closeModal();
    await listarUsuarios();
    if (typeof criarNotificacao === "function") criarNotificacao("Usuário atualizado", `${user.name} foi atualizado.`, "success");
  } catch (error) { showToast(error.message, "error"); }
  finally { form.setLoading(false); }
}

function excluirUsuario(id) {
  confirmAction("Excluir este usuário? O perfil será removido e os planos serão preservados sem paciente.", async () => {
    try {
      const result = await userService.remove(id);
      showToast(result);
      if (result.status !== "success") return;
      await listarUsuarios();
      if (typeof criarNotificacao === "function") criarNotificacao("Usuário removido", "Um usuário foi excluído do sistema.", "warning");
    } catch (error) { showToast(error.message, "error"); }
  });
}
