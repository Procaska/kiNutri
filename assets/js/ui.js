function showToast(message, type = "success") {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

function openModal(title, contentHTML) {
  let modal = document.getElementById("modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal";
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2 id="modalTitle"></h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>

        <div id="modalContent"></div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalContent").innerHTML = contentHTML;

  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.remove("show");
  }
}

function confirmAction(message, callback) {
  openModal("Confirmar ação", `
    <p class="modal-text">${message}</p>

    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="confirmBtn">Confirmar</button>
    </div>
  `);

  document.getElementById("confirmBtn").onclick = () => {
    callback();
    closeModal();
  };
}