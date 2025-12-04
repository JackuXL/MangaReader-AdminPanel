import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authApi.login(values) as any;
      console.log('Login response:', response);
      
      // Determine success: either explicit success flag or presence of token in data
      const isSuccess = response.success === true || response.success === 'true' || (!response.success && response.data?.token);

      if (isSuccess) {
        // 检查是否是 admin 角色
        const userData = response.data?.user || response.data;
        // If user data is directly in response (not wrapped in data)
        const userRole = userData?.role;
        
        if (userRole && userRole !== 'ADMIN') {
          message.error('只有管理员可以登录');
          return;
        }
        
        // 保存 token
        const token = response.data?.token || response.token;
        const user = userData;

        if (token) {
             localStorage.setItem('token', token);
        }
        if (user) {
             localStorage.setItem('user', JSON.stringify(user));
        }
        
        message.success('登录成功');
        navigate('/manga');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="Manga Admin Panel">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ height: '40px', fontSize: '16px' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

