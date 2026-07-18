const { onCall } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

// Callable function for AI chat
exports.chatWithAI = onCall(async (request) => {
  const { message, context } = request.data
  const userId = request.auth?.uid

  if (!message) {
    throw new Error('Message is required')
  }

  // Simple intent detection without external AI
  const lowerMsg = message.toLowerCase()
  
  let response = ''
  let isProblem = false
  let suggestedSeverity = 'medium'

  // Detect water-related issues
  if (lowerMsg.includes('leak') || lowerMsg.includes('burst') || lowerMsg.includes('flood')) {
    isProblem = true
    suggestedSeverity = 'critical_leak'
    response = "This sounds like a **critical leak**. Please file a complaint immediately with:\n• Location (use the map pin)\n• A clear photo of the leak\n• Description of the damage\n\nWould you like me to help you submit a complaint?"
  } else if (lowerMsg.includes('pressure') || lowerMsg.includes('weak flow') || lowerMsg.includes('low flow')) {
    isProblem = true
    suggestedSeverity = 'low_pressure'
    response = "**Low water pressure** can indicate pipe issues or pump problems. To report:\n• Note which floors/taps are affected\n• Time of day when pressure drops\n• Photo of pressure gauge if available\n\nWant to submit a complaint?"
  } else if (lowerMsg.includes('no water') || lowerMsg.includes('outage') || lowerMsg.includes('dry tap')) {
    isProblem = true
    suggestedSeverity = 'no_supply'
    response = "**No water supply** is an urgent issue. Please report with:\n• Your exact address/ward\n• How long it's been out\n• Whether neighbors are affected\n\nI can help you file a complaint now."
  } else if (lowerMsg.includes('color') || lowerMsg.includes('smell') || lowerMsg.includes('taste') || lowerMsg.includes('dirty') || lowerMsg.includes('contaminat')) {
    isProblem = true
    suggestedSeverity = 'contamination'
    response = "**Water contamination** is a health emergency. Report immediately with:\n• Photo of water in clear container\n• Description of color/smell/taste\n• When you first noticed it\n\nSubmit a complaint right away."
  } else if (lowerMsg.includes('bill') || lowerMsg.includes('charge') || lowerMsg.includes('meter')) {
    isProblem = true
    suggestedSeverity = 'billing'
    response = "For **billing issues**, you'll need:\n• Recent meter reading\n• Bill copy\n• Previous bills for comparison\n\nThis goes through a different process than supply complaints."
  } else {
    // General help
    response = "I can help you with:\n\n🔴 **Critical Leak** - Burst pipes, flooding\n🟠 **Low Pressure** - Weak flow, can't fill tanks\n🟡 **No Supply** - Complete outage\n🔵 **Contamination** - Color, smell, taste issues\n🟣 **Billing** - Meter reading, charges\n\n**To file a complaint:**\n1. Tap 'Report' in the bottom nav\n2. Select severity\n3. Describe the issue\n4. Upload a photo (GPS auto-filled)\n5. Confirm location on map\n\nWhat are you experiencing?"
  }

  return { response, isProblem, suggestedSeverity }
})

// Optional: Scheduled function to clean old complaints
exports.cleanupOldComplaints = require('firebase-functions/v2/scheduler').onSchedule(
  '0 3 * * 0', // Weekly at 3 AM Sunday
  async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const snapshot = await db.collection('complaints')
      .where('createdAt', '<', thirtyDaysAgo)
      .where('status', 'in', ['resolved', 'rejected'])
      .limit(500)
      .get()
    
    const batch = db.batch()
    snapshot.docs.forEach(doc => batch.delete(doc.ref))
    await batch.commit()
    console.log(`Cleaned ${snapshot.size} old complaints`)
  }
)
