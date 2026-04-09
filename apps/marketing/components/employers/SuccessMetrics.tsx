export default function SuccessMetrics() {
  const metrics = [
    { value: '50K+', label: 'Active candidates' },
    { value: '12K+', label: 'Jobs filled' },
    { value: '50%', label: 'Faster hiring' },
    { value: '94%', label: 'Success rate' },
  ]

  return (
    <section className="py-16 bg-text-primary text-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl font-bold mb-2">
                {metric.value}
              </div>
              <div className="text-white/70">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
