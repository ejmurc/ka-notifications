const _fetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const silent_fetch = async (): Promise<Response> => {
    try {
      return await _fetch(input, init);
    } catch {
      return new Response(null, { status: 404 });
    }
  };
  if (
    !(input instanceof Request) ||
    !input.url?.startsWith('https://www.khanacademy.org/api/internal/graphql/getFeedbackRepliesPage')
  ) {
    return silent_fetch();
  }
  const blob = await input.blob();
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = async () => {
      const contents = reader.result;
      if (contents === null || contents instanceof ArrayBuffer) return resolve(silent_fetch());
      const b64 = contents.split(',')?.[1];
      if (b64 === undefined) return resolve(silent_fetch());
      const decoded = atob(b64);
      if (decoded === null) return resolve(silent_fetch());
      const body = JSON.parse(decoded);
      body.variables.limit = 100;
      const newInit: RequestInit = {
        ...input,
        body: JSON.stringify(body),
      };
      const updatedRequest = new Request(input, newInit);
      resolve(_fetch(updatedRequest));
    };
    reader.onerror = () => resolve(silent_fetch());
    reader.readAsDataURL(blob);
  });
};
