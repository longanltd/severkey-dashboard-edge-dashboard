import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, ProductEntity, LicenseEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Product, License, ApiKey } from "@shared/types";
// In a real app, API keys would be a separate entity. For this demo, we'll store them in-memory on the worker.
const MOCK_API_KEYS: ApiKey[] = [
  { id: crypto.randomUUID(), key: `sk_live_${crypto.randomUUID().replace(/-/g, '')}`, createdAt: Date.now() - 86400000 * 5 },
];
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // PRODUCTS
  app.get('/api/products', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    const page = await ProductEntity.list(c.env, c.req.query('cursor') ?? null, c.req.query('limit') ? Number(c.req.query('limit')) : undefined);
    return ok(c, page);
  });
  app.post('/api/products', async (c) => {
    const { name, description, price } = await c.req.json<Partial<Product>>();
    if (!isStr(name) || !isStr(description) || typeof price !== 'number') return bad(c, 'name, description, and price are required');
    const product: Product = { id: `prod_${crypto.randomUUID()}`, name, description, price, createdAt: Date.now() };
    return ok(c, await ProductEntity.create(c.env, product));
  });
  // LICENSES
  app.get('/api/licenses', async (c) => {
    await LicenseEntity.ensureSeed(c.env);
    const page = await LicenseEntity.list(c.env, c.req.query('cursor') ?? null, c.req.query('limit') ? Number(c.req.query('limit')) : undefined);
    return ok(c, page);
  });
  app.post('/api/licenses', async (c) => {
    const { productId, expiresAt, metadata } = await c.req.json<Partial<License>>();
    if (!isStr(productId)) return bad(c, 'productId is required');
    const license: License = {
      id: `lic_${crypto.randomUUID()}`,
      productId,
      key: LicenseEntity.generateKey(),
      status: 'active',
      expiresAt: expiresAt ?? null,
      metadata: metadata ?? {},
      createdAt: Date.now(),
    };
    return ok(c, await LicenseEntity.create(c.env, license));
  });
  app.post('/api/licenses/:id/revoke', async (c) => {
    const license = new LicenseEntity(c.env, c.req.param('id'));
    if (!await license.exists()) return notFound(c, 'license not found');
    return ok(c, await license.revoke());
  });
  // API KEYS (Mock)
  app.get('/api/api-keys', (c) => {
    return ok(c, MOCK_API_KEYS);
  });
  app.post('/api/api-keys', (c) => {
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      key: `sk_live_${crypto.randomUUID().replace(/-/g, '')}`,
      createdAt: Date.now(),
    };
    MOCK_API_KEYS.push(newKey);
    return ok(c, newKey);
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Products
  app.delete('/api/products/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ProductEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/products/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) return bad(c, 'ids array is required');
    return ok(c, { deletedCount: await ProductEntity.deleteMany(c.env, ids), ids });
  });
  // DELETE: Licenses
  app.delete('/api/licenses/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await LicenseEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/licenses/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) return bad(c, 'ids array is required');
    return ok(c, { deletedCount: await LicenseEntity.deleteMany(c.env, ids), ids });
  });
}