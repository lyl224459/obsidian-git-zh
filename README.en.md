# Obsidian Git Chinese Version

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/lyl224459/obsidian-git-zh)](https://github.com/lyl224459/obsidian-git-zh/releases)
[![GitHub issues](https://img.shields.io/github/issues/lyl224459/obsidian-git-zh)](https://github.com/lyl224459/obsidian-git-zh/issues)
[![GitHub license](https://img.shields.io/github/license/lyl224459/obsidian-git-zh)](https://github.com/lyl224459/obsidian-git-zh/blob/master/LICENSE)

> Git version control integration - Automatic backup and advanced features (Full Chinese localization)

[English](README.en.md) | [简体中文](README.md) | [English (Original)](https://github.com/Vinzent03/obsidian-git/blob/master/README.md)

## 📖 Introduction

Obsidian Git Chinese Version is a plugin developed for [Obsidian.md](https://obsidian.md) that provides complete Git version control functionality for your note library. This plugin is based on [obsidian-git](https://github.com/Vinzent03/obsidian-git) and provides complete Chinese localization support.

### ✨ Key Features

- 🔄 **Automatic Backup and Sync** - Automatically commit, push, and pull your changes
- 📊 **Source Control View** - Intuitive interface to view and manage file changes
- 📜 **History View** - Browse commit history and version differences
- 👤 **Line Author Feature** - View information about the last modifier of each line
- 🔍 **Diff View** - Compare differences between file versions
- 🌐 **Complete Chinese Support** - All interface elements are translated to Chinese
- 📱 **Mobile Optimization** - Mobile device support and performance optimization
- 🔧 **Flexible Configuration** - Rich settings options to meet different needs

## 🚀 Quick Start

### Installation Methods

#### Method 1: Install from Obsidian Community Plugin Market

1. Open Settings → Third-party plugins in Obsidian
2. Disable safe mode
3. Click Browse → Search for "Git 中文版"
4. Install and enable the plugin

#### Method 2: Manual Installation

1. Download the latest version from [Releases](https://github.com/lyl224459/obsidian-git-zh/releases)
2. Extract the `obsidian-git-zh` folder to your Obsidian plugin directory:
   - Windows: `%APPDATA%\Obsidian\Plugins\`
   - macOS: `~/Library/Application Support/obsidian/Plugins/`
   - Linux: `~/.config/obsidian/Plugins/`
3. Enable the plugin in Obsidian

### Basic Setup

1. Install Git and configure your identity:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. Initialize Git repository in Obsidian:
   - Open command palette (`Ctrl/Cmd + P`)
   - Run "Git: Initialize Repository" command

3. Configure remote repository (optional):
   - Add remote repository URL in settings
   - Configure authentication information

## 📦 Plugin Release

### Obsidian Plugin Standards

This plugin fully complies with Obsidian community plugin release standards:

#### 📁 File Structure
```
git-zh.zip
└── git-zh/                    # Plugin ID folder
    ├── main.js               # Main plugin program (791.40 KB)
    ├── manifest.json         # Plugin manifest (0.50 KB)
    ├── styles.css            # Plugin styles (18.08 KB)
    ├── README.md             # Plugin documentation (6.50 KB)
    └── LICENSE               # Open source license (2.55 KB)
```

#### 🔧 Plugin Information
- **Plugin ID**: `git-zh`
- **Version**: `2.36.1`
- **Minimum Obsidian Version**: `0.15.0`
- **Author**: Vinzent (Original), lyl224459 (Chinese Version)

#### 📋 Packaging Commands
```bash
# Generate Obsidian-standard release package
pnpm run package:obsidian

# Generate complete release packages (includes tar.gz and zip)
pnpm run package:all

# Complete pre-release checks
pnpm run pre-release
```

### 🤖 GitHub Actions Automation

This project uses GitHub Actions to implement complete CI/CD processes:

#### 🚀 Automatic Build (push to master)
- Code quality checks (ESLint, Prettier, TypeScript, Svelte)
- Automatic build and testing
- Generate release packages
- Publish latest development version

#### 📦 Automatic Release (create version tag)
- Complete pre-release validation
- Generate standardized release packages
- Automatic GitHub Release creation
- Detailed release notes and installation guides

#### 🔍 Regular Code Quality Checks
- Weekly code quality analysis
- Dependency security scanning
- Build validation
- Detailed quality reports

#### 📊 Workflow Status
[![Build Status](https://img.shields.io/github/actions/workflow/status/lyl224459/obsidian-git-zh/ci.yml)](https://github.com/lyl224459/obsidian-git-zh/actions)
[![Code Quality](https://img.shields.io/github/actions/workflow/status/lyl224459/obsidian-git-zh/code-quality.yml)](https://github.com/lyl224459/obsidian-git-zh/actions)

## 📚 Features

### 🔄 Automatic Sync

- **Scheduled Sync** - Automatically commit and sync every specified minutes
- **Post-Edit Sync** - Delayed sync after stopping editing
- **Startup Sync** - Automatically pull latest changes when starting Obsidian

### 📊 Source Control

- View status of all file changes
- Stage/unstage individual or all files
- Discard file changes
- Commit changes
- Push/pull to remote repositories

### 📜 History

- Browse commit history
- View changed files for each commit
- Compare file version differences
- Restore to specific versions

### 👤 Line Author Information

- Display the last modification time for each line
- Display modifier information
- Support custom date and author display formats

### 🔍 Diff View

- Side-by-side file difference display
- Support unified and split views
- Syntax highlighting

## ⚙️ Advanced Configuration

### Authentication Methods

Support multiple Git authentication methods:
- SSH keys
- Personal Access Tokens
- Username and password

### Submodule Support

- Automatic submodule updates
- Recursive operation support

### Mobile Optimization

- Performance optimization for mobile devices
- Intelligent feature degradation
- Touch-friendly interface

## 🛠️ Development

### Environment Requirements

- Node.js >= 18
- pnpm >= 9
- Git

### Development Setup

```bash
# Clone repository
git clone https://github.com/lyl224459/obsidian-git-zh.git
cd obsidian-git-zh

# Install dependencies
pnpm install

# Development mode
pnpm run dev

# Build production version
pnpm run build

# Code checks
pnpm run all
```

### Project Structure

```
src/
├── main.ts                 # Plugin entry point
├── commands.ts            # Command definitions
├── automaticsManager.ts   # Automation manager
├── gitManager/            # Git manager
│   ├── gitManager.ts      # Abstract interface
│   ├── simpleGit.ts       # Simple Git implementation
│   └── isomorphicGit.ts   # Isomorphic Git implementation
├── services/              # Business service layer
├── ui/                    # User interface components
│   ├── commitSidebar/     # Commit sidebar
│   ├── diff/             # Diff view
│   ├── history/          # History view
│   └── sourceControl/    # Source control
├── setting/               # Settings interface
├── i18n/                  # Internationalization
│   ├── locales/          # Translation files
│   │   ├── zh-cn.ts      # Chinese translations
│   │   └── en.ts         # English translations
└── types.ts              # Type definitions
```

## 📖 Documentation

Detailed documentation can be found in the [`docs/`](docs/) directory:

- [Getting Started](docs/Getting%20Started.md)
- [Installation Guide](docs/Installation.md)
- [Features](docs/Features.md)
- [Authentication Configuration](docs/Authentication.md)
- [Common Issues](docs/Common%20issues.md)
- [Tips and Tricks](docs/Tips-and-Tricks.md)
- [Line Authoring Feature](docs/Line%20Authoring.md)
- [Integration with Other Tools](docs/Integration%20with%20other%20tools.md)

## 🤝 Contributing

Issues and Pull Requests are welcome!

### Contribution Guidelines

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### Translation Contributions

If you want to help improve Chinese translations or add support for other languages:

1. Edit the corresponding files in `src/i18n/locales/`
2. Test the translation effects
3. Submit a Pull Request

## 📄 License

This project is based on the [MIT License](LICENSE) open source license.

## 🙏 Acknowledgments

- **Original Author**: [Vinzent03](https://github.com/Vinzent03) - Original obsidian-git plugin author
- **Chinese Localization**: [lyl224459](https://github.com/lyl224459) - Chinese version maintainer
- **Community Contributors**: Thanks to all developers who have contributed to this project

## 💝 Support

If this plugin is helpful to you, please consider:

- ⭐ Star the project on GitHub
- 🐛 [Report issues](https://github.com/lyl224459/obsidian-git-zh/issues) or suggest features
- 💡 Contribute code or translations
- ☕ [Support the original author](https://ko-fi.com/vinzent)

---

**Note**: This is an unofficial Chinese localization version based on the original plugin with Chinese localization and feature optimizations. If you have any issues, please first check the documentation in the [original repository](https://github.com/Vinzent03/obsidian-git).