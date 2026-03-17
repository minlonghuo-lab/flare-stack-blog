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
 * 支持从 attachments 获取上传的图片
 */
function convertMemoToPost(memo: MemosMemo): MemosPost {
  const id = parseInt(memo.name.split("/")[1] || "0", 10) || Date.now();
  
  // 从 attachments 获取图片（方式1：通过后台上传）
  const images: string[] = [];
  const attachments = memo.attachments || [];
  
  for (const attachment of attachments) {
    // 检查是否是图片类型
    if (attachment.type.startsWith("image/")) {
      // 使用 Memos 的内部 URI
      images.push(attachment.uri);
    }
  }
  
  // 同时也支持从内容中提取图片 URL（方式2：粘贴 URL）
  // 从内容中提取图片 URL
  const contentImages = extractImagesFromContent(memo.content);
  for (const img of contentImages) {
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
    attachments: attachments.map(a => ({
      id: a.id,
      filename: a.filename,
      uri: a.uri,
    })),
  };
}

/**
 * 从内容中提取图片 URL
 * 支持格式：
 * - ![alt](url)
 * - <img src="url">
 * - 纯 URL（jpg, png, gif, webp 结尾）
 */
function extractImagesFromContent(content: string): string[] {
  const images: string[] = [];
  
  // Markdown 图片语法 ![alt](url)
  const mdMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
  if (mdMatch) {
    for (const m of mdMatch) {
      const url = m.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1];
      if (url) images.push(url);
    }
  }
  
  // HTML img 标签
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/gi);
  if (htmlMatch) {
    for (const m of htmlMatch) {
      const url = m.match(/src=["']([^"']+)["']/)?.[1];
      if (url) images.push(url);
    }
  }
  
  // 直接的图片 URL
  const urlMatch = content.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp|svg))/gi);
  if (urlMatch) {
    for (const url of urlMatch) {
      if (!images.includes(url)) {
        images.push(url);
      }
    }
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
