import {getSortedPostsData, getTagSortedPostData} from "@/lib/markdown";
import {Layout, Typography} from "antd";
import PostList from "@/component/PostList";
import React from "react";
import Title from "antd/lib/typography/Title";
import SideNav from "@/component/SideNav";

interface PageProps {
  params: {
    tag: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams(): Promise<PageProps['params'][]> {
  const posts = await getSortedPostsData();
  const tags = posts.posts.flatMap((post) => post.tags)
  return tags.map((tag) => {
    return {
      tag: tag,
    }
  });
}

export default async function Page({params}: PageProps) {
  const { tag } = await params;
  const data = await getTagSortedPostData(tag);
  const titleStyle: React.CSSProperties = {
    backgroundColor: 'var(--black-10)',
    padding: '1.4rem',
    borderRadius: '10px',
    marginBottom: '2.4rem',
  }
  return (
    <Layout hasSider={true} style={{backgroundColor: 'var(----foreground)'}}>
      <SideNav categories={data.categories} tags={data.tags}/>
      <Layout style={{backgroundColor: 'var(--background)'}}>
        <Typography style={titleStyle}>
          <Title style={{margin: 0}} level={4}>Tag: #{tag}</Title>
        </Typography>
        <PostList posts={data.posts} />
      </Layout>
    </Layout>
  );
}