import { KhanAPIVariables } from '../@types/extension-types';
import { StringMap } from '../@types/common-types';
import { MutationHashes } from '../@types/extension-types';

const hashes: MutationHashes = {};
const mutations: StringMap = {};

export async function khanApiMutation(
  mutationName: string,
  authToken: string,
  variables: KhanAPIVariables = {},
): Promise<Response> {
  let mutation: string | null | undefined = mutations[mutationName];
  if (mutation === undefined) {
    mutation = await getLatestMutation(mutationName);
    if (mutation === null) {
      throw new Error(`Failed to retrieve mutation ${mutationName} from safelist.`);
    }
    mutations[mutationName] = mutation;
  }
  const requestURL = `https://www.khanacademy.org/api/internal/graphql/${mutationName}?/fastly/`;
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      'X-KA-fkey': authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operationName: mutationName,
      query: mutation,
      variables,
    }),
  };
  return fetch(requestURL, requestInit);
}

export async function khanApiQuery(queryName: string, variables: KhanAPIVariables = {}): Promise<Response> {
  let hash: number | null | undefined = hashes[queryName];
  if (hash === undefined) {
    hash = await getLatestQueryHash(queryName);
    if (hash === null) {
      throw new Error(`Failed to retrieve hash ${queryName} from safelist.`);
    }
    hashes[queryName] = hash;
  }
  const url = `https://www.khanacademy.org/api/internal/graphql/${queryName}?hash=${hash}&variables=${encodeURIComponent(JSON.stringify(variables))}&/fastly/`;
  return fetch(url);
}

export function getAuthToken(): Promise<string> {
  return new Promise<string>((resolve) => {
    chrome.cookies.get(
      {
        url: 'https://www.khanacademy.org',
        name: 'fkey',
      },
      (cookie) => {
        resolve(cookie?.value ?? '');
      },
    );
  });
}

/**
 * Stolen code from @bhavjit/khan-api:
 * https://www.npmjs.com/package/@bhavjit/khan-api
 * Tree shaking wasn't working, so putting the functions manually saves
 * about 30kb from output size.
 */
const SAFELIST_URL = 'https://cdn.jsdelivr.net/gh/bhavjitChauhan/khan-api@safelist';

function hashQuery(document: string) {
  let hash = 5381,
    i = document.length;

  while (i) hash = (hash * 33) ^ document.charCodeAt(--i);
  return hash >>> 0;
}

async function getLatestQuery(query: string) {
  const response = await fetch(`${SAFELIST_URL}/query/${query}`);
  if (response.status === 404) return null;
  const text = await response.text();
  return text;
}

async function getLatestQueryHash(query: string) {
  const text = await getLatestQuery(query);
  if (!text) return null;
  return hashQuery(text);
}

async function getLatestMutation(mutation: string) {
  const response = await fetch(`${SAFELIST_URL}/mutation/${mutation}`);
  if (response.status === 404) return null;
  const text = await response.text();
  return text;
}
