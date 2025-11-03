# Push to GitHub - Steps

## Issue
Token appears to be invalid or expired (403 Permission denied error).

## Solution: Create New Personal Access Token

### Step 1: Create Token
1. Go to: https://github.com/settings/tokens/new
2. Settings:
   - **Note**: `checkinapp-push`
   - **Expiration**: Choose (90 days recommended)
   - **Scopes**: ✅ **repo** (Full control of private repositories)
3. Click **"Generate token"**
4. **Copy the token immediately** (you won't see it again!)

### Step 2: Push Using Token

**Option A: Use token in URL** (one-time):
```bash
git push https://YOUR_TOKEN@github.com/DannyDulgheru/checkinapp.git main
```

**Option B: Store in credential manager**:
```bash
git push github main
# When prompted:
# Username: DannyDulgheru
# Password: [paste your new token]
```

**Option C: Use with username**:
```bash
git remote set-url github https://DannyDulgheru:YOUR_TOKEN@github.com/DannyDulgheru/checkinapp.git
git push github main
```

## Verify Push
After successful push, check: https://github.com/DannyDulgheru/checkinapp

## Important Security Notes
⚠️ **NEVER** commit tokens to git
⚠️ **NEVER** share tokens publicly
⚠️ Tokens in git history should be revoked and regenerated

