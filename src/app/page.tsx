import {getSortedPostsData} from "@/lib/markdown";
import React from "react";
import {Layout} from "antd";
import PostList from "@/component/PostList";
import SideNav from "@/component/SideNav";

export default async function Home() {
  const data = await getSortedPostsData();

  return (
    <Layout hasSider={true} style={{backgroundColor: 'var(----foreground)'}}>
      <SideNav categories={data.categories} tags={data.tags}/>
      <Layout style={{backgroundColor: 'var(--background)'}}>
        <PostList posts={data.posts} />
      </Layout>
    </Layout>
  );
}
