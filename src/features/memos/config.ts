/**
 * Memos 集成配置
 */

export const memosConfig = {
  /** Memos API 基础 URL */
  apiBaseUrl: "https://memos.ssaw.top",
  
  /** 说说页面显示数量 */
  pageSize: 20,
  
  /** 路由路径 */
  routePath: "/memos",
  
  /** 页面标题 */
  pageTitle: "说说",
  
  /** 页面描述 */
  pageDescription: "日常碎碎念",
} as const;

export type MemosConfig = typeof memosConfig;
