import axios from "axios";
import { BASE_URL } from "./config";

export const getWishlistByUser = async (userId: string) => {
  if (!userId || userId === "undefined") return { data: [] };
  const res = await axios.get(`${BASE_URL}/wishlist/lists/user/${userId}`);
  return res.data;
};

export const createWishlist = async ({ user, product }: { user: string; product: string }) => {
  const res = await axios.post(`${BASE_URL}/wishlist`, { user, product });
  return res.data;
};

// IMPORTANT: send body (not params)
export const deleteWishlist = async ({ user, product }: { user: string; product: string }) => {
  const res = await axios.delete(`${BASE_URL}/wishlist`, {
    data: { user, product },
  });
  return res.data;
};
