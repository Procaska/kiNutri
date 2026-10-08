async function carregarHistorico() {
  const container = document.getElementById("listaHistorico");
  const user = storage.getUser();

  if (!container || !user) {
    return;
  }

  container.innerHTML = `
    <div class="loading-state">
      Carregando histórico...
    </div>
  `;

  try {
    const result = await api.get(`/usuarios/${user.id}/dietas`);

    if (
      result.status !== "success" ||
      !result.data ||
      result.data.length === 0
    ) {
      container.innerHTML = `
        <div class="empty-row">
          Nenhum plano alimentar encontrado no histórico.
        </div>
      `;

      return;
    }

    const dietas = result.data;

    container.innerHTML = dietas.map(dieta => `
      <article class="history-card">

        <div class="history-header">
          <div>
            <span class="history-label">
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

        <div class="history-macros">

          <div>
            <span>Calorias</span>
            <strong>${dieta.calories} kcal</strong>
          </div>

          <div>
            <span>Proteínas</span>
            <strong>${dieta.protein} g</strong>
          </div>

          <div>
            <span>Carboidratos</span>
            <strong>${dieta.carbs} g</strong>
          </div>

          <div>
            <span>Gorduras</span>
            <strong>${dieta.fat} g</strong>
          </div>

        </div>

      </article>
    `).join("");

  } catch (error) {

    console.error(
      "Erro ao carregar histórico:",
      error
    );

    container.innerHTML = `
      <div class="empty-row">
        Não foi possível carregar seu histórico.
      </div>
    `;
  }
}


document.addEventListener(
  "DOMContentLoaded",
  carregarHistorico
);