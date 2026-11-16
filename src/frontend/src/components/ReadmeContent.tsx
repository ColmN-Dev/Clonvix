import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'

interface ReadmeContentProps {
    content: string
    downloadUrl: string
    htmlUrl: string
}

export default function ReadmeContent({ content, downloadUrl, htmlUrl }: ReadmeContentProps) {
    return (
        <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
            components={{
                img({ src, alt, ...props }) {
                    const imageSrc = src ? new URL(src, downloadUrl).href : undefined

                    return <img src={imageSrc} alt={alt ?? ''} {...props} />
                },
                a({ href, children, ...props }) {
                    const linkHref = href && !href.startsWith('#') ? new URL(href, htmlUrl).href : href

                    return <a href={linkHref} {...props}>{children}</a>
                }
            }}
        >
            {content}
        </ReactMarkdown>
    )
}