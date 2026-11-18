// Cada objeto mantém seu elemento/timer; os métodos são compartilhados.
const ToastPrototype = {
  init(id = "toast", duration = 3000) {
    this.id = id;
    this.duration = duration;
    this.timer = null;
    return this;
  },
  show(response, type) {
    const status = type ?? response?.status ?? "success";
    type = ["success", "warning", "error"].includes(status) ? status : "warning";
    const defaults = { success: "Operação realizada com sucesso!", warning: "Verifique os dados informados.", error: "Não foi possível concluir a operação." };
    const message = typeof response === "string" && response.trim() ? response :
      typeof response?.message === "string" && response.message.trim() ? response.message : defaults[type];
    let element = document.getElementById(this.id);
    if (!element) {
      element = document.createElement("div");
      element.id = this.id;
      document.body.appendChild(element);
    }
    element.setAttribute("role", type === "error" ? "alert" : "status");
    element.setAttribute("aria-live", "polite");
    element.textContent = message;
    element.className = `toast show ${type}`;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), this.duration);
    return message;
  },
  hide() {
    clearTimeout(this.timer);
    const element = document.getElementById(this.id);
    if (element) element.className = "toast";
  }
};
const appToast = Object.create(ToastPrototype).init();
function showToast(response, type) { return appToast.show(response, type); }
