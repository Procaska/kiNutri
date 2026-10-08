const USERS_KEY = "kinutri_users";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(user) {
  const token = storage.getToken();

  if (token) {
    storage.saveSession(token, user);
  }
}

function getSession() {
  return storage.getUser();
}

function clearSession() {
  storage.clearSession();
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

function setLoading(
  button,
  isLoading,
  textDefault,
  textLoading = "Carregando..."
) {
  if (!button) return;

  if (isLoading) {
    button.classList.add("loading");
    button.textContent = textLoading;
  } else {
    button.classList.remove("loading");
    button.textContent = textDefault;
  }
}

function redirectByUserType(user) {
  if (user.typeId == 1) {
    window.location.href = "admin/admin.html";
  } else {
    window.location.href = "usuario/dashboard.html";
  }
}

function redirectByUserTypeFromSubfolder(user) {
  if (user.typeId == 1) {
    window.location.href = "../admin/admin.html";
  } else {
    window.location.href = "../usuario/dashboard.html";
  }
}

async function cadastroUsuario(event) {
  event.preventDefault();

  const btn = document.getElementById("cadastroBtn");

  const nome = document.getElementById("nome").value.trim();
  const email = document
    .getElementById("email")
    .value
    .trim()
    .toLowerCase();

  const senha = document.getElementById("senha").value.trim();
  const tipo = document.getElementById("tipo").value;

  if (!nome || !email || !senha || !tipo) {
    showToast(
      "Preencha todos os campos obrigatórios.",
      "error"
    );
    return;
  }

  if (senha.length < 6) {
    showToast(
      "A senha precisa ter pelo menos 6 caracteres.",
      "error"
    );
    return;
  }

  setLoading(
    btn,
    true,
    "Criar conta",
    "Criando conta..."
  );

  try {
    const result = await api.post("/usuarios", {
      name: nome,
      email: email,
      password: senha,
      typeId: tipo === "admin" ? 1 : 2
    });

    if (result.status !== "success") {
      showToast(
        result.message || "Erro ao criar conta.",
        "error"
      );

      setLoading(btn, false, "Criar conta");
      return;
    }

    showToast(
      "Conta criada com sucesso!",
      "success"
    );

    setLoading(btn, false, "Criar conta");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);

  } catch (error) {
    console.error(error);

    showToast(
      error.message || "Erro ao conectar com a API.",
      "error"
    );

    setLoading(btn, false, "Criar conta");
  }
}

async function loginUsuario(event) {
  event.preventDefault();

  const btn = document.getElementById("loginBtn");

  const email = document
    .getElementById("loginEmail")
    .value
    .trim()
    .toLowerCase();

  const senha = document
    .getElementById("loginSenha")
    .value
    .trim();

  if (!email || !senha) {
    showToast(
      "Informe e-mail e senha.",
      "error"
    );
    return;
  }

  setLoading(
    btn,
    true,
    "Entrar",
    "Entrando..."
  );

  try {
    const result = await api.post("/login", {
      email: email,
      password: senha
    });

    if (result.status !== "success") {
      showToast(
        result.message || "E-mail ou senha inválidos.",
        "error"
      );

      setLoading(btn, false, "Entrar");
      return;
    }

    const user = result.data?.user;

    if (!user) {
      showToast(
        "O servidor não retornou os dados do usuário.",
        "error"
      );

      setLoading(btn, false, "Entrar");
      return;
    }

    const token = result.data?.token;

    if (!token) {
      showToast(
        "O servidor não retornou o token de autenticação.",
        "error"
      );

      setLoading(btn, false, "Entrar");
      return;
    }

    storage.saveSession(token, user);

    showToast(
      "Login realizado com sucesso!",
      "success"
    );

    setTimeout(() => {
      redirectByUserType(user);
    }, 800);

  } catch (error) {
    console.error(error);

    showToast(
      error.message || "Erro ao conectar com a API.",
      "error"
    );

    setLoading(btn, false, "Entrar");
  }
}

function logout() {
  clearSession();

  window.location.href = "../login.html";
}

function protegerRota(tipoPermitido) {
  const session = getSession();

  if (!session) {
    window.location.href = "../login.html";
    return;
  }

  if (
    tipoPermitido === "admin" &&
    session.typeId != 1
  ) {
    redirectByUserTypeFromSubfolder(session);
    return;
  }

  if (
    tipoPermitido === "usuario" &&
    session.typeId != 2
  ) {
    redirectByUserTypeFromSubfolder(session);
  }
}

function bloquearLogado() {
  const session = getSession();

  if (session) {
    redirectByUserType(session);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cadastroForm =
    document.getElementById("cadastroForm");

  const loginForm =
    document.getElementById("loginForm");

  if (cadastroForm) {
    bloquearLogado();

    cadastroForm.addEventListener(
      "submit",
      cadastroUsuario
    );
  }

  if (loginForm) {
    bloquearLogado();

    loginForm.addEventListener(
      "submit",
      loginUsuario
    );
  }
});