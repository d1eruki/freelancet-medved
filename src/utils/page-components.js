const pageLoaders = {
  home: () => import('../pages/home/HomePage.vue'),
  about: () => import('../pages/about/AboutPage.vue'),
  catalog: () => import('../pages/catalog/CatalogPage.vue'),
  category: () => import('../pages/category/CategoryPage.vue'),
  contacts: () => import('../pages/contacts/ContactsPage.vue'),
  horeca: () => import('../pages/horeca/HorecaPage.vue'),
  legal: () => import('../pages/legal/LegalPage.vue'),
  production: () => import('../pages/production/ProductionPage.vue'),
}

export async function loadPageComponent(type) {
  const module = await (pageLoaders[type]
    ? pageLoaders[type]()
    : import('../pages/not-found/NotFoundPage.vue'))
  return module.default
}
