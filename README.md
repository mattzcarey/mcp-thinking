# MCP Thinking Server

> Extract the thinking chain of thought of the Deepseek R1 reasoning model and use it in Claude Desktop or any MCP [client](https://www.youtube.com/watch?v=9mciRwpcLNY).

![with a box of scraps](./meme.png)

## Setup

To install dependencies:

```bash
bun install
```

Run the setup script to create the MCP config file. You will need to input your [Deepseek API key](https://platform.deepseek.com):

```bash
bun setup
```

Open Claude Desktop and enjoy reasoning with Deepseek R1.

## Tests

copy `.env.test.example` to `.env.test`.

```bash
cp .env.test.example .env.test
```

Run the tests:

```bash
bun test
```

## Credits

Thanks to @jacksteamdev's [awesome repo](https://github.com/jacksteamdev/mcp-sqlite-bun-server) for the example of MCP in bun. The setup script and logger are "heavily" inspired by it.
