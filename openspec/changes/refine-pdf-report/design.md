## Context

The PDF report currently includes a timeline that repeats status history already visible in the app. Users downloading a report want a concise snapshot — type, description, location, contact, photo — not a full audit log. The success screen after submission auto-dismisses after 7 seconds with no way to dismiss early. Users should be able to close it immediately.

## Decisions

**Decision 1: Remove timeline from PDF**
The timeline adds unnecessary page length. The PDF is meant as a shareable/printable record of the complaint details, not a full history. Users can view the timeline in-app.

**Decision 2: Manual dismiss only on success screen**
Replace the auto-dismiss timeout with a persistent success state that only closes when the user clicks "Back" or "Close". This gives users unlimited time to read the confirmation, download the report, or both.

**Decision 3: "Back" button wording**
Use "Back" instead of "Close" to indicate the user is returning to the form (which is then in its reset state).
