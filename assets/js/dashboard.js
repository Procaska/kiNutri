async function carregarDashboard() {
  const user = storage.getUser();

  if (!user) return;

  const loading = document.getElementById("dashboardLoading");
  const errorBox = document.getElementById("dashboardError");
  const dashboardGrid = document.querySelector(".dashboard-grid");
  const contentCards = document.querySelectorAll(".content-card");

  const nomeUsuario = document.getElementById("nomeUsuario");

  if (nomeUsuario) {
    nomeUsuario.textContent = user.name || user.nome || "usuário";
  }

  // Estado de loading
  if (loading) {
    loading.style.display = "block";
  }

  if (errorBox) {
    errorBox.style.display = "none";
  }

  if (dashboardGrid) {
    dashboardGrid.style.display = "none";
  }

  try {
    const result = await api.get(`/usuarios/${user.id}/dietas`);

    if (result.status !== "success") {
      throw new Error(
        result.message || "Não foi possível carregar seu plano."
      );
    }

    const dietas = result.data || [];

    // Estado sem dados
    if (dietas.length === 0) {
      if (dashboardGrid) {
        dashboardGrid.innerHTML = `
          <div class="empty-row">
            Nenhum plano alimentar cadastrado.
          </div>
        `;
        dashboardGrid.style.display = "block";
      }

      return;
    }

    // Usa a primeira dieta encontrada
    const plano = dietas[0];

    const calorias = Number(plano.calories) || 0;
    const proteina = Number(plano.protein) || 0;
    const carbo = Number(plano.carbs) || 0;
    const gordura = Number(plano.fat) || 0;

    document.getElementById("calorias").textContent =
      `${calorias} kcal`;

    document.getElementById("proteina").textContent =
      `${proteina}g`;

    document.getElementById("carbo").textContent =
      `${carbo}g`;

    document.getElementById("gordura").textContent =
      `${gordura}g`;

    // Estado de sucesso
    if (dashboardGrid) {
      dashboardGrid.style.display = "grid";
    }

    criarGraficoUsuario(
      proteina,
      carbo,
      gordura
    );

  } catch (error) {
    console.error(error);

    // Estado de erro
    if (errorBox) {
      errorBox.textContent =
        error.message ||
        "Não foi possível carregar seu plano.";
      errorBox.style.display = "block";
    }

  } finally {
    if (loading) {
      loading.style.display = "none";
    }
  }
}


function criarGraficoUsuario(
  proteina,
  carbo,
  gordura
) {
  const canvas = document.getElementById("macroChart");

  if (!canvas) return;

  new Chart(canvas, {
    type: "doughnut",

    data: {
      labels: [
        "Proteína",
        "Carboidrato",
        "Gordura"
      ],

      datasets: [{
        data: [
          proteina,
          carbo,
          gordura
        ],

        backgroundColor: [
          "#22C55E",
          "#15803D",
          "#86EFAC"
        ],

        borderWidth: 0
      }]
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
});