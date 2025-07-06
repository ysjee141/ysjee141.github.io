import {getPostData, getSortedPostsData} from '@/lib/markdown';
import "./page.scss"
import "prismjs/themes/prism-tomorrow.min.css"
import {Button, Divider, Flex, Tag} from "antd";
import React from "react";
import Title from "antd/lib/typography/Title";
import Text from "antd/lib/typography/Text";
import {CalendarOutlined, ClockCircleOutlined, ShareAltOutlined} from "@ant-design/icons";
import SchemaOrg from "@/component/schema-org";
import {Metadata} from "next";

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams(): Promise<PageProps['params'][]> {
  const posts = await getSortedPostsData();
  return posts.posts.map((post) => ({
    id: post.id,
  }));
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostData(id);

  return {
    title: post.title,
    description: post.title,
    openGraph: {
      title: post.title,
      description: post.title,
      url: `https://www.happlog.xyz/posts/${post.id}`,
      siteName: 'HAPPLOG',
      type: 'article',
    },
    alternates: {
      canonical: `https://www.happlog.xyz/posts/${post.id}`,
    },
  };
}


export default async function Page({params}: PageProps) {
  const {id} = await params;
  const post = await getPostData(id);
  const readingTime = calculateReadingTime(post.contentHtml);
  const DividerStyle: React.CSSProperties = {
    letterSpacing: '10px',
    color: 'var(--black-20)',
  }

  const TitleStyle: React.CSSProperties = {
    fontWeight: '700',
    fontSize: '3.4rem',
  }

  const FooterStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.6rem',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--blue-20)',
    borderRadius: '10px',
    padding: '2.4rem',
    marginTop: '4rem',
  }

  return (
    <>
      <SchemaOrg data={post} />
      <article className="max-w-4xl mx-auto py-8">
        <Title style={TitleStyle}>{post.title}</Title>
        <Flex gap={'small'} justify={'space-between'} wrap={'wrap'}>
          <Text style={{fontSize: '1.6rem'}}>
            <Flex gap={'small'} wrap={'wrap'}>
              <div>
                <CalendarOutlined/> {post.date}
              </div>
              <div>
                <ClockCircleOutlined/> {readingTime}분
              </div>
            </Flex>
          </Text>
          <div>
            {post.tags.map((tag) => (
              <Tag style={{fontSize: '1.4rem'}} bordered={false} color="blue" key={tag}>#{tag}</Tag>
            ))}
          </div>
        </Flex>
        <Divider style={DividerStyle}>HAPPLOG</Divider>
        <div
          className="prose lg:prose-xl"
          dangerouslySetInnerHTML={{__html: post.contentHtml}}
        />
        <footer style={FooterStyle}>
          <Text style={{fontSize: '1.6rem', color: 'var(--black-80)'}}>
            이 포스트가 유익하다면?
          </Text>
          <Button type="primary" size={'large'} icon={<ShareAltOutlined/>}>
            공유하기
          </Button>
        </footer>
      </article>
    </>
  );
}