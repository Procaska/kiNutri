// Validações compartilhadas; não depende de DOM nem HTTP.
const EntityValidation = Object.freeze({
  id(value) {
    if (value == null || value === "") return null;
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error("Identificador inválido.");
    return number;
  },
  text(value, field, required = false) {
    const text = String(value ?? "").trim();
    if (required && !text) throw new Error(`${field} é obrigatório.`);
    return text;
  },
  number(value, field) {
    const number = Number(value ?? 0);
    if (!Number.isFinite(number) || number < 0) throw new Error(`${field} deve ser um número não negativo.`);
    return number;
  }
});
