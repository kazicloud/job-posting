import { ConvexClientProvider } from '@/providers/ConvexClientProvider'

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>
}
