import { KhanAPIVariables } from '../@types/extension-types';
import { getLatestMutation, getLatestQueryHash } from '@bhavjit/khan-api';
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
