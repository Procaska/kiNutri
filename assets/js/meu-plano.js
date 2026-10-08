async function buscarAlimentosDaDieta(dietaId) {
  try {
    const result = await api.get(`/dietas/${dietaId}/alimentos`);

    if (result.status !== "success") {
      return [];
    }

    return result.data || [];

  } catch (error) {
    console.error("Erro ao buscar alimentos da dieta:", error);
    return [];
  }
}


function agruparPorRefeicao(alimentos) {
  const ordem = [
    "Café da manhã",
    "Lanche da manhã",
    "Almoço",
    "Lanche da tarde",
    "Jantar",
    "Ceia"
  ];

  const grupos = {};

  alimentos.forEach(item => {
    if (!grupos[item.meal]) {
      grupos[item.meal] = [];
    }

    grupos[item.meal].push(item);
  });

  return ordem
    .filter(refeicao => grupos[refeicao])
    .map(refeicao => ({
      refeicao,
      alimentos: grupos[refeicao]
    }));
}


function renderizarRefeicoes(alimentos) {

  if (!alimentos || alimentos.length === 0) {
    return `
      <div class="empty-row">
        Nenhum alimento cadastrado nesta dieta ainda.
      </div>
    `;
  }

  const grupos = agruparPorRefeicao(alimentos);

  return grupos.map(grupo => `
    <div class="meal-card">

      <div class="meal-header">
        <h4>${grupo.refeicao}</h4>

        <span>
          ${grupo.alimentos.length} alimento(s)
        </span>
      </div>

      <div class="meal-foods">

        ${grupo.alimentos.map(item => `
          <div class="meal-food-item">

            <div>
              <strong>${item.food_name}</strong>

              <small>
                ${item.calories} kcal |
                ${item.protein}g proteína
              </small>
            </div>

            <span class="food-quantity">
              ${item.quantity}g
            </span>

          </div>
        `).join("")}

      </div>

    </div>
  `).join("");
}


async function carregarMeuPlano() {

  const container = document.getElementById("listaPlano");
  const user = storage.getUser();

  if (!container || !user) {
    return;
  }

  container.innerHTML = `
    <div class="loading-state">
      Carregando seu plano alimentar...
    </div>
  `;

  try {

    const result = await api.get(
      `/usuarios/${user.id}/dietas`
    );

    if (
      result.status !== "success" ||
      !result.data ||
      result.data.length === 0
    ) {

      container.innerHTML = `
        <div class="empty-row">
          Nenhuma dieta foi atribuída a você ainda.
        </div>
      `;

      return;
    }

    const dietas = result.data;

    let html = "";

    for (const dieta of dietas) {

      const alimentos =
        await buscarAlimentosDaDieta(dieta.id);

      html += `
        <article class="diet-card">

          <div class="diet-header">

            <div>

              <span class="diet-label">
                Plano alimentar
              </span>

              <h3>
                ${dieta.name}
              </h3>

              <p>
                ${dieta.goal}
              </p>

            </div>

          </div>


          <div class="macro-grid">

            <div class="macro-card">

              <span>
                Calorias
              </span>

              <strong>
                ${dieta.calories}
              </strong>

              <small>
                kcal
              </small>

            </div>


            <div class="macro-card">

              <span>
                Proteínas
              </span>

              <strong>
                ${dieta.protein}
              </strong>

              <small>
                g
              </small>

            </div>


            <div class="macro-card">

              <span>
                Carboidratos
              </span>

              <strong>
                ${dieta.carbs}
              </strong>

              <small>
                g
              </small>

            </div>


            <div class="macro-card">

              <span>
                Gorduras
              </span>

              <strong>
                ${dieta.fat}
              </strong>

              <small>
                g
              </small>

            </div>

          </div>


          <div class="diet-meals">

            <h4>
              Refeições do dia
            </h4>

            ${renderizarRefeicoes(alimentos)}

          </div>

        </article>
      `;
    }

    container.innerHTML = html;

  } catch (error) {

    console.error(
      "Erro ao carregar meu plano:",
      error
    );

    container.innerHTML = `
      <div class="empty-row">
        Não foi possível carregar seu plano alimentar.
      </div>
    `;
  }
}


document.addEventListener(
  "DOMContentLoaded",
  carregarMeuPlano
);