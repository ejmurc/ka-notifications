import { KhanAPIVariables } from '../@types/extension-types';
import { StringMap } from '../@types/common-types';

const queries: StringMap = {};

export async function khanApiFetch(
  operationName: string,
  authToken?: string,
  variables: KhanAPIVariables = {},
): Promise<Response> {
  let query: string | null = null;
  if (queries[operationName] === undefined) {
    query = (await getLatestQuery(operationName)) || (await getLatestMutation(operationName));
    if (query === null) {
      throw new Error(`Failed to retrieve query ${operationName} from safelist.`);
    }
    queries[operationName] = query;
  }
  const requestURL = `https://www.khanacademy.org/api/internal/graphql/${operationName}?/fastly/`;
  const requestInit: RequestInit = {
    method: 'POST',
    headers: {
      ...(authToken && { cookie: `KAAS=${authToken}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operationName,
      query,
      variables,
    }),
  };

  const response = await fetch(requestURL, requestInit);
  if (response.status === 400) {
    query = (await getLatestQuery(operationName)) || (await getLatestMutation(operationName));
    if (query === null) {
      throw new Error(`Failed to retrieve query ${operationName} from safelist.`);
    }
    queries[operationName] = query;
    requestInit.body = JSON.stringify({
      operationName,
      query,
      variables,
    });
    return fetch(requestURL, requestInit);
  }
  return response;
}

export function getAuthToken(): Promise<string | undefined> {
  return new Promise<string | undefined>((resolve) => {
    chrome.cookies.get(
      {
        url: 'https://www.khanacademy.org',
        name: 'KAAS',
      },
      (cookie) => {
        resolve(cookie?.value);
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

export async function getLatestQuery(query: string): Promise<string | null> {
  const response = await fetch(`${SAFELIST_URL}/query/${query}`);
  if (response.status === 404) return null;
  const text = await response.text();
  return text;
}

export async function getLatestMutation(mutation: string): Promise<string | null> {
  const response = await fetch(`${SAFELIST_URL}/mutation/${mutation}`);
  if (response.status === 404) return null;
  const text = await response.text();
  return text;
}
