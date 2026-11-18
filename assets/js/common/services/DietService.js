class DietService extends HttpClientBase {
  async list() { return this.#entities(await this.get("/dietas"), true); }
  async find(id) { return this.#entities(await this.get(`/dietas/${EntityValidation.id(id)}`)); }
  create(value) {
    const entity = value instanceof Diet ? value : Diet.fromJSON(value);
    const body = entity.toJSON();
    return this.post("/dietas", body);
  }
  update(id, value) {
    const entity = value instanceof Diet ? value : Diet.fromJSON(value);
    return this.put(`/dietas/${EntityValidation.id(id)}`, entity.toJSON());
  }
  remove(id) { return this.delete(`/dietas/${EntityValidation.id(id)}`); }
  #entities(result, list = false) {
    if (result.status !== "success") return result;
    return { ...result, data: list ? (result.data ?? []).map(item => Diet.fromJSON(item)) : result.data ? Diet.fromJSON(result.data) : null };
  }
  async listByUser(id) { return this.#entities(await this.get(`/usuarios/${EntityValidation.id(id)}/dietas`), true); }
  async listFoods(id) {
    const result = await this.get(`/dietas/${EntityValidation.id(id)}/alimentos`);
    return result.status === "success" ? { ...result, data: (result.data ?? []).map(item => DietFood.fromJSON(item)) } : result;
  }
  addFood(id, value) {
    const item = value instanceof DietFood ? value : DietFood.fromJSON({ ...value, diet_id: id });
    return this.post(`/dietas/${EntityValidation.id(id)}/alimentos`, { food_id: item.food_id, meal: item.meal, quantity: item.quantity });
  }
  removeFood(id) { return this.delete(`/dietas/alimentos/${EntityValidation.id(id)}`); }
}
