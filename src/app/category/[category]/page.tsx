import {getCategorySortedPostData, getSortedPostsData} from "@/lib/markdown";
import {Layout, Typography} from "antd";
import PostList from "@/component/PostList";
import React from "react";
import Title from "antd/lib/typography/Title";
import SideNav from "@/component/SideNav";

interface PageProps {
  params: {
    category: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateStaticParams(): Promise<PageProps['params'][]> {
  const posts = await getSortedPostsData();
  return posts.posts.map((post) => {
    console.log(encodeURIComponent(post.category))
    return {
      category: encodeURIComponent(post.category),
    }
  });
}

export default async function Page({params}: PageProps) {
  let {category} = await params;
  category = decodeURIComponent(category);
  const data = await getCategorySortedPostData(category);
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
          <Title style={{margin: 0}} level={4}>Category: {category}</Title>
        </Typography>
        <PostList posts={data.posts}/>
      </Layout>
    </Layout>
  );
}