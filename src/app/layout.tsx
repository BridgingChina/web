import type { ReactNode } from 'react';

// next-intl with [locale] segment requires a trivial root layout that passes
// children through. All actual <html>/<body>/providers live in
// src/app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
