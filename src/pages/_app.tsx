import type { AppProps } from 'next/app';
import '../styles/globals.css';
import 'highlight.js/styles/github.css';
import { trpc } from '../utils/trpc';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import React from 'react';

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
      links: [httpBatchLink({ url: '/api/trpc' })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={(pageProps as any)?.trpcState}>
          <Component {...pageProps} />
        </HydrationBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
