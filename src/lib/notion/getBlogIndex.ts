import rpc, { values } from './rpc'
import createTable from './createTable'
import getTableData from './getTableData'
import { readFile, writeFile } from '../fs-helpers'
import { BLOG_INDEX_ID, BLOG_INDEX_CACHE } from './server-constants'

export default async function getBlogIndex(
  previews = true,
  include_future_posts = false
) {
  let postsTable: any = null
  const useCache = process.env.USE_CACHE === 'true'
  const cacheFile = `${BLOG_INDEX_CACHE}${previews ? '_previews' : ''}`

  if (useCache) {
    try {
      postsTable = JSON.parse(await readFile(cacheFile, 'utf8'))
    } catch (_) {
      /* not fatal */
    }
  }

  if (!postsTable) {
    try {
      const data = await rpc('loadPageChunk', {
        pageId: BLOG_INDEX_ID,
        limit: 999, // TODO: figure out Notion's way of handling pagination
        cursor: { stack: [] },
        chunkNumber: 0,
        verticalColumns: false,
      })

      // Parse table with posts
      const tableBlock = values(data.recordMap.block).find(
        (block: any) => block.value.type === 'collection_view'
      )

      postsTable = await getTableData(tableBlock, true)
    } catch (err) {
      console.warn(
        `Failed to load Notion posts, attempting to auto create table`
      )
      try {
        await createTable()
        console.log(`Successfully created table in Notion`)
      } catch (err) {
        console.error(
          `Auto creating table failed, make sure you created a blank page and site the id with BLOG_INDEX_ID in your environment`,
          err
        )
      }
      return {}
    }

    if (!include_future_posts) {
      const nowDate = Date.now()

      Object.keys(postsTable).forEach(slug => {
        if (postsTable[slug].Date > nowDate) {
          delete postsTable[slug]
        }
      })
    }

    if (useCache) {
      writeFile(cacheFile, JSON.stringify(postsTable), 'utf8').catch(() => {})
    }
  }

  return postsTable
}
