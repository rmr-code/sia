import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  baseTextColor: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  baseTextColor,
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className={`text-2xl font-bold mb-4 ${baseTextColor}`}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className={`text-xl font-semibold mb-4 ${baseTextColor}`}
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p
            className={`text-base leading-relaxed mb-4 ${baseTextColor}`}
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol className={`list-decimal ml-6 ${baseTextColor}`} {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className={`list-disc ml-6 ${baseTextColor}`} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className={`${baseTextColor}`} {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className={`border-l-4 border-gray-300 pl-4 italic my-4 ${baseTextColor}`}
            {...props}
          />
        ),
        code: ({ node, children, ...props }) => (
          <pre className="bg-gray-800 text-white p-3 rounded-md my-4">
            <code className="whitespace-pre-wrap" {...props}>
              {children}
            </code>
          </pre>
        ),
        table: ({ node, ...props }) => (
          <table
            className="table-auto border-collapse border border-gray-300 w-full my-4"
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th
            className="border border-gray-300 px-4 py-2 text-left font-bold"
            {...props}
          />
        ),
        tr: ({ node, ...props }) => (
          <tr className="border border-gray-300" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="border border-gray-300 px-4 py-2" {...props} />
        ),
        a: ({ node, href, ...props }) => (
          <a href={href} className="text-blue-500 underline" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
