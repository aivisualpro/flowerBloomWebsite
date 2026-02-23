import axios from "axios";
import { BASE_URL } from "./config";

export const updateUser = async (userDetail: any, userId: string) => {
    try {
        const response = await axios.put(`${BASE_URL}/user/update/${userId}`, userDetail);
        return response.data;
    } catch (error) {
    }
}