const _fetch = window.fetch;

window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (
    !(input instanceof Request) ||
    !input.url.startsWith('https://www.khanacademy.org/api/internal/graphql/getFeedbackRepliesPage')
  ) {
    try {
      return await _fetch(input, init);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw e;
      return new Response(null, { status: 404 });
    }
  }

  const text = await input.text();
  const patched = text.replace(/"limit"\s*:\s*\d+/, '"limit":100');

  return _fetch(
    new Request(input.url, {
      method: input.method,
      headers: input.headers,
      credentials: input.credentials,
      mode: input.mode,
      cache: input.cache,
      redirect: input.redirect,
      body: patched,
    }),
  );
};
