import axios from "axios"
import { BASE_URL } from "./config";

export const checkCoupon = async (payload: any) => {
    try {
        const res = await axios.post(`${BASE_URL}/coupon/check`, payload);
        return res.data;
    } catch (error) {
    }
}