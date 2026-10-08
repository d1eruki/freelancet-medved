import logoUrl from '../assets/branding/brand-logo.svg'
import { contacts } from '../data/contacts.js'

export function createStructuredData(page, assetUrl) {
  if (!page.canonicalUrl) return null

  const origin = new URL(page.canonicalUrl).origin
  const organizationId = `${origin}/#organization`
  const organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: contacts.general.title,
    legalName: 'ООО «ФАРТ СПБ»',
    url: `${origin}/`,
    logo: assetUrl(logoUrl),
    address: contacts.address,
    telephone: contacts.general.phone,
    email: contacts.general.email,
    contactPoint: [contacts.general, contacts.sales].map((contact) => ({
      '@type': 'ContactPoint',
      contactType: contact.label,
      telephone: contact.phone,
      email: contact.email,
    })),
  }
  const graph = [organization]

  if (page.type === 'category') {
    // Объём и характеристики относятся к конкретному варианту упаковки.
    const products = page.category.items.flatMap((item, itemIndex) => item.variants.map((variant, variantIndex) => ({
      '@type': 'Product',
      '@id': `${page.canonicalUrl}#product-${itemIndex + 1}-${variantIndex + 1}`,
      name: `${item.name}, ${variant.volume}`,
      description: `${item.description} ${variant.details ?? item.details}`,
      category: page.category.name,
      size: variant.volume,
      image: assetUrl(variant.image),
      url: page.canonicalUrl,
      manufacturer: { '@id': organizationId },
    })))

    graph.push({
      '@type': 'ItemList',
      '@id': `${page.canonicalUrl}#products`,
      url: page.canonicalUrl,
      name: page.category.name,
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: product,
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
