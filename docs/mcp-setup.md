# MCP Setup – Context7 Integration

This project uses **Context7 MCP** to enhance AI-assisted development in Cursor.

## What MCP servers are configured?

The file `.cursor/mcp.json` declares a single optional MCP server:

- **context7**
  - Enabled only if the user has the `context7` CLI installed.
  - Gives the assistant extended project-wide context and better reasoning across files.

## How to enable MCP locally?

1. Install Context7 CLI (if you want AI to use it):

pip install context7 # or the official instructions

2. Restart Cursor.
3. Open: *Cursor → Settings → MCP*  
Verify that **context7** is detected and active.

## What does the assistant use MCP for?

- Deep repository understanding  
- Multi-file reasoning  
- Better indexing of your code structure  
- Stronger multi-file refactoring  
- Context stitching between distant parts of the code  

## What if someone doesn't have Context7?

No problem.

- Cursor will simply ignore the MCP entry.
- Everything works normally.
- No errors will occur.

## Safety

The assistant:
- **Must not** run destructive filesystem commands via MCP.
- Should use MCP for *analysis only*.
- Should rely on MCP solely to reason about the repository structure.

This setup is safe for all contributors.