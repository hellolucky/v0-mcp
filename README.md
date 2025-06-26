# v0-mcp

[English](README.md) | [中文](README_zh.md)

Vercel v0 MCP Server for Claude Code - Generate beautiful UI components using AI through the Model Context Protocol.

> ✨ **Collaborative Development**: This project was built through innovative collaboration between Claude Code and Gemini CLI using Vibe Coding methodology - demonstrating the power of AI-assisted development workflows.

## 🎯 Features

- **Generate UI Components**: Create React components from natural language descriptions
- **Image to UI**: Convert design images into working React code
- **Chat-based Iteration**: Iteratively refine components through conversation
- **Multiple Models**: Support for v0-1.5-md, v0-1.5-lg, and v0-1.0-md
- **TypeScript Support**: Full type safety with Zod schema validation
- **Streaming Support**: Real-time generation progress

## 🚀 Quick Start

```bash
# 1. Clone and enter the project
git clone <repository-url> && cd v0-mcp

# 2. Install dependencies
npm install

# 3. Create .env file and add your v0 API key
npm run setup
# Edit .env file with your V0_API_KEY

# 4. Build the project
npm run build

# 5. Add to Claude Code (ensure you are in the project root)
claude mcp add v0-mcp --env V0_API_KEY=$(grep V0_API_KEY .env | cut -d '=' -f2) -- node $(pwd)/dist/main.js

# 6. Start using it in Claude Code!
# Try: "Hey v0-mcp, create a login form with email and password fields"
```

## 🛠 Installation

### 1. Clone or Download
```bash
git clone <repository-url>
cd v0-mcp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
npm run setup
# Edit .env file with your v0 API key
```

### 4. Build Project
```bash
npm run build
```

## ⚙️ Configuration

### 🔑 Getting Your v0 API Key

Before configuring v0-mcp, you'll need a v0 API key:

1. **Visit the [v0 Model API documentation](https://vercel.com/docs/v0/model-api)**
2. **Sign in to your Vercel account**
3. **Navigate to the API Keys section**
4. **Generate a new API key**
5. **Copy and save your key securely**

### Claude Code Integration

📖 **Quick setup guide - choose the method that works best for you**

#### Method 1: CLI Configuration (Recommended)

1. **Add v0-mcp using the Claude Code CLI:**
   ```bash
   # Navigate to your v0-mcp directory first
   cd /path/to/your/v0-mcp
   
   # Add the MCP server using current directory
   claude mcp add v0-mcp -- node $(pwd)/dist/main.js
   ```

2. **Set your v0 API key:**

   **Option A: Add key during CLI setup**
   ```bash
   # When adding the server, include the API key (run from v0-mcp directory)
   claude mcp add v0-mcp --env V0_API_KEY=your_v0_api_key_here -- node $(pwd)/dist/main.js
   ```

   **Option B: Edit `.claude.json` file after setup**
   
   After running the `claude mcp add` command, edit the generated `.claude.json` file:
   ```json
   {
     "mcpServers": {
       "v0-mcp": {
         "type": "stdio",
         "command": "node",
         "args": ["/absolute/path/to/your/v0-mcp/dist/main.js"],
         "env": {
           "V0_API_KEY": "your_v0_api_key_here"
         }
       }
     }
   }
   ```
   
   **Option C: System environment variable (Most secure)**
   ```bash
   # Add to your shell profile (.bashrc, .zshrc, etc.)
   echo 'export V0_API_KEY="your_v0_api_key_here"' >> ~/.zshrc
   
   # Reload your shell configuration
   source ~/.zshrc
   ```

3. **Verify your setup:**
   ```bash
   claude mcp list
   node scripts/verify-claude-code-setup.js
   ```
   
   ✅ **Expected Output:**
   ```
   Verifying v0 API connection...
   ✓ v0-mcp server found in Claude configuration
   ✓ API key is configured
   ✓ Successfully connected to v0 API
   Setup is complete! You can now use v0-mcp in Claude Code.
   ```

#### Method 2: Manual Configuration (Advanced)

1. **Create or edit the Claude Code configuration file:**
   - **macOS/Linux**: `~/.claude.json`
   - **Windows**: `%USERPROFILE%\.claude.json`

2. **Add the v0-mcp server configuration:**

```json
{
  "mcpServers": {
    "v0-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/v0-mcp/dist/main.js"],
      "env": {
        "V0_API_KEY": "your_v0_api_key_here"
      }
    }
  }
}
```

3. **Restart Claude Code** for the changes to take effect.

#### Verification

After configuration, you should see v0-mcp tools available in Claude Code:

- ✅ `v0_generate_ui` - Generate UI components from text
- ✅ `v0_generate_from_image` - Generate UI from image references  
- ✅ `v0_chat_complete` - Iterative UI development chat
- ✅ `v0_setup_check` - Verify API connectivity

### 🔗 Why Use MCP (Model Context Protocol)?

**MCP Benefits:**
- **Seamless Integration**: Tools appear natively in Claude without API juggling
- **Enhanced Context**: Claude understands your v0 workflow and provides better assistance
- **Real-time Availability**: Tools are always accessible during your coding sessions
- **Type Safety**: Full parameter validation and error handling built-in
- **Persistent State**: Maintains conversation context across tool calls

**How It Works:**
When you mention v0-mcp or UI generation in Claude, the tools automatically become available. Claude can intelligently choose the right tool based on your request, making the development process feel natural and integrated.

### Claude Desktop Integration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "v0-mcp": {
      "command": "node",
      "args": ["/path/to/v0-mcp/dist/main.js"],
      "env": {
        "V0_API_KEY": "your_v0_api_key_here"
      }
    }
  }
}
```

### Cursor Integration

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "v0-mcp": {
      "command": "node",
      "args": ["/path/to/v0-mcp/dist/main.js"],
      "env": {
        "V0_API_KEY": "your_v0_api_key_here"
      }
    }
  }
}
```

## 🔧 Available Tools

### `v0_generate_ui`
Generate UI components from text descriptions.

**Parameters:**
- `prompt` (required): Description of the UI component
- `model`: v0 model to use (default: v0-1.5-md)
- `stream`: Enable streaming response (default: false)
- `context`: Optional existing code context

### `v0_generate_from_image`
Generate UI components from image references.

**Parameters:**
- `imageUrl` (required): URL of the reference image
- `prompt`: Additional instructions
- `model`: v0 model to use (default: v0-1.5-md)

### `v0_chat_complete`
Chat-based UI development with conversation context.

**Parameters:**
- `messages` (required): Array of conversation messages
- `model`: v0 model to use (default: v0-1.5-md)
- `stream`: Enable streaming response (default: false)

### `v0_setup_check`
Validate v0 API configuration and connectivity.

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `V0_API_KEY` | ✅ | - | Your v0 API key |
| `V0_BASE_URL` | ❌ | `https://api.v0.dev/v1` | v0 API base URL |
| `V0_DEFAULT_MODEL` | ❌ | `v0-1.5-md` | Default model to use |
| `V0_TIMEOUT` | ❌ | `60000` | API timeout (ms) |
| `MCP_SERVER_NAME` | ❌ | `v0-mcp` | MCP server name |
| `LOG_LEVEL` | ❌ | `info` | Logging level |

## 🚀 Usage Examples

### In Claude Code

Once configured, you can use v0-mcp in multiple ways:

#### Direct v0-mcp Usage
Simply mention v0-mcp in your request, and Claude will automatically select the appropriate tool:
```
Hey v0-mcp, create a modern login form with email and password fields
```

```
v0-mcp: Generate a dashboard component with charts and KPI cards
```

```
@v0-mcp convert this wireframe to a React component: [image URL]
```

#### Specific Tool Usage

##### Generate a Login Form
```
Use v0_generate_ui to create a modern login form with email, password fields, and a blue submit button with rounded corners.
```

##### Convert Design to Code  
```
Use v0_generate_from_image with this Figma design URL: https://example.com/design.png
```

##### Iterative Development
```
Use v0_chat_complete to refine the previous login form by adding a "Remember me" checkbox and "Forgot password" link.
```

##### Check API Setup
```
Use v0_setup_check to verify your v0 API connection and configuration.
```

### Advanced Usage Examples

#### Creating a Dashboard Component
```
Use v0_generate_ui with the following prompt:
"Create a modern dashboard component with a sidebar navigation, header with user profile dropdown, and a main content area with grid layout for cards. Include metrics cards showing KPIs with charts. Use shadcn/ui components and Tailwind CSS."
```

#### Building from a Wireframe
```
Use v0_generate_from_image with your wireframe image URL and add:
"Convert this wireframe into a fully functional React component. Add proper spacing, modern styling, and make it responsive for mobile devices."
```

#### Iterative Refinement
```
Use v0_chat_complete with conversation history:
[
  {"role": "user", "content": "Create a pricing table component"},
  {"role": "assistant", "content": "[Previous pricing table code]"},
  {"role": "user", "content": "Add a popular plan highlight and annual/monthly toggle"}
]
```

## 🧪 Development

```bash
# Development mode with hot reload
npm run dev

# Type checking
npm run lint

# Run tests
npm test

# Test with coverage
npm run test:coverage

# Test in CI mode
npm run test:ci

# Clean build artifacts
npm run clean

# Test configuration
npm run test:config

# Test basic functionality
npm run test:basic

# Verify Claude Code setup
npm run verify:claude-code
```

## 🛡️ Enhanced Features

### Structured Logging
- **Winston-based logging** with JSON format
- **Contextual information** for API calls and tool usage
- **Error tracking** with stack traces and metadata
- **Configurable log levels** via `LOG_LEVEL` environment variable

### Advanced Error Handling
- **Categorized error types** (API, Network, Timeout, Rate Limit, etc.)
- **Retry logic** with exponential backoff for transient errors
- **User-friendly error messages** with actionable guidance
- **Comprehensive error metadata** for debugging

### Testing Infrastructure
- **Jest testing framework** with TypeScript support
- **Comprehensive unit tests** for all core components
- **Test coverage reporting** with configurable thresholds
- **Mock implementations** for external dependencies

### Improved Reliability
- **Input validation** using Zod schemas
- **Graceful error handling** for all failure modes
- **Performance monitoring** with request timing
- **Health checks** for API connectivity

## 💖 Support This Project

If you find this project helpful, please consider supporting it:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://coff.ee/hellolucky)

Your support helps maintain and improve v0-mcp!

## 📄 License

MIT