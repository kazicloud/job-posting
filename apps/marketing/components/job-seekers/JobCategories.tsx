import { Code, Heart, DollarSign, Wrench, GraduationCap, Truck, Palette, Building } from 'lucide-react'

export default function JobCategories() {
  const categories = [
    { icon: Code, name: 'Technology & IT', count: '3,247' },
    { icon: Heart, name: 'Healthcare', count: '1,892' },
    { icon: DollarSign, name: 'Finance', count: '1,456' },
    { icon: Wrench, name: 'Engineering', count: '987' },
    { icon: GraduationCap, name: 'Education', count: '743' },
    { icon: Truck, name: 'Logistics', count: '621' },
    { icon: Palette, name: 'Creative', count: '534' },
    { icon: Building, name: 'Construction', count: '412' },
  ]

  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-text-primary mb-4">
            Browse jobs by category
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Explore opportunities across industries
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <a
              key={index}
              href={`/jobs?category=${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              className="group bg-white rounded-lg p-6 border border-border hover:border-brand-orange hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-brand-orange/10 group-hover:bg-brand-orange flex items-center justify-center mb-4 transition-colors">
                <category.icon className="w-6 h-6 text-brand-orange group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-text-primary mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-text-muted">
                {category.count} jobs
              </p>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/jobs"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-text-primary text-text-primary font-medium hover:bg-text-primary hover:text-white transition-colors"
          >
            View All Categories
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
