# Firebase Realtime Database Setup Guide

## ⚠️ IMPORTANT: Enable Realtime Database in Firebase Console

For the app to work with Realtime Database, you MUST enable it in Firebase Console first.

## Step-by-Step Setup

### 1. Enable Realtime Database

1. Go to https://console.firebase.google.com
2. Select your project: **dandulgheru-e5fcc**
3. In the left menu, click **Realtime Database**
4. If you see "Get started" button, click it
5. Choose location:
   - For Europe: Select **europe-west1** (Belgium) or closest region
   - For US: Select **us-central1** or closest region
   - **Important**: Note which location you choose (you'll need this later)
6. Click **Enable**
7. Wait for database creation (usually takes 1-2 minutes)

### 2. Set Database Rules

1. In **Realtime Database** section, click on **Rules** tab
2. Replace the default rules with these:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

3. Click **Publish**

**What these rules do:**
- Users can only read/write their own data
- Each user can only access `users/{theirUserId}/` path
- Requires authentication (user must be logged in)

### 3. Get Database URL

1. In **Realtime Database** section, you'll see a database URL like:
   - `https://dandulgheru-e5fcc-default-rtdb.europe-west1.firebasedatabase.app/`
   - Or: `https://dandulgheru-e5fcc-default-rtdb.firebaseio.com/`

2. Copy the database URL (you may need it for troubleshooting)

### 4. Verify Database is Ready

After enabling:
1. You should see the database URL at the top
2. You should see tabs: **Data** and **Rules**
3. In **Data** tab, you should see empty database (or `null`)

## Troubleshooting

### Error: "Permission denied"
- **Solution**: Check Rules tab, make sure rules are published
- Verify user is authenticated (logged in)

### Error: "Database URL not found"
- **Solution**: Realtime Database might not be enabled
- Go back to Step 1 and make sure you clicked "Enable"

### Error: "Quota exceeded"
- **Solution**: You're on Firebase free tier which has limits
- Check Firebase Console > Usage and Billing

### Error: "Database not initialized"
- **Solution**: 
  1. Check browser console for errors
  2. Verify Firebase project ID is correct: `dandulgheru-e5fcc`
  3. Make sure Realtime Database is enabled in Console

## Testing

After setup, test in your app:
1. Login with email
2. Start check-in (timer should save to Firebase)
3. Check Firebase Console > Realtime Database > Data tab
4. You should see: `users/{yourUserId}/timer/` with data

## Data Structure

The app stores data like this:
```
users/
  {userId}/
    timer/
      startTime: "..."
      pausedAt: null
      pausedDuration: 0
      isPaused: false
      isCheckedIn: true
    history/
      {checkInId}/
        id: "..."
        startTime: "..."
        endTime: "..."
        duration: 1234
        status: "checked-out"
    settings/
      targetHours: 32400
      notificationsEnabled: false
```

## Need Help?

If still not working:
1. Open browser console (F12)
2. Look for errors starting with `[Realtime]`
3. Check if you see: `[Firebase] Initialized successfully`
4. Check if Realtime Database shows as enabled in Firebase Console

