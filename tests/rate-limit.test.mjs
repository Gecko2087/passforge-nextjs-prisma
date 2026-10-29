import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

test('El contador SQL limita cada cliente y reinicia una ventana vencida', () => {
  const source = readFileSync(new URL('../lib/auth.ts', import.meta.url), 'utf8');
  const sql = source.match(/customStorage:[\s\S]*?prepare\(`([\s\S]*?)`\)/)?.[1];
  assert(sql, 'Se verifica la consulta usada en producción');
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE rateLimit (id TEXT PRIMARY KEY, key TEXT UNIQUE, count INTEGER, lastRequest INTEGER)');
    const query = db.prepare(sql);
    let id = 0;
    const consume = (key, now) => query.get(String(++id), key, now, now - 60000, 4, now - 60000);
    assert.equal(consume('cliente-a', 100000).count, 1);
    assert.equal(consume('cliente-a', 100001).count, 2);
    assert.equal(consume('cliente-a', 100002).count, 3);
    assert.equal(consume('cliente-a', 100003).count, 4);
    assert.equal(consume('cliente-a', 100004).count, 4);
    assert.equal(consume('cliente-b', 100004).count, 1);
    const renewed = consume('cliente-a', 160000);
    assert.equal(renewed.count, 1);
    assert.equal(renewed.lastRequest, 160000);
  } finally { db.close(); }
});
