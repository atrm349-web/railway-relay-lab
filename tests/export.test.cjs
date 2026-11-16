const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
global.THREE = require('../dist/vendor/three.min.js');
// 导出只包含网格；画布标签不进入 GLB，测试为其提供最小画布接口。
global.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ({ measureText: t => ({ width: t.length * 38 }), beginPath() {}, roundRect() {}, fill() {}, fillText() {} }) }) };
require('../dist/model.js');
let checked = 0;
function validate(buffer) {
  const bytes = Buffer.from(buffer);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67);
  assert.equal(bytes.readUInt32LE(4), 2);
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const jsonSize = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(16), 0x4e4f534a);
  const doc = JSON.parse(bytes.subarray(20, 20 + jsonSize).toString());
  const binaryStart = 20 + jsonSize;
  assert.equal(bytes.readUInt32LE(binaryStart + 4), 0x004e4942);
  const binSize = bytes.readUInt32LE(binaryStart);
  assert.equal(doc.buffers[0].byteLength, binSize);
  assert.equal(bytes.length, binaryStart + 8 + binSize);
  assert.ok(doc.meshes.length > 40);
  assert.equal(doc.nodes.length, doc.meshes.length);
  for (const bv of doc.bufferViews) {
    assert.equal(bv.byteOffset % 4, 0);
    assert.ok(bv.byteOffset + bv.byteLength <= binSize);
  }
  for (const a of doc.accessors) {
    const bv = doc.bufferViews[a.bufferView];
    assert.equal(bv.byteLength, a.count * (a.type === 'VEC3' ? 3 : 1) * 4);
    if (a.min) for (let i = 0; i < 3; i++) { assert.ok(Number.isFinite(a.min[i])); assert.ok(a.min[i] <= a.max[i]); }
  }
  for (const mesh of doc.meshes) for (const p of mesh.primitives) {
    assert.ok(doc.materials[p.material]);
    const position = doc.accessors[p.attributes.POSITION];
    if (p.indices !== undefined) {
      const indices = doc.accessors[p.indices], bv = doc.bufferViews[indices.bufferView];
      for (let i = 0; i < indices.count; i++) assert.ok(bytes.readUInt32LE(binaryStart + 8 + bv.byteOffset + i * 4) < position.count);
    }
  }
  checked++;
  return doc.meshes.length;
}
const output = path.resolve(__dirname, '../outputs/models'); fs.mkdirSync(output, { recursive: true });
for (const type of ['neutral', 'biased', 'latching', 'rectifier', 'phase']) {
  const model = RelayModel.createRelay(type);
  for (const picked of [false, true]) {
    model.setView({ labels: true, cover: false, explode: 0, field: true });
    model.pose(Number(picked), { drive: picked, localEnergized: true }, { mode: 'bench', polarity: picked ? 1 : 0 }, 0);
    const buffer = RelayModel.exportGLB(model.root), meshCount = validate(buffer);
    fs.writeFileSync(path.join(output, `${type}-${picked ? 'picked' : 'dropped'}.glb`), Buffer.from(buffer));
    console.log(`${type} ${picked ? '吸起/定位' : '落下/反位'}：${meshCount} 个网格，${buffer.byteLength} 字节`);
  }
  model.dispose();
}
if (process.argv[2]) validate(fs.readFileSync(process.argv[2]));
console.log(`通过 ${checked} 份 GLB 结构检查（头部、缓冲区、几何、材质与索引边界）。`);
