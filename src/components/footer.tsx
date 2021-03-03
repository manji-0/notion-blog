import ExtLink from './ext-link'

const Footer = () => (
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
        <ExtLink href="/atom">RSS Feed</ExtLink>
      </p>
    </footer>
  </>
)

export default Footer