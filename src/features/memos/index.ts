/**
 * Memos 集成模块
 * 
 * 用于获取 Memos 说说数据并在博客中展示
 */

export { memosConfig } from "./config";
export type { MemosConfig } from "./config";

export { 
  getMemos, 
  getMemosPageData,
  clearMemosCache 
} from "./service";

export type { 
  MemosMemo, 
  MemosPost, 
  MemosPageProps 
} from "./schema";
