/**
 * Memos 说说页面 - 无限滚动
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { MemosPost } from "../schema";
import { m } from "@/paraglide/messages";
import { memosConfig } from "../config";
import { loadMoreMemos } from "../service";

interface MemosPageProps {
  initialMemos?: MemosPost[];
}

function formatDate(date: Date): string {
  const lang = typeof document !== "undefined" ? document.documentElement.lang || "zh" : "zh";
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function processContent(content: string): string {
  return content.split("\n").map(line => line.replace(/^#\S+(\s|$)/, "")).join("\n").trim();
}

function MemosItem({ memo }: { memo: MemosPost }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const images = (memo as any).images || [];

  return (
    <>
      <article className="relative pl-8">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[-3px] top-2 w-2 h-2 rounded-full bg-foreground/30" />
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/60">
            <time dateTime={memo.createdAt.toISOString()}>{formatDate(memo.createdAt)}</time>
            {memo.pinned && <span className="text-primary font-medium">{m.memos_pinned()}</span>}
          </div>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{processContent(memo.content)}</div>
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity" onClick={() => { setPreviewImage(img); setIsPreviewOpen(true); }}>
                  <img src={img} alt={\`\${m.memos_images()} \${idx + 1}\`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
          {memo.tags && memo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {memo.tags.filter(t => !t.startsWith("#")).map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl w-10 h-10" onClick={() => setIsPreviewOpen(false)}>✕</button>
          <img src={previewImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

export function MemosPage({ initialMemos = [] }: MemosPageProps) {
  const [memos, setMemos] = useState<MemosPost[]>(initialMemos);
  const [loading, setLoading] = useState(initialMemos.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 使用 ref 跟踪状态
  const pageTokenRef = useRef<string>("");
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载更多函数 - 使用 useCallback
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    
    isLoadingRef.current = true;
    setLoadingMore(true);
    
    try {
      const result = await loadMoreMemos(pageTokenRef.current);
      
      if (result.memos.length > 0) {
        setMemos(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMemos = result.memos.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMemos];
        });
      }
      
      pageTokenRef.current = result.nextPageToken;
      hasMoreRef.current = !!result.nextPageToken;
      setHasMore(!!result.nextPageToken);
    } catch (e) {
      console.error("Load more error:", e);
    } finally {
      isLoadingRef.current = false;
      setLoadingMore(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    if (initialMemos.length === 0) {
      loadMore().then(() => setLoading(false)).catch(() => { setError("加载失败"); setLoading(false); });
    }
  }, [loadMore, initialMemos]);

  // 无限滚动
  useEffect(() => {
    if (!sentinelRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(sentinelRef.current);
    
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  if (loading) {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">{m.memos_title()}</h1>
        <p className="text-muted-foreground mt-2">{m.memos_desc()}</p>
        <p className="text-center py-20 text-muted-foreground">{m.memos_loading()}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">{m.memos_title()}</h1>
        <p className="text-center py-20 text-destructive">{error}</p>
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">{m.memos_title()}</h1>
        <p className="text-muted-foreground mt-2">{m.memos_desc()}</p>
        <p className="text-center py-20 text-muted-foreground">{m.memos_no_content()}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20">
      <h1 className="text-4xl md:text-5xl font-serif mb-2">{m.memos_title()}</h1>
      <p className="text-muted-foreground mt-2">{m.memos_desc()}</p>
      <div className="space-y-12 mt-12">
        {memos.map(memo => <MemosItem key={memo.id} memo={memo} />)}
      </div>
      <div ref={sentinelRef} className="py-8 text-center">
        {loadingMore && <p className="text-muted-foreground">{m.memos_loading()}</p>}
        {!hasMore && memos.length > 0 && <p className="text-muted-foreground text-sm">- END -</p>}
      </div>
    </div>
  );
}
