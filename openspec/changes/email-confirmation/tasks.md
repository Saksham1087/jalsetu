## 1. Store userEmail on complaint

- [x] 1.1 Add `userEmail` field to `createComplaintData` in `firestore.js`
- [x] 1.2 Add `userEmail` field to `complaintService.create()` in `complaintService.js`
- [x] 1.3 Pass `userEmail` from ComplaintForm to submitComplaint

## 2. Create Cloud Function

- [x] 2.1 Create `functions/index.js` with Firestore trigger and email sending
- [x] 2.2 Add `nodemailer` dependency to `functions/package.json`

## 3. Update UI success message

- [x] 3.1 Add "Confirmation sent to {email}" message in ComplaintForm success state

## 4. Verification

- [x] 4.1 Build passes
- [x] 4.2 Lint passes
