import type { User, Chat, ChatMessage, Product, License } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User' },
  { id: 'u2', name: 'Support Team' }
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'General' },
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'u1', text: 'Hello', ts: Date.now() },
];
// New Mock Data for SeverKey
export const MOCK_PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Pro Plan', description: 'Full access to all features for professionals.', price: 2999, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10 },
  { id: 'prod_2', name: 'Enterprise Plan', description: 'Dedicated support and infrastructure for large teams.', price: 9999, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20 },
  { id: 'prod_3', name: 'Basic Plan', description: 'Essential features for getting started.', price: 999, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  { id: 'prod_4', name: 'Lifetime Deal', description: 'One-time purchase for lifetime access.', price: 49900, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30 },
  { id: 'prod_5', name: 'Team Bundle', description: 'Access for up to 5 users.', price: 7999, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15 },
];
export const MOCK_LICENSES: License[] = Array.from({ length: 25 }, (_, i) => {
  const product = MOCK_PRODUCTS[i % MOCK_PRODUCTS.length];
  const statusOptions: License['status'][] = ['active', 'active', 'active', 'expired', 'banned'];
  const status = statusOptions[i % 5];
  const expiresAt = status === 'active' ? Date.now() + 1000 * 60 * 60 * 24 * (30 * (i + 1)) : (status === 'expired' ? Date.now() - 1000 * 60 * 60 * 24 * 30 : null);
  return {
    id: `lic_${crypto.randomUUID()}`,
    productId: product.id,
    key: `SK-${crypto.randomUUID().toUpperCase()}`,
    status,
    expiresAt,
    metadata: { customerId: `cust_${i + 1}` },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * i,
  };
});
export const MOCK_LICENSE_TRENDS = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        active: 1000 + i * 10 + Math.floor(Math.random() * 50),
        expired: 20 + Math.floor(i / 2) + Math.floor(Math.random() * 5),
        banned: 2 + Math.floor(i / 10),
    };
});
export const MOCK_ACTIVITY_DATA = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        creates: Math.floor(Math.random() * 20) + 5,
        revokes: Math.floor(Math.random() * 5),
        updates: Math.floor(Math.random() * 10) + 2,
    };
});