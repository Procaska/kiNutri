// Entidade baseada nos campos da API PHP/MySQL.
class DietFood {
  #id;
  #diet_id;
  #food_id;
  #meal;
  #quantity;
  #food_name;
  #calories;
  #protein;
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.diet_id = data.diet_id ?? null;
    this.food_id = data.food_id ?? null;
    this.meal = data.meal ?? "";
    this.quantity = data.quantity ?? 0;
    this.food_name = data.food_name ?? "";
    this.calories = data.calories ?? 0;
    this.protein = data.protein ?? 0;
  }
  get id() { return this.#id; }
  set id(value) {
    const normalized = EntityValidation.id(value);
    this.#id = normalized;
  }
  get diet_id() { return this.#diet_id; }
  set diet_id(value) {
    const normalized = EntityValidation.id(value);
    this.#diet_id = normalized;
  }
  get food_id() { return this.#food_id; }
  set food_id(value) {
    const normalized = EntityValidation.id(value);
    this.#food_id = normalized;
  }
  get meal() { return this.#meal; }
  set meal(value) {
    const normalized = EntityValidation.text(value, "meal", true);
    this.#meal = normalized;
  }
  get quantity() { return this.#quantity; }
  set quantity(value) {
    const normalized = EntityValidation.number(value, "quantity");
    if (normalized <= 0) throw new Error("Quantidade deve ser maior que zero.");
    this.#quantity = normalized;
  }
  get food_name() { return this.#food_name; }
  set food_name(value) {
    const normalized = EntityValidation.text(value, "food_name", false);
    this.#food_name = normalized;
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
  portionCalories() { return this.calories * this.quantity / 100; }
  toJSON() {
    return { id: this.id, diet_id: this.diet_id, food_id: this.food_id, meal: this.meal, quantity: this.quantity, food_name: this.food_name, calories: this.calories, protein: this.protein };
  }
  static fromJSON(data) { return new DietFood(data); }
}
