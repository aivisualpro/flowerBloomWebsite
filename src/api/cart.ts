// src/api/cart.js
import axios from "axios";
import { BASE_URL } from "./config";

/* -------------------------- GET (read) -------------------------- */

// All carts (admin/debug) -> GET /cart/lists
export const getCarts = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/cart/lists`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Single cart by cartId -> GET /cart/lists/:id
export const getCartById = async (cartId: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/cart/lists/${cartId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Cart by userId -> GET /cart/lists/user/:userId
export const getCartByUser = async (userId: string) => {
  if (!userId || userId === "undefined" || userId === "null") return null;
  try {
    const res = await axios.get(`${BASE_URL}/cart/lists/user/${userId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getCartLength = async (userId: string) => {
  if (!userId || userId === "undefined" || userId === "null") return { data: { distinct: 0 } };
  try {
    const res = await axios.get(`${BASE_URL}/cart/length/${userId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

/* ------------------------- CART document ------------------------ */

// Create cart -> POST /cart
export const createCart = async (payload: any) => {
  try {
    const res = await axios.post(`${BASE_URL}/cart`, payload);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Update cart (full) -> PUT /cart/update/:id    (⚠️ make sure backend has the colon)
export const updateCart = async (cartId: string, payload: any) => {
  try {
    const res = await axios.put(`${BASE_URL}/cart/update/${cartId}`, payload);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Delete a cart -> DELETE /cart/delete/:id
export const deleteCart = async (cartId: string) => {
  try {
    const res = await axios.delete(`${BASE_URL}/cart/delete/${cartId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Bulk delete carts -> DELETE /cart/bulk   body: { ids: [...] }
export const bulkDeleteCarts = async (ids: string[] = []) => {
  try {
    const res = await axios.delete(`${BASE_URL}/cart/bulk`, {
      data: { ids },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

/* ----------------------- Item-level actions ---------------------- */

// Add single item -> POST /cart/items    body: { user, product, qty }
export const addItemToCart = async ({ user, product, qty = 1 }: { user: string; product: string; qty?: number }) => {
  try {
    const res = await axios.post(`${BASE_URL}/cart/items`, { user, product, qty });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Add bundle (FBT) -> POST /cart/bundle   body: { user, items: [{product, qty}, ...] }
export const addBundleToCart = async ({ user, items }: { user: string; items: any[] }) => {
  try {
    const res = await axios.post(`${BASE_URL}/cart/bundle`, { user, items });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Set quantity -> PATCH /cart/items/update/:productId   body: { user, qty }
export const setItemQty = async ({ user, productId, qty }: { user: string; productId: string; qty: number }) => {
  try {
    const res = await axios.patch(`${BASE_URL}/cart/items/update/${productId}`, { user, qty });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Remove a single product (or multiple) -> DELETE /cart/items/delete
// Backend expects: { user, productIds: [...] }
export const removeItemFromCart = async ({ user, productId }: { user: string; productId: string }) => {
  try {
    const res = await axios.delete(`${BASE_URL}/cart/items/delete`, {
      data: { user, productIds: [productId] },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// Remove multiple products together (bulk remove) -> DELETE /cart/items/delete
export const removeItemsFromCart = async ({ user, productIds = [] }: { user: string; productIds: string[] }) => {
  try {
    const res = await axios.delete(`${BASE_URL}/cart/items/delete`, {
      data: { user, productIds },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};
