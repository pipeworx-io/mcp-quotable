interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Quotable MCP — wraps Quotable API (free, no auth)
 *
 * Tools:
 * - random_quote: Get one or more random quotes, optionally filtered by tag or author
 * - search_quotes: Search quotes by keyword
 * - get_authors: List or search authors by name slug
 * - list_tags: List all available quote tags
 */


const BASE_URL = 'https://api.quotable.io';

// ── API types ─────────────────────────────────────────────────────────

type RawQuote = {
  _id: string;
  content: string;
  author: string;
  authorSlug: string;
  length: number;
  tags: string[];
};

type RawAuthor = {
  _id: string;
  name: string;
  slug: string;
  bio: string;
  description: string;
  quoteCount: number;
  link: string;
};

type RawTag = {
  _id: string;
  name: string;
  quoteCount: number;
};

type QuotableListResponse<T> = {
  count: number;
  totalCount: number;
  page: number;
  totalPages: number;
  results: T[];
};

// ── Tool definitions ──────────────────────────────────────────────────

const tools: McpToolExport['tools'] = [
  {
    name: 'random_quote',
    description:
      'Get one or more random quotes from Quotable. Optionally filter by tag (e.g. "wisdom", "humor") or author slug.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of quotes to return (1–50, default 1)',
        },
        tags: {
          type: 'string',
          description:
            'Filter by tag(s). Use comma for AND, pipe for OR, e.g. "wisdom" or "humor|science"',
        },
        author: {
          type: 'string',
          description: 'Filter by author slug, e.g. "albert-einstein"',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_quotes',
    description: 'Search quotes by keyword. Returns matching quotes with author and tags.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Keyword or phrase to search for in quote content',
        },
        limit: {
          type: 'number',
          description: 'Number of results per page (1–150, default 20)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_authors',
    description:
      'List authors or search by name slug. Returns author bio, description, and quote count.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description:
            'Author slug(s) to look up, e.g. "albert-einstein". Supports pipe-separated values for multiple authors.',
        },
        limit: {
          type: 'number',
          description: 'Number of authors to return (1–150, default 20)',
        },
      },
      required: [],
    },
  },
  {
    name: 'list_tags',
    description:
      'List all quote tags available in Quotable, sorted by quote count. Use these tag names with random_quote.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

function formatQuote(q: RawQuote) {
  return {
    id: q._id,
    content: q.content,
    author: q.author,
    author_slug: q.authorSlug,
    length: q.length,
    tags: q.tags,
  };
}

function formatAuthor(a: RawAuthor) {
  return {
    id: a._id,
    name: a.name,
    slug: a.slug,
    bio: a.bio,
    description: a.description,
    quote_count: a.quoteCount,
    link: a.link,
  };
}

// ── Tool implementations ──────────────────────────────────────────────

async function randomQuote(limit = 1, tags?: string, author?: string) {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(limit, 1), 50)),
  });
  if (tags) params.set('tags', tags);
  if (author) params.set('author', author);

  const res = await fetch(`${BASE_URL}/quotes/random?${params}`);
  if (!res.ok) throw new Error(`Quotable API error: ${res.status}`);

  const data = (await res.json()) as RawQuote[];

  if (data.length === 1) return formatQuote(data[0]!);
  return { count: data.length, quotes: data.map(formatQuote) };
}

async function searchQuotes(query: string, limit = 20) {
  const params = new URLSearchParams({
    query,
    limit: String(Math.min(Math.max(limit, 1), 150)),
  });

  const res = await fetch(`${BASE_URL}/search/quotes?${params}`);
  if (!res.ok) throw new Error(`Quotable API error: ${res.status}`);

  const data = (await res.json()) as QuotableListResponse<RawQuote>;

  return {
    total: data.totalCount,
    count: data.count,
    page: data.page,
    total_pages: data.totalPages,
    quotes: data.results.map(formatQuote),
  };
}

async function getAuthors(slug?: string, limit = 20) {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(limit, 1), 150)),
    sortBy: 'quoteCount',
    order: 'desc',
  });
  if (slug) params.set('slug', slug);

  const res = await fetch(`${BASE_URL}/authors?${params}`);
  if (!res.ok) throw new Error(`Quotable API error: ${res.status}`);

  const data = (await res.json()) as QuotableListResponse<RawAuthor>;

  return {
    total: data.totalCount,
    count: data.count,
    authors: data.results.map(formatAuthor),
  };
}

async function listTags() {
  const params = new URLSearchParams({ sortBy: 'quoteCount', order: 'desc' });
  const res = await fetch(`${BASE_URL}/tags?${params}`);
  if (!res.ok) throw new Error(`Quotable API error: ${res.status}`);

  const data = (await res.json()) as RawTag[];

  return {
    count: data.length,
    tags: data.map((t) => ({ name: t.name, quote_count: t.quoteCount })),
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'random_quote':
      return randomQuote(
        args.limit as number | undefined,
        args.tags as string | undefined,
        args.author as string | undefined,
      );
    case 'search_quotes':
      return searchQuotes(args.query as string, args.limit as number | undefined);
    case 'get_authors':
      return getAuthors(args.slug as string | undefined, args.limit as number | undefined);
    case 'list_tags':
      return listTags();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
