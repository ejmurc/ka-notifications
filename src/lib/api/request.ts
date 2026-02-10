import type { OperationName, QueryCache, GraphQLVariables } from '../../types/api';
import { SAFELIST_URL, KHAN_API_BASE_URL } from '../constants';

const queryCache: QueryCache = {};

export async function request(
  operationName: OperationName,
  token?: string,
  variables?: GraphQLVariables,
): Promise<Response> {
  if (!queryCache[operationName]) {
    const query = (await getLatestQuery(operationName)) || (await getLatestMutation(operationName));
    if (!query) {
      throw new Error(`Failed to retrieve query ${operationName} from safelist.`);
    }
    queryCache[operationName] = query;
  }
  const url = `${KHAN_API_BASE_URL}/${operationName}?/fastly/`;
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-KA-fkey': '1',
  });
  if (token) {
    headers.append('cookie', 'KAAS=' + token);
  }
  const init: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operationName,
      query: queryCache[operationName]!,
      variables,
    }),
  };
  const response = await fetch(url, init);
  if (response.status === 400) {
    const query = (await getLatestQuery(operationName)) || (await getLatestMutation(operationName));
    if (!query) {
      throw new Error(`Failed to retrieve query ${operationName} from safelist.`);
    }
    queryCache[operationName] = query;
    init.body = JSON.stringify({
      operationName,
      query,
      variables,
    });
    return fetch(url, init);
  }
  return response;
}

async function getLatestQuery(query: string): Promise<string | undefined> {
  const response = await fetch(`${SAFELIST_URL}/query/${query}`);
  if (response.status === 404) return undefined;
  const text = await response.text();
  return text;
}

async function getLatestMutation(mutation: string): Promise<string | undefined> {
  const response = await fetch(`${SAFELIST_URL}/mutation/${mutation}`);
  if (response.status === 404) return undefined;
  const text = await response.text();
  return text;
}
