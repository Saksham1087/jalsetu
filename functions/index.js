const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { getFirestore } = require('firebase-admin/firestore')
const { initializeApp } = require('firebase-admin/app')
const nodemailer = require('nodemailer')
const logger = require('firebase-functions/logger')

initializeApp()

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user
  if (!user || !pass) return null
  return { host, port, user, pass, from }
}

function buildEmailBody(complaint) {
  const shortId = (complaint.id || '').substring(0, 8).toUpperCase()
  const submittedDate = complaint.createdAt
    ? new Date(complaint.createdAt._seconds ? complaint.createdAt._seconds * 1000 : complaint.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : 'Just now'

  const typeLabels = {
    critical_leak: 'Critical Leak',
    low_pressure: 'Low Pressure',
    no_supply: 'No Supply',
    contamination: 'Contamination',
    billing: 'Billing Issue',
    other: 'Other',
  }
  const typeLabel = typeLabels[complaint.type] || complaint.type || 'Water Complaint'

  return `
Dear ${complaint.userName || 'Valued Resident'},

Thank you for reaching out to JalSetu. Your water complaint has been 
successfully submitted and is now with the concerned authorities for review.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  COMPLAINT CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Complaint ID:  ${shortId}
  Type:          ${typeLabel}
  Description:   ${complaint.description || 'N/A'}
  Location:      ${complaint.address || 'N/A'}
  Ward:          ${complaint.ward || 'N/A'}
  Status:        Submitted
  Submitted on:  ${submittedDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can track the status of your complaint anytime by visiting the 
JalSetu app and viewing the List tab.

We will keep you updated as your complaint progresses through 
each stage. If you have any urgent concerns, please contact your 
local ward office.

With gratitude,
Team JalSetu
— Mira Bhayander Water Management
  `.trim()
}

exports.sendComplaintConfirmation = onDocumentCreated(
  { document: 'complaints/{complaintId}', region: 'us-central1' },
  async (event) => {
    const snap = event.data
    if (!snap) {
      logger.log('No data associated with the event')
      return
    }

    const complaint = { id: snap.id, ...snap.data() }
    const userEmail = complaint.userEmail

    if (!userEmail) {
      logger.log('No userEmail on complaint', complaint.id)
      return
    }

    const smtp = getSmtpConfig()
    if (!smtp) {
      logger.log('SMTP not configured — set SMTP_USER and SMTP_PASS env vars')
      return
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    })

    const mailOptions = {
      from: `"JalSetu" <${smtp.from}>`,
      to: userEmail,
      subject: `✅ JalSetu — Your Complaint #${(complaint.id || '').substring(0, 8).toUpperCase()} Has Been Received`,
      text: buildEmailBody(complaint),
    }

    try {
      await transporter.sendMail(mailOptions)
      logger.log('Confirmation email sent to', userEmail, 'for complaint', complaint.id)
      await getFirestore().collection('complaints').doc(complaint.id).update({
        emailSent: true,
        emailSentAt: new Date(),
      })
    } catch (err) {
      logger.error('Failed to send confirmation email:', err.message)
    }
  }
)
