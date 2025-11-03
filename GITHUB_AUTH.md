# GitHub Authentication Setup

## Issue
Git push to GitHub requires authentication. You need to authenticate with GitHub.

## Solution Options

### Option 1: Personal Access Token (Recommended)

1. **Create Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `checkinapp-push`
   - Select scopes: ✅ `repo` (Full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Push with token**:
   When prompted for password, use the **token** instead of your password:
   ```bash
   git push github main
   Username: DannyDulgheru
   Password: [paste your token here]
   ```

### Option 2: GitHub CLI (Easiest)

```bash
# Install GitHub CLI
winget install GitHub.cli

# Login
gh auth login

# Then push
git push github main
```

### Option 3: Configure Git Credential Manager

```bash
# Windows Credential Manager should work
# Just run push and enter credentials when prompted
git push github main
```

## Quick Push Command

After authentication, run:
```bash
git push github main
```

Or to push both remotes:
```bash
git push origin main  # GitLab
git push github main  # GitHub
```

