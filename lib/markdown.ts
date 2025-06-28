import fs from 'fs';
import path from 'path';
import matter, {GrayMatterFile} from 'gray-matter';
import {remark} from 'remark';
import html from 'remark-html';
import {excerpt} from "@/utils/string.util";
import remarkParse from "remark-parse";
import remarkRehype from 'remark-rehype';
import rehypePrism from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'posts');

export type Category = {
  name: string,
  count: number
}

export type PostItem = {
  id: string,
  excerpt: string,
  published: boolean,
  date: string,
  title: string,
  category: string,
  tags: string[],
  cover: string,
}

const getFileNames = <T>(callback: (id: string, contents: GrayMatterFile<string>) => T): T[] => {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {

    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return callback(id, matterResult);
  })
}

const getPostItem = (id: string, matter: GrayMatterFile<string>): PostItem => {

  const published: boolean = matter.data.published === false;

  return {
    id,
    excerpt: excerpt(matter.content, 150),
    published: !published,
    ...(matter.data as { date: string; title: string; category: string; tags: string[], cover: string }),
  };
}

export type PostListType = {
  posts: PostItem[],
  categories: Category[],
  tags: string[],
}

export const getCategorySortedPostData = async (category: string): Promise<PostListType> => {

  const allPostsData = getFileNames((id, matter) => getPostItem(id, matter))
    .filter(post => post.published && post.category === category);

  const {categories, tags} = getCategoriesAndTags()

  return {
    categories,
    tags,
    posts: allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    })
  };

}

export const getTagSortedPostData = async (tag: string): Promise<PostListType> => {

  const allPostsData = getFileNames((id, matter) => getPostItem(id, matter))
    .filter(post => post.published && post.tags.indexOf(tag) > -1);

  const {categories, tags} = getCategoriesAndTags()

  return {
    categories,
    tags,
    posts: allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    })
  };

}

const updateCategoryCount = (
  categories: Category[],
  categoryName: string
): void => {
  const existingCategory = categories.find(
    (category) => category.name === categoryName
  );

  if (existingCategory) {
    existingCategory.count += 1;
  } else {
    categories.push({ name: categoryName, count: 1 });
  }
};


const getCategoriesAndTags = (): { categories: Category[], tags: string[] } => {
  const categories: Category[] = [];
  const allTags: string[] = [];
  getFileNames((_, matter) => {
    if (matter.data.published === false) {
      return;
    }
    updateCategoryCount(categories, matter.data.category);
    allTags.push(...matter.data.tags);
  })
  return {
    categories,
    tags: Array.from(new Set(allTags)),
  };
}


export async function getSortedPostsData(): Promise<PostListType> {
  const allPostsData = getFileNames((id, contents) => getPostItem(id, contents))
    .filter(post => post.published);

  const {categories, tags} = getCategoriesAndTags()

  return {
    categories,
    tags,
    posts: allPostsData.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    })
  };
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the posts metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePrism)
    .use(rehypeStringify)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string; description: string; tags: string[] }),
  };
}