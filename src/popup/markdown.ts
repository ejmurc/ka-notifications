export function parseMarkdown(text: string): string {
  text = escapeHtml(text);
  const codeBlocks: string[] = [];
  const codeInlines: string[] = [];
  text = text.replace(/```([\s\S]*?)```/gm, (_, code) => {
    codeBlocks.push(escapeHtml(code));
    return `\x00CB${codeBlocks.length - 1}\x00`;
  });
  text = text.replace(/`([^\n`]+?)`/g, (_, code) => {
    codeInlines.push(escapeHtml(code));
    return `\x00CI${codeInlines.length - 1}\x00`;
  });
  for (let i = 0, prev = ''; prev !== text && i < 20; prev = text, i++) {
    text = text.replace(/\*([^\n*]+?)\*/g, '<b>$1</b>');
    text = text.replace(/_([^\n_]+?)_/g, '<i>$1</i>');
    text = text.replace(/~([^\n~]+?)~/g, '<s>$1</s>');
  }
  text = text.replace(
    /https?:\/\/\S+/g,
    url => `<a class="hyperlink" href="${url}" target="_blank">${url}</a>`,
  );
  text = text.replace(
    /@([a-zA-Z][a-zA-Z\d]{0,39})/g,
    '<a class="hyperlink" href="https://www.khanacademy.org/profile/$1" target="_blank">@$1</a>',
  );
  text = text.replace(/\x00CB(\d+)\x00/g, (_, i) => `<pre><code>${codeBlocks[+i]}</code></pre>`);
  text = text.replace(/\x00CI(\d+)\x00/g, (_, i) => `<code>${codeInlines[+i]}</code>`);
  return text;
}

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
} as const;

const ESCAPE_REGEX = /[&<>"']/g;

export function escapeHtml(str: string): string {
  return str.replace(ESCAPE_REGEX, c => ESCAPE_MAP[c as keyof typeof ESCAPE_MAP]);
}
