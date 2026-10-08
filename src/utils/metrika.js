export const metrikaCounterId = 113558843

export function getMetrikaMarkup(hostname) {
  return {
    head: `<script type="text/javascript">
    (function () {
      if (location.hostname !== ${JSON.stringify(hostname)}) return;
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${metrikaCounterId}', 'ym');
      ym(${metrikaCounterId}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
    })();
    </script>`,
    body: `<noscript><div><img src="https://mc.yandex.ru/watch/${metrikaCounterId}" style="position:absolute; left:-9999px;" alt=""></div></noscript>`,
  }
}

export function trackMetrikaGoal(goal, params) {
  if (typeof window === 'undefined' || typeof window.ym !== 'function') return
  // Сбой аналитики не должен прерывать отправку формы или переход по ссылке.
  try {
    if (params) window.ym(metrikaCounterId, 'reachGoal', goal, params)
    else window.ym(metrikaCounterId, 'reachGoal', goal)
  } catch {
    // Счётчик может быть недоступен из-за блокировщика или расширения браузера.
  }
}

export function trackContactClicks() {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return
    const link = event.target.closest('a[href]')
    const href = link?.getAttribute('href') || ''
    if (href.startsWith('tel:')) trackMetrikaGoal('contact_phone_click')
    else if (href.startsWith('mailto:')) trackMetrikaGoal('contact_email_click')
  })
}
