import fetch from 'node-fetch'

type DuckApiResponse = {
    url: string
    message: string
  }

export async function getRandomDuckImage(): Promise<string> {
  const res = await fetch('https://random-d.uk/api/random')
  const data = await res.json() as DuckApiResponse
  return data.url
}