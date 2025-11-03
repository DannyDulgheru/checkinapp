# Setup GitHub Repository

## Create Public GitHub Repository

### Option 1: Using GitHub CLI (if installed)

```bash
gh repo create checkinapp --public --source=. --remote=origin-github --push
```

### Option 2: Manual Setup

1. **Go to https://github.com**
   - Login or create account
   - Click "+" → "New repository"

2. **Create Repository**
   - Repository name: `checkinapp`
   - Description: "PWA Check-in App with Timer and Firebase"
   - Visibility: **Public** ✓
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

3. **Add GitHub Remote**
   ```bash
   git remote add github https://github.com/YOUR_USERNAME/checkinapp.git
   ```

4. **Push to GitHub**
   ```bash
   git push github main
   ```

### Option 3: Change Origin (Replace GitLab with GitHub)

If you want to replace GitLab with GitHub:

```bash
# Remove GitLab remote
git remote remove origin

# Add GitHub as origin
git remote add origin https://github.com/YOUR_USERNAME/checkinapp.git

# Push to GitHub
git push -u origin main
```

## Current Setup

- **GitLab**: `https://gitlab.com/quorbik/checkinapp.git` (kept as remote)
- **GitHub**: Add new remote (see above)

## After Push

Your repository will be available at:
- `https://github.com/YOUR_USERNAME/checkinapp`

Make sure to:
- ✅ Add repository description
- ✅ Add topics/tags (react, typescript, firebase, pwa, vite)
- ✅ Set up GitHub Pages or Vercel deployment (optional)

