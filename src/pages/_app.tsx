import type { AppProps } from 'next/app';
import '../styles/globals.css';
import 'highlight.js/styles/github.css';
import { trpc } from '../utils/trpc';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { JetBrains_Mono } from 'next/font/google';
import React from 'react';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  }));
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={(pageProps as any)?.trpcState}>
          <div className={`${mono.variable} contents`}>
            <Component {...pageProps} />
          </div>
        </HydrationBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
