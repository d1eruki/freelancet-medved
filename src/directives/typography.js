import Typograf from 'typograf'

Typograf.addRule({
  name: 'common/nbsp/nonBreakingHyphenatedWord',
  handler(text) {
    return text.replace(/([0-9A-Za-zА-Яа-яЁё])-(?=[0-9A-Za-zА-Яа-яЁё])/g, '$1‑')
  },
})

const typograf = new Typograf({ locale: ['ru'] })

typograf.disableRule('*')
typograf.enableRule('common/nbsp/afterShortWordByList')
typograf.enableRule('common/nbsp/nonBreakingHyphenatedWord')

export function preventHangingPrepositions(text) {
  return typograf.execute(text)
}

const observers = new WeakMap()

function shouldIgnoreTextNode(node) {
  return !node.nodeValue?.trim() || node.parentElement?.closest('code, pre, script, style, textarea, [data-typography-ignore]')
}

function formatTextNode(node) {
  if (shouldIgnoreTextNode(node)) {
    return
  }

  const formattedText = preventHangingPrepositions(node.nodeValue)

  if (formattedText !== node.nodeValue) {
    node.nodeValue = formattedText
  }
}

function formatTextNodes(element) {
  const nodeFilter = element.ownerDocument.defaultView.NodeFilter
  const walker = element.ownerDocument.createTreeWalker(
    element,
    nodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (shouldIgnoreTextNode(node)) {
          return nodeFilter.FILTER_REJECT
        }

        return nodeFilter.FILTER_ACCEPT
      },
    },
  )

  let textNode = walker.nextNode()

  while (textNode) {
    formatTextNode(textNode)
    textNode = walker.nextNode()
  }
}

function observeTextNodes(element) {
  const MutationObserver = element.ownerDocument.defaultView.MutationObserver
  const Node = element.ownerDocument.defaultView.Node
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        formatTextNode(mutation.target)
        continue
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          formatTextNode(node)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          formatTextNodes(node)
        }
      }
    }
  })

  observer.observe(element, {
    characterData: true,
    childList: true,
    subtree: true,
  })
  observers.set(element, observer)
}

export const vTypography = {
  mounted(element) {
    formatTextNodes(element)
    observeTextNodes(element)
  },
  updated: formatTextNodes,
  unmounted(element) {
    observers.get(element)?.disconnect()
    observers.delete(element)
  },
}
