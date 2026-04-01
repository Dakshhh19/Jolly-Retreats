const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const LEFT = 48
const RIGHT = 48
const CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT

const escapeText = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')
  .replace(/[^\x20-\x7E]/g, '?')

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`

const splitText = (text, maxChars) => {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  if (!words.length) return ['']
  const lines = []
  let current = words[0]
  for (const word of words.slice(1)) {
    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }
  lines.push(current)
  return lines
}

class PdfBuilder {
  constructor() {
    this.pages = []
    this.current = []
    this.y = PAGE_HEIGHT - 52
    this.pageNumber = 0
    this.newPage()
  }

  newPage() {
    if (this.current.length) {
      this.pages.push(this.current.join('\n'))
    }
    this.current = []
    this.y = PAGE_HEIGHT - 52
    this.pageNumber += 1
  }

  push(line) {
    this.current.push(line)
  }

  setFill(r, g, b) {
    this.push(`${r} ${g} ${b} rg`)
  }

  setStroke(r, g, b) {
    this.push(`${r} ${g} ${b} RG`)
  }

  rect(x, y, width, height, fill = false) {
    this.push(`${x} ${y} ${width} ${height} re ${fill ? 'f' : 'S'}`)
  }

  line(x1, y1, x2, y2) {
    this.push(`${x1} ${y1} m ${x2} ${y2} l S`)
  }

  text(value, x, y, size = 12, font = 'F1') {
    this.push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapeText(value)}) Tj ET`)
  }

  paragraph(text, x, maxChars, size = 11, leading = 14, font = 'F1') {
    const lines = splitText(text, maxChars)
    lines.forEach((line) => {
      this.text(line, x, this.y, size, font)
      this.y -= leading
    })
  }

  ensureSpace(height) {
    if (this.y - height < 60) {
      this.newPage()
      drawPageHeader(this)
    }
  }

  finish() {
    if (this.current.length) {
      this.pages.push(this.current.join('\n'))
      this.current = []
    }

    const objects = []
    const addObject = (content) => {
      objects.push(content)
      return objects.length
    }

    const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
    const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')

    const contentIds = this.pages.map((page) => addObject(`<< /Length ${Buffer.byteLength(page, 'utf8')} >>\nstream\n${page}\nendstream`))
    const pageObjectIds = this.pages.map(() => addObject(''))
    const pagesId = addObject('')
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)

    pageObjectIds.forEach((objectId, index) => {
      objects[objectId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`
    })
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`

    let pdf = '%PDF-1.4\n'
    const offsets = [0]
    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, 'utf8'))
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
    })

    const xrefOffset = Buffer.byteLength(pdf, 'utf8')
    pdf += `xref\n0 ${objects.length + 1}\n`
    pdf += '0000000000 65535 f \n'
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
    })
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
    return Buffer.from(pdf, 'utf8')
  }
}

const drawPageHeader = (pdf) => {
  pdf.setFill(0.07, 0.36, 0.67)
  pdf.rect(LEFT, PAGE_HEIGHT - 74, 34, 34, true)
  pdf.setFill(1, 1, 1)
  pdf.text('JR', LEFT + 9, PAGE_HEIGHT - 60, 15, 'F2')
  pdf.setFill(0, 0, 0)
  pdf.text('Jolly Retreats', LEFT + 48, PAGE_HEIGHT - 54, 22, 'F2')
  pdf.text('support@jollyretreats.com | +1 800 555 0199', LEFT + 48, PAGE_HEIGHT - 72, 10, 'F1')
  pdf.line(LEFT, PAGE_HEIGHT - 86, PAGE_WIDTH - RIGHT, PAGE_HEIGHT - 86)
  pdf.y = PAGE_HEIGHT - 110
}

export const buildTourInvoicePdf = (booking) => {
  const pdf = new PdfBuilder()
  drawPageHeader(pdf)

  pdf.text('Tour Booking Invoice', LEFT, pdf.y, 18, 'F2')
  pdf.text(`Booking ID: ${booking.booking_id}`, PAGE_WIDTH - RIGHT - 180, pdf.y, 11, 'F2')
  pdf.y -= 26

  pdf.text('Customer Details', LEFT, pdf.y, 13, 'F2')
  pdf.y -= 18
  pdf.text(`Customer: ${booking.customer_name}`, LEFT, pdf.y)
  pdf.text(`Email: ${booking.customer_email || 'N/A'}`, LEFT + 250, pdf.y)
  pdf.y -= 16
  pdf.text(`Primary Contact: ${booking.primary_contact_person}`, LEFT, pdf.y)
  pdf.text(`Phone: ${booking.primary_contact_phone}`, LEFT + 250, pdf.y)
  pdf.y -= 24

  pdf.text('Booking Details', LEFT, pdf.y, 13, 'F2')
  pdf.y -= 18
  pdf.text(`Tour: ${booking.tour_title || booking.tour_name_snapshot}`, LEFT, pdf.y)
  pdf.y -= 16
  pdf.paragraph(`Description: ${booking.tour_description || booking.tour_description_snapshot || 'N/A'}`, LEFT, 74)
  pdf.text(`Travel Dates: ${booking.start_date} to ${booking.end_date}`, LEFT, pdf.y)
  pdf.text(`Travelers: ${booking.total_people}`, LEFT + 250, pdf.y)
  pdf.y -= 24

  pdf.text('Traveler List', LEFT, pdf.y, 13, 'F2')
  pdf.y -= 18

  const tableTop = pdf.y
  const columns = [LEFT, LEFT + 180, LEFT + 240, LEFT + 320, LEFT + 430, PAGE_WIDTH - RIGHT]
  const headers = ['Name', 'Age', 'Gender', 'Contact', '']
  pdf.setStroke(0.75, 0.75, 0.75)
  pdf.line(columns[0], tableTop, columns[5], tableTop)
  pdf.line(columns[0], tableTop - 22, columns[5], tableTop - 22)
  columns.slice(0, 5).forEach((x) => pdf.line(x, tableTop, x, tableTop - 22))
  pdf.line(columns[5], tableTop, columns[5], tableTop - 22)
  pdf.text(headers[0], columns[0] + 6, tableTop - 15, 10, 'F2')
  pdf.text(headers[1], columns[1] + 6, tableTop - 15, 10, 'F2')
  pdf.text(headers[2], columns[2] + 6, tableTop - 15, 10, 'F2')
  pdf.text(headers[3], columns[3] + 6, tableTop - 15, 10, 'F2')
  pdf.y = tableTop - 34

  booking.travelers.forEach((traveler) => {
    pdf.ensureSpace(28)
    const rowTop = pdf.y + 8
    pdf.line(columns[0], rowTop, columns[5], rowTop)
    columns.forEach((x) => pdf.line(x, rowTop + 22, x, rowTop))
    pdf.text(traveler.name, columns[0] + 6, pdf.y, 10)
    pdf.text(String(traveler.age), columns[1] + 6, pdf.y, 10)
    pdf.text(traveler.gender, columns[2] + 6, pdf.y, 10)
    pdf.text(traveler.contact_number, columns[3] + 6, pdf.y, 10)
    pdf.y -= 22
  })

  pdf.y -= 12
  pdf.ensureSpace(120)
  pdf.text('Billing Summary', LEFT, pdf.y, 13, 'F2')
  pdf.y -= 18
  pdf.text(`Cost per person: ${formatMoney(booking.price_per_person)}`, LEFT, pdf.y)
  pdf.text(`Quantity: ${booking.total_people}`, LEFT + 250, pdf.y)
  pdf.y -= 16
  const subtotal = Number(booking.price_per_person) * Number(booking.total_people)
  pdf.text(`Subtotal: ${formatMoney(subtotal)}`, LEFT, pdf.y)
  pdf.text(`Taxes: ${formatMoney(booking.tax_amount)}`, LEFT + 250, pdf.y)
  pdf.y -= 18
  pdf.line(LEFT, pdf.y, LEFT + 360, pdf.y)
  pdf.y -= 16
  pdf.text(`Grand Total: ${formatMoney(booking.total_amount)}`, LEFT, pdf.y, 14, 'F2')
  pdf.y -= 34

  pdf.text('Thank you for booking with Jolly Retreats.', LEFT, pdf.y, 11, 'F2')
  pdf.y -= 16
  pdf.text('Support: support@jollyretreats.com | +1 800 555 0199', LEFT, pdf.y, 10)

  return pdf.finish()
}
