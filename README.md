# mcp-quotable

Quotable MCP — wraps the Quotable dataset (free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `random_quote` | Get a random quote, optionally filtered by tag (e.g., "Wisdom", "Motivational") or author slug. Returns quote text, author, and tags. Tags come from a fixed list — call list_tags to see it. |
| `search_quotes` | Search quotes by keyword or phrase. Returns matching quotes with author names and topic tags. |
| `get_authors` | Look up an author by slug (e.g., "albert-einstein"). Returns bio, description, and total quote count. Without a slug, returns a page of the author list — the upstream list is unordered and cannot be searched, so prefer passing a slug. |
| `list_tags` | Browse all available quote tags sorted by popularity. Use returned tags with random_quote to filter by topic. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "quotable": {
      "url": "https://gateway.pipeworx.io/quotable/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Quotable data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
