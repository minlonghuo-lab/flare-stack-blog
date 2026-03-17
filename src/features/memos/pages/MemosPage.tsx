/**
 * 说说页面组件
 * 
 * 独立页面渲染 Memos 说说，支持图片展示和点击放大
 */

import { useState } from "react";
import { memo } from "react";
import type { MemosPost } from "../schema";

interface MemosPageComponentProps {
  memos: MemosPost[];
}

/**
 * 说说页面 - 与默认主题风格一致
 */
export const MemosPage = memo(({ memos }: MemosPageComponentProps) => {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20 space-y-16">
      {/* 页面标题 */}
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground">
          说说
        </h1>
        <p className="text-muted-foreground font-light">
          日常碎碎念，记录灵感闪现的瞬间
        </p>
      </section>

      {/* 说说列表 */}
      <section className="space-y-12">
        {memos.map((memo) => (
          <MemosItem key={memo.id} memo={memo} />
        ))}
        
        {memos.length === 0 && (
          <p className="text-muted-foreground text-center py-12">
            暂无说说
          </p>
        )}
      </section>

      {/* 图片预览模态框 */}
      <ImageModal />
    </div>
  );
});

MemosPage.displayName = "MemosPage";

/**
 * 图片预览模态框组件
 */
function ImageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // 暴露给全局，方便子组件调用
  if (typeof window !== "undefined") {
    (window as any).openImageModal = (url: string) => {
      setImageUrl(url);
      setIsOpen(true);
    };
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      {/* 关闭按钮 */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl w-10 h-10 flex items-center justify-center"
        onClick={() => setIsOpen(false)}
      >
        ✕
      </button>
      
      {/* 图片 */}
      <img
        src={imageUrl}
        alt="预览"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/**
 * 说说单项组件
 */
const MemosItem = memo(({ memo }: { memo: MemosPost }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 处理内容，支持简单的换行
  const contentLines = memo.content.split("\n");

  // 获取图片列表
  const images = (memo as any).images || [];

  // 点击图片打开预览
  const handleImageClick = (url: string) => {
    if (typeof window !== "undefined" && (window as any).openImageModal) {
      (window as any).openImageModal(url);
    } else {
      // 降级：直接打开
      window.open(url, "_blank");
    }
  };

  return (
    <article className="relative pl-8">
      {/* 时间线 */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
      <div className="absolute left-[-3px] top-2 w-2 h-2 rounded-full bg-foreground/30" />
      
      <div className="space-y-3">
        {/* 元信息 */}
        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/60">
          <time dateTime={memo.createdAt.toISOString()}>
            {formatDate(memo.createdAt)}
          </time>
          {memo.pinned && (
            <span className="text-primary font-medium">置顶</span>
          )}
        </div>

        {/* 内容 */}
        <div className="text-base leading-relaxed text-foreground/90 space-y-2">
          {contentLines.map((line, index) => {
            // 处理标题
            if (line.startsWith("# ")) {
              return (
                <h2 key={index} className="text-xl font-serif font-medium pt-2">
                  {line.slice(2)}
                </h2>
              );
            }
            // 处理代码块标记
            if (line.startsWith("```")) {
              return null;
            }
            // 普通段落
            return line ? (
              <p key={index}>{line}</p>
            ) : (
              <br key={index} />
            );
          })}
        </div>

        {/* 图片展示 - 点击放大 */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-3">
            {images.map((imgUrl: string, index: number) => (
              <div
                key={index}
                className="block aspect-square overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() => handleImageClick(imgUrl)}
              >
                <img
                  src={imgUrl}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* 标签 */}
        {memo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {memo.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-muted-foreground/60 hover:text-foreground/80 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
});

MemosItem.displayName = "MemosItem";
