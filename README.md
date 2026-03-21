# 🚀 Swigit

[![npm version](https://img.shields.io/npm/v/@charviwadhwa06/swigit.svg?style=flat-square)](https://www.npmjs.com/package/@charviwadhwa06/swigit)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)

> ⚡ AI-powered Git CLI that writes commits, prevents leaks, and ships your code — all in one command.

---

## ✨ Features

- 🤖 **AI Commit Engine**  
  Uses Google Gemini (1.5 Flash) to analyze your `git diff` and generate clean, professional commit messages (Conventional Commits style).

- 🛡️ **CleanPR Security Shield**  
  Scans your staged files and blocks pushes if it detects:
  - API keys  
  - Secrets  
  - `.env` files  
  - Tokens or credentials  

- 🔄 **Smart Sync Workflow**  
  Automatically performs:

  ```bash
  git stash
  git pull --rebase
  git stash pop
  ```

  So you never deal with messy merge conflicts.

- 🌍 **Global Configuration**  
  Set your Gemini API key once and use it across all repositories.

- 📊 **Repo Dashboard**  
  Get a quick overview of:
  - Current branch  
  - Remote status  
  - Recent commits  

---

## 📦 Installation

### Install globally

```bash
npm install -g @charviwadhwa06/swigit
```

### Run instantly (no install)

```bash
npx @charviwadhwa06/swigit
```

---

## 🛠️ Quick Start

### 1. Setup (One-time)

Connect your Gemini API key:

```bash
swigit setup
```

---

### 2. Ship your code 🚀

Run one command to:
- stage changes
- generate commit message
- scan for secrets
- sync with remote
- push safely

```bash
swigit
```

---

### 3. View repo info

```bash
swigit info
```

---

### 4. Help command

```bash
swigit --help
```

---

## 🧠 Why Swigit?

### ❌ Problem 1: Bad Commit Messages

Most developers write:

```bash
fix
update
changes
```

👉 Swigit generates:

```bash
feat(auth): add JWT-based login with refresh tokens
```

---

### 🔐 Problem 2: Secret Leaks

Thousands of API keys get pushed to GitHub daily.

👉 Swigit prevents this by:
- scanning staged files
- blocking unsafe pushes
- alerting you instantly

---

### ⚡ Problem 3: Messy Git Workflow

Manual workflow:

```bash
git add .
git commit -m "..."
git pull --rebase
git push
```

👉 Swigit replaces it with:

```bash
swigit
```

---

## 🧪 Example Output

```bash
✔ Staged changes
✔ Generated commit message:
  "feat(api): add user authentication endpoint"

✔ Security scan passed
✔ Synced with remote
✔ Pushed successfully 🚀
```

---

## ⚙️ Configuration

After setup, your API key is stored securely and used globally.

To reconfigure:

```bash
swigit setup
```

---

## 🛡️ Security

Swigit’s **CleanPR Shield** ensures:
- No sensitive data leaves your machine
- Local scanning before push
- Safe Git practices by default
