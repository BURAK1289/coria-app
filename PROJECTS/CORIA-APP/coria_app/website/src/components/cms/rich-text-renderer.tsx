'use client';

import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS, Document, Block, Inline } from '@contentful/rich-text-types';
import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Asset, Entry } from 'contentful';

interface RichTextRendererProps {
  document: Document | null | undefined;
  className?: string;
}

// Type guards
function isAsset(node: any): node is Asset {
  return node && node.sys && node.sys.type === 'Asset' && node.fields && node.fields.file;
}

function isEntry(node: any): node is Entry<any> {
  return node && node.sys && node.sys.type === 'Entry' && node.fields;
}

function hasImageDetails(file: any): file is { url: string; details: { image: { width: number; height: number } } } {
  return file && file.details && file.details.image && typeof file.details.image.width === 'number' && typeof file.details.image.height === 'number';
}

const renderOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text: ReactNode) => <strong className="font-semibold">{text}</strong>,
    [MARKS.ITALIC]: (text: ReactNode) => <em className="italic">{text}</em>,
    [MARKS.UNDERLINE]: (text: ReactNode) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text: ReactNode) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: ReactNode) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (node: Block | Inline, children: ReactNode) => (
      <h1 className="text-4xl font-bold mb-6 text-gray-900">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node: Block | Inline, children: ReactNode) => (
      <h2 className="text-3xl font-bold mb-5 text-gray-900">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node: Block | Inline, children: ReactNode) => (
      <h3 className="text-2xl font-bold mb-4 text-gray-900">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (node: Block | Inline, children: ReactNode) => (
      <h4 className="text-xl font-bold mb-3 text-gray-900">{children}</h4>
    ),
    [BLOCKS.HEADING_5]: (node: Block | Inline, children: ReactNode) => (
      <h5 className="text-lg font-bold mb-3 text-gray-900">{children}</h5>
    ),
    [BLOCKS.HEADING_6]: (node: Block | Inline, children: ReactNode) => (
      <h6 className="text-base font-bold mb-2 text-gray-900">{children}</h6>
    ),
    [BLOCKS.UL_LIST]: (node: Block | Inline, children: ReactNode) => (
      <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node: Block | Inline, children: ReactNode) => (
      <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node: Block | Inline, children: ReactNode) => (
      <li className="text-gray-700">{children}</li>
    ),
    [BLOCKS.QUOTE]: (node: Block | Inline, children: ReactNode) => (
      <blockquote className="border-l-4 border-coria-green pl-4 py-2 mb-4 italic text-gray-700 bg-gray-50">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-gray-300" />,
    [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline) => {
      const asset = node.data?.target;
      
      if (!isAsset(asset)) {
        return <div className="my-4 p-4 border border-red-200 rounded-lg text-red-600">Invalid asset</div>;
      }

      const { file, title, description } = asset.fields;
      if (!file || !file.url) {
        return <div className="my-4 p-4 border border-red-200 rounded-lg text-red-600">Invalid asset file</div>;
      }
      const url = typeof file.url === 'string' && file.url.startsWith('//') ? `https:${file.url}` : file.url;
      
      if (hasImageDetails(file)) {
        return (
          <div className="my-6">
            <Image
              src={typeof url === 'string' ? url : ''}
              alt={(title || description || 'Content image') as string}
              width={file.details.image.width}
              height={file.details.image.height}
              className="rounded-lg shadow-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            {typeof description === 'string' && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {description}
              </p>
            )}
          </div>
        );
      }
      
      // For non-image assets, show a download link
      return (
        <div className="my-4 p-4 border border-gray-200 rounded-lg">
          {typeof url === 'string' &&
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-coria-green hover:text-coria-green/80 font-medium"
            >
              📎 {typeof title === 'string' ? title : 'Download file'}
            </a>
          }
          {typeof description === 'string' && (
            <p className="text-sm text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
      );
    },
    [INLINES.HYPERLINK]: (node: Block | Inline, children: ReactNode) => {
      const uri = node.data?.uri;
      
      if (!uri || typeof uri !== 'string') {
        return <span>{children}</span>;
      }

      const isExternal = uri.startsWith('http');
      
      if (isExternal) {
        return (
          <a
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-coria-green hover:text-coria-green/80 underline"
          >
            {typeof children === 'string' ? children : null}
          </a>
        );
      }
      
      return (
        <Link
          href={uri}
          className="text-coria-green hover:text-coria-green/80 underline"
        >
          {typeof children === 'string' ? children : null}
        </Link>
      );
    },
    [INLINES.ENTRY_HYPERLINK]: (node: Block | Inline, children: ReactNode) => {
      const entry = node.data?.target;
      
      if (!isEntry(entry)) {
        return <span>{children}</span>;
      }

      if (entry.sys.contentType.sys.id === 'blogPost' && entry.fields.slug) {
        return (
          <Link
            href={`/blog/${entry.fields.slug}`}
            className="text-coria-green hover:text-coria-green/80 underline"
          >
            {typeof children === 'string' ? children : null}
          </Link>
        );
      }
      
      return <span>{typeof children === 'string' ? children : null}</span>;
    },
  },
};

export default function RichTextRenderer({ document, className = '' }: RichTextRendererProps) {
  if (!document) {
    return null;
  }
  
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {documentToReactComponents(document, renderOptions)}
    </div>
  );
}