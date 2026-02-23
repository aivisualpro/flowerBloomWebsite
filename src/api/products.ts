// client/src/api/products.js
import axios from "axios";
import { BASE_URL } from "./config";

// helper to build query string
const qs = (obj: Record<string, any> = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

// 1) SubCategory: Flower in vases (paginated)
export const getProductsInFlowerInVases = async ({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) => {
  const res = await axios.get(
    `${BASE_URL}/product/lists/inFlowerInVases?${qs({ page, limit })}`
  );
  return res.data;
};

// 2) Top sold (now paginated too)
export const getTopSoldProducts = async ({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) => {
  const res = await axios.get(
    `${BASE_URL}/product/lists/inTopSold?${qs({ page, limit })}`
  );
  return res.data;
};

// 3) Chocolates OR Hand Bouquets (paginated)
export const getProductsInChocolatesOrHandBouquets = async ({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) => {
  const res = await axios.get(
    `${BASE_URL}/product/lists/inChocolatesOrHandBouquets?${qs({ page, limit })}`
  );
  return res.data;
};

// 4) Friends occasion (paginated)
export const getProductsForFriendsOccasion = async ({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) => {
  const res = await axios.get(
    `${BASE_URL}/product/lists/inFriendsOccasion?${qs({ page, limit })}`
  );
  return res.data;
};

// 5) Featured (paginated)
export const getFeaturedProducts = async ({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) => {
  const res = await axios.get(
    `${BASE_URL}/product/lists/inFeatured?${qs({ page, limit })}`
  );
  return res.data;
};

// 6) Perfumes (paginated)
export const getProductsInPerfumes = async ({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) => {
  const res = await axios.get(
    `${BASE_URL}/product/lists/inPerfumes?${qs({ page, limit })}`
  );
  return res.data;
};

// 7) Preserved flowers (paginated)
export const getProductsInPreservedFlowers = async ({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) => {
  const res = await axios.get(
    `${BASE_URL}/product/lists/inPreservedFlowers?${qs({ page, limit })}`
  );
  return res.data;
};

// 8) Gift Detail  👉 return the *product object* (res.data.data)
export const getGiftDetail = async (id: string) => {
  const res = await axios.get(`${BASE_URL}/product/lists/${id}`);
  return res?.data?.data; // { ...product }
};

// 9) Search
export const searchProducts = async (q: string, { limit = 8, signal }: { limit?: number; signal?: AbortSignal } = {}) => {
  if (!q?.trim()) return { total: 0, items: [] };
  const res = await axios.get(`${BASE_URL}/product/search`, {
    params: { q },
    signal,
  });
  return res.data;
};

