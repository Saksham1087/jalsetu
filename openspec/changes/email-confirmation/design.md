## Context

Email sending has two paths:

**Firebase mode**: Cloud Function with Firestore trigger `onDocumentCreated`. Uses Nodemailer with configurable SMTP (Gmail/SendGrid via Firebase config). Gracefully handles missing config by logging instead of crashing.

**Demo mode**: No Firebase available. The success view simulates the email confirmation message since there's no server.

## Decisions

**Decision 1: Cloud Function with Nodemailer**
The `functions/` dir already has `firebase-functions` and `firebase-admin`. Adding `nodemailer` is lightweight. SMTP credentials are provided via `firebase functions:config:set` — no hardcoded secrets. The function is idempotent (only sends once).

**Decision 2: Store userEmail on complaint doc**
The email is captured from `user.email` (Google Auth) at submission time and stored as `userEmail` on the complaint. This lets the Cloud Function read it without needing to query auth.

**Decision 3: Confirmation email content**
Short, polite, warm message:
- Thank the user
- Confirm submission
- Show complaint details (type, description, location, ID)
- Link to track status (the app URL)
- No PDF attachment

## Email Template

```
Subject: ✅ JalSetu — Your Complaint Has Been Received

Dear {userName},

Thank you for reaching out to JalSetu. Your water complaint has been 
successfully submitted and is now with the concerned authorities.

📋 Complaint Summary
────────────────────
Complaint ID:  {shortId}
Type:          {type}
Description:   {description}
Location:      {address}
Ward:          {ward}
Status:        Submitted
Submitted on:  {date}

You can track the status of your complaint anytime:
{appUrl}

We will keep you updated as your complaint progresses. 
If you have any urgent concerns, please contact your local ward office.

With gratitude,
Team JalSetu
— Mira Bhayander Water Management
```
