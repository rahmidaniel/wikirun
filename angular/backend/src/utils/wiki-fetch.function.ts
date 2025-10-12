import { baseWikiUrl } from './constants';

export async function wikiFetch<R>(params: URLSearchParams): Promise<R> {
  const response = await fetch(`${baseWikiUrl}?${params}`);

  if (!response.ok) {
    throw new Error(`HTTP error! ${response.status}`);
  }

  return (await response.json()) as R;
}
