// app/sitemap.ts
import { MetadataRoute } from 'next'
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 기본 URL 설정
  const baseUrl = 'https://www.happl.xyz'

  // 정적 경로
  const staticRoutes = [
    '',  // home page
    // 필요한 정적 경로 추가
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 1.0
  }))

  // posts 디렉토리의 모든 게시물에 대한 URL 생성
  // 여기서는 posts 디렉토리에서 파일을 읽어오는 예시입니다
  const postsDirectory = path.join(process.cwd(), 'posts')
  const postFiles = fs.readdirSync(postsDirectory)

  const postRoutes = postFiles.map(filename => ({
    url: `${baseUrl}/posts/${filename.replace(/\.md$/, '')}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 0.8
  }))

  return [...staticRoutes, ...postRoutes]
}
