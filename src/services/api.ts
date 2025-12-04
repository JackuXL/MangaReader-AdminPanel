import axios from 'axios';
import { message } from 'antd';

// API 基础配置
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，提示并跳转登录
      message.error('登录已过期，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 类型定义
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      role: string;
    };
  };
}

export interface Manga {
  id: number;
  title: string;
  oldName: string;
  description: string;
  coverImageUrl: string;
  author: string;
  isFinish: string;
  tendency: string;
  country: string;
  viewCount: number;
  favoriteCount: number;
  chapterCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MangaListResponse {
  success: boolean;
  data: {
    content: Manga[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// 解析 JWT token 获取过期时间
export const parseJwt = (token: string): { exp?: number } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// 检查 token 是否过期（本地检查）
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    return true; // 无法解析，视为过期
  }
  // exp 是秒级时间戳，转换为毫秒比较
  const expirationTime = payload.exp * 1000;
  const now = Date.now();
  // 提前 60 秒视为过期，避免边界情况
  return now >= expirationTime - 60000;
};

// API 方法
export const authApi = {
  // 登录
  login: (data: LoginRequest) => 
    api.post<any, LoginResponse>('/api/auth/login', data),
};

export const mangaApi = {
  // 获取漫画列表
  getList: (page: number = 0, size: number = 20) =>
    api.get<any, MangaListResponse>(`/api/manga?page=${page}&size=${size}`),

  // 按标签筛选漫画
  getByTag: (tag: string, page: number = 0, size: number = 20) =>
    api.get<any, MangaListResponse>(`/api/manga/tag/${encodeURIComponent(tag)}?page=${page}&size=${size}`),
  
  // 批量导入漫画
  batchImport: (data: any[]) =>
    api.post<any, ApiResponse>('/api/admin/manga/batch-import', data),

  // 获取所有标签
  getAllTags: () =>
    api.get<any, ApiResponse<string[]>>('/api/manga/tags'),
  
  // 删除漫画
  delete: (id: number) =>
    api.delete<any, ApiResponse>(`/api/admin/manga/${id}`),
};

export default api;

