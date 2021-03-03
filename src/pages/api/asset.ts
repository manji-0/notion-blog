import { NextApiRequest, NextApiResponse } from 'next'
import getNotionAssetUrls from '../../lib/notion/getNotionAssetUrls'
import { setHeaders, handleData, handleError } from '../../lib/notion/utils'

export default async function notionApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (setHeaders(req, res)) return
  try {
    const { assetUrl, blockId } = req.query as { [k: string]: string }

    if (!assetUrl || !blockId) {
      handleData(res, {
        status: 'error',
        message: 'asset url or blockId missing',
      })
    } else {
      // we need to re-encode it since it's decoded when added to req.query
      const { signedUrls = [], ...urlsResponse } = await getNotionAssetUrls(
        res,
        assetUrl,
        blockId
      )

      if (signedUrls.length === 0) {
        console.error('Failed to get signedUrls', urlsResponse)
        return handleData(res, {
          status: 'error',
          message: 'Failed to get asset URL',
        })
      }

      const content = await fetch(signedUrls[0])
      const data = await content.blob()
      const binary = Buffer.from(await data.arrayBuffer())

      res.setHeader('content-type', content.headers.get('content-type'))
      res.setHeader('content-length', content.headers.get('content-length'))
      res.setHeader('accept-ranges', 'byte')
      res.setHeader('last-modified', content.headers.get('last-modified'))
      res.setHeader('cache-control', 'public, s-max-age=7200s, stale-while-revalidate')
      res.status(200)
      res.end(binary, "binary")
    }
  } catch (error) {
    handleError(res, error)
  }
}
