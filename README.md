# mcp-quotable

Quotable MCP — wraps Quotable API (free, no auth)

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `search_quotes` | Search quotes by keyword. Returns matching quotes with author and tags. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "quotable": {
      "url": "https://gateway.pipeworx.io/quotable/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use quotable
```

## License

MIT
