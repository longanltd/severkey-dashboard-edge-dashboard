export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// New types for SeverKey Dashboard
export type LicenseStatus = 'active' | 'expired' | 'banned';
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  createdAt: number;
}
export interface License {
  id: string;
  productId: string;
  key: string;
  status: LicenseStatus;
  expiresAt: number | null;
  metadata: Record<string, any>;
  createdAt: number;
}
export interface ApiKey {
  id: string;
  key: string;
  createdAt: number;
}