// Entidade baseada nos campos da API PHP/MySQL.
class User {
  #id;
  #name;
  #email;
  #photo;
  #type;
  #typeId;
  constructor(data = {}, { fromAPI = false } = {}) {
    this.id = data.id ?? null;
    this.name = data.name ?? "";
    // A Etapa 05 aceita emails legados fora do formato. Ler não deve impedir a listagem.
    if (fromAPI) this.#email = EntityValidation.text(data.email, "email");
    else this.email = data.email ?? "";
    this.photo = data.photo ?? null;
    this.type = data.type ?? "";
    this.typeId = data.typeId ?? (data.type === "ADMIN" ? 1 : data.type === "STANDARD" ? 2 : null);
  }
  get id() { return this.#id; }
  set id(value) {
    const normalized = EntityValidation.id(value);
    this.#id = normalized;
  }
  get name() { return this.#name; }
  set name(value) {
    const normalized = EntityValidation.text(value, "name", true);
    this.#name = normalized;
  }
  get email() { return this.#email; }
  set email(value) {
    const normalized = EntityValidation.text(value, "email", true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("E-mail inválido.");
    this.#email = normalized;
  }
  get photo() { return this.#photo; }
  set photo(value) {
    const normalized = value == null ? null : String(value);
    this.#photo = normalized;
  }
  get type() { return this.#type; }
  set type(value) {
    const normalized = EntityValidation.text(value, "type", false);
    this.#type = normalized;
  }
  get typeId() { return this.#typeId; }
  set typeId(value) {
    const normalized = EntityValidation.id(value);
    if (normalized !== null && ![1, 2].includes(normalized)) throw new Error("Tipo de usuário inválido.");
    this.#typeId = normalized;
  }
  isAdmin() { return this.typeId === 1 || this.type === "ADMIN"; }
  toJSON() {
    return { id: this.id, name: this.name, email: this.email, photo: this.photo, type: this.type, typeId: this.typeId };
  }
  static fromJSON(data) { return new User(data, { fromAPI: true }); }
}
