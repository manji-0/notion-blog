import { NextApiRequest, NextApiResponse } from 'next'
import BuildAtom from '../../lib/build-rss'

export default async function rss(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const data = await BuildAtom()
    res.status(200)
    res.setHeader('Content-Type', 'text/xml')
    res.end(data.toString())
}
