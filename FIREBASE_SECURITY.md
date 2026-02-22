# Firebase Security Rules for Mobile App

This document explains the security rules configured for the MLSC mobile app.

## Overview

The mobile app uses a **hybrid architecture**:
- **Direct Firebase SDK access** for public read-only data (events, team, jobs)
- **REST API endpoints** for all mutations and sensitive operations

This ensures:
- ✅ Real-time updates for public data
- ✅ Secure mutations through validated API endpoints
- ✅ Centralized business logic on the backend
- ✅ Protection against unauthorized access

---

## Firestore Security Rules

### Public Read Access (Mobile Apps)

These collections are readable by anyone:

✅ **events** - All event documents
- Mobile apps can read event details
- Registrations subcollection is protected (API only)

✅ **teamMembers** - Only active members
- Mobile apps can read `status == 'active'` members only
- Pending members are hidden

✅ **teamCategories** - All categories
✅ **jobs** - All job listings
✅ **notifications** - All notifications
✅ **settings** - Application settings (deadline, etc.)

### Protected Collections (API Only)

These collections require REST API access:

🔒 **applications** - No direct mobile access
- Submissions go through `POST /api/v1/applications`
- Queries go through `GET /api/v1/admin/applications`

🔒 **authTokens** - Server-side only
- Stores refresh tokens
- No client access

🔒 **visitors** - Analytics only
- Written by middleware
- Read by admins only

### Admin-Only Access

These collections require authenticated admin/panel role:

👤 **panels** - Panel configuration
👤 **All write operations** - Create, update, delete

---

## Firebase Storage Rules

### Public Read Access

✅ **profile-images/** - User profile pictures
✅ **team-images/** - Team member photos
✅ **events/...** - Event banners and images
✅ **event-highlights/** - Event highlight galleries
✅ **speakers/** - Speaker photos

### Protected Storage

🔒 **resumes/** - No public access
- Uploaded via `POST /api/v1/applications`
- Processed server-side
- Never exposed to clients

---

## Deploying Rules

### Option 1: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy content from `firestore.rules`
5. Click **Publish**

6. Navigate to **Storage** → **Rules**
7. Copy content from `storage.rules`
8. Click **Publish**

### Option 2: Firebase CLI (Recommended)

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy both at once
firebase deploy --only firestore:rules,storage:rules
```

---

## Testing Rules

### Test Public Read Access

```javascript
// Should succeed - reading active team members
const teamRef = collection(db, 'teamMembers');
const q = query(teamRef, where('status', '==', 'active'));
const snapshot = await getDocs(q);

// Should succeed - reading events
const eventsRef = collection(db, 'events');
const eventsSnapshot = await getDocs(eventsRef);

// Should fail - reading applications
const appsRef = collection(db, 'applications');
const appsSnapshot = await getDocs(appsRef); // Permission denied
```

### Test Write Protection

```javascript
// Should fail - writing to applications
await addDoc(collection(db, 'applications'), {
  name: 'Test',
  // ... other fields
}); // Permission denied

// Should fail - writing to events
await addDoc(collection(db, 'events'), {
  title: 'Test Event',
  // ... other fields
}); // Permission denied
```

---

## Security Best Practices

### ✅ What Mobile Apps CAN Do:

1. **Read** public collections (events, team, jobs, notifications)
2. **Subscribe** to real-time updates for public data
3. **Call** REST API endpoints for mutations
4. **Upload** files through REST API endpoints only

### ❌ What Mobile Apps CANNOT Do:

1. **Write** directly to Firestore (must use API)
2. **Read** sensitive data (applications, auth tokens)
3. **Access** pending team members
4. **Download** resumes from Storage
5. **Bypass** API validation and business logic

---

## Monitoring and Auditing

### Enable Firestore Audit Logs

1. Go to Firebase Console → **Firestore**
2. Navigate to **Usage** tab
3. Enable audit logging to track:
   - Failed permission attempts
   - Unusual access patterns
   - Potential security issues

### Monitor API Usage

Check your API logs for:
- Excessive failed login attempts
- Suspicious rate limit hits
- Unauthorized access attempts

---

## Common Issues and Solutions

### Issue: "Permission denied" on valid reads

**Solution:** Check that:
- Firestore rules are deployed
- Collection name is correct
- For team members, `status == 'active'`
- Firebase SDK is initialized correctly

### Issue: Mobile app can't submit applications

**Solution:** Applications must go through REST API:
- Use `POST /api/v1/applications` endpoint
- Include all required fields
- Attach resume as multipart/form-data

### Issue: Real-time listeners not updating

**Solution:**
- Ensure rules allow read access
- Check network connectivity
- Verify Firestore offline persistence is enabled

---

## Rule Updates History

### Version 1.0 (Current)
- Initial mobile app security rules
- Hybrid architecture: Firebase reads + API writes
- Public read for events, team, jobs
- Protected writes for all mutations

---

## Emergency Access

If you need to temporarily disable security rules (NOT RECOMMENDED for production):

```javascript
// ⚠️ DANGER: Development only
match /{document=**} {
  allow read, write: if true;
}
```

**Remember to restore proper rules immediately after testing!**

---

## Contact

For security concerns or questions:
- Review this document
- Check Firebase Console logs
- Contact the development team
