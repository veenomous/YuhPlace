import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <span className="text-3xl font-bold text-primary">YuhPlace</span>
      </Link>

      {/* Card container */}
      <div className="w-full max-w-sm">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted text-center">
        Your place for Guyana
      </p>
    </div>
  );
}
