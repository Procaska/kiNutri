// Transporte genérico: não conhece entidades, endpoints de negócio ou HTML.
class HttpClientBase {
  #baseURL;
  #tokenProvider;
  constructor(baseURL = "http://localhost/kiNutri/api", tokenProvider = () => storage.getToken()) {
    this.#baseURL = baseURL.replace(/\/$/, "");
    this.#tokenProvider = tokenProvider;
  }
  get baseURL() { return this.#baseURL; }
  async request(endpoint, options = {}) {
    const multipart = typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers = { ...(multipart ? {} : { "Content-Type": "application/json" }), ...options.headers };
    const token = this.#tokenProvider();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${this.#baseURL}${endpoint}`, { ...options, headers });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(data?.message || `Erro na requisição (${response.status})`);
      error.status = response.status;
      throw error;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Resposta inválida da API.");
    return data;
  }
  get(endpoint) { return this.request(endpoint, { method: "GET" }); }
  post(endpoint, body = {}) { return this.request(endpoint, { method: "POST", body: JSON.stringify(body) }); }
  postForm(endpoint, form) { return this.request(endpoint, { method: "POST", body: form }); }
  put(endpoint, body = {}) { return this.request(endpoint, { method: "PUT", body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: "DELETE" }); }
}
