import axios from 'axios';

const API_URL = '/api/wallet';

export const getWallet = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const requestWithdrawal = async (data) => {
  const response = await axios.post(`${API_URL}/withdraw`, data);
  return response.data;
};
