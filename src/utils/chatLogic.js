import { MIRA_BHAYANDER } from '../lib/miraBhayander'

function formatSchedule() {
  const s = MIRA_BHAYANDER.defaultSchedule
  return `${s.morning.start}–${s.morning.end} AM and ${s.evening.start}–${s.evening.end} PM`
}

export function getChatResponse(message) {
  if (!message || !message.trim()) {
    return {
      response: 'Please provide a message.',
      isProblem: false,
      suggestedSeverity: 'medium',
    }
  }

  const lowerMsg = message.toLowerCase().trim()

  let response = ''
  let isProblem = false
  let suggestedSeverity = 'medium'

  if (lowerMsg.includes('timing') || lowerMsg.includes('schedule') || lowerMsg.includes('supply time') || lowerMsg.includes('water time') || lowerMsg.includes('what time')) {
    response = `**Mira Bhayander Water Supply Schedule:**\n\nDefault supply timings across all wards: **${formatSchedule()}** daily.\n\n⚠️ Timings may vary slightly by ward. Contact MBMC at **${MIRA_BHAYANDER.contacts.waterComplaint}** for your specific ward schedule.\n\nAre you facing a supply issue?`
  } else if (lowerMsg.includes('contact') || lowerMsg.includes('mbmc') || lowerMsg.includes('phone') || lowerMsg.includes('number') || lowerMsg.includes('call')) {
    response = `**MBMC Contact Information:**\n\n• Water Complaint Helpline: **${MIRA_BHAYANDER.contacts.waterComplaint}**\n• Emergency: **${MIRA_BHAYANDER.contacts.emergency}**\n• Website: ${MIRA_BHAYANDER.contacts.website}\n\nYou can also file a complaint directly through the JalSetu app — tap "Report" in the bottom nav.`
  } else if (lowerMsg.includes('ghodbunder') || lowerMsg.includes('kashimira') || lowerMsg.includes('uttan') || lowerMsg.includes('mira road east') || lowerMsg.includes('bhayander east') || lowerMsg.includes('bhayander west')) {
    const area = MIRA_BHAYANDER.knownIssueAreas.find(a => lowerMsg.includes(a.area.toLowerCase()))
    if (area) {
      response = `**Known issues in ${area.area}:**\n\n${area.issues.map(i => `• ${i}`).join('\n')}\n\nIf you're experiencing these issues, please file a complaint with details about your specific location. The more reports we get, the faster MBMC can address the problem.\n\nWould you like to submit a complaint?`
      isProblem = true
    } else {
      response = `That area is within Mira Bhayander. You can check supply timings or file a complaint for any water issues you're facing there.`
    }
  } else if (lowerMsg.includes('leak') || lowerMsg.includes('burst') || lowerMsg.includes('flood')) {
    isProblem = true
    suggestedSeverity = 'critical_leak'
    response = `This sounds like a **critical leak**. Please file a complaint immediately with:
• Location (use the map pin)
• A clear photo of the leak
• Description of the damage

Would you like me to help you submit a complaint?`
  } else if (lowerMsg.includes('pressure') || lowerMsg.includes('weak flow') || lowerMsg.includes('low flow')) {
    isProblem = true
    suggestedSeverity = 'low_pressure'
    response = `**Low water pressure** can indicate pipe issues or pump problems. To report:
• Note which floors/taps are affected
• Time of day when pressure drops
• Photo of pressure gauge if available

Want to submit a complaint?`
  } else if (lowerMsg.includes('no water') || lowerMsg.includes('outage') || lowerMsg.includes('dry tap')) {
    isProblem = true
    suggestedSeverity = 'no_supply'
    response = `**No water supply** is an urgent issue. Please report with:
• Your exact address/ward
• How long it's been out
• Whether neighbors are affected

I can help you file a complaint now.`
  } else if (lowerMsg.includes('color') || lowerMsg.includes('smell') || lowerMsg.includes('taste') || lowerMsg.includes('dirty') || lowerMsg.includes('contaminat')) {
    isProblem = true
    suggestedSeverity = 'contamination'
    response = `**Water contamination** is a health emergency. Report immediately with:
• Photo of water in clear container
• Description of color/smell/taste
• When you first noticed it

Submit a complaint right away.`
  } else if (lowerMsg.includes('bill') || lowerMsg.includes('charge') || lowerMsg.includes('meter')) {
    isProblem = true
    suggestedSeverity = 'billing'
    response = `For **billing issues**, you'll need:
• Recent meter reading
• Bill copy
• Previous bills for comparison

This goes through a different process than supply complaints.`
  } else {
    response = `I can help you with water issues in **Mira Bhayander**!

🔴 **Critical Leak** - Burst pipes, flooding
🟠 **Low Pressure** - Weak flow, can't fill tanks
🟡 **No Supply** - Complete outage
🔵 **Contamination** - Color, smell, taste issues
🟣 **Billing** - Meter reading, charges

**Supply Schedule:** ${formatSchedule()} daily
**MBMC Helpline:** ${MIRA_BHAYANDER.contacts.waterComplaint}

**To file a complaint:**
1. Tap 'Report' in the bottom nav
2. Select severity
3. Describe the issue
4. Upload a photo (GPS auto-filled)
5. Confirm location on map

What are you experiencing?`
  }

  return { response, isProblem, suggestedSeverity }
}