import regions from './regions'
import settings from './settings'
import { Storefront, CollectionItem } from './api/types'

let baseUrl = null

export default async function fetchMyVideos(): Promise<Video[]> {
  const storefront = await fetchStorefront()

  const collection = storefront.collections.filter(c => c.edit)[0]
  if (!collection) throw new Error('No videos found!')

  browser.storage.local.set({ [await getCacheKey()]: collection.items as any })

  return collection.items.map(parseCollectionItem)
}

export async function getCachedVideos(): Promise<Video[]> {
  const key = await getCacheKey()
  const { [key]: items } = await browser.storage.local.get([key])
  if (!items) return []

  return (items as any).map(parseCollectionItem)
}

async function getCacheKey(): Promise<string> {
  const { region } = await settings.getAll()
  return `cachedVideoItems-${region}`
}

async function fetchStorefront(): Promise<Storefront> {
  baseUrl = await getBaseUrl()
  const endpointUrl = `${baseUrl}/gp/video/api/storefront`
  return (await (await fetch(endpointUrl)).json()) as Storefront
}

function parseCollectionItem(item: CollectionItem): Video {
  const id = item.titleID

  return {
    id,
    ...parseTitle(item.title),
    image: item.image.url,
    continueWatchingUrl: `${baseUrl}/gp/video/detail/${id}?autoplay=1`,
  }
}

async function getBaseUrl(): Promise<string> {
  const { region } = await settings.getAll()
  const { domain } = regions[region]
  return `https://www.${domain}`
}

const TITLE_PATTERN = /^(.+?)(?:[:\- ]+(\S+? \d+))?(?: (\[.+\]|\(.+\)))?$/

interface TitleInfo {
  title: string
  season: string
  titleSuffix: string
}

function parseTitle(sourceTitle: string): TitleInfo {
  const [, title, season, titleSuffix] = TITLE_PATTERN.exec(sourceTitle)
  return { title, season, titleSuffix }
}

interface Video {
  image: string
  continueWatchingUrl: string
  title: string
  season: string
  titleSuffix: string
  id: string
}
