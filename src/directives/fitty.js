import fitty from 'fitty'

const instances = new WeakMap()

function disconnect(element) {
  instances.get(element)?.unsubscribe()
  instances.delete(element)
}

function syncFitty(element, binding) {
  if (binding.value === false) {
    disconnect(element)
    return
  }
  if (instances.has(element)) return
  const instance = fitty(element, { multiLine: false })
  instances.set(element, instance)

  if (element.ownerDocument.fonts?.status !== 'loaded') {
    element.ownerDocument.fonts?.ready.then(() => {
      if (instances.get(element) === instance) {
        instance.fit()
      }
    })
  }
}

export const vFitty = {
  mounted: syncFitty,
  updated: syncFitty,
  unmounted: disconnect,
}
