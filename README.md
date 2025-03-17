

## 📑 部署步骤

### 1. 部署 Cloudflare Worker

- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
- 进入 Workers & Pages 页面
- 点击"创建应用程序"
- 选择"创建 Worker"
- 将 ([节点聚合.js](https://github.com/976853694/cloudflare-vpn/blob/main/%E8%8A%82%E7%82%B9%E8%81%9A%E5%90%88.js)) 的内容粘贴到 Worker 编辑器中
- 点击"部署"保存您的更改

### 2. 配置自定义域名（可选）

- 在 Worker 详情页面，点击"触发器"选项卡
- 在"自定义域"部分，点击"添加自定义域"
- 输入您希望用于访问此服务的域名
- 按照提示完成 DNS 配置

### 3. 添加节点或订阅链接

方法一：使用环境变量
- 在 Worker 详情页面，点击"设置"选项卡
- 选择"变量"
- 按照下方变量说明添加必要的环境变量

方法二：使用 KV 存储（推荐）
- 在 Cloudflare Dashboard 左侧菜单，找到"KV"
- 点击"创建命名空间"，将其命名为 `KV`
- 回到 Worker 设置页面，绑定 KV 命名空间
- 将变量名称设为 `KV`，选择刚创建的命名空间
- 保存配置后，您可以通过 Web 界面管理订阅链接

## 📋 变量说明

| 变量名 | 示例 | 必填 | 备注 |
|--------|------|------|------|
| TOKEN | `auto` | ✅ | 汇聚订阅的订阅配置路径地址，例如：`/auto` |
| GUEST | `test` | ❌ | 汇聚订阅的访客订阅TOKEN，例如：`/sub?token=test` |
| LINK | `vless://b7a39...`,`vmess://ew0K...`,`https://sub...` | ❌ | 可同时放入多个节点链接与多个订阅链接，链接之间用换行做间隔（添加**KV命名空间**后，该变量将不会使用）|
| TGTOKEN | `6894123456:XXXXXXXXXX0qExVsBPUhHDAbXXXXXqWXgBA` | ❌ | 发送TG通知的机器人token |
| TGID | `6946912345` | ❌ | 接收TG通知的账户数字ID |
| SUBNAME | `六趣聚合` | ❌ | 订阅名称 |
| SUBAPI | `SUBAPI.cmliussss.net` | ❌ | clash、singbox等订阅转换后端 |
| SUBCONFIG | [https://raw.github.../ACL4SSR_Online_MultiCountry.ini](https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini) | ❌ | clash、singbox等订阅转换配置文件 |

## 🔍 使用说明

### 订阅地址格式

部署完成后，您可以通过以下方式访问您的订阅：

- 标准订阅地址: `https://您的域名/TOKEN值`
- 访客订阅地址: `https://您的域名/sub?token=GUEST值`

### 订阅格式

支持多种客户端订阅格式，可通过链接参数指定：

- 自动识别: `https://您的域名/TOKEN值`
- Base64格式: `https://您的域名/TOKEN值?b64`
- Clash格式: `https://您的域名/TOKEN值?clash`
- SingBox格式: `https://您的域名/TOKEN值?sb`
- Surge格式: `https://您的域名/TOKEN值?surge`
- QuantumultX格式: `https://您的域名/TOKEN值?quanx`
- Loon格式: `https://您的域名/TOKEN值?loon`

### 管理订阅

如果您绑定了KV存储，访问 `https://您的域名/TOKEN值` 可打开管理页面，您可以在此管理订阅链接和节点。

## 💡 特性

- 毛玻璃UI界面设计
- 多种客户端格式支持
- 节点自动去重
- 支持TG通知
- 支持访客模式

## 📌 备注

本项目基于 [CF-Workers-SUB](https://github.com/cmliu/CF-Workers-SUB)，添加了全局UI美化，采用毛玻璃风格设计，提供更好的用户体验。所有核心功能保持不变。

---

© 2023 六趣聚合 - 让您的网络连接更畅通，体验更丝滑
