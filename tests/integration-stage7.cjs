// XAMPP + migration required. Changes only records created by this script.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { deflateSync, crc32 } = require('node:zlib');
const api = process.env.KINUTRI_API || 'http://localhost/kiNutri/api';
const demoPassword = 'KiNutri-Stage7-Test!';
const manifest = path.join(os.tmpdir(), 'kinutri-etapa07-demo.json');
const uploadDir = path.join(__dirname, '../api/uploads');

function png(color) {
  const chunk = (type, data) => {
    const name = Buffer.from(type), size = Buffer.alloc(4), crc = Buffer.alloc(4);
    size.writeUInt32BE(data.length);
    crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
    return Buffer.concat([size, name, data, crc]);
  };
  const width = 128, height = 96, header = Buffer.alloc(13);
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const rows = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inside = ((x - 64) / 38) ** 2 + ((y - 49) / 31) ** 2 < 1;
      const leaf = ((x - 78) / 18) ** 2 + ((y - 17) / 7) ** 2 < 1;
      const pixel = leaf ? [61, 127, 66] : inside ? color : [244, 248, 238];
      rows.set(pixel, y * (width * 3 + 1) + x * 3 + 1);
    }
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]);
}
const red = png([190, 43, 60]), yellow = png([240, 174, 48]);
function form(field, bytes = red, alt) {
  const data = new FormData();
  data.append(field, new Blob([bytes], { type: 'image/png' }), 'nome-nao-confiavel.php');
  if (alt != null) data.append('alt_text', alt);
  return data;
}
async function req(route, { token, method = 'GET', body, status = 200 } = {}) {
  const headers = token ? { Authorization: 'Bearer ' + token } : {};
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const response = await fetch(api + route, { method, headers, body });
  const raw = await response.text();
  assert.equal(response.status, status, method + ' ' + route + ': ' + raw.slice(0, 180));
  const json = JSON.parse(raw);
  assert.equal(json.status, status < 400 ? 'success' : 'error', json.message);
  return json.data;
}
const login = (email, password) => req('/login', { method: 'POST', body: { email, password } });
const files = () => fs.readdirSync(uploadDir).filter(name => /^[a-f0-9]{32}\.(png|jpg|webp)$/.test(name)).sort();
async function asset(imagePath, status, bytes) {
  assert.match(imagePath, /^uploads\/[a-f0-9]{32}\.png$/);
  const response = await fetch(api + '/' + imagePath);
  if (status === 404) assert.ok([403, 404].includes(response.status));
  else {
    assert.equal(response.status, status);
    assert.match(response.headers.get('content-type'), /^image\/png/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  }
}

(async () => {
  const admin = await login(process.env.KINUTRI_TEST_EMAIL || 'admin@kinutri.com', process.env.KINUTRI_TEST_PASSWORD || '12345678');
  const use = (route, options = {}) => req(route, { token: admin.token, ...options });
  const remove = route => use(route, { method: 'DELETE' });
  const cleanup = async ({ userId, foodIds }) => {
    for (const id of foodIds) await remove('/alimentos/' + id);
    if (userId) await remove('/usuarios/' + userId);
  };
  const demo = process.argv.includes('--demo');
  if (process.argv.includes('--clean-demo')) {
    if (fs.existsSync(manifest)) {
      await cleanup(JSON.parse(fs.readFileSync(manifest, 'utf8')));
      fs.unlinkSync(manifest);
    }
    return;
  }
  if (demo && fs.existsSync(manifest)) throw new Error('Execute --clean-demo primeiro.');
  const initialFiles = files();
  const email = 'etapa7-' + Date.now() + '@example.test';
  const records = { userId: null, foodIds: [] };
  try {
    await req('/usuarios', { method: 'POST', body: { name: 'Etapa 7', email, password: demoPassword, typeId: 1 }, status: 401 });
    await req('/usuarios', { method: 'POST', body: { name: 'Etapa 7', email, password: demoPassword, typeId: 2 } });
    const standard = await login(email, demoPassword);
    records.userId = standard.user.id;
    const own = (route, options = {}) => req(route, { token: standard.token, ...options });
    await req('/users/photo', { status: 401 });
    await own('/users/photo', { method: 'POST', body: new FormData(), status: 400 });
    assert.equal((await own('/users/photo')).image_path, null);
    const firstPhoto = form('photo');
    firstPhoto.append('user_id', admin.user.id);
    const adminPhoto = await use('/users/photo');
    const p1 = (await own('/users/photo', { method: 'POST', body: firstPhoto })).image_path;
    await asset(p1, 200, red);
    assert.deepEqual(await use('/users/photo'), adminPhoto);
    const p2 = (await own('/users/photo', { method: 'POST', body: form('photo', yellow) })).image_path;
    assert.notEqual(p1, p2);
    await asset(p1, 404);
    const relogin = await login(email, demoPassword);
    assert.equal((await req('/users/photo', { token: relogin.token })).image_path, p2);
    await asset(p2, 200, yellow);
    for (const name of ['Maçã de demonstração Etapa 7', 'Alimento sem fotos Etapa 7']) {
      const unique = name + ' ' + email.split('@')[0];
      await use('/alimentos', { method: 'POST', body: { name: unique, category_id: 3, calories: 52 } });
      records.foodIds.push((await use('/alimentos')).find(food => food.name === unique).id);
    }
    const [food, other] = records.foodIds;
    const gallery = '/alimentos/' + food + '/imagens', otherGallery = '/alimentos/' + other + '/imagens';
    assert.deepEqual(await use(gallery), []);
    const beforeInvalid = files();
    await own(gallery, { method: 'POST', body: form('image'), status: 403 });
    await own('/alimentos/' + food, { method: 'DELETE', status: 403 });
    await use(gallery, { method: 'POST', body: form('image', Buffer.from('<?php echo 1;')), status: 415 });
    await use(gallery, { method: 'POST', body: form('image', Buffer.alloc(5 * 1024 * 1024 + 1)), status: 413 });
    await use(gallery, { method: 'POST', body: form('image', red, 'a'.repeat(256)), status: 400 });
    if (process.env.KINUTRI_TEST_DB_REJECTION) {
      await use(gallery, { method: 'POST',
        body: form('image', red, process.env.KINUTRI_TEST_DB_REJECTION), status: 500 });
    }
    assert.deepEqual(files(), beforeInvalid);
    assert.deepEqual(await use(gallery), []);
    const add = (bytes, alt) => use(gallery, { method: 'POST', body: form('image', bytes, alt), status: 201 });
    const a = await add(red, 'Maçã vermelha (imagem de teste)');
    const b = await add(yellow, 'Maçã dourada (imagem de teste)');
    await asset(a.image_path, 200, red);
    await asset(b.image_path, 200, yellow);
    assert.deepEqual((await own(gallery)).map(i => Number(i.id)), [Number(a.id), Number(b.id)]);
    assert.deepEqual(await use(otherGallery), []);
    await own(gallery + '/' + a.id, { method: 'DELETE', status: 403 });
    await use(otherGallery + '/' + a.id, { method: 'DELETE', status: 404 });
    if (demo) {
      fs.writeFileSync(manifest, JSON.stringify(records));
      console.log(JSON.stringify({ email, foodId: food }));
      return;
    }
    await remove(gallery + '/' + a.id);
    assert.deepEqual((await use(gallery)).map(i => Number(i.id)), [Number(b.id)]);
    await asset(a.image_path, 404);
    await asset(b.image_path, 200, yellow);
    await remove('/alimentos/' + food);
    records.foodIds.shift();
    await use(gallery, { status: 404 });
    await asset(b.image_path, 404);
    await remove('/usuarios/' + records.userId);
    records.userId = null;
    await asset(p2, 404);
    console.log('PASS: foto vinculada ao token, substituição, dois arquivos por alimento, escopo, validação, remoção e cascata.');
  } finally {
    if (!demo || !fs.existsSync(manifest)) {
      await cleanup(records);
      assert.deepEqual(files(), initialFiles);
    }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
