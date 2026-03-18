/**
 * Memos 数据类型定义
 */

import { z } from "zod";

/**
 * Memos API 返回的原始数据结构
 */
export const MemosMemoSchema = z.object({
  name: z.string(),
  state: z.string(),
  creator: z.string(),
  createTime: z.string(),
  updateTime: z.string(),
  displayTime: z.string(),
  content: z.string(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "PROTECTED"]),
  tags: z.array(z.string()),
  pinned: z.boolean(),
  attachments: z.array(z.any()).optional(),
});

export const MemosResponseSchema = z.object({
  memos: z.array(MemosMemoSchema),
  nextPageToken: z.string(),
});

/**
 * 转换后的说说类型
 */
export const MemosPostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(z.string()),
  pinned: z.boolean(),
  images: z.array(z.string()).optional(),
  files: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
});

export type MemosMemo = z.infer<typeof MemosMemoSchema>;
export type MemosResponse = z.infer<typeof MemosResponseSchema>;
export type MemosPost = z.infer<typeof MemosPostSchema>;

/**
 * 说说页面 Props
 */
export interface MemosPageData {
  memos: MemosPost[];
  nextPageToken: string;
}

export interface MemosPageProps {
  memos: MemosPost[];
}
