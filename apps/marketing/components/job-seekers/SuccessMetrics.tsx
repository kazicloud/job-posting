export default function SuccessMetrics() {
  const metrics = [
    { value: '50K+', label: 'Jobs filled' },
    { value: '12K+', label: 'Active jobs' },
    { value: '2.3hrs', label: 'Avg. response time' },
    { value: '94%', label: 'Success rate' },
  ]

  return (
    <section className="py-16 bg-white rounded-lg border-y border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold text-text-primary mb-2">
                {metric.value}
              </div>
              <div className="text-text-muted">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
