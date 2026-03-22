
# Swigit

[![npm version](https://img.shields.io/npm/v/@charviwadhwa06/swigit.svg?style=flat-square)](https://www.npmjs.com/package/@charviwadhwa06/swigit)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)

Swigit is a high-performance Command Line Interface (CLI) designed to modernize the standard Git workflow. By integrating Large Language Models (LLMs) and local security auditing, Swigit automates the generation of standardized commit messages, prevents accidental credential exposure, and streamlines remote synchronization.

---

## Core Architecture

### 1. AI-Driven Documentation Engine
Swigit leverages the Google Gemini 1.5 Flash API to perform deep semantic analysis of repository diffs. Unlike basic automated commit tools, Swigit understands the context of code changes to produce high-quality, "Conventional Commits" compliant messages.

### 2. CleanPR Security Shield
A proactive security layer that performs real-time entropy analysis and pattern matching on staged files. It identifies and intercepts:
- Private keys (RSA, SSH, PGP)
- Cloud provider credentials (AWS, GCP, Azure)
- Database connection strings and environment variables
- Authentication tokens (JWT, OAuth)

### 3. Atomic Sync Workflow
To maintain a clean project history, Swigit automates the rebase-pull pattern. It safely handles local work-in-progress (WIP) using a stash-pull-pop mechanism, ensuring that your local branch is always updated against the remote head before a push.

---

## Installation and Requirements

### System Requirements
- Node.js version 18.0.0 or higher
- Git 2.0.0 or higher
- Valid Google Gemini API Key

### Global Installation
```bash
npm install -g @charviwadhwa06/swigit
```

### Direct Execution
```bash
npx @charviwadhwa06/swigit
```

---

## Technical Configuration

### Initial Setup
Run the setup utility to authorize the CLI with your Gemini API credentials. This configuration is stored globally for use across all local repositories.
```bash
swigit setup
```

### Main Execution Logic
The primary `swigit` command executes a multi-stage pipeline:
1. **Discovery:** Identifies modified and untracked files.
2. **Staging:** Performs a recursive `git add .` to prepare the workspace.
3. **Analysis:** Routes the current `diff` to the Gemini engine for message generation.
4. **Audit:** Triggers the CleanPR scanner for secret detection.
5. **Finalization:** Executes the commit and pushes to the current upstream branch.

```bash
swigit
```

---

## Command Reference

| Command | Description |
| :--- | :--- |
| `swigit` | Default shipping workflow (Add, AI Commit, Audit, Push). |
| `swigit init <url>` | Initializes a local repository and establishes a remote origin. |
| `swigit sync` | Performs a stash-based rebase pull to stay current with remote. |
| `swigit clone <url>` | Clones a repository and auto-installs Node.js dependencies. |
| `swigit info` | Displays current branch status, remotes, and commit metadata. |
| `swigit undo` | Reverts the most recent commit while preserving file changes. |
| `swigit setup` | Manages global configuration and API credentials. |

---

## Workflow Comparison

### Standard Manual Workflow
Manual workflows often lead to non-descriptive messages and increased risk of secret leakage.
```bash
git add .
git commit -m "fix bug"
git pull origin main
# (Manual conflict resolution)
git push origin main
```

### Swigit Automated Workflow
Swigit ensures every commit is documented, secure, and synchronized.
```bash
swigit
```

---

## Security Policy
Swigit is built with a "Local First" security philosophy. The CleanPR Security Shield executes all scanning logic within the local environment. No source code or sensitive credentials are ever transmitted to external servers for the purpose of auditing.
