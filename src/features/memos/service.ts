/**
 * Memos 数据服务 - 支持图片展示
 */

import { memosConfig } from "./config";
import type { MemosMemo, MemosPost, MemosPageProps } from "./schema";

/**
 * 简单内存缓存
 */
let memosCache: {
  data: MemosPost[];
  timestamp: number;
} = {
  data: [],
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

/**
 * 将 Memos 转换为说说格式
 * 透传源站图片直链: https://moment.ssaw.top/file/attachments/{id}/{filename}
 */
function convertMemoToPost(memo: MemosMemo): MemosPost {
  const id = parseInt(memo.name.split("/")[1] || "0", 10) || Date.now();
  
  // 从 attachments 获取图片 - 透传源站直链
  const images: string[] = [];
  const attachments = (memo as any).attachments || [];
  
  for (const attachment of attachments) {
    if (attachment.type && attachment.type.startsWith("image/")) {
      // 使用源站直链格式
      const attachmentId = (attachment.name || "").replace("attachments/", "");
      const filename = attachment.filename || "";
      if (attachmentId && filename) {
        // 透传源站 URL: https://moment.ssaw.top/file/attachments/{id}/{filename}
        images.push(`${memosConfig.apiBaseUrl}/file/attachments/${attachmentId}/${filename}`);
      }
    }
  }
  
  // 从内容中提取 Markdown 图片
  const mdImages = extractMarkdownImages(memo.content);
  for (const img of mdImages) {
    if (!images.includes(img)) {
      images.push(img);
    }
  }
  
  return {
    id,
    slug: `memos-${id}`,
    content: memo.content,
    createdAt: new Date(memo.createTime),
    updatedAt: new Date(memo.updateTime),
    tags: memo.tags,
    pinned: memo.pinned,
    images,
  };
}

/**
 * 从 Markdown 内容中提取图片 URL
 */
function extractMarkdownImages(content: string): string[] {
  const images: string[] = [];
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    images.push(match[2]);
  }
  return images;
}

/**
 * 获取说说列表
 */
export async function getMemos(pageSize?: number): Promise<MemosPost[]> {
  const now = Date.now();
  
  // 检查缓存
  if (memosCache.data.length && now - memosCache.timestamp < CACHE_TTL) {
    return memosCache.data.slice(0, pageSize);
  }
  
  try {
    const apiUrl = `${memosConfig.apiBaseUrl}/api/v1/memos?pageSize=50`;
    
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error("[Memos] API request failed:", response.status);
      return memosCache.data;
    }
    
    const data = await response.json();
    
    if (!data.memos || !Array.isArray(data.memos)) {
      return memosCache.data;
    }
    
    // 转换并排序（置顶在前，按时间倒序）
    const posts = data.memos
      .filter((memo: MemosMemo) => memo.visibility === "PUBLIC")
      .map(convertMemoToPost)
      .sort((a: MemosPost, b: MemosPost) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    
    // 更新缓存
    memosCache = {
      data: posts,
      timestamp: now,
    };
    
    return posts.slice(0, pageSize);
  } catch (error) {
    console.error("[Memos] Error fetching memos:", error);
    return memosCache.data;
  }
}

/**
 * 获取说说页面数据
 */
export async function getMemosPageData(): Promise<MemosPageProps> {
  const memos = await getMemos(memosConfig.pageSize);
  return { memos };
}

/**
 * 清除缓存
 */
export function clearMemosCache(): void {
  memosCache = {
    data: [],
    timestamp: 0,
  };
}
