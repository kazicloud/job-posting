import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PublicJobsContent from '@/components/jobs/PublicJobsContent'
import { ConvexClientProvider } from '@/providers/ConvexClientProvider'

export default function JobsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-secondary">
        <ConvexClientProvider>
          <PublicJobsContent />
        </ConvexClientProvider>
      </main>
      <Footer />
    </>
  )
}
