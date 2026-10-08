function getUserSessionPerfil() {
  return storage.getUser();
}

async function carregarPerfil() {
  const user = getUserSessionPerfil();

  if (!user) {
    return;
  }

  const loading = document.getElementById("perfilLoading");
  const errorBox = document.getElementById("perfilError");
  const form = document.getElementById("perfilForm");

  // Preenche os dados básicos imediatamente
  const nome = document.getElementById("perfilNome");
  const email = document.getElementById("perfilEmail");

  if (nome) {
    nome.value = user.name || user.nome || "";
  }

  if (email) {
    email.value = user.email || "";
  }

  // Estado de carregamento
  if (loading) {
    loading.style.display = "block";
  }

  if (errorBox) {
    errorBox.style.display = "none";
  }

  try {
    const result = await api.get(`/usuarios/${user.id}/perfil`);

    if (result.status !== "success") {
      throw new Error(
        result.message || "Não foi possível carregar o perfil."
      );
    }

    const perfil = result.data;

    const nascimento = document.getElementById("perfilNascimento");
    const genero = document.getElementById("perfilGenero");
    const peso = document.getElementById("perfilPeso");
    const altura = document.getElementById("perfilAltura");
    const atividade = document.getElementById("perfilAtividade");
    const objetivo = document.getElementById("perfilObjetivo");

    if (nascimento) {
      nascimento.value = perfil.birth_date || "";
    }

    if (genero) {
      genero.value = perfil.gender || "";
    }

    if (peso) {
      peso.value = perfil.weight || "";
    }

    if (altura) {
      altura.value = perfil.height || "";
    }

    if (atividade) {
      atividade.value = perfil.activity_level || "";
    }

    if (objetivo) {
      objetivo.value = perfil.goal || "";
    }

    // Perfil carregado com sucesso
    if (form) {
      form.style.display = "block";
    }

  } catch (error) {
    console.error(error);

    // Mesmo com erro, permite visualizar/preencher o formulário
    if (form) {
      form.style.display = "block";
    }

    if (errorBox) {
      errorBox.textContent =
        error.message || "Não foi possível carregar o perfil.";
      errorBox.style.display = "block";
    }

  } finally {
    if (loading) {
      loading.style.display = "none";
    }
  }
}


async function salvarPerfil(event) {
  event.preventDefault();

  const user = getUserSessionPerfil();

  if (!user) {
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');

  const dados = {
    birth_date:
      document.getElementById("perfilNascimento")?.value || "",

    gender:
      document.getElementById("perfilGenero")?.value || "",

    weight:
      Number(document.getElementById("perfilPeso")?.value) || 0,

    height:
      Number(document.getElementById("perfilAltura")?.value) || 0,

    activity_level:
      document.getElementById("perfilAtividade")?.value || "",

    goal:
      document.getElementById("perfilObjetivo")?.value || ""
  };

  // Estado de carregamento
  if (btn) {
    btn.disabled = true;
    btn.dataset.textOriginal = btn.textContent;
    btn.textContent = "Salvando...";
  }

  try {
    const result = await api.post(
      `/usuarios/${user.id}/perfil`,
      dados
    );

    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao salvar perfil.",
        "error"
      );
      return;
    }

    // Estado de sucesso
    showToast(
      "Perfil atualizado com sucesso!",
      "success"
    );

  } catch (error) {
    console.error(error);

    // Estado de erro
    showToast(
      error.message || "Erro ao conectar com a API.",
      "error"
    );

  } finally {
    // Retorna o botão ao estado normal
    if (btn) {
      btn.disabled = false;
      btn.textContent =
        btn.dataset.textOriginal || "Salvar alterações";
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  carregarPerfil();

  const form = document.getElementById("perfilForm");

  if (form) {
    form.addEventListener("submit", salvarPerfil);
  }
});