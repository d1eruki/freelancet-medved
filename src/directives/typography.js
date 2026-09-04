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

function formatTextNodes(element) {
  const nodeFilter = element.ownerDocument.defaultView.NodeFilter
  const walker = element.ownerDocument.createTreeWalker(
    element,
    nodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue?.trim() || node.parentElement?.closest('code, pre, script, style, textarea, [data-typography-ignore]')) {
          return nodeFilter.FILTER_REJECT
        }

        return nodeFilter.FILTER_ACCEPT
      },
    },
  )

  let textNode = walker.nextNode()

  while (textNode) {
    textNode.nodeValue = preventHangingPrepositions(textNode.nodeValue)
    textNode = walker.nextNode()
  }
}

export const vTypography = {
  mounted: formatTextNodes,
  updated: formatTextNodes,
}
