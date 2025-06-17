import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {remark} from 'remark';
import html from 'remark-html';
import {excerpt} from "@/utils/string.util";
import remarkParse from "remark-parse";
import remarkRehype from 'remark-rehype';
import rehypePrism from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'posts');

type Category = {
  name: string,
  count: number
}

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const categories: Category[] = [];
  const tags: string[] = [];

  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the posts metadata section
    const matterResult = matter(fileContents);
    const existingCategory = categories.find(category => category.name === matterResult.data.category);

    if (existingCategory) {
      existingCategory.count += 1;
    } else {
      categories.push({ name: matterResult.data.category, count: 1 });
    }

    // categories.push(matterResult.data.category);
    tags.push(...matterResult.data.tags);
    // Combine the data with the id

    const published: boolean = matterResult.data.published === false;

    return {
      id,
      excerpt: excerpt(matterResult.content, 150),
      published: !published,
      ...(matterResult.data as { date: string; title: string; category: string; tags: string[], cover: string }),
    };
  }).filter(post => post.published);

  // Sort posts by date
  return {
    categories: categories,
    tags: Array.from(new Set(tags)),
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