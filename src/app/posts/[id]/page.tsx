import { getPostData, getSortedPostsData } from '@/lib/markdown';
import "./page.scss"
import "prismjs/themes/prism-tomorrow.min.css"
import {Divider} from "antd";
import React from "react";
import Title from "antd/lib/typography/Title";
import Text from "antd/lib/typography/Text";

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams(): Promise<PageProps['params'][]>
{
  const posts = getSortedPostsData();
  return posts.posts.map((post) => ({
    id: post.id,
  }));
}

export default async function Page({ params }: PageProps) {
  const post = await getPostData(params.id);
  const DividerStyle: React.CSSProperties = {
    letterSpacing: '10px',
    color: 'var(--black-20)',
  }

  const TitleStyle: React.CSSProperties = {
    fontWeight: '700',
  }

  return (
    <article className="max-w-4xl mx-auto py-8">
      <Title style={TitleStyle}>{post.title}</Title>
      <Text>{post.date}</Text>
      <Divider style={DividerStyle}>HAPPLOG</Divider>
      <div
        className="prose lg:prose-xl"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}