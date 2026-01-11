import Link from 'next/link';

interface IBackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: IBackLinkProps) {
  return (
    <Link href={href} className="text-sm font-medium text-primary hover:underline">
      ← {label}
    </Link>
  );
}

