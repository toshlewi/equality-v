import { NextResponse } from 'next/server';

type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'STORY';

type InstagramApiMedia = {
  id: string;
  caption?: string;
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  media_type: InstagramMediaType;
  timestamp?: string;
  username?: string;
};

type HighlightPost = {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  mediaType: InstagramMediaType;
  timestamp?: string;
  username?: string;
  thumbnailUrl?: string | null;
};

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;

const INSTAGRAM_FIELDS = [
  'id',
  'caption',
  'media_url',
  'permalink',
  'thumbnail_url',
  'media_type',
  'timestamp',
  'username',
].join(',');

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

let cachedResponse: { data: HighlightPost[]; fetchedAt: number } | null = null;

function normaliseMedia(media: InstagramApiMedia[]): HighlightPost[] {
  return media
    .filter((item) => Boolean(item.media_url || item.thumbnail_url))
    .map((item) => {
      const previewUrl = item.media_type === 'VIDEO'
        ? item.thumbnail_url ?? item.media_url ?? ''
        : item.media_url ?? item.thumbnail_url ?? '';

      return {
        id: item.id,
        caption: item.caption ?? '',
        mediaUrl: previewUrl,
        permalink: item.permalink,
        mediaType: item.media_type,
        timestamp: item.timestamp,
        username: item.username,
        thumbnailUrl: item.thumbnail_url ?? null,
      } satisfies HighlightPost;
    })
    .filter((item) => Boolean(item.mediaUrl));
}

export async function GET(request: Request) {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Instagram integration is not configured.' },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const limit = (() => {
    const parsed = Number(limitParam);
    if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
    return Math.min(Math.max(Math.floor(parsed), 1), MAX_LIMIT);
  })();

  if (cachedResponse && Date.now() - cachedResponse.fetchedAt < CACHE_TTL) {
    return NextResponse.json(
      {
        data: cachedResponse.data.slice(0, limit),
        source: 'cache',
        fetchedAt: cachedResponse.fetchedAt,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      },
    );
  }

  const baseEndpoint = INSTAGRAM_USER_ID
    ? `https://graph.instagram.com/${encodeURIComponent(INSTAGRAM_USER_ID)}/media`
    : 'https://graph.instagram.com/me/media';

  const requestUrl = new URL(baseEndpoint);
  requestUrl.searchParams.set('fields', INSTAGRAM_FIELDS);
  requestUrl.searchParams.set('access_token', INSTAGRAM_ACCESS_TOKEN);
  requestUrl.searchParams.set('limit', String(Math.min(limit, MAX_LIMIT)));

  try {
    const response = await fetch(requestUrl.toString(), {
      cache: 'no-store',
      next: { revalidate: CACHE_TTL / 1000 },
    });

    if (!response.ok) {
      const errorPayload = await response
        .json()
        .catch(() => ({ error: 'Unable to parse Instagram error response.' }));

      return NextResponse.json(
        { error: 'Failed to fetch Instagram media.', details: errorPayload },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as { data?: InstagramApiMedia[] };
    const mediaItems = payload.data ?? [];
    const normalised = normaliseMedia(mediaItems);

    cachedResponse = {
      data: normalised,
      fetchedAt: Date.now(),
    };

    return NextResponse.json(
      {
        data: normalised.slice(0, limit),
        source: 'instagram',
        fetchedAt: cachedResponse.fetchedAt,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error fetching Instagram media.' },
      { status: 500 },
    );
  }
}

