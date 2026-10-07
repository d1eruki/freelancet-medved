const pageLoaders = {
  home: () => import('../components/home/HomePage.vue'),
  about: () => import('../components/about/AboutPage.vue'),
  catalog: () => import('../components/catalog/CatalogPage.vue'),
  category: () => import('../components/category/CategoryPage.vue'),
  contacts: () => import('../components/contacts/ContactsPage.vue'),
  horeca: () => import('../components/horeca/HorecaPage.vue'),
  legal: () => import('../components/legal/LegalPage.vue'),
  production: () => import('../components/production/ProductionPage.vue'),
}

export async function loadPageComponent(type) {
  const module = await (pageLoaders[type]
    ? pageLoaders[type]()
    : import('../components/not-found/NotFoundPage.vue'))
  return module.default
}
