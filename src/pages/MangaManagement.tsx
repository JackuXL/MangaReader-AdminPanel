import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Upload,
  Tag,
  Image,
  Layout,
  Typography,
  Card,
  Select,
} from 'antd';
import {
  DeleteOutlined,
  UploadOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mangaApi, Manga } from '../services/api';
import type { UploadFile } from 'antd';
import './MangaManagement.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const MangaManagement: React.FC = () => {
  const [manga, setManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // 获取用户信息
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username || 'Admin');
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }
    
    // 加载所有标签
    loadAllTags();
  }, []);

  const loadAllTags = async () => {
    try {
      const response = await mangaApi.getAllTags(); 
      if (response.success) {
        setAllTags(response.data);
      }
    } catch (e) {
      console.log("Failed to load tags", e);
    }
  };

  // 加载漫画列表
  const loadManga = async (page: number = 0) => {
    setLoading(true);
    try {
      let response;
      if (selectedTag) {
        response = await mangaApi.getByTag(selectedTag, page, pagination.pageSize);
      } else {
        response = await mangaApi.getList(page, pagination.pageSize);
      }
      
      if (response.success) {
        setManga(response.data.content);
        setPagination({
          ...pagination,
          current: page + 1,
          total: response.data.totalElements,
        });
      }
    } catch (error: any) {
      message.error('加载失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 监听筛选条件变化
  useEffect(() => {
    loadManga(0);
    // eslint-disable-next-line
  }, [selectedTag]);

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 删除单个漫画
  const handleDelete = async (id: number) => {
    try {
      const response = await mangaApi.delete(id);
      if (response.success) {
        message.success('删除成功');
        loadManga(pagination.current - 1);
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error: any) {
      message.error('删除失败: ' + (error.response?.data?.message || error.message));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的漫画');
      return;
    }

    setLoading(true);
    try {
      // 循环删除
      let successCount = 0;
      let failCount = 0;
      
      for (const key of selectedRowKeys) {
        try {
          const response = await mangaApi.delete(Number(key));
          if (response.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        message.success(`成功删除 ${successCount} 个漫画${failCount > 0 ? `，失败 ${failCount} 个` : ''}`);
        setSelectedRowKeys([]);
        loadManga(pagination.current - 1);
      } else {
        message.error('批量删除失败');
      }
    } catch (error: any) {
      message.error('批量删除过程中发生错误: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 批量导入
  // Removed async from here to prevent immediate promise return
  const handleImport = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const mangaList = Array.isArray(json) ? json : [json];
        
        const response = await mangaApi.batchImport(mangaList);
        if (response.success) {
          message.success(`成功导入 ${mangaList.length} 个漫画`);
          loadManga(0);
        } else {
          message.error(response.message || '导入失败');
        }
      } catch (error: any) {
        message.error('导入失败: ' + (error.response?.data?.message || error.message));
      }
    };
    // Cast to any because UploadFile is a wrapper, but FileReader expects Blob/File
    reader.readAsText(file as any);
    
    // Return false immediately to stop automatic upload
    return false;
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '封面',
      dataIndex: 'coverImageUrl',
      key: 'coverImageUrl',
      width: 100,
      render: (url: string) => (
        <Image
          src={url}
          alt="cover"
          width={60}
          height={80}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: Manga) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.oldName && (
            <div style={{ fontSize: '12px', color: '#999' }}>{record.oldName}</div>
          )}
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'isFinish',
      key: 'isFinish',
      width: 80,
      render: (isFinish: string) => (
        <Tag color={isFinish === '1' ? 'success' : 'processing'}>
          {isFinish === '1' ? '已完结' : '连载中'}
        </Tag>
      ),
    },
    {
      title: '地区',
      dataIndex: 'country',
      key: 'country',
      width: 80,
      render: (country: string) => {
        const countryMap: Record<string, string> = {
          '1': '日本',
          '2': '韩国',
          '3': '中国',
          '4': '其他',
        };
        return countryMap[country] || country;
      },
    },
    {
      title: '章节数',
      dataIndex: 'chapterCount',
      key: 'chapterCount',
      width: 100,
      render: (count: number) => <Text strong>{count}</Text>,
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
    },
    {
      title: '收藏量',
      dataIndex: 'favoriteCount',
      key: 'favoriteCount',
      width: 100,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tags?.slice(0, 3).map((tag) => (
            <Tag 
              key={tag} 
              color="blue" 
              style={{ cursor: 'pointer', margin: 0 }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row selection if clicking tag
                setSelectedTag(tag);
              }}
            >
              {tag}
            </Tag>
          ))}
          {tags?.length > 3 && <Tag style={{ margin: 0 }}>+{tags.length - 3}</Tag>}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: Manga) => (
        <Popconfirm
          title="确定要删除这个漫画吗？"
          description="删除后将无法恢复"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div className="header-content">
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Manga Admin Panel
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {username && (
              <Text style={{ color: 'white', fontSize: '16px' }}>
                {username}
              </Text>
            )}
            <Button
              type="default"
              ghost
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}
            >
              登出
            </Button>
          </div>
        </div>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Card>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
                <Upload
                accept=".json"
                showUploadList={false}
                beforeUpload={handleImport}
                >
                <Button type="primary" icon={<UploadOutlined />}>
                    批量导入 JSON
                </Button>
                </Upload>

                <Popconfirm
                title="确定要删除选中的漫画吗？"
                description={`将删除 ${selectedRowKeys.length} 个漫画`}
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
                disabled={selectedRowKeys.length === 0}
                >
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={selectedRowKeys.length === 0}
                >
                    批量删除 ({selectedRowKeys.length})
                </Button>
                </Popconfirm>

                <Button
                icon={<ReloadOutlined />}
                onClick={() => loadManga(pagination.current - 1)}
                >
                刷新
                </Button>
            </Space>

            <Space>
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="选择标签筛选"
                    optionFilterProp="children"
                    onChange={(value) => setSelectedTag(value)}
                    value={selectedTag}
                    allowClear
                    onClear={() => setSelectedTag(undefined)}
                    filterOption={(input, option) =>
                        (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {allTags.map(tag => (
                        <Option key={tag} value={tag}>{tag}</Option>
                    ))}
                </Select>
                <Text type="secondary">
                共 {pagination.total} 个漫画
                </Text>
            </Space>
          </Space>

          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={manga}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1500 }}
            pagination={{
              ...pagination,
              onChange: (page) => loadManga(page - 1),
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default MangaManagement;
