// Entidade baseada nos campos da API PHP/MySQL.
class Diet {
  #id;
  #user_id;
  #name;
  #goal;
  #calories;
  #protein;
  #carbs;
  #fat;
  #foods = [];
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.user_id = data.user_id ?? null;
    this.name = data.name ?? "";
    this.goal = data.goal ?? "";
    this.calories = data.calories ?? 0;
    this.protein = data.protein ?? 0;
    this.carbs = data.carbs ?? 0;
    this.fat = data.fat ?? 0;
    this.foods = data.foods ?? [];
  }
  get id() { return this.#id; }
  set id(value) {
    const normalized = EntityValidation.id(value);
    this.#id = normalized;
  }
  get user_id() { return this.#user_id; }
  set user_id(value) {
    const normalized = EntityValidation.id(value);
    this.#user_id = normalized;
  }
  get name() { return this.#name; }
  set name(value) {
    const normalized = EntityValidation.text(value, "name", true);
    this.#name = normalized;
  }
  get goal() { return this.#goal; }
  set goal(value) {
    const normalized = EntityValidation.text(value, "goal", false);
    this.#goal = normalized;
  }
  get calories() { return this.#calories; }
  set calories(value) {
    const normalized = EntityValidation.number(value, "calories");
    this.#calories = normalized;
  }
  get protein() { return this.#protein; }
  set protein(value) {
    const normalized = EntityValidation.number(value, "protein");
    this.#protein = normalized;
  }
  get carbs() { return this.#carbs; }
  set carbs(value) {
    const normalized = EntityValidation.number(value, "carbs");
    this.#carbs = normalized;
  }
  get fat() { return this.#fat; }
  set fat(value) {
    const normalized = EntityValidation.number(value, "fat");
    this.#fat = normalized;
  }
  get foods() { return [...this.#foods]; }
  set foods(items) {
    if (!Array.isArray(items)) throw new Error("Alimentos devem ser uma lista.");
    this.#foods = items.map(item => item instanceof DietFood ? item : DietFood.fromJSON(item));
  }
  macroCalories() { return this.protein * 4 + this.carbs * 4 + this.fat * 9; }
  toJSON() {
    return { id: this.id, user_id: this.user_id, name: this.name, goal: this.goal, calories: this.calories, protein: this.protein, carbs: this.carbs, fat: this.fat };
  }
  static fromJSON(data) { return new Diet(data); }
}
