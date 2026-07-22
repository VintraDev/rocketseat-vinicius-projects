import ReactMarkdown from "react-markdown"
import remarkGfm from "@swarmica/remark-gfm"

type MarkdownProps = {
    content: string,
    className?: string;
}

export function Markdown({ content }: MarkdownProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => (
                    <h1 className="mb-4 text-heading-md md:text-heading-xl">{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 className="mb-4 mt-8 text-heading-sm md:text-heading-lg">{children}</h2>
                ),
                p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-gray-200">{children}</p>
                ),
                a: ({ children, href }) => (
                    <a className="text-blue-200 hover:underline" href={href}>{children}</a>
                ),
                strong: ({ children }) => (
                    <strong className="font-extrabold text-gray-100 ">{children}</strong>
                )
            }}
        >
            {content}
        </ReactMarkdown>
    )
}