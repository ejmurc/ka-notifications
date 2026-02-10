export async function getAuthToken(): Promise<string | undefined> {
  const cookie = await chrome.cookies.get({
    url: 'https://www.khanacademy.org',
    name: 'KAAS',
  });
  return cookie?.value;
}
