/**
 * Memos 首页组件
 * 
 * 使用 Memos 数据渲染首页，与默认主题兼容
 */

import { Link, useRouteContext } from "@tanstack/react-router";
import { Github, Mail, Rss, Terminal } from "lucide-react";
import type { HomePageProps } from "@/features/theme/contract/pages";
import { m } from "@/paraglide/messages";
import type { MemosPostItem } from "../schema";

interface MemosHomePageComponentProps {
  posts: MemosPostItem[];
}

/**
 * Memos 版本的首页组件
 * 与默认主题的 HomePage props 兼容
 */
export function MemosHomePage({ posts }: MemosHomePageComponentProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-6 md:px-0 py-12 md:py-20 space-y-20">
      {/* Intro Section */}
      <section className="space-y-8">
        <header className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground flex items-center gap-4">
            {m.home_greeting()}{" "}
            <span className="animate-wave origin-[70%_70%]">👋</span>
          </h1>

          <div className="space-y-4 max-w-2xl text-base md:text-lg text-muted-foreground font-light leading-relaxed">
            <p>
              {m.home_intro_prefix()}{" "}
              <span className="text-foreground font-medium">
                {siteConfig.author}
              </span>
              {m.home_intro_separator()}
              {siteConfig.description}
            </p>
          </div>
        </header>

        <div className="flex items-center gap-6 text-muted-foreground">
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github size={20} strokeWidth={1.5} />
          </a>
          <a
            href="/rss.xml"
            target="_blank"
            className="hover:text-foreground transition-colors"
            rel="noreferrer"
            aria-label={m.rss_subscription()}
          >
            <Rss size={20} strokeWidth={1.5} />
          </a>
          <a
            href={`mailto:${siteConfig.social.email}`}
            className="hover:text-foreground transition-colors"
            aria-label={m.send_email()}
          >
            <Mail size={20} strokeWidth={1.5} />
          </a>
        </div>
      </section>

      {/* Memos Posts */}
      <section className="space-y-10">
        <h2 className="text-xl font-serif font-medium text-foreground tracking-tight flex items-center gap-2">
          {m.home_latest_posts()}
        </h2>

        <div className="space-y-8">
          {posts.map((post) => (
            <MemosPostItem key={post.id} post={post} />
          ))}
        </div>

        <div className="pt-8">
          <Link
            to="/posts"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Terminal size={14} />
            cd /posts
          </Link>
        </div>
      </section>
    </div>
  );
}

/**
 * Memos 文章项组件
 * 兼容默认主题的 PostItem 样式
 */
function MemosPostItem({ post }: { post: MemosPostItem }) {
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="group border-b border-border/40 last:border-0">
      <Link
        to="/post/$slug"
        params={{ slug: post.slug }}
        className="block py-8 md:py-10 transition-all duration-300 hover:pl-4"
      >
        <div className="flex flex-col gap-3">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono text-muted-foreground/60 tracking-wider">
            <time
              dateTime={post.publishedAt?.toISOString()}
              className="whitespace-nowrap"
            >
              {formatDate(post.publishedAt)}
            </time>
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="opacity-30">/</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-muted-foreground/60 whitespace-nowrap"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <h3
            className="text-2xl md:text-3xl font-serif font-medium text-foreground group-hover:text-foreground/70 transition-colors duration-300"
            style={{ viewTransitionName: `post-title-${post.slug}` }}
          >
            {post.title}
          </h3>

          <p className="text-muted-foreground font-light leading-relaxed max-w-2xl line-clamp-2 text-sm md:text-base font-sans mt-1 group-hover:text-muted-foreground/80">
            {post.summary}
          </p>
        </div>
      </Link>
    </div>
  );
}
