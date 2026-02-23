// client/src/api/products.js
import axios from "axios";
import { BASE_URL } from "./config";

export const getPayments = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/payment/lists`);
    return res.data;
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
};

export const getPaymentById = async (id: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/payment/lists/${id}`);
    return res.data;
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
};

export const getPaymentByUserId = async (userId: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/payment/user/${userId}`);
    return res.data;
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
};

export const getStripeSessionDetails = async (sessionId: string) => {
  const res = await axios.get(`${BASE_URL}/checkout-session/${sessionId}`);
  return res.data;    // { success, session, receiptUrl, paymentIntentId }
};

export const createPayment = async (payload: any) => {
  const res = await axios.post(`${BASE_URL}/payment`, payload);
  return res.data;
};

export const updatePayment = async (id: string, payload: any) => {
  const res = await axios.put(`${BASE_URL}/payment/update/${id}`, payload);
  return res.data;
};

export const deletePayment = async (id: string) => {
  const res = await axios.delete(`${BASE_URL}/payment/delete/${id}`);
  return res.data;
};

export const bulkDeletePayment = async () => {
  const res = await axios.delete(`${BASE_URL}/payment/bulkDelete`);
  return res.data;
};
