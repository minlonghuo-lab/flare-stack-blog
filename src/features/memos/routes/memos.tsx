/**
 * 说说页面路由
 * 
 * 访问 /memos 渲染 Memos 说说
 */

import { createFileRoute } from "@tanstack/react-router";
import { getMemosPageData } from "@/features/memos";
import { MemosPage } from "@/features/memos/pages/MemosPage";

export const Route = createFileRoute("/_public/memos")({
  component: MemosRoute,
  loader: async () => {
    const { memos } = await getMemosPageData();
    
    return {
      title: "说说",
      description: "日常碎碎念",
      memos,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.title,
      },
      {
        name: "description",
        content: loaderData?.description,
      },
    ],
  }),
});

function MemosRoute() {
  const { memos } = Route.useLoaderData();
  return <MemosPage memos={memos} />;
}
