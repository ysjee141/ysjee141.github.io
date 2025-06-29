// src/app/robots.ts
import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/*', '/admin/*']  // 필요한 경우 제외할 경로 설정
    },
    sitemap: 'http://www.happl.xyz/sitemap.xml'  // 실제 도메인으로 수정
  }
}