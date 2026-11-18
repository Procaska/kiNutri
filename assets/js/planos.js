async function carregarUsuariosNoSelect() {
  const select = document.getElementById("planoUsuario");

  if (!select) return;

  try {
    const result = await userService.list();

    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao carregar usuários.",
        "error"
      );
      return;
    }

    const usuarios = result.data.filter(
      user => user.typeId == 2 || user.type === "STANDARD"
    );

    select.innerHTML = `
      <option value="">Selecione o paciente</option>

      ${usuarios.map(user => `
        <option value="${user.id}">
          ${user.name}
        </option>
      `).join("")}
    `;

  } catch (error) {
    console.error(error);

    showToast(
      error.message || "Erro ao conectar com a API.",
      "error"
    );
  }
}


async function listarPlanos() {
  const tbody = document.getElementById("planosTable");

  if (!tbody) return;

  // Estado de loading
  tbody.innerHTML = `
    <tr id="planosLoading">
      <td colspan="6" class="loading-state">
        Carregando dietas...
      </td>
    </tr>
  `;

  try {
    const result = await dietService.list();

    if (result.status !== "success") {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="error-state">
            ${result.message || "Não foi possível carregar as dietas."}
          </td>
        </tr>
      `;

      showToast(
        result.message || "Erro ao carregar dietas.",
        "error"
      );

      return;
    }

    const dietas = result.data || [];

    // Estado vazio
    if (dietas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-row">
            Nenhuma dieta cadastrada ainda.
          </td>
        </tr>
      `;

      return;
    }

    // Estado de sucesso
    tbody.innerHTML = dietas.map(dieta => `
      <tr>
        <td>${dieta.name}</td>
        <td>${dieta.calories} kcal</td>
        <td>${dieta.protein}g</td>
        <td>${dieta.carbs}g</td>
        <td>${dieta.fat}g</td>

        <td>
          <button
            class="action-btn edit-btn"
            onclick="abrirModalEditarPlano(${dieta.id})"
          >
            Editar
          </button>

          <button
            class="action-btn edit-btn"
            onclick="abrirModalAlimentosDieta(${dieta.id}, '${dieta.name}')"
          >
            Alimentos
          </button>

          <button
            class="action-btn delete-btn"
            onclick="excluirPlano(${dieta.id})"
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
        <td colspan="6" class="error-state">
          Não foi possível carregar as dietas.
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


async function criarPlano(event) {
  event.preventDefault();
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();

  const userId = Number(
    fields.planoUsuario
  );

  const nome = fields.planoNome;

  const calorias =
    Number(fields.planoCalorias) || 0;

  const proteina =
    Number(fields.planoProteina) || 0;

  const carbo =
    Number(fields.planoCarbo) || 0;

  const gordura =
    Number(fields.planoGordura) || 0;


  if (!userId || !nome) {
    showToast(
      "Selecione o paciente e informe o nome da dieta.",
      "error"
    );
    return;
  }


  formController.setLoading(true);
  try {
    const result = await dietService.create({
      user_id: userId,
      name: nome,
      goal: "Não definido",
      calories: calorias,
      protein: proteina,
      carbs: carbo,
      fat: gordura
    });


    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao criar dieta.",
        "error"
      );
      return;
    }


    formController.reset();

    await carregarUsuariosNoSelect();
    await listarPlanos();

    showToast(
      "Dieta criada com sucesso!",
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


async function buscarPlanoPorId(id) {
  try {
    const result = await dietService.find(id);

    return result.status === "success"
      ? result.data
      : null;

  } catch (error) {
    console.error(error);

    return null;
  }
}


async function abrirModalEditarPlano(id) {
  const dieta = await buscarPlanoPorId(id);

  if (!dieta) {
    showToast(
      "Dieta não encontrada.",
      "error"
    );
    return;
  }


  openModal(
    "Editar dieta",
    `
      <form
        class="modal-form"
        onsubmit="salvarEdicaoPlano(event, ${id})"
      >

        <input
          type="text"
          id="editPlanoNome"
          value="${dieta.name}"
          required
        >

        <input
          type="number"
          id="editPlanoCalorias"
          value="${dieta.calories}"
          required
        >

        <input
          type="number"
          id="editPlanoProteina"
          value="${dieta.protein}"
          required
        >

        <input
          type="number"
          id="editPlanoCarbo"
          value="${dieta.carbs}"
          required
        >

        <input
          type="number"
          id="editPlanoGordura"
          value="${dieta.fat}"
          required
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


async function salvarEdicaoPlano(event, id) {
  event.preventDefault();
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();

  const dietaAtual = await buscarPlanoPorId(id);

  const nome = fields.editPlanoNome;

  const calorias =
    Number(
      fields.editPlanoCalorias
    ) || 0;

  const proteina =
    Number(
      fields.editPlanoProteina
    ) || 0;

  const carbo =
    Number(
      fields.editPlanoCarbo
    ) || 0;

  const gordura =
    Number(
      fields.editPlanoGordura
    ) || 0;


  formController.setLoading(true);
  try {
    const result = await dietService.update(id,
      {
        user_id: dietaAtual?.user_id || null,
        name: nome,
        goal: dietaAtual?.goal || "Não definido",
        calories: calorias,
        protein: proteina,
        carbs: carbo,
        fat: gordura
      }
    );


    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao atualizar dieta.",
        "error"
      );
      return;
    }


    await listarPlanos();

    closeModal();

    showToast(
      "Dieta atualizada com sucesso!",
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


function excluirPlano(id) {
  confirmAction(
    "Deseja realmente excluir esta dieta?",
    async () => {

      try {
        const result = await dietService.remove(id
        );


        if (result.status !== "success") {
          showToast(
            result.message || "Erro ao excluir dieta.",
            "error"
          );
          return;
        }


        await listarPlanos();

        showToast(
          "Dieta excluída com sucesso!",
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


async function buscarAlimentos() {
  try {
    const result = await foodService.list();

    return result.status === "success"
      ? result.data
      : [];

  } catch (error) {
    console.error(error);

    return [];
  }
}


async function buscarAlimentosDaDieta(dietaId) {
  try {
    const result = await dietService.listFoods(dietaId);

    return result.status === "success"
      ? result.data
      : [];

  } catch (error) {
    console.error(error);

    return [];
  }
}


async function abrirModalAlimentosDieta(
  dietaId,
  dietaNome
) {

  const alimentos = await buscarAlimentos();

  const alimentosDaDieta =
    await buscarAlimentosDaDieta(dietaId);


  openModal(
    `Alimentos da dieta: ${dietaNome}`,
    `
      <form
        class="modal-form"
        onsubmit="adicionarAlimentoDieta(event, ${dietaId}, '${dietaNome}')"
      >

        <select
          id="dietFoodId"
          required
        >
          <option value="">
            Selecione um alimento
          </option>

          ${alimentos.map(alimento => `
            <option value="${alimento.id}">
              ${alimento.name} - ${alimento.calories} kcal
            </option>
          `).join("")}

        </select>


        <select
          id="dietMeal"
          required
        >

          <option value="">
            Selecione a refeição
          </option>

          <option value="Café da manhã">
            Café da manhã
          </option>

          <option value="Lanche da manhã">
            Lanche da manhã
          </option>

          <option value="Almoço">
            Almoço
          </option>

          <option value="Lanche da tarde">
            Lanche da tarde
          </option>

          <option value="Jantar">
            Jantar
          </option>

          <option value="Ceia">
            Ceia
          </option>

        </select>


        <input
          type="number"
          id="dietQuantity"
          placeholder="Quantidade em gramas"
          required
        >


        <button
          type="submit"
          class="btn btn-primary"
        >
          Adicionar alimento
        </button>

      </form>


      <hr>


      ${
        alimentosDaDieta.length === 0

          ? `
            <p>
              Nenhum alimento nesta dieta.
            </p>
          `

          : `
            <ul class="plan-food-list">

              ${alimentosDaDieta.map(item => `
                <li>

                  <strong>
                    ${item.meal}
                  </strong>

                  —
                  ${item.food_name}
                  (${item.quantity}g)

                  <button
                    class="action-btn delete-btn"
                    onclick="removerAlimentoDieta(
                      ${item.id},
                      ${dietaId},
                      '${dietaNome}'
                    )"
                  >
                    Remover
                  </button>

                </li>
              `).join("")}

            </ul>
          `
      }


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
}


async function adicionarAlimentoDieta(
  event,
  dietaId,
  dietaNome
) {

  event.preventDefault();
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();


  const foodId = Number(
    fields.dietFoodId
  );

  const meal =
    fields.dietMeal;

  const quantity =
    Number(
      fields.dietQuantity
    );


  if (!foodId || !meal || !quantity) {
    showToast(
      "Preencha todos os campos.",
      "error"
    );
    return;
  }


  formController.setLoading(true);
  try {

    const result = await dietService.addFood(dietaId,
      {
        food_id: foodId,
        meal: meal,
        quantity: quantity
      }
    );


    if (result.status !== "success") {
      showToast(
        result.message ||
        "Erro ao adicionar alimento.",
        "error"
      );
      return;
    }


    showToast(
      "Alimento adicionado à dieta!",
      "success"
    );

    closeModal();


    setTimeout(() => {
      abrirModalAlimentosDieta(
        dietaId,
        dietaNome
      );
    }, 300);


  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
      "Erro ao conectar com a API.",
      "error"
    );
  } finally {
    formController.setLoading(false);
  }
}


async function removerAlimentoDieta(
  id,
  dietaId,
  dietaNome
) {

  try {

    const result = await dietService.removeFood(id
    );


    if (result.status !== "success") {
      showToast(
        result.message ||
        "Erro ao remover alimento.",
        "error"
      );
      return;
    }


    showToast(
      "Alimento removido da dieta.",
      "success"
    );

    closeModal();


    setTimeout(() => {
      abrirModalAlimentosDieta(
        dietaId,
        dietaNome
      );
    }, 300);


  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
      "Erro ao conectar com a API.",
      "error"
    );
  }
}


document.addEventListener(
  "DOMContentLoaded",
  () => {

    carregarUsuariosNoSelect();

    listarPlanos();

    const planoForm =
      document.getElementById("planoForm");


    if (planoForm) {
      planoForm.addEventListener(
        "submit",
        criarPlano
      );
    }

  }
);