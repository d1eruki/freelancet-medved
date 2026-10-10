export async function loadPageData(page) {
  if (page?.type === 'category') {
    const { catalogCategories } = await import('../data/catalog.js')
    return { category: catalogCategories.find((category) => category.slug === page.categorySlug) }
  }
  if (page?.type === 'legal') {
    const { legalContent } = await import('../data/legal-content.js')
    return { page: legalContent[page.legalKey] }
  }
  return {}
}
