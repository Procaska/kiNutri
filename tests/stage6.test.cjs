const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const files = ['classes/EntityValidation', 'classes/User', 'classes/Food', 'classes/UserProfile', 'classes/DietFood', 'classes/Diet', 'classes/HttpClientBase', 'services/UserService', 'services/FoodService', 'services/DietService', 'prototypes/ToastPrototype', 'prototypes/FormControllerPrototype'];
function context(overrides = {}) {
  const elements = new Map();
  const ctx = vm.createContext({ console, setTimeout, clearTimeout,
    storage: { getToken: () => null },
    document: { getElementById: id => elements.get(id), createElement: () => ({ setAttribute() {} }), body: { appendChild: el => elements.set(el.id, el) } },
    ...overrides });
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/common', `${file}.js`), 'utf8'), ctx);
  return ctx;
}
test('encapsulamento, validação, conversão e composição', () => {
  const ctx = context();
  assert.equal(vm.runInContext(`(() => {
    const food = Food.fromJSON({id: "2", category_id: "1", name: "Arroz", calories: "100", protein: "2"});
    if (Object.keys(food).length !== 0 || food.id !== 2 || food.toJSON().name !== "Arroz") return false;
    const diet = new Diet({name: "Plano", foods: [{food_id: 2, meal: "Almoço", quantity: 100}]});
    return diet.foods[0] instanceof DietFood && new User({name: "Admin", email: "admin@example.com", type: "ADMIN"}).isAdmin();
  })()`, ctx), true);
  for (const expression of ['new Food({name: ""})', 'new Food({name: "Teste", calories: -1})', 'new Food({name: "Teste", protein: "abc"})', 'new User({name: "Teste", email: "inválido"})', 'new DietFood({meal: "Almoço", quantity: 0})']) assert.throws(() => vm.runInContext(expression, ctx));
});
test('Toast compartilha métodos e nunca mostra data como mensagem', () => {
  const ctx = context();
  assert.equal(vm.runInContext(`(() => {
    const a = Object.create(ToastPrototype).init("a", 1);
    const b = Object.create(ToastPrototype).init("b", 1);
    const responses = [{status: "success", message: "Salvo", data: {}}, {status: "success", message: "Salvo"}, {status: "success", data: {}}, {status: "warning"}, {status: "error"}, null, {message: {}}];
    const valid = responses.every(r => a.show(r) !== "[object Object]");
    a.hide(); b.hide();
    return a.show === b.show && Object.getPrototypeOf(a) === ToastPrototype && valid;
  })()`, ctx), true);
});
test('FormController tem estado independente e métodos compartilhados', () => {
  const ctx = context();
  assert.equal(vm.runInContext(`(() => {
    const form = {querySelectorAll: () => [{id: "nome", value: " Teste "}], reportValidity: () => true, reset() { this.cleared = true; }};
    const a = Object.create(FormControllerPrototype).init(form);
    const b = Object.create(FormControllerPrototype).init({});
    a.reset();
    return a.values().nome === "Teste" && a.validate() && form.cleared && a.values === b.values && a.form !== b.form;
  })()`, ctx), true);
});
test('serviços usam rotas corretas, entidades e JWT atualizado a cada chamada', async () => {
  const calls = [];
  let token = 'primeiro';
  const ctx = context({ storage: { getToken: () => token }, fetch: async (url, options) => {
    calls.push({url, ...options});
    return {ok: true, json: async () => ({status: 'success', data: [{id: 1, name: 'Teste', category_id: 1, calories: 10}]})};
  }});
  assert.equal(await vm.runInContext('(async () => (await new FoodService().list()).data[0] instanceof Food)()', ctx), true);
  token = 'segundo';
  await vm.runInContext('new FoodService().update(1, new Food({name: "Atualizado", calories: 20}))', ctx);
  await vm.runInContext('new DietService().addFood(3, {food_id: 1, meal: "Jantar", quantity: 100})', ctx);
  await vm.runInContext('new UserService().login({email: "a@b.com", password: "123456"})', ctx);
  assert.equal(calls[0].headers.Authorization, 'Bearer primeiro');
  assert.equal(calls[1].headers.Authorization, 'Bearer segundo');
  assert.equal(calls[1].method, 'PUT');
  assert.equal(calls[2].url, 'http://localhost/kiNutri/api/dietas/3/alimentos');
  assert.deepEqual(JSON.parse(calls[2].body), {food_id: 1, meal: 'Jantar', quantity: 100});
  assert.equal(calls[3].method, 'POST');
  assert.equal(calls[3].url, 'http://localhost/kiNutri/api/login');
});
test('HTTP rejeita erros HTTP e respostas inválidas', async () => {
  const ctx = context({fetch: async () => ({ok: false, status: 401, json: async () => ({message: 'Token inválido'})})});
  await assert.rejects(vm.runInContext('new HttpClientBase().get("/usuarios")', ctx), /Token inválido/);
  ctx.fetch = async () => ({ok: true, json: async () => null});
  await assert.rejects(vm.runInContext('new HttpClientBase().get("/usuarios")', ctx), /Resposta inválida/);
});
test('exportação usa serviços e serializa entidades com campos privados', async () => {
  const ctx = context();
  const downloads = [];
  ctx.downloads = downloads;
  ctx.showToast = () => {};
  vm.runInContext(`var foodService = {list: async () => ({status: "success", data: [new Food({id: 1, name: "Teste", calories: 100})]})};`, ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/export.js'), 'utf8'), ctx);
  vm.runInContext('downloadJSON = (filename, data) => downloads.push({filename, json: JSON.stringify(data)});', ctx);
  await vm.runInContext('exportarAlimentos()', ctx);
  assert.equal(downloads[0].filename, 'kinutri-alimentos.json');
  assert.equal(JSON.parse(downloads[0].json)[0].name, 'Teste');
  assert.equal(JSON.parse(downloads[0].json)[0].calories, 100);
});
test('Meu Plano mantém nomes de refeições em UTF-8 e agrupa itens da API', () => {
  const ctx = context();
  ctx.document.addEventListener = () => {};
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/meu-plano.js'), 'utf8'), ctx);
  assert.equal(vm.runInContext('agruparPorRefeicao([{meal: "Café da manhã"}, {meal: "Almoço"}]).length', ctx), 2);
  for (const file of ['meu-plano.js', 'historico.js']) assert.doesNotMatch(fs.readFileSync(path.join(root, 'assets/js', file), 'utf8'), /Ã[ƒ³£§­]/);
});
test('HTML carrega dependências existentes, em ordem e sem scripts duplicados', () => {
  for (const dir of ['', 'admin', 'usuario']) {
    for (const file of fs.readdirSync(path.join(root, dir)).filter(file => file.endsWith('.html'))) {
      const full = path.join(root, dir, file);
      const html = fs.readFileSync(full, 'utf8');
      const sources = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1].split('?')[0]).filter(src => !src.startsWith('http'));
      assert.equal(new Set(sources).size, sources.length, full);
      for (const src of sources) assert.ok(fs.existsSync(path.resolve(path.dirname(full), src)), `${full}: ${src}`);
      if (sources.some(src => src.endsWith('/auth.js'))) {
        assert.ok(sources.findIndex(src => src.endsWith('/HttpClientBase.js')) < sources.findIndex(src => src.endsWith('/UserService.js')));
        assert.ok(sources.findIndex(src => src.endsWith('/UserService.js')) < sources.findIndex(src => src.endsWith('/auth.js')));
      }
    }
  }
  for (const file of fs.readdirSync(path.join(root, 'assets/js')).filter(file => file.endsWith('.js'))) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'assets/js', file), 'utf8'), /\bfetch\s*\(|\bapi\.(get|post|put|delete)\s*\(/, file);
  }
});
