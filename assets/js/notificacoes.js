const NOTIFICACOES_KEY = "kinutri_notificacoes";

function getNotificacoes() {
  return JSON.parse(localStorage.getItem(NOTIFICACOES_KEY)) || [];
}

function saveNotificacoes(notificacoes) {
  localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(notificacoes));
}

function criarNotificacao(titulo, mensagem, tipo = "info") {
  const notificacoes = getNotificacoes();

  notificacoes.unshift({
    id: Date.now(),
    titulo,
    mensagem,
    tipo,
    lida: false,
    data: new Date().toLocaleString("pt-BR")
  });

  saveNotificacoes(notificacoes);
}

function listarNotificacoes() {
  const lista = document.getElementById("listaNotificacoes");
  const contador = document.getElementById("contadorNotificacoes");

  if (!lista) return;

  const notificacoes = getNotificacoes();

  const naoLidas = notificacoes.filter(item => !item.lida).length;

  if (contador) {
    contador.textContent = naoLidas;
    contador.style.display = naoLidas > 0 ? "inline-flex" : "none";
  }

  if (notificacoes.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <strong>Nenhuma notificação</strong>
        <p>As atividades recentes aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  lista.innerHTML = notificacoes.slice(0, 5).map(item => `
    <div class="notification-item ${item.lida ? "" : "unread"}">
      <strong>${item.titulo}</strong>
      <p>${item.mensagem}</p>
      <small>${item.data}</small>
    </div>
  `).join("");
}

function marcarNotificacoesComoLidas() {
  const notificacoes = getNotificacoes().map(item => ({
    ...item,
    lida: true
  }));

  saveNotificacoes(notificacoes);
  listarNotificacoes();

  if (typeof showToast === "function") {
    showToast("Notificações marcadas como lidas!");
  }
}

document.addEventListener("DOMContentLoaded", listarNotificacoes);