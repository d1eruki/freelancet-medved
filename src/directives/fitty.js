import fitty from 'fitty'

const instances = new WeakMap()

export const vFitty = {
  mounted(element) {
    const instance = fitty(element, { multiLine: false })
    instances.set(element, instance)

    element.ownerDocument.fonts?.ready.then(() => {
      if (instances.get(element) === instance) {
        instance.fit()
      }
    })
  },
  unmounted(element) {
    instances.get(element)?.unsubscribe()
    instances.delete(element)
  },
}
