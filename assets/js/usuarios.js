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

    const result = await api.get("/usuarios");

    if (result.status !== "success") {
      showToast("Erro ao carregar usuários.", "error");
      return;
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
            onclick="showToast('Edição de usuário será implementada depois.', 'error')"
          >
            Editar
          </button>

          <button
            class="action-btn delete-btn"
            onclick="showToast('Exclusão de usuário será implementada depois.', 'error')"
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

  const nome = document.getElementById("userNome").value.trim();
  const email = document.getElementById("userEmail").value.trim().toLowerCase();
  const senha = document.getElementById("userSenha").value.trim();
  const tipo = document.getElementById("userTipo").value;

  if (!nome || !email || !senha || !tipo) {
    showToast("Preencha todos os campos obrigatórios.", "error");
    return;
  }

  if (senha.length < 6) {
    showToast("A senha precisa ter pelo menos 6 caracteres.", "error");
    return;
  }

  try {
    const result = await api.post("/usuarios", {
      name: nome,
      email: email,
      password: senha,
      typeId: tipo === "admin" ? 1 : 2
    });

    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao criar usuário.",
        "error"
      );
      return;
    }

    event.target.reset();

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
  }
}


async function verDietasUsuario(userId, userName) {
  try {
    const result = await api.get(
      `/usuarios/${userId}/dietas`
    );

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