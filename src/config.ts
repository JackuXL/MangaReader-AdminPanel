// API 配置
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 其他配置
export const config = {
  apiBaseUrl: API_BASE_URL,
  timeout: 30000,
};

export default config;

