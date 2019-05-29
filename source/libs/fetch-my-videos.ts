import settings from './settings'
import sites from './sites'

let baseUrl = null

export default async function fetchMyVideos() {
  const storefront = await fetchStorefront()

  const collection = storefront.collections.filter(c => c.edit)[0]
  if (!collection) throw new Error('No videos found!')

  return collection.items.map(parseCollectionItem)
}

async function fetchStorefront() {
  baseUrl = await getBaseUrl()
  const endpointUrl = `${baseUrl}/gp/video/api/storefront`
  return (await (await fetch(endpointUrl)).json()) as Storefront
}

function parseCollectionItem(item: Item) {
  const id = item.titleID

  return {
    id,
    ...parseTitle(item.title),
    image: item.image.url,
    continueWatchingUrl: `${baseUrl}/gp/video/detail/${id}?autoplay=1`,
  }
}

async function getBaseUrl() {
  const { preferredSite } = await settings.getAll()
  const { domainSuffix } = sites[preferredSite]
  return `https://www.amazon.${domainSuffix}`
}

const TITLE_PATTERN = /^(?<title>.+?)(?:[:\- ]+(?<season>(?:Season|Staffel) \d+))?(?: (?<titleSuffix>\[.+\]|\(.+\)))?$/

function parseTitle(title: string) {
  return TITLE_PATTERN.exec(title).groups as {
    title: string,
    season?: string,
    titleSuffix?: string,
  }
}

interface Storefront {
  collections: Collection[]
}

interface Collection {
  text: string
  items: Item[]
  edit?: any
}

interface Item {
  link: Image
  image: Image
  title: string
  titleID: string
  edit?: any
}

interface Image {
  url: string
}
