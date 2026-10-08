async function carregarDadosAdmin() {
  const totalUsuarios = document.getElementById("totalUsuarios");
  const totalPlanos = document.getElementById("totalPlanos");
  const totalAlimentos = document.getElementById("totalAlimentos");

  try {
    const [usuariosResult, planosResult, alimentosResult] =
      await Promise.all([
        api.get("/usuarios"),
        api.get("/dietas"),
        api.get("/alimentos")
      ]);

      console.log("USUÁRIOS:", usuariosResult);
      console.log("PLANOS:", planosResult);
      console.log("ALIMENTOS:", alimentosResult);

    const usuarios =
      usuariosResult.status === "success"
        ? usuariosResult.data || []
        : [];

    const planos =
      planosResult.status === "success"
        ? planosResult.data || []
        : [];

    const alimentos =
      alimentosResult.status === "success"
        ? alimentosResult.data || []
        : [];

    if (totalUsuarios) {
      totalUsuarios.classList.remove("skeleton", "skeleton-line");
      totalUsuarios.textContent = usuarios.length;
    }

    if (totalPlanos) {
      totalPlanos.classList.remove("skeleton", "skeleton-line");
      totalPlanos.textContent = planos.length;
    }

    if (totalAlimentos) {
      totalAlimentos.classList.remove("skeleton", "skeleton-line");
      totalAlimentos.textContent = alimentos.length;
    }

    criarGraficoAdmin(
      usuarios.length,
      planos.length,
      alimentos.length
    );

  } catch (error) {
    console.error("Erro ao carregar dados administrativos:", error);

    if (totalUsuarios) {
      totalUsuarios.classList.remove("skeleton", "skeleton-line");
      totalUsuarios.textContent = "—";
    }

    if (totalPlanos) {
      totalPlanos.classList.remove("skeleton", "skeleton-line");
      totalPlanos.textContent = "—";
    }

    if (totalAlimentos) {
      totalAlimentos.classList.remove("skeleton", "skeleton-line");
      totalAlimentos.textContent = "—";
    }
  }
}


function criarGraficoAdmin(
  totalUsuarios,
  totalPlanos,
  totalAlimentos
) {
  const canvas = document.getElementById("adminChart");

  if (!canvas) return;

  new Chart(canvas, {
    type: "bar",

    data: {
      labels: [
        "Usuários",
        "Planos",
        "Alimentos"
      ],

      datasets: [{
        label: "Total",

        data: [
          totalUsuarios,
          totalPlanos,
          totalAlimentos
        ],

        backgroundColor: [
          "#22C55E",
          "#15803D",
          "#86EFAC"
        ],

        borderRadius: 8
      }]
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          display: false
        }
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

document.addEventListener(
  "DOMContentLoaded",
  carregarDadosAdmin
);