'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { css } from '../../../styled-system/css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const markdownStyles = css({
    '& p': {
      mb: '2',
      lineHeight: 'relaxed'
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      fontWeight: 'bold',
      mb: '2',
      mt: '4',
      _first: { mt: '0' }
    },
    '& h1': { fontSize: 'xl' },
    '& h2': { fontSize: 'lg' },
    '& h3': { fontSize: 'md' },
    '& ul, & ol': {
      pl: '4',
      mb: '2'
    },
    '& li': {
      mb: '1'
    },
    '& code': {
      bg: 'gray.100',
      px: '1',
      py: '0.5',
      rounded: 'sm',
      fontSize: 'sm',
      fontFamily: 'mono'
    },
    '& pre': {
      bg: 'gray.100',
      p: '3',
      rounded: 'md',
      overflow: 'auto',
      mb: '3'
    },
    '& pre code': {
      bg: 'transparent',
      p: '0'
    },
    '& blockquote': {
      borderLeft: '4px solid',
      borderLeftColor: 'gray.300',
      pl: '4',
      py: '2',
      bg: 'gray.50',
      mb: '3',
      fontStyle: 'italic'
    },
    '& a': {
      color: 'primary.600',
      textDecoration: 'underline',
      _hover: { color: 'primary.700' }
    },
    '& strong': {
      fontWeight: 'bold'
    },
    '& em': {
      fontStyle: 'italic'
    },
    '& hr': {
      border: 'none',
      borderTop: '1px solid',
      borderTopColor: 'gray.200',
      my: '4'
    },
    '& table': {
      w: 'full',
      borderCollapse: 'collapse',
      mb: '3'
    },
    '& th, & td': {
      border: '1px solid',
      borderColor: 'gray.200',
      px: '3',
      py: '2',
      textAlign: 'left'
    },
    '& th': {
      bg: 'gray.50',
      fontWeight: 'bold'
    }
  });

  return (
    <div className={`${markdownStyles} ${className || ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
