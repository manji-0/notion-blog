import Header from '../components/header'
import ExtLink from '../components/ext-link'
import Img from 'next/image'

import sharedStyles from '../styles/shared.module.css'
import contactStyles from '../styles/contact.module.css'

import GitHub from '../components/svgs/github'
import Twitter from '../components/svgs/twitter'
import Envelope from '../components/svgs/envelope'
import LinkedIn from '../components/svgs/linkedin'

const contacts = [
  {
    Comp: Twitter,
    alt: 'twitter icon',
    link: 'https://twitter.com/_manji0',
  },
  {
    Comp: GitHub,
    alt: 'github icon',
    link: 'https://github.com/manji-0',
  },
  {
    Comp: LinkedIn,
    alt: 'linkedin icon',
    link: 'https://www.linkedin.com/in/manji0',
  },
  {
    Comp: Envelope,
    alt: 'envelope icon',
    link: 'mailto:manji@linux.com',
  },
]

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 10,
  }
}

const Default = () => (
  <>
    <Header titlePre="Profile" />
    <div className={sharedStyles.layout}>
      <div className={contactStyles.avatar}>
        <Img
          src="/avatar.png"
          alt="avatar with Wataru Manji"
          height="125"
          width="125"
        />
      </div>

      <h1 style={{ marginTop: 0 }}>manji0</h1>

      <div className={contactStyles.name}>Wataru Manji</div>

      <div className={contactStyles.links}>
        {contacts.map(({ Comp, link, alt }) => {
          return (
            <ExtLink key={link} href={link} aria-label={alt}>
              <Comp height={32} width={32} />
            </ExtLink>
          )
        })}
      </div>
      <div className={contactStyles.text}>
        <p>Site Reliability Engineer @ Verda, LINE</p>
        <p>Expertise in OpenStack, Kubernetes, and Prometheus</p>
        <p>
          <ExtLink href="https://www.verda.fm/">verda.fm</ExtLink>をやってます。
        </p>
        <p>
          <ExtLink href="https://docs.google.com/document/d/1j4FUbrChetZ6T4UbacQ_cMoYiwnSBiMliFK2CaSZP7A">
            Resume
          </ExtLink>
        </p>
      </div>
    </div>
  </>
)

export default Default
