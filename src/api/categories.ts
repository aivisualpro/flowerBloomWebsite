// client/src/api/products.js
import axios from "axios";
import { BASE_URL } from "./config";

// 1) SubCategory: Flower in vases
export const getCategories = async (params?: any) => {
  const res = await axios.get(`${BASE_URL}/subCategory/lists`);
  return res.data;
};