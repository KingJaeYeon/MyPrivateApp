import axios from 'axios';

export let request_youtube = axios.create({
  baseURL: import.meta.env.VITE_YT_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

request_youtube.interceptors.response.use(
  (response) => response, // 성공 그대로 반환
  (error) => {
    // 에러를 통일된 형식으로 가공
    return Promise.reject({
      isError: true,
      message: error.response?.data?.error?.message || error.message || 'Unknown error',
      status: error.response?.status,
    });
  }
);
