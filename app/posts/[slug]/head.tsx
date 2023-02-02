import BlogMeta from 'components/BlogMeta'
import * as demo from 'lib/demo.data'
import { getPostBySlug, getSettings } from 'lib/sanity.client'
import { urlForImage } from 'lib/sanity.image'

export default async function SlugHead({
  params,
}: {
  params: { slug: string }
}) {
  const [{ title = demo.title }, post] = await Promise.all([
    getSettings(),
    getPostBySlug(params.slug),
  ])
  return (
    <>
      <title>{post.title ? `${post.title} | ${title}` : title}</title>
      <link rel="canonical" href={`http://localhost:3000/${post.slug}`} />
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
