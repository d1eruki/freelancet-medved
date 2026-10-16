const shortWords = 'а|без|в|во|если|да|до|для|за|и|или|из|к|ко|как|ли|на|но|не|ни|о|об|обо|от|по|про|при|под|с|со|то|у'
const afterShortWord = new RegExp(`(^|[ \u00a0(«‹»›„“‟”"])(${shortWords}) `, 'gim')
const protectedText = /(?:https?|file|ftp):\/\/[a-zA-Z0-9/+-=%&:_.~?]+[a-zA-Z0-9#+]*/g

function formatPlainText(text) {
  return text
    .replace(afterShortWord, '$1$2\u00a0')
    .replace(afterShortWord, '$1$2\u00a0')
    .replace(/([0-9A-Za-zА-Яа-яЁё])-(?=[0-9A-Za-zА-Яа-яЁё])/g, '$1‑')
}

// This directive receives DOM text nodes, not HTML markup. Keep URL text intact.
export function preventHangingPrepositions(text) {
  let offset = 0
  let result = ''
  for (const match of text.matchAll(protectedText)) {
    result += formatPlainText(text.slice(offset, match.index)) + match[0]
    offset = match.index + match[0].length
  }
  return result + formatPlainText(text.slice(offset))
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
  unmounted(element) {
    observers.get(element)?.disconnect()
    observers.delete(element)
  },
}
