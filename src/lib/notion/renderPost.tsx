import React from 'react'
import dynamic from 'next/dynamic'
import Header from '../../components/header'
import Heading from '../../components/heading'
import components from '../../components/dynamic'
import ReactJSXParser from '@zeit/react-jsx-parser'
import blogStyles from '../../styles/blog.module.css'
import { textBlock } from '../../lib/notion/renderers'
import { getDateStr } from '../../lib/blog-helpers'
import Gist from 'super-react-gist'
import {TwitterTweetEmbed} from 'react-twitter-embed'

const Iframe = dynamic(() => import('react-iframe'))
const Img = dynamic(() => import('next/image'))

const listTypes = new Set(['bulleted_list', 'numbered_list'])

const RenderPost = ({ post }) => {
  let listTagName: string | null = null
  let listLastId: string | null = null
  let listMap: {
    [id: string]: {
      key: string
      isNested?: boolean
      nested: string[]
      children: React.ReactFragment
    }
  } = {}

  // if you don't have a post at this point, and are not
  // loading one from fallback then  redirect back to the index
  if (!post) {
    return (
      <div className={blogStyles.post}>
        <p>Woops! didn't find that post!</p>
      </div>
    )
  }

  return (
    <>
      <Header titlePre={post.Page} desc={post.Description} />
      <div className={blogStyles.post}>
        <h1>{post.Page || ''}</h1>
        {post.Authors.length > 0 && (
          <div className="authors">By: {post.Authors.join(' ')}</div>
        )}
        {post.Date && (
          <div className="posted">Posted: {getDateStr(post.Date)}</div>
        )}
        <hr />

        {(!post.content || post.content.length === 0) && (
          <p>This post has no content</p>
        )}

        {(post.content || []).map((block, blockIdx) => {
          const { value } = block
          const { type, properties, id, parent_id } = value
          const isLast = blockIdx === post.content.length - 1
          const isList = listTypes.has(type)
          let toRender = []

          if (isList) {
            listTagName = components[type === 'bulleted_list' ? 'ul' : 'ol']
            listLastId = `list${id}`

            listMap[id] = {
              key: id,
              nested: [],
              children: textBlock(properties.title, true, id),
            }

            if (listMap[parent_id]) {
              listMap[id].isNested = true
              listMap[parent_id].nested.push(id)
            }
          }

          if (listTagName && (isLast || !isList)) {
            toRender.push(
              React.createElement(
                listTagName,
                { key: listLastId! },
                Object.keys(listMap).map(itemId => {
                  if (listMap[itemId].isNested) return null

                  const createEl = item =>
                    React.createElement(
                      components.li || 'ul',
                      { key: item.key },
                      item.children,
                      item.nested.length > 0
                        ? React.createElement(
                            components.ul || 'ul',
                            { key: item + 'sub-list' },
                            item.nested.map(nestedId =>
                              createEl(listMap[nestedId])
                            )
                          )
                        : null
                    )
                  return createEl(listMap[itemId])
                })
              )
            )
            listMap = {}
            listLastId = null
            listTagName = null
          }

          const renderHeading = (Type: string | React.ComponentType) => {
            toRender.push(
              <Heading key={id}>
                <Type key={id}>{textBlock(properties.title, true, id)}</Type>
              </Heading>
            )
          }

          switch (type) {
            case 'bookmark':
              const title = value.properties.title[0][0]
              const link = value.properties.link[0][0]

              toRender.push(
                <p>
                  <Iframe
                    className="bookmark"
                    title={title}
                    url={`https://hatenablog-parts.com/embed?url=${link}`}
                    width="100%"
                    height="149"
                    loading="lazy"
                    position="relative"
                    frameBorder={0}
                  />
                </p>
              )
              break
            case 'table_of_contents':
              break
            case 'collection_view':
              console.log(value)
              toRender.push(
                <components.Table children={null} id={value.id} tableData={value.tableData} />
              )
              break
            case 'page':
              break
            case 'gist':
              const url = value.properties.source[0][0] as string
              toRender.push(<Gist url={url} />)
              break
            case 'tweet':
              const tweetUrl = properties.source[0][0]
              const pos = tweetUrl.indexOf('?')
              let tweetId = tweetUrl.substring(0, pos).split('/')[5]
              if (!tweetId) {
                tweetId = tweetUrl.split('/')[5]
              }
              toRender.push(
                <div className="twitter">
                  <TwitterTweetEmbed
                    key={id}
                    tweetId={tweetId}
                    options={{ margin: '0 auto;' }}
                  />
                </div>
              )
              break
            case 'divider':
              toRender.push(<hr className="article" />)
              break
            case 'text':
              if (properties) {
                toRender.push(textBlock(properties.title, false, id))
              }
              break
            case 'video':
              const { format = {} } = value
              const youtubeId = properties.source[0][0].match(/\?v=([^&]+)/)

              if (youtubeId) {
                const aspect_ratio = format.block_aspect_ratio as number
                const height = `${Math.round(aspect_ratio * 3840)}px`
                const aspect_int = `${Math.round(aspect_ratio * 100)}`

                toRender.push(
                  <Iframe
                    url={`https://youtube.com/embed/${youtubeId[1]}?wmode=transparent&playsinline=1&rel=0&hd=1`}
                    loading="lazy"
                    allow="accelerometer; fullscreen; encrypted-media; picture-in-picture; gyroscope"
                    width="100000px"
                    height={height}
                    className={`youtube-${aspect_int}`}
                    position="relative"
                    frameBorder={0}
                  />
                )
              } else {
                break
                // const display_source = format.display_source
                // toRender.push(
                //   <video
                //     src={`/api/asset?assetUrl=${encodeURIComponent(
                //       display_source as string
                //     )}&blockId=${id}`}
                //     preload="none"
                //     playsInline={true}
                //     disablePictureInPicture={true}
                //     width="100%"
                //     height="100%"
                //     controls={true}
                //     loop={true}
                //   />
                // )
              }

              break
            case 'embed':
              break
            case 'image': {
              const { format = {} } = value
              const { block_width, display_source, block_aspect_ratio } = format
              const width = block_width
              const height = Math.round(block_width * block_aspect_ratio)

              toRender.push(
                <Img
                  unoptimized={true}
                  key={id}
                  src={`/api/asset/${id}?assetUrl=${encodeURIComponent(
                    display_source as string
                  )}`}
                  width={width}
                  height={height}
                  layout="responsive"
                  className={blogStyles.postImg}
                />
              )
              break
            }
            case 'header':
              renderHeading('h1')
              break
            case 'sub_header':
              renderHeading('h2')
              break
            case 'sub_sub_header':
              renderHeading('h3')
              break
            case 'code': {
              if (properties.title) {
                const content = properties.title[0][0]
                const language = properties.language[0][0].toLowerCase()

                if (language === 'livescript') {
                  // this requires the DOM for now
                  toRender.push(
                    <ReactJSXParser
                      key={id}
                      jsx={content}
                      components={components}
                      componentsOnly={false}
                      renderInpost={false}
                      allowUnknownElements={true}
                      blacklistedTags={['script', 'style']}
                    />
                  )
                } else {
                  toRender.push(
                    <components.Code key={id} language={language || 'textfile'}>
                      {content}
                    </components.Code>
                  )
                }
              }
              break
            }
            case 'quote': {
              if (properties.title) {
                toRender.push(
                  React.createElement(
                    components.blockquote,
                    { key: id },
                    properties.title
                  )
                )
              }
              break
            }
            case 'callout': {
              toRender.push(
                <p>
                  <div className="callout" key={id}>
                    {value.format?.page_icon && (
                      <div>{value.format?.page_icon}</div>
                    )}
                    <div className="text">
                      {textBlock(properties.title, true, id)}
                    </div>
                  </div>
                </p>
              )
              break
            }
            case 'tweet': {
              if (properties.html) {
                toRender.push(
                  <div
                    dangerouslySetInnerHTML={{ __html: properties.html }}
                    key={id}
                  />
                )
              }
              break
            }
            case 'equation': {
              if (properties && properties.title) {
                const content = properties.title[0][0]
                toRender.push(
                  <components.Equation key={id} displayMode={true}>
                    {content}
                  </components.Equation>
                )
              }
              break
            }
            default:
              if (
                process.env.NODE_ENV !== 'production' &&
                !listTypes.has(type)
              ) {
                console.log('unknown type', type)
              }
              break
          }
          return toRender
        })}
      </div>
    </>
  )
}

export default RenderPost
