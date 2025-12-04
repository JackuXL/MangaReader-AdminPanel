import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MangaManagement from './pages/MangaManagement';
import { isTokenExpired } from './services/api';
import './App.css';

// 路由守卫 - 本地检查 token 有效性
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // 没有 token，跳转登录
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 本地检查 token 是否过期
  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/manga"
          element={
            <PrivateRoute>
              <MangaManagement />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/manga" replace />} />
        <Route path="*" element={<Navigate to="/manga" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
