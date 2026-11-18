// Instâncias criadas com Object.create, sem classe equivalente.
const FormControllerPrototype = {
  init(form) {
    if (!form) throw new Error("Formulário não encontrado.");
    this.form = form;
    return this;
  },
  values() {
    const values = {};
    for (const field of this.form.querySelectorAll("input, select, textarea")) {
      if (field.disabled || ["submit", "button"].includes(field.type)) continue;
      if (["checkbox", "radio"].includes(field.type) && !field.checked) continue;
      const key = field.name || field.id;
      if (key) values[key] = field.value.trim();
    }
    return values;
  },
  validate() { return this.form.reportValidity(); },
  reset() { this.form.reset(); },
  setLoading(loading, label = "Salvando...") {
    for (const button of this.form.querySelectorAll('button[type="submit"], input[type="submit"]')) {
      if (loading) {
        button.dataset.originalLabel = button.textContent;
        button.disabled = true;
        button.textContent = label;
      } else {
        button.disabled = false;
        button.textContent = button.dataset.originalLabel || button.textContent;
      }
    }
  }
};
