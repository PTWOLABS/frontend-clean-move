import { AppQueryClientProvider } from '@/shared/providers/query-client-provider';
import { ReactNode } from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppQueryClientProvider>{children}</AppQueryClientProvider>;
}
