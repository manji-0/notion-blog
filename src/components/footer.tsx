import ExtLink from './ext-link'

export default () => (
  <>
    <footer>
      <p>(c) 2021 Wataru Manji</p>
      <p>
        This site is built by{' '}
        <ExtLink href="https://github.com/ijjk/notion-blog">
          notion-blog
        </ExtLink>
      </p>
      <p>
        <ExtLink href="https://manj.io/atom">RSS Feed</ExtLink>
      </p>
    </footer>
  </>
)
