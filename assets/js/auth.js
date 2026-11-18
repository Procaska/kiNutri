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


function setLoading(
  button,
  isLoading,
  textDefault,
  textLoading = "Carregando..."
) {
  if (!button) return;

  if (isLoading) {
    button.classList.add("loading");
    button.disabled = true;
    button.textContent = textLoading;
  } else {
    button.classList.remove("loading");
    button.disabled = false;
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
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();

  const btn = document.getElementById("cadastroBtn");

  const nome = fields.nome;
  const email = fields.email
    .toLowerCase();

  const senha = fields.senha;
  const tipo = fields.tipo;

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
    const result = await userService.create({
      name: nome,
      email: email,
      typeId: tipo === "admin" ? 1 : 2
    }, senha);

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
  const formController = Object.create(FormControllerPrototype).init(event.target);
  if (!formController.validate()) return;
  const fields = formController.values();

  const btn = document.getElementById("loginBtn");

  const email = fields.loginEmail
    .toLowerCase();

  const senha = fields.loginSenha;

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
    const result = await userService.login({
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