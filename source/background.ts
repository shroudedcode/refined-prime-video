import settings from './libs/settings'

browser.runtime.onMessage.addListener((message: any) => {
  if (message.event) submitEvent(message.event)
})

declare const __METRICS_ENDPOINT__: string | undefined
declare const __VERSION__: string

const endpoint = __METRICS_ENDPOINT__
const version = __VERSION__

async function submitEvent<E extends { type: string }>(event: E) {
  if (!endpoint) return

  const { region, uid } = await settings.getAll()
  await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ ...event, region, uid, version }),
    headers: new Headers({ 'content-type': 'application/json' }),
  })
}
