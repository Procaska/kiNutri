function getCategoryId(categoria) {
  const categorias = {
    "Proteínas": 1,
    "Proteinas": 1,
    "Carboidratos": 2,
    "Frutas": 3,
    "Verduras e Legumes": 4,
    "Gorduras Boas": 5
  };

  return categorias[categoria] || 1;
}

async function listarAlimentos() {
  const tbody = document.getElementById("alimentosTable");

  if (!tbody) return;

  // Estado de loading
  tbody.innerHTML = `
    <tr id="alimentosLoading">
      <td colspan="5" class="loading-state">
        Carregando alimentos...
      </td>
    </tr>
  `;

  try {
    const result = await foodService.list();

    if (result.status !== "success") {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="error-state">
            ${result.message || "Não foi possível carregar os alimentos."}
          </td>
        </tr>
      `;

      showToast(
        result.message || "Erro ao carregar alimentos.",
        "error"
      );

      return;
    }

    const alimentos = result.data || [];

    // Estado vazio
    if (alimentos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-row">
            Nenhum alimento cadastrado ainda.
          </td>
        </tr>
      `;

      return;
    }

    // Estado de sucesso
    tbody.innerHTML = alimentos.map(alimento => `
      <tr>
        <td>${escapeHTML(alimento.name)}</td>
        <td>${escapeHTML(alimento.category)}</td>
        <td>${alimento.calories} kcal</td>
        <td>${alimento.protein}g</td>
        <td>
          <button type="button" class="action-btn edit-btn" data-gallery-id="${alimento.id}">Imagens</button>
          <button
            class="action-btn edit-btn"
            onclick="abrirModalEditarAlimento(${alimento.id})"
          >
            Editar
          </button>

          <button
            class="action-btn delete-btn"
            onclick="excluirAlimento(${alimento.id})"
          >
            Excluir
          </button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    console.error(error);

    // Estado de erro
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="error-state">
          Não foi possível carregar os alimentos.
          Verifique a conexão com a API.
        </td>
      </tr>
    `;

    showToast(
      error.message || "Erro ao conectar com a API.",
      "error"
    );
  }
}

async function criarAlimento(event) {
  event.preventDefault();
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();

  const nome = fields.alimentoNome;

  const categoria = fields.alimentoCategoria;

  const calorias = Number(
    fields.alimentoCalorias
  );

  const proteina = Number(
    fields.alimentoProteina
  ) || 0;

  if (!nome || !categoria || !calorias) {
    showToast(
      "Preencha todos os campos obrigatórios.",
      "error"
    );
    return;
  }

  formController.setLoading(true);
  try {
    const result = await foodService.create({
      category_id: getCategoryId(categoria),
      name: nome,
      calories: calorias,
      protein: proteina
    });

    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao criar alimento.",
        "error"
      );
      return;
    }

    formController.reset();

    await listarAlimentos();

    if (typeof criarNotificacao === "function") {
      criarNotificacao(
        "Novo alimento cadastrado",
        `${nome} foi adicionado à base de alimentos.`,
        "success"
      );
    }

    showToast(
      "Alimento criado com sucesso!",
      "success"
    );

  } catch (error) {
    console.error(error);

    showToast(
      error.message || "Erro ao conectar com a API.",
      "error"
    );
  } finally {
    formController.setLoading(false);
  }
}

async function buscarAlimentoPorId(id) {
  try {
    const result = await foodService.find(id);
    return result.status === "success" ? result.data : null;
  } catch (error) {
    showToast(error.message, "error");
    return null;
  }
}

async function abrirModalEditarAlimento(id) {
  const alimento = await buscarAlimentoPorId(id);

  if (!alimento) {
    showToast(
      "Alimento não encontrado.",
      "error"
    );
    return;
  }

  openModal(
    "Editar alimento",
    `
      <form
        class="modal-form"
        onsubmit="salvarEdicaoAlimento(event, ${id})"
      >

        <input
          type="text"
          id="editAlimentoNome"
          value="${alimento.name}"
          required
        >

        <input
          type="text"
          id="editAlimentoCategoria"
          value="${alimento.category}"
          required
        >

        <input
          type="number"
          id="editAlimentoCalorias"
          value="${alimento.calories}"
          required
        >

        <input
          type="number"
          id="editAlimentoProteina"
          value="${alimento.protein}"
        >

        <div class="modal-actions">

          <button
            type="button"
            class="btn btn-outline"
            onclick="closeModal()"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="btn btn-primary"
          >
            Salvar
          </button>

        </div>

      </form>
    `
  );
}

async function salvarEdicaoAlimento(event, id) {
  event.preventDefault();
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();

  const nome = fields.editAlimentoNome;

  const categoria = fields.editAlimentoCategoria;

  const calorias = Number(
    fields.editAlimentoCalorias
  );

  const proteina = Number(
    fields.editAlimentoProteina
  ) || 0;

  if (!nome || !categoria || !calorias) {
    showToast(
      "Preencha todos os campos obrigatórios.",
      "error"
    );
    return;
  }

  formController.setLoading(true);
  try {
    const result = await foodService.update(id,
      {
        category_id: getCategoryId(categoria),
        name: nome,
        calories: calorias,
        protein: proteina
      }
    );

    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao atualizar alimento.",
        "error"
      );
      return;
    }

    await listarAlimentos();

    closeModal();

    showToast(
      "Alimento atualizado com sucesso!",
      "success"
    );

  } catch (error) {
    console.error(error);

    showToast(
      error.message || "Erro ao conectar com a API.",
      "error"
    );
  } finally {
    formController.setLoading(false);
  }
}

function excluirAlimento(id) {
  confirmAction(
    "Deseja realmente excluir este alimento?",
    async () => {

      try {
        const result = await foodService.remove(id
        );

        if (result.status !== "success") {
          showToast(
            result.message || "Erro ao excluir alimento.",
            "error"
          );
          return;
        }

        await listarAlimentos();

        if (typeof criarNotificacao === "function") {
          criarNotificacao(
            "Alimento removido",
            "Um alimento foi excluído da base.",
            "warning"
          );
        }

        showToast(
          "Alimento excluído com sucesso!",
          "success"
        );

      } catch (error) {
        console.error(error);

        showToast(
          error.message || "Erro ao conectar com a API.",
          "error"
        );
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {

  listarAlimentos();

  const alimentoForm =
    document.getElementById("alimentoForm");

  if (alimentoForm) {
    alimentoForm.addEventListener(
      "submit",
      criarAlimento
    );
  }

  const searchAlimentos =
    document.getElementById("searchAlimentos");

  if (searchAlimentos) {

    searchAlimentos.addEventListener(
      "input",
      (event) => {

        const termo =
          event.target.value.toLowerCase();

        const linhas =
          document.querySelectorAll(
            "#alimentosTable tr"
          );

        linhas.forEach(linha => {

          const texto =
            linha.textContent.toLowerCase();

          linha.style.display =
            texto.includes(termo)
              ? ""
              : "none";
        });
      }
    );
  }
});
