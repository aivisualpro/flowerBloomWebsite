import axios from "axios";

export const updateUser = async (userDetail: any, userId: string) => {
    try {
        const response = await axios.put(`/api/user/update/${userId}`, userDetail);
        return response.data;
    } catch (error) {
        console.error("updateUser error:", error);
    }
}