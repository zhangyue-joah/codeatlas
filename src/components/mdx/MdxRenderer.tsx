import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/mdxComponents';

export function MdxRenderer({ source, variant = 'page' }: { source: string; variant?: 'page' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <div className="mx-auto max-w-3xl">
        <MDXRemote source={source} components={mdxComponents} />
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <MDXRemote source={source} components={mdxComponents} />
      </div>
    </div>
  );
}
