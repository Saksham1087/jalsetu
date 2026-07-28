import { formatType } from './formatters'

const STATUS_COLORS = {
  submitted: { fill: '#0F2E35', text: '#ffffff' },
  acknowledged: { fill: '#127A7A', text: '#ffffff' },
  in_progress: { fill: '#C8914A', text: '#ffffff' },
  resolved: { fill: '#2E7D5A', text: '#ffffff' },
  rejected: { fill: '#C44A3A', text: '#ffffff' },
}

const STATUS_LABELS = {
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

function sanitizeFileName(str) {
  return str
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase() || 'complaint'
}

function formatDateForFilename(date) {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`
}

function formatDateLong(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function shortId(id) {
  return (id || '').substring(0, 8).toUpperCase() || 'N/A'
}

async function preloadImage(url) {
  if (!url) return null
  if (url.startsWith('data:')) return url
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function tableRow(label, value) {
  return [
    { text: label, style: 'tableLabel', alignment: 'left' },
    { text: value || 'N/A', style: 'tableValue', alignment: 'left' },
  ]
}

export async function generateComplaintPdf(complaint) {
  const pdfMake = (await import('pdfmake/build/pdfmake')).default
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = pdfFontsModule.default || pdfFontsModule

  const today = formatDateLong(new Date())
  const statusColors = STATUS_COLORS[complaint.status] || STATUS_COLORS.submitted
  const statusLabel = STATUS_LABELS[complaint.status] || complaint.status

  let photoImage = null
  const photoUrl = complaint.images?.[0] || complaint.photoURL || null
  if (photoUrl) {
    photoImage = await preloadImage(photoUrl)
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 50],
    info: {
      title: `Complaint Report - ${complaint.id || ''}`,
      author: 'JalSetu',
      subject: 'Water Complaint Report',
    },
    content: [
      { text: 'JalSetu', style: 'brandTitle' },
      { text: 'Water Complaint Report', style: 'brandSubtitle' },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#127A7A' },
        ],
      },
      { text: '\n' },

      {
        columns: [
          {
            width: '*',
            stack: [
              { text: `Complaint ID: ${shortId(complaint.id)}`, style: 'metaText' },
            ],
          },
          {
            width: 'auto',
            table: {
              body: [[
                {
                  text: `  ${statusLabel}  `,
                  fillColor: statusColors.fill,
                  color: statusColors.text,
                  alignment: 'center',
                  fontSize: 10,
                  bold: true,
                  margin: [6, 3, 6, 3],
                },
              ]],
            },
            layout: 'noBorders',
          },
          {
            width: '*',
            stack: [
              { text: `Issued: ${today}`, style: 'metaText', alignment: 'right' },
            ],
          },
        ],
        columnGap: 10,
      },

      { text: '\n' },

      { text: 'COMPLAINT TYPE', style: 'sectionTitle' },
      { text: formatType(complaint.type), style: 'bodyText' },
      { text: '\n' },

      { text: 'DESCRIPTION', style: 'sectionTitle' },
      { text: complaint.description || 'No description provided', style: 'bodyText' },
      { text: '\n' },

      { text: 'LOCATION', style: 'sectionTitle' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            tableRow('Address', complaint.address),
            tableRow('Ward', complaint.ward),
            tableRow('Landmark', complaint.landmark),
            tableRow(
              'GPS Coordinates',
              complaint.latitude
                ? `${Number(complaint.latitude).toFixed(6)}, ${Number(complaint.longitude).toFixed(6)}`
                : 'N/A',
            ),
          ],
        },
        layout: 'noBorders',
      },
      { text: '\n' },

      { text: 'CONTACT', style: 'sectionTitle' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            tableRow('Reported by', complaint.userName || 'Anonymous'),
            tableRow('Mobile', complaint.mobile || 'Not provided'),
            tableRow('Submitted', formatDateLong(complaint.createdAt)),
            tableRow('Last Updated', formatDateLong(complaint.updatedAt || complaint.createdAt)),
          ],
        },
        layout: 'noBorders',
      },
      { text: '\n' },

      ...(photoImage
        ? [
            { text: 'PHOTO', style: 'sectionTitle' },
            { image: photoImage, width: 400, alignment: 'center', margin: [0, 4, 0, 8] },
            { text: '\n' },
          ]
        : []),

    ],

    styles: {
      brandTitle: {
        fontSize: 24,
        bold: true,
        color: '#127A7A',
        margin: [0, 0, 0, 2],
      },
      brandSubtitle: {
        fontSize: 14,
        color: '#666666',
        margin: [0, 0, 0, 4],
      },
      sectionTitle: {
        fontSize: 10,
        bold: true,
        color: '#127A7A',
        margin: [0, 12, 0, 4],
      },
      bodyText: {
        fontSize: 11,
        color: '#333333',
        lineHeight: 1.4,
      },
      metaText: {
        fontSize: 9,
        color: '#888888',
      },
      tableLabel: {
        fontSize: 10,
        bold: true,
        color: '#555555',
        margin: [0, 2, 0, 2],
      },
      tableValue: {
        fontSize: 11,
        color: '#333333',
        margin: [0, 2, 0, 2],
      },
    },

    footer: (currentPage, pageCount) => ({
      text: `Generated by JalSetu — ${formatDateLong(new Date())}  |  Page ${currentPage} of ${pageCount}`,
      fontSize: 8,
      color: '#aaaaaa',
      alignment: 'center',
      margin: [0, 10, 0, 0],
    }),
  }

  const fileName = `${sanitizeFileName(complaint.userName || 'user')}-${sanitizeFileName(formatType(complaint.type))}-${formatDateForFilename(complaint.createdAt)}.pdf`

  pdfMake.createPdf(docDefinition).download(fileName)
}
