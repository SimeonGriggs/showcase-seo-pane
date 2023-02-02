// This plugin is responsible for adding a “Preview” tab to the document pane
// You can add any React component to `S.view.component` and it will be rendered in the pane
// and have access to content in the form in real-time.
// It's part of the Studio's “Structure Builder API” and is documented here:
// https://www.sanity.io/docs/structure-builder-reference

import { getSecret } from 'plugins/productionUrl/utils'
import { DefaultDocumentNodeResolver } from 'sanity/desk'
import { SEOPane } from 'sanity-plugin-seo-pane'
import authorType from 'schemas/author'
import postType from 'schemas/post'
import { suspend } from 'suspend-react'

import AuthorAvatarPreviewPane from './AuthorAvatarPreviewPane'
import PostPreviewPane, { fetchSecret } from './PostPreviewPane'

function resolvePreviewUrl(options) {
  const {
    apiVersion = `v2023-01-13`,
    previewSecretId = 'preview.secret',
    slug,
    getClient,
  } = options
  const client = getClient({ apiVersion })

  const secret = suspend(
    () => getSecret(client, previewSecretId, true),
    ['getSecret', previewSecretId, fetchSecret],
    // The secret fetch has a TTL of 1 minute, just to check if it's necessary to recreate the secret which has a TTL of 60 minutes
    { lifespan: 60000 }
  )

  const url = new URL('/api/preview', location.origin)
  url.searchParams.set('slug', slug)
  if (secret) {
    url.searchParams.set('secret', secret)
  }
  return url.toString()
}

export const previewDocumentNode = ({
  apiVersion,
  previewSecretId,
}: {
  apiVersion: string
  previewSecretId: `${string}.${string}`
}): DefaultDocumentNodeResolver => {
  return (S, { schemaType, getClient }) => {
    switch (schemaType) {
      case authorType.name:
        return S.document().views([
          S.view.form(),
          S.view
            .component(({ document }) => (
              <AuthorAvatarPreviewPane
                name={document.displayed.name as any}
                picture={document.displayed.picture as any}
              />
            ))
            .title('Preview'),
        ])

      case postType.name:
        return S.document().views([
          S.view.form(),
          S.view
            .component(({ document }) => (
              <PostPreviewPane
                slug={document.displayed.slug?.current}
                apiVersion={apiVersion}
                previewSecretId={previewSecretId}
              />
            ))
            .title('Preview'),
          S.view
            .component(SEOPane)
            .options({
              keywords: `seo.keywords`,
              synonyms: `seo.synonyms`,
              url: async (doc) => {
                console.log(`previewUrl`, resolvePreviewUrl({ slug: doc?.slug?.current, getClient }))

                return await resolvePreviewUrl({ slug: doc?.slug?.current, getClient })
              },
            })
            .title('SEO'),
        ])

      default:
        return null
    }
  }
}
