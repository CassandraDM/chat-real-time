import axios from "axios";

export interface User {
  id: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "http://localhost:8000/api";

export const userService = {
  async findAll(): Promise<User[]> {
    const response = await axios.get<User[]>(`${API_URL}/users`, {
      withCredentials: true,
    });
    return response.data;
  },
};
