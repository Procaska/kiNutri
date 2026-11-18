const imageService = new ImageService();

function setImageStatus(element, message, state = "") {
  element.textContent = message;
  element.dataset.state = state;
}

function showStoredImage(element, path) {
  const url = imageService.url(path);
  element.hidden = !url;
  if (url) element.src = url;
  else element.removeAttribute("src");
  return Boolean(url);
}

function attachImagePreview(input, preview, onChange) {
  let objectURL = null;
  function clear() {
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = null;
    preview.hidden = true;
    preview.removeAttribute("src");
  }
  input.addEventListener("change", () => {
    clear();
    const file = input.files[0];
    if (!file) return onChange("");
    const knownType = file.type && file.type !== "application/octet-stream";
    const validType = knownType ? ["image/jpeg", "image/png", "image/webp"].includes(file.type) :
      /\.(jpe?g|png|webp)$/i.test(file.name);
    if (file.size === 0 || file.size > 5 * 1024 * 1024 || !validType) {
      input.value = "";
      return onChange("Escolha uma imagem JPEG, PNG ou WebP de até 5 MiB.");
    }
    objectURL = URL.createObjectURL(file);
    preview.src = objectURL;
    preview.hidden = false;
    onChange("");
  });
  return clear;
}
