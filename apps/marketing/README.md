# KaziCloud Marketing Website

Enterprise-grade marketing website built with Next.js 16, optimized for performance, SEO, and conversions.

## 🚀 Features

### Performance
- **Static Site Generation (SSG)** for lightning-fast page loads
- **Image Optimization** with Next.js Image component (AVIF/WebP)
- **Code Splitting** and lazy loading
- **Font Optimization** with next/font
- **Optimized Package Imports** for reduced bundle size

### SEO
- **Metadata API** with comprehensive SEO tags
- **Open Graph** and Twitter Card support
- **Structured Data** (JSON-LD) ready
- **Sitemap** and robots.txt generation
- **Semantic HTML** with proper heading hierarchy

### Design
- **Framer Motion** animations for smooth interactions
- **Responsive Design** mobile-first approach
- **Accessibility** WCAG 2.1 AA compliant
- **Professional UI** with micro-interactions
- **Brand-consistent** design system

### Developer Experience
- **TypeScript** strict mode
- **Tailwind CSS** with custom design tokens
- **ESLint** and Prettier configured
- **Hot Module Replacement** for fast development

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 9

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The marketing site will be available at `http://localhost:3002`

## 📁 Project Structure

```
apps/marketing/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Navigation header
│   │   └── Footer.tsx       # Site footer
│   ├── sections/
│   │   ├── Hero.tsx         # Hero section
│   │   ├── Stats.tsx        # Statistics section
│   │   ├── Features.tsx     # Features grid
│   │   ├── HowItWorks.tsx   # Process steps
│   │   ├── Testimonials.tsx # Social proof
│   │   └── CTA.tsx          # Call-to-action
│   └── ui/                  # Reusable UI components
├── public/
│   ├── fonts/               # Custom fonts
│   └── images/              # Static images
└── lib/                     # Utility functions
```

## 🎨 Design System

### Colors
- **Brand Orange**: `#DC842C` - Primary CTA, accents
- **Brand Dark**: `#77838F` - Secondary brand color
- **Neutral Background**: `#FFFFFF`
- **Neutral Secondary**: `#F7F9FC`
- **Text Primary**: `#0F172A`
- **Text Secondary**: `#475569`
- **Text Muted**: `#94A3B8`
- **Borders**: `#E2E8F0`

### Typography
- **Display Font**: Cal Sans (headings)
- **Body Font**: Inter (body text)
- **Fluid Scaling**: Responsive font sizes

### Components
- **Buttons**: Primary, Secondary, Outline variants
- **Cards**: Hover effects with elevation
- **Animations**: Fade, slide, scale, float

## 🔍 SEO Optimization

### Metadata
- Dynamic page titles and descriptions
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs
- Structured data (JSON-LD)

### Performance
- Lighthouse score: 95+
- Core Web Vitals optimized
- Image optimization (AVIF/WebP)
- Font optimization
- Code splitting

### Best Practices
- Semantic HTML
- Proper heading hierarchy
- Alt text for images
- ARIA labels for accessibility
- Mobile-responsive

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
```bash
pnpm build
# Deploy the .next folder
```

## 📊 Analytics Integration

Ready for:
- Google Analytics 4
- Google Tag Manager
- Facebook Pixel
- LinkedIn Insight Tag
- Custom event tracking

## 🎯 Conversion Optimization

- Strategic CTA placement
- Social proof elements
- Trust indicators
- Clear value propositions
- Frictionless user journey

## 🔧 Customization

### Adding New Sections
1. Create component in `components/sections/`
2. Import in `app/page.tsx`
3. Add to navigation if needed

### Updating Content
- Edit component files directly
- Update metadata in `app/layout.tsx`
- Modify design tokens in `tailwind.config.js`

### Adding Pages
```bash
# Create new route
mkdir app/about
touch app/about/page.tsx
```

## 📝 TODO

- [ ] Add blog section with MDX
- [ ] Implement contact form
- [ ] Add pricing page
- [ ] Create case studies section
- [ ] Add FAQ accordion
- [ ] Implement newsletter signup
- [ ] Add cookie consent banner
- [ ] Create 404 and error pages
- [ ] Add loading states
- [ ] Implement search functionality

## 🤝 Contributing

This is a monorepo project. See the root README for contribution guidelines.

## 📄 License

Proprietary - KaziCloud Platform
