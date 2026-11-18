document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("foodGallery");
  const form = dialog.querySelector("form");
  const list = document.getElementById("foodGalleryItems");
  const status = document.getElementById("foodGalleryStatus");
  const close = document.getElementById("foodGalleryClose");
  const input = form.elements.image;
  const retry = document.getElementById("foodGalleryRetry");
  let foodId;
  let busy = false;
  const clearPreview = attachImagePreview(input, document.getElementById("foodImagePreview"), error => {
    setImageStatus(status, error, error ? "error" : "");
  });

  function setBusy(value) {
    busy = value;
    dialog.querySelectorAll("input, button").forEach(element => { element.disabled = value; });
  }

  function render(images) {
    list.replaceChildren();
    if (!images.length) {
      const empty = document.createElement("p");
      empty.textContent = "Este alimento ainda não tem imagens.";
      list.append(empty);
      return;
    }
    for (const item of images) {
      const card = document.createElement("figure");
      const image = document.createElement("img");
      image.alt = item.alt_text || "Imagem do alimento";
      showStoredImage(image, item.image_path);
      const caption = document.createElement("figcaption");
      caption.textContent = item.alt_text || "Imagem do alimento";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "action-btn delete-btn";
      remove.textContent = "Remover imagem";
      remove.addEventListener("click", async () => {
        if (busy || !window.confirm("Remover esta imagem da galeria?")) return;
        await change("Removendo imagem…", () => imageService.removeImage(foodId, item.id));
      });
      card.append(image, caption, remove);
      list.append(card);
    }
  }

  async function refresh(message = "") {
    retry.hidden = true;
    try {
      const { data } = await imageService.gallery(foodId);
      render(data);
      setImageStatus(status, message, message ? "success" : "");
    } catch (error) {
      list.replaceChildren();
      retry.hidden = false;
      setImageStatus(status, (message ? message + " " : "") + "Falha ao carregar galeria: " + error.message, "error");
    }
  }

  async function change(label, operation, after) {
    if (busy) return;
    setBusy(true);
    setImageStatus(status, label);
    try {
      const result = await operation();
      if (after) after();
      await refresh(result.message);
    } catch (error) {
      setImageStatus(status, error.message, "error");
    } finally { setBusy(false); }
  }

  async function load() {
    setBusy(true);
    setImageStatus(status, "Carregando galeria…");
    try { await refresh(); }
    finally { setBusy(false); }
  }

  retry.addEventListener("click", load);
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); });
  dialog.addEventListener("close", () => { clearPreview(); form.reset(); });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const file = input.files[0];
    const alt = form.elements.alt_text.value.trim();
    if (file) change("Enviando imagem…", () => imageService.addImage(foodId, file, alt), () => {
      form.reset();
      clearPreview();
    });
  });

  document.getElementById("alimentosTable").addEventListener("click", event => {
    const button = event.target.closest("button[data-gallery-id]");
    if (!button || dialog.open) return;
    foodId = Number(button.dataset.galleryId);
    const name = button.closest("tr").cells[0].textContent.trim();
    document.getElementById("foodGalleryTitle").textContent = "Imagens de " + name;
    list.replaceChildren();
    dialog.showModal();
    load();
  });
});
