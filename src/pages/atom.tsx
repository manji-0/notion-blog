import BuildAtom from '../lib/build-rss'

export const getServerSideProps = async (context) => {
    const data = await BuildAtom()
    const dataString = data.toString()
    context.res.status = 200
    context.res.setHeader('Content-Type', 'text/xml')
    context.res.end(dataString)

    return {
        props: {}
    }
}

const Page = () => null

export default Page
