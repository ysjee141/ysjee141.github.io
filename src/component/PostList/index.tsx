import {Card, Flex, Tag} from "antd";
import Link from "next/link";
import styles from "@/app/page.module.css";
import {CalendarOutlined} from "@ant-design/icons";
import React from "react";
import {PostItem} from "@/lib/markdown";

export type PostListProps = {
  posts: PostItem[]
}

const PostList = ({posts}: PostListProps) => {
  return (
    <Flex wrap gap={'large'} style={{backgroundColor: 'white'}}>
      {posts.map((post) => (
        <Link href={`/posts/${post.id}`} key={post.id} className={styles.article}>
          <Card
            hoverable
            key={post.id}
          >
            <h1>{post.title}</h1>
            <pre style={{textWrap: 'wrap'}}>{post.excerpt}</pre>
            <ul className={styles.meta}>
              <li>
                <CalendarOutlined />&nbsp;
                {post.date}
              </li>
              <li>
                <Tag color="blue">{post.category}</Tag>
              </li>
            </ul>
          </Card>
        </Link>
      ))}
    </Flex>
  );
};

export default PostList;