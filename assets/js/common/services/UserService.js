class UserService extends HttpClientBase {
  async list() { return this.#entities(await this.get("/usuarios"), true); }
  async find(id) { return this.#entities(await this.get(`/usuarios/${EntityValidation.id(id)}`)); }
  create(value, password) {
    const entity = value instanceof User ? value : new User(value);
    const body = entity.toJSON();
    if (String(password ?? "").length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
    body.password = password;
    return this.post("/usuarios", body);
  }
  update(id, value) {
    const entity = value instanceof User ? value : new User(value);
    return this.put(`/usuarios/${EntityValidation.id(id)}`, entity.toJSON());
  }
  remove(id) { return this.delete(`/usuarios/${EntityValidation.id(id)}`); }
  #entities(result, list = false) {
    if (result.status !== "success") return result;
    return { ...result, data: list ? (result.data ?? []).map(item => User.fromJSON(item)) : result.data ? User.fromJSON(result.data) : null };
  }
  async login(credentials) {
    const result = await this.post("/login", credentials);
    if (result.status === "success" && result.data?.user) return { ...result, data: { ...result.data, user: User.fromJSON(result.data.user) } };
    return result;
  }
  async getProfile(id) {
    const result = await this.get(`/usuarios/${EntityValidation.id(id)}/perfil`);
    return result.status === "success" ? { ...result, data: result.data ? UserProfile.fromJSON(result.data) : null } : result;
  }
  saveProfile(id, value) {
    const profile = value instanceof UserProfile ? value : UserProfile.fromJSON({ ...value, user_id: id });
    return this.post(`/usuarios/${EntityValidation.id(id)}/perfil`, profile.toJSON());
  }
}
