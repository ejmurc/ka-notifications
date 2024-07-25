// Fetch 100 comments at a time instead of 10
const _fetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (
    !(input instanceof Request) ||
    !input.url?.startsWith('https://www.khanacademy.org/api/internal/graphql/getFeedbackRepliesPage')
  ) {
    try {
      return await _fetch(input, init);
    } catch (error) {
      return new Response(null, { status: 404, statusText: typeof error === 'string' ? error : undefined });
    }
  }
  const blob = await input.blob();
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const contents = reader.result as string;
      const graphQLBody = JSON.parse(atob(contents.split(',')[1]));
      graphQLBody.variables.limit = 100;
      const newInit: RequestInit = {
        ...input,
        body: JSON.stringify(graphQLBody),
      };
      const updatedRequest = new Request(input, newInit);
      resolve(_fetch(updatedRequest));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
