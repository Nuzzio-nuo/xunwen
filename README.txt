# 寻纹App - 非遗纹样智能助手

## 项目简介

寻纹App是一款专注于中国传统非物质文化遗产纹样的智能助手，通过AI技术为用户提供纹样识别、文本对话和图像生成服务。

## 核心功能

### 1. 寻纹（文本AI对话）
- 智能问答：解答关于非遗纹样的各种问题
- 纹样推荐：根据用户需求推荐合适的传统纹样
- 多轮对话：支持连续提问，深入了解纹样文化
- 响应模式：提供简洁、标准、详细三种响应模式

### 2. 工坊（图像生成）
- 纹样生成：根据描述生成传统纹样图像
- 提示词优化：自动优化输入描述，提高生成质量
- 图像保存：将生成的纹样保存到本地
- 分享功能：分享生成的纹样给朋友

### 3. 识遗（纹样识别）
- 实时识别：通过摄像头实时识别纹样
- 图片上传：支持从相册选择图片进行识别
- CLIP模型：使用先进的CLIP模型进行纹样识别
- 降级方案：当CLIP服务不可用时使用本地模拟识别

### 4. 我的（个人中心）
- 个人资料：管理用户信息和头像
- 收藏管理：查看和管理收藏的内容
- 历史记录：查看扫描历史和生成历史
- 深色模式：支持深色/浅色模式切换

## 技术栈

-   前端  ：React Native + Expo + TypeScript
-   导航  ：React Navigation
-   状态管理  ：React Hooks
-   本地存储  ：AsyncStorage
-   AI服务  ：
  - 文本AI：通义千问
  - 图像识别：CLIP模型（BentoML API）
  - 图像生成：专业图像生成API

## 安装与设置

### 1. 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- Python >= 3.8（用于CLIP服务）
- Expo Go应用（用于测试）

### 2. 安装步骤

#### 前端安装
1. 克隆项目仓库
2. 安装依赖：
   ```bash
   npm install
   ```
3. 安装Expo CLI：
   ```bash
   npm install -g expo-cli
   ```

#### CLIP服务设置
1. 创建Python虚拟环境：
   ```bash
   python -m venv clip-env
   ```
2. 激活虚拟环境：
   - Windows：`clip-env\Scripts\activate`
   - macOS/Linux：`source clip-env/bin/activate`
3. 安装CLIP服务依赖：
   ```bash
   pip install -r requirements.txt
   ```

### 3. 配置

#### 环境变量
在项目根目录创建 `.env` 文件，添加以下配置：

```env
# CLIP API服务地址
EXPO_PUBLIC_CLIP_BASE_URL=http://localhost:3000

# 文本AI API配置
EXPO_PUBLIC_TEXT_AI_API_KEY=your_api_key

# 图像生成API配置
EXPO_PUBLIC_IMAGE_GENERATION_API_KEY=your_api_key
```

## 运行项目

### 1. 启动CLIP服务
```bash
# 激活虚拟环境
clip-env\Scripts\activate

# 启动CLIP API服务
python -m clip_api_service
```

### 2. 启动Expo开发服务器
```bash
npx expo start
```

### 3. 运行应用
- 使用Expo Go应用扫描终端中的二维码
- 或选择在模拟器中运行

## 项目结构

```
├── App.tsx                    # 应用入口
├── src/
│   ├── screens/               # 页面组件
│   │   ├── ChatScreen.tsx     # 文本AI对话
│   │   ├── StudioScreen.tsx   # 图像生成
│   │   ├── ScannerScreen.tsx  # 纹样识别
│   │   ├── ProfileScreen.tsx  # 个人中心
│   │   └── ...
│   ├── services/              # 服务模块
│   │   ├── textAI/            # 文本AI服务
│   │   ├── imageRecognition/  # 图像识别服务
│   │   ├── imageGeneration/   # 图像生成服务
│   │   └── utils/             # 工具函数
│   ├── data/                  # 数据文件
│   └── config/                # 配置文件
├── clip-env/                  # Python虚拟环境
└── README.txt                 # 项目说明
```

## 常见问题与解决方案

### 1. CLIP服务启动失败
-   问题  ：无法启动CLIP API服务
-   解决方案  ：
  - 检查Python版本是否为3.8
  - 确保网络连接正常
  - 尝试使用本地模拟识别功能（应用会自动降级）

### 2. 摄像头无法使用
-   问题  ：无法访问摄像头
-   解决方案  ：
  - 在设备设置中允许应用访问摄像头
  - 重新启动应用

### 3. AI响应缓慢
-   问题  ：AI生成回答或图像速度较慢
-   解决方案  ：
  - 检查网络连接
  - 尝试使用简洁响应模式
  - 减少生成图像的复杂度

### 4. 模块导入错误
-   问题  ：TypeScript编译错误，模块未找到
-   解决方案  ：
  - 确保所有依赖已安装
  - 检查导入路径是否正确

## 开发与贡献

### 开发流程
1.  Fork项目仓库
2.  创建特性分支
3.  提交代码变更
4.  运行测试
5.  提交Pull Request

### 代码规范
- 使用TypeScript类型
- 遵循ESLint规则
- 编写清晰的注释
- 保持代码风格一致

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 联系方式

- 项目地址：https://nuzzio-nuo.github.io/xunwen/
- 邮箱：943223807@qq.com

---

  寻纹App   - 让传统纹样文化焕发新活力！
