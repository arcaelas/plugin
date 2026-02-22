export default function chunk(text: string, size = 1600, overlap = 200): string[] {
  if (text.length <= size) return [text];

  const segments = text.split(/(?<=\n\n)|(?<=[.!?]\s)|(?<=\n)/g).filter(Boolean);
  if (segments.length <= 1) return force_split(text, size, overlap);

  const chunks: string[] = [];
  let buf: string[] = [];
  let len = 0;

  for (const seg of segments) {
    if (len + seg.length > size && buf.length > 0) {
      chunks.push(buf.join("").trim());
      let keep = 0, kept = 0;
      for (let j = buf.length - 1; j >= 0 && kept + buf[j].length <= overlap; j--) {
        kept += buf[j].length;
        keep++;
      }
      buf = keep > 0 ? buf.slice(-keep) : [];
      len = buf.reduce((s, p) => s + p.length, 0);
    }
    buf.push(seg);
    len += seg.length;
  }

  if (buf.length > 0) {
    const last = buf.join("").trim();
    if (last) chunks.push(last);
  }

  return chunks;
}

function force_split(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  const step = Math.max(size - overlap, 1);
  for (let pos = 0; pos < text.length; pos += step) {
    chunks.push(text.slice(pos, pos + size));
    if (pos + step >= text.length) break;
  }
  return chunks;
}
