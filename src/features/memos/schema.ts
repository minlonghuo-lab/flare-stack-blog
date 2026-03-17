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
  // attachments 包含上传的图片
  attachments: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    uri: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
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
  // 提取的图片 URL
  images: z.array(z.string()),
  // 上传的图片附件
  attachments: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    uri: z.string(),
  })),
});

export type MemosMemo = z.infer<typeof MemosMemoSchema>;
export type MemosResponse = z.infer<typeof MemosResponseSchema>;
export type MemosPost = z.infer<typeof MemosPostSchema>;

/**
 * 说说页面 Props
 */
export interface MemosPageProps {
  memos: MemosPost[];
}
