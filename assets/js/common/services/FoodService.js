class FoodService extends HttpClientBase {
  async list() { return this.#entities(await this.get("/alimentos"), true); }
  create(value) {
    const entity = value instanceof Food ? value : Food.fromJSON(value);
    const body = entity.toJSON();
    return this.post("/alimentos", body);
  }
  update(id, value) {
    const entity = value instanceof Food ? value : Food.fromJSON(value);
    return this.put(`/alimentos/${EntityValidation.id(id)}`, entity.toJSON());
  }
  remove(id) { return this.delete(`/alimentos/${EntityValidation.id(id)}`); }
  #entities(result, list = false) {
    if (result.status !== "success") return result;
    return { ...result, data: list ? (result.data ?? []).map(item => Food.fromJSON(item)) : result.data ? Food.fromJSON(result.data) : null };
  }
  async find(id) { return this.#entities(await this.get(`/alimentos/${EntityValidation.id(id)}`)); }
}
