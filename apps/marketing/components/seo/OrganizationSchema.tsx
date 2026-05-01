import JsonLd from './JsonLd'

/**
 * Site-wide Organization + WebSite schema (Google Sitelinks Searchbox).
 * Rendered once in the root layout body — inherited by every page.
 * Mirrors what LinkedIn, Indeed, and Glassdoor inject at the document root.
 */
export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://kazicloud.com/#organization',
        name: 'Kazicloud',
        alternateName: ['Kazi Cloud', 'KaziCloud Jobs'],
        url: 'https://kazicloud.com',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://kazicloud.com/#logo',
          url: 'https://kazicloud.com/logo.png',
          contentUrl: 'https://kazicloud.com/logo.png',
          width: 200,
          height: 60,
          caption: 'Kazicloud',
        },
        image: { '@id': 'https://kazicloud.com/#logo' },
        description:
          "East Africa's leading job platform connecting talented professionals with top employers across Kenya, Uganda, Rwanda and Tanzania.",
        foundingDate: '2024',
        numberOfEmployees: { '@type': 'QuantitativeValue', value: 20 },
        areaServed: [
          {
            '@type': 'Country',
            name: 'Kenya',
            sameAs: 'https://www.wikidata.org/wiki/Q114',
          },
          {
            '@type': 'Country',
            name: 'Uganda',
            sameAs: 'https://www.wikidata.org/wiki/Q1036',
          },
          {
            '@type': 'Country',
            name: 'Rwanda',
            sameAs: 'https://www.wikidata.org/wiki/Q1037',
          },
          {
            '@type': 'Country',
            name: 'Tanzania',
            sameAs: 'https://www.wikidata.org/wiki/Q924',
          },
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: 'hello@kazicloud.com',
            contactType: 'customer service',
            areaServed: ['KE', 'UG', 'RW', 'TZ'],
            availableLanguage: 'English',
          },
          {
            '@type': 'ContactPoint',
            email: 'employers@kazicloud.com',
            contactType: 'sales',
            areaServed: ['KE', 'UG', 'RW', 'TZ'],
            availableLanguage: 'English',
          },
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Nairobi',
          addressRegion: 'Nairobi County',
          addressCountry: 'KE',
        },
        sameAs: [
          'https://twitter.com/kazicloud',
          'https://linkedin.com/company/kazicloud',
          'https://facebook.com/kazicloud',
          'https://instagram.com/kazicloud',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kazicloud.com/#website',
        url: 'https://kazicloud.com',
        name: 'Kazicloud',
        description:
          "East Africa's leading job platform – find verified jobs in Kenya, Uganda, Rwanda and Tanzania.",
        inLanguage: 'en',
        publisher: { '@id': 'https://kazicloud.com/#organization' },
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate:
                'https://kazicloud.com/jobs?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
    ],
  }

  return <JsonLd schema={schema} />
}
