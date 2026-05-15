const SAFE_IMAGE_PROTOCOLS = new Set(['http:', 'https:']);

export function extractYouTubeId(url) {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || null;
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(embed|shorts|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[2];
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedUrl(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query || '')}`;
}

export function imageSearchUrl(query) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query || '')}`;
}

export function safeImageUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url.trim());
    if (!SAFE_IMAGE_PROTOCOLS.has(parsed.protocol)) return '';
    return parsed.href;
  } catch {
    return '';
  }
}
