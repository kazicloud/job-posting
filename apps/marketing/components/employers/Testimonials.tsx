'use client'

export default function Testimonials() {
  const testimonials = [
    {
      quote: "We hire regularly, and this platform simplified the process. Clear pricing, good candidate reach, and a steady flow of qualified applicants. It's now part of our standard recruitment toolkit.",
      author: "Vincent Muderu",
      role: "Branch Manager",
      company: "Pheonix Capital",
      image: "/images/testimonials/testimony1.webp",
      avatar: "VM",
    },
    {
      quote: "We posted our role and started receiving relevant applications within days. The dashboard made it easy to track candidates, and the added visibility across social media helped us reach talent we wouldn't have found otherwise.",
      author: "Simon Oparah",
      role: "Mwezi Solar Co. LTD",
      company: "",
      image: "/images/testimonials/testimony2.webp",
      avatar: "SO",
    },
    {
      quote: "For hard-to-fill roles, the hiring support made a real difference. From shortlisting to interview coordination, the process was efficient and professional. We filled positions faster with better candidates.",
      author: "Lucy Mwangi",
      role: "Smart Pay Ltd",
      company: "",
      image: "/images/testimonials/testimony3.webp",
      avatar: "LM",
    },
  ]

  return (
    <section className="section-padding bg-neutral-secondary">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-text-primary mb-4">
            Trusted by hiring teams
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            See what companies say about hiring through KaziCloud
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-8 border border-border rounded-lg">
              <p className="text-lg text-text-secondary italic leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neutral-secondary overflow-hidden rounded-full flex-shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-text-primary font-bold">${testimonial.avatar}</div>`;
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold text-text-primary">{testimonial.author}</div>
                  <div className="text-sm text-text-muted">
                    {testimonial.company ? `${testimonial.role} - ${testimonial.company}` : testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
