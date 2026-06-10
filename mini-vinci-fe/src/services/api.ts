import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.API_URL,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error) {
      if (error.message === 'Request canceled') throw new Error(error.message);
      else
        throw new Error('Unknown API request error. Please contact support.');
    }
  },
);

export default api;
