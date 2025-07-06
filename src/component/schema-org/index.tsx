import {PostData} from "@/lib/markdown";

interface SchemaOrgProps {
  data: PostData;
}

const SchemaOrg = ({data}: SchemaOrgProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.title,
          "author": {
            "@type": "Person",
            "name": "happ(지윤성)"
          },
          "datePublished": data.date
        })
      }}
    />
  )
}

export default SchemaOrg;