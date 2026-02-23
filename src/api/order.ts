import axios from "axios"
import { BASE_URL } from "./config";

export const getOnGoingOrderByUser = async (userId: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/ongoingOrder/lists/user/${userId}`);
        return res.data;
    } catch (error) {
    }
}

export const getPreviousOrder = async (userId: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/orderHistory/lists/user/${userId}`);
        return res.data;
    } catch (error) {
    }

}
export const getCurrentLatestOrder = async (userId: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/orders/lists/current-latest-order/${userId}`);
        return res.data;
    } catch (error) {
    }
}

export const createOrder = async (payload: any) => {
    try {
        const res = await axios.post(`${BASE_URL}/orders`, payload);
        return res.data;
    } catch (error) {
    }
}

export const updateOrder = async (payload: any, id: string) => {
    try {
        const res = await axios.put(`${BASE_URL}/orders/update/${id}`, payload);
        return res.data;
    } catch (error) {
    }
}