// src/app/robots.ts
import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.happl.xyz/sitemap.xml'  // 실제 도메인으로 수정
  }
}