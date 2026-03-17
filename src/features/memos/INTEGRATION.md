# Memos 说说页面集成指南

## 方案说明

本方案在博客中**新增一个独立页面** `/memos`，用于展示 Memos 说说内容。

- ✅ 首页不变 - 仍然显示本地文章
- ✅ 文章页不变 - 仍然显示本地文章
- ✅ 友链页不变
- ✅ 新增 `/memos` 说说页面

## 文件结构

将以下目录复制到你的项目中：

```
src/features/memos/
├── config.ts          # 配置文件
├── schema.ts          # 类型定义
├── service.ts         # 数据服务
├── index.ts           # 入口文件
├── pages/
│   └── MemosPage.tsx # 说说页面组件
└── routes/
    └── memos.tsx     # 路由文件
```

## 集成步骤

### 1. 复制文件

将 `src/features/memos/` 复制到你的项目中。

### 2. 配置 Memos API 地址

在 `src/features/memos/config.ts` 中修改：

```typescript
export const memosConfig = {
  apiBaseUrl: "https://memos-proxy.minlonghuo.workers.dev", // 你的 Workers 地址
  pageSize: 20,
  routePath: "/memos",
  pageTitle: "说说",
  pageDescription: "日常碎碎念",
} as const;
```

### 3. 添加导航链接（可选）

在导航栏添加说说页面入口：

修改 `src/features/theme/themes/default/layouts/navbar.tsx`：

```tsx
<Link to="/memos" className="...">
  说说
</Link>
```

## 访问方式

集成完成后，访问 `/memos` 即可看到说说页面。

## 合并上游更新

由于所有 Memos 代码都在独立的 `features/memos` 目录，合并上游更新时：
- 保留 `src/features/memos/` 目录
- 保留 `src/routes/_public/memos.tsx` 文件

不会被上游覆盖。

## 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `apiBaseUrl` | Memos Workers API 地址 | 必填 |
| `pageSize` | 页面显示数量 | 20 |
| `routePath` | 路由路径 | `/memos` |
| `pageTitle` | 页面标题 | `说说` |
| `pageDescription` | 页面描述 | `日常碎碎念` |
