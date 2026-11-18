document.addEventListener("DOMContentLoaded", async () => {
  if (!storage.getUser()) return;
  const form = document.getElementById("profilePhotoForm");
  const input = form.elements.photo;
  const submit = form.querySelector("button");
  const current = document.getElementById("currentProfilePhoto");
  const status = document.getElementById("profilePhotoStatus");
  const clearPreview = attachImagePreview(input, document.getElementById("profilePhotoPreview"), error => {
    setImageStatus(status, error, error ? "error" : "");
  });

  input.disabled = submit.disabled = true;
  setImageStatus(status, "Carregando foto…");
  try {
    const { data } = await imageService.photo();
    const hasPhoto = showStoredImage(current, data.image_path);
    setImageStatus(status, hasPhoto ? "" : "Você ainda não tem foto de perfil.");
  } catch (error) {
    setImageStatus(status, error.message, "error");
  } finally { input.disabled = submit.disabled = false; }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const file = input.files[0];
    if (!file) return;
    input.disabled = submit.disabled = true;
    setImageStatus(status, "Enviando foto…");
    try {
      const result = await imageService.uploadPhoto(file);
      showStoredImage(current, result.data.image_path);
      form.reset();
      clearPreview();
      setImageStatus(status, result.message, "success");
    } catch (error) {
      setImageStatus(status, error.message, "error");
    } finally { input.disabled = submit.disabled = false; }
  });
});
