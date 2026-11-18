// Entidade baseada nos campos da API PHP/MySQL.
class UserProfile {
  #id;
  #user_id;
  #birth_date;
  #gender;
  #weight;
  #height;
  #activity_level;
  #goal;
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.user_id = data.user_id ?? null;
    this.birth_date = data.birth_date ?? "";
    this.gender = data.gender ?? "";
    this.weight = data.weight ?? 0;
    this.height = data.height ?? 0;
    this.activity_level = data.activity_level ?? "";
    this.goal = data.goal ?? "";
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
  get birth_date() { return this.#birth_date; }
  set birth_date(value) {
    const normalized = EntityValidation.text(value, "birth_date", false);
    this.#birth_date = normalized;
  }
  get gender() { return this.#gender; }
  set gender(value) {
    const normalized = EntityValidation.text(value, "gender", false);
    this.#gender = normalized;
  }
  get weight() { return this.#weight; }
  set weight(value) {
    const normalized = EntityValidation.number(value, "weight");
    this.#weight = normalized;
  }
  get height() { return this.#height; }
  set height(value) {
    const normalized = EntityValidation.number(value, "height");
    this.#height = normalized;
  }
  get activity_level() { return this.#activity_level; }
  set activity_level(value) {
    const normalized = EntityValidation.text(value, "activity_level", false);
    this.#activity_level = normalized;
  }
  get goal() { return this.#goal; }
  set goal(value) {
    const normalized = EntityValidation.text(value, "goal", false);
    this.#goal = normalized;
  }
  bmi() { return this.height > 0 ? this.weight / (this.height / 100) ** 2 : null; }
  toJSON() {
    return { id: this.id, user_id: this.user_id, birth_date: this.birth_date, gender: this.gender, weight: this.weight, height: this.height, activity_level: this.activity_level, goal: this.goal };
  }
  static fromJSON(data) { return new UserProfile(data); }
}
