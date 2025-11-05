import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

const mySchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span || []),
      ['className'], // ✅ className 허용
    ],
  },
};

export default function MarkdownPreview({ value }: { value: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert scrollWidth3 w-full max-w-none overflow-y-auto rounded-lg p-4">
      <ReactMarkdown
        remarkPlugins={[remarkBreaks, remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, mySchema]]}
        components={{
          // H3 스타일
          h3: ({ children }) => <h3 className="text-foreground text-lg font-bold">{children}</h3>,
          // Bold 스타일
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          // 이미지 스타일
          img: ({ src, alt }) => {
            // 로컬 경로면 file:// 붙이기
            const safeSrc =
              src?.startsWith('/') && !src.startsWith('/Users')
                ? src
                : src?.startsWith('/Users')
                  ? `file://${src}`
                  : src;

            return (
              <img
                src={safeSrc}
                alt={alt ?? ''}
                className="max-h-[400px] rounded-md border object-contain"
              />
            );
          },
          // 리스트 스타일
          ul: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          span: ({ children, className }) => <span className={className}>{children}</span>,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
