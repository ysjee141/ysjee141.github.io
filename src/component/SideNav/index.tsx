import styles from "@/app/page.module.css";
import {Card, Flex, Tag} from "antd";
import {FolderOutlined, TagOutlined} from "@ant-design/icons";
import Link from "next/link";
import Sider from "antd/es/layout/Sider";
import React from "react";
import {Category} from "@/lib/markdown";

export type SideNavProps = {
  categories: Category[],
  tags: string[],
}

const SideNav = ({categories, tags}: SideNavProps) => {
  return (
    <Sider width={250} className={styles.sider}>
      <Card
        title={
          <><FolderOutlined/>&nbsp;Categories</>
        }
        style={{marginBottom: '2.4rem'}}
      >
        <Flex wrap gap={'small'} vertical>
          {categories.map((category) => (
            <Link href={`/category/${category.name}`} key={category.name} >
              <Flex justify={'space-between'} align={'center'} wrap gap={'small'}>
                <div>{category.name}</div>
                <div>({category.count})</div>
              </Flex>
            </Link>
          ))}
        </Flex>
      </Card>
      <Card
        title={
          <><TagOutlined />&nbsp;Tags</>
        }
      >
        <Flex wrap gap={'small'}>
          {tags.map((tag) => (
            <Link href={`/tag/${tag}`} key={tag}>
              <Tag color="blue" key={tag}>{tag}</Tag>
            </Link>
          ))}
        </Flex>
      </Card>
    </Sider>
  )
}

export default SideNav