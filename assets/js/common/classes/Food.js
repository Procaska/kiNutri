// Entidade baseada nos campos da API PHP/MySQL.
class Food {
  #id;
  #category_id;
  #name;
  #category;
  #calories;
  #protein;
  #carbs;
  #fat;
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.category_id = data.category_id ?? null;
    this.name = data.name ?? "";
    this.category = data.category ?? ({ 1: "Proteínas", 2: "Carboidratos", 3: "Frutas", 4: "Verduras e Legumes", 5: "Gorduras Boas" }[data.category_id] || "");
    this.calories = data.calories ?? 0;
    this.protein = data.protein ?? 0;
    this.carbs = data.carbs ?? 0;
    this.fat = data.fat ?? 0;
  }
  get id() { return this.#id; }
  set id(value) {
    const normalized = EntityValidation.id(value);
    this.#id = normalized;
  }
  get category_id() { return this.#category_id; }
  set category_id(value) {
    const normalized = EntityValidation.id(value);
    this.#category_id = normalized;
  }
  get name() { return this.#name; }
  set name(value) {
    const normalized = EntityValidation.text(value, "name", true);
    this.#name = normalized;
  }
  get category() { return this.#category; }
  set category(value) {
    const normalized = EntityValidation.text(value, "category", false);
    this.#category = normalized;
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
  caloriesFor(grams) { return this.calories * EntityValidation.number(grams, "Quantidade") / 100; }
  toJSON() {
    return { id: this.id, category_id: this.category_id, name: this.name, category: this.category, calories: this.calories, protein: this.protein, carbs: this.carbs, fat: this.fat };
  }
  static fromJSON(data) { return new Food(data); }
}
