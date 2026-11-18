// Cria apenas registros temporários e remove os próprios dados ao concluir.
// Requer XAMPP e a conta de demonstração existente (ou variáveis de ambiente).
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ctx = vm.createContext({fetch, console, storage: {getToken: () => ctx.jwt ?? null}});
const root = path.resolve(__dirname, '..');
for (const f of ['classes/EntityValidation','classes/User','classes/Food','classes/UserProfile','classes/DietFood','classes/Diet','classes/HttpClientBase','services/UserService','services/FoodService','services/DietService']) vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/common', f + '.js'), 'utf8'), ctx);
vm.runInContext('var users = new UserService(); var foods = new FoodService(); var diets = new DietService();', ctx);
const run = code => vm.runInContext(code, ctx);
function success(result) { assert.equal(result.status, 'success', result.message); return result.data; }
(async () => {
  ctx.credentials = {email: process.env.KINUTRI_TEST_EMAIL || 'admin@kinutri.com', password: process.env.KINUTRI_TEST_PASSWORD || '12345678'};
  const session = success(await run('users.login(credentials)'));
  ctx.jwt = session.token;
  const baseline = [success(await run('users.list()')).length, success(await run('foods.list()')).length, success(await run('diets.list()')).length];
  ctx.marker = 'Etapa6-' + Date.now();
  let userId, foodId, dietId, itemId;
  try {
    success(await run('users.create({name: marker, email: marker + "@example.test", typeId: 2}, "Teste123456")'));
    userId = ctx.userId = success(await run('users.list()')).find(u => u.name === ctx.marker).id;
    assert.ok(success(await run('users.find(userId)')));
    success(await run('users.update(userId, {name: marker + " editado", email: marker + "@example.test", typeId: 2})'));
    assert.equal(success(await run('users.find(userId)')).name, ctx.marker + ' editado');
    success(await run('users.saveProfile(userId, {birth_date: "2000-01-01", gender: "masculino", weight: 70, height: 175, activity_level: "moderado", goal: "Teste"})'));
    assert.equal(success(await run('users.getProfile(userId)')).weight, 70);
    success(await run('foods.create({name: marker, category_id: 1, calories: 100, protein: 10})'));
    foodId = ctx.foodId = success(await run('foods.list()')).find(f => f.name === ctx.marker).id;
    success(await run('foods.update(foodId, {name: marker, category_id: 1, calories: 150, protein: 15})'));
    assert.equal(success(await run('foods.find(foodId)')).calories, 150);
    success(await run('diets.create({user_id: userId, name: marker, goal: "Teste", calories: 2000, protein: 100, carbs: 250, fat: 60})'));
    dietId = ctx.dietId = success(await run('diets.list()')).find(d => d.name === ctx.marker).id;
    success(await run('diets.update(dietId, {user_id: userId, name: marker, goal: "Teste atualizado", calories: 2100, protein: 110, carbs: 250, fat: 60})'));
    assert.equal(success(await run('diets.find(dietId)')).calories, 2100);
    assert.equal(success(await run('diets.listByUser(userId)')).length, 1);
    success(await run('diets.addFood(dietId, {food_id: foodId, meal: "Almoço", quantity: 100})'));
    itemId = ctx.itemId = success(await run('diets.listFoods(dietId)'))[0].id;
    success(await run('diets.removeFood(itemId)')); itemId = null;
    assert.equal(success(await run('diets.listFoods(dietId)')).length, 0);
    // Usuário comum não pode editar/excluir usuários; admin não exclui a si mesmo.
    const temporary = success(await run('users.login({email: marker + "@example.test", password: "Teste123456"})'));
    const adminToken = ctx.jwt; ctx.jwt = temporary.token;
    await assert.rejects(run('users.remove(userId)'), /administradores/);
    ctx.jwt = adminToken; ctx.adminId = session.user.id;
    await assert.rejects(run('users.remove(adminId)'), /própria conta/);
    // FK: excluir usuário preserva dieta e remove perfil.
    success(await run('users.remove(userId)')); userId = null;
    assert.equal(success(await run('diets.find(dietId)')).user_id, null);
    console.log('PASS: login, entidades reais, CRUD usuários/alimentos/dietas, perfil, vínculo e permissões.');
  } finally {
    if (itemId) success(await run('diets.removeFood(itemId)'));
    if (dietId) success(await run('diets.remove(dietId)'));
    if (foodId) success(await run('foods.remove(foodId)'));
    if (userId) success(await run('users.remove(userId)'));
  }
  const after = [success(await run('users.list()')).length, success(await run('foods.list()')).length, success(await run('diets.list()')).length];
  assert.deepEqual(after, baseline);
  console.log('PASS: registros temporários removidos; contagens originais preservadas: ' + baseline.join('/'));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
