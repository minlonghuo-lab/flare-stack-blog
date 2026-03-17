/**
 * Memos 说说页面组件 - 支持图片和文件展示
 */

import { useState } from "react";
import type { MemosPost } from "../schema";

interface MemosPageProps {
  memos: MemosPost[];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * 处理内容：移除标签、保留换行
 */
function processContent(content: string): string {
  const lines = content.split("\n");
  const processedLines = lines.map((line) => {
    return line.replace(/^#\S+(\s|$)/, "").trim();
  });
  return processedLines.join("\n").trim();
}

/**
 * 说说项组件
 */
function MemosItem({ memo }: { memo: MemosPost }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  
  const processedContent = processContent(memo.content);
  const images = memo.images || [];
  const files = (memo as any).files || [];
  
  const handleImageClick = (url: string) => {
    setImageUrl(url);
    setIsOpen(true);
  };
  
  const ImageModal = () => {
    if (!isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      >
        <button
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl w-10 h-10 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
        <img
          src={imageUrl}
          alt="预览"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };
  
  return (
    <>
      <article className="relative pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[-3px] top-2 w-2 h-2 rounded-full bg-foreground/30" />
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/60">
            <time dateTime={memo.createdAt.toISOString()}>
              {formatDate(memo.createdAt)}
            </time>
            {memo.pinned && (
              <span className="text-primary font-medium">置顶</span>
            )}
          </div>
          
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {processedContent}
          </div>
          
          {/* 图片网格 */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {images.map((img, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(img)}
                >
                  <img 
                    src={img} 
                    alt={`图片 ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {files.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <span className="text-base">📎</span>
                  <span>{file.name}</span>
                </a>
              ))}
            </div>
          )}
          
          {/* 标签 */}
          {memo.tags && memo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {memo.tags.filter((t) => !t.startsWith("#")).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
      
      <ImageModal />
    </>
  );
}

/**
 * 说说页面主组件
 */
export function MemosPage({ memos }: MemosPageProps) {
  if (!memos || memos.length === 0) {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif mb-12">说说</h1>
        <p className="text-muted-foreground">暂无说说</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20 space-y-16">
      <h1 className="text-4xl md:text-5xl font-serif">说说</h1>
      
      <div className="space-y-12">
        {memos.map((memo) => (
          <MemosItem key={memo.id} memo={memo} />
        ))}
      </div>
    </div>
  );
}
