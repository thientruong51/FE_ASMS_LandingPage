import axios from "axios";

export const forgotPassword = async (payload: {
  email: string;
  isEmployee: boolean;
}) => {
  const res = await axios.post("/api/Password/forgot-password", payload);
  return res.data;
};
