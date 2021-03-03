import { NextApiRequest, NextApiResponse } from 'next'
import { handleError } from '../../lib/notion/utils'
import { readFile } from '../../lib/fs-helpers'

export default async function Atom(
    req: NextApiRequest,
    res: NextApiResponse
    ) {
    const inputPath = './built-atom'
    const data = await readFile(inputPath)
    try {
        res.setHeader('content-type', 'text/xml')
        res.status(200)
        res.end(data, "utf8")
    } catch (error) {
        handleError(res, error)
    }
}