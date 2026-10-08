    class SessionStorage {
  #tokenKey = "kinutri_token";
  #userKey = "kinutri_user";

  saveSession(token, user = null) {
    localStorage.setItem(this.#tokenKey, token);

    if (user) {
      localStorage.setItem(
        this.#userKey,
        JSON.stringify(user)
      );
    }
  }

  getToken() {
    return localStorage.getItem(this.#tokenKey);
  }

  getUser() {
    const user = localStorage.getItem(this.#userKey);

    return user ? JSON.parse(user) : null;
  }

  clearSession() {
    localStorage.removeItem(this.#tokenKey);
    localStorage.removeItem(this.#userKey);
  }
}

const storage = new SessionStorage();