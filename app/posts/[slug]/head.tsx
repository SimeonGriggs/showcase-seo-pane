import BlogMeta from 'components/BlogMeta'
import { PreviewSuspense } from 'components/PreviewSuspense'
import * as demo from 'lib/demo.data'
import {
  getPostAndMoreStories,
  getPostBySlug,
  getSettings,
} from 'lib/sanity.client'
import { urlForImage } from 'lib/sanity.image'
import { previewData } from 'next/headers'

export default async function SlugHead({
  params,
}: {
  params: { slug: string }
}) {
  // Without a canonical URL, the SEO Pane cannot review the content
  // The Canonical URL must be derived from preview content
  if (previewData()) {
    const token = previewData().token || null
    const {post} = await getPostAndMoreStories(params.slug, token)

    return (
      <>
        {post?.title ? <title>{post.title}</title> : null}
        {post?.slug ? (
          <link
            rel="canonical"
            href={`http://localhost:3000/${post.slug}`}
          />
        ) : null}
      </>
    )
  }

  const [{ title = demo.title }, post] = await Promise.all([
    getSettings(),
    getPostBySlug(params.slug),
  ])

  return (
    <>
      <title>{post.title ? `${post.title} | ${title}` : title}</title>
      {post?.slug ? (
        <link rel="canonical" href={`http://localhost:3000/${post.slug}`} />
      ) : null}
      <meta name="description" content={post.excerpt} />
      <BlogMeta />
      {post.coverImage?.asset?._ref && (
        <meta
          property="og:image"
          content={urlForImage(post.coverImage)
            .width(1200)
            .height(627)
            .fit('crop')
            .url()}
        />
      )}
    </>
  )
}
