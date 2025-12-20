import jsPDF from 'jspdf'

interface SalesReportData {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  totalProductsSold: number
  totalRevenue: number
  revenueByMethod: {
    CASH: number
    QRIS: number
    EDC: number
  }
  productSales: Array<{
    productId: string
    productName: string
    quantitySold: number
    totalRevenue: number
  }>
  dailyRevenue: Array<{ date: string; amount: number }>
}

export function generateSalesReportPDF(data: SalesReportData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPos = margin
    }
  }

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN PENJUALAN', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Resto Iga Bakar', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  // Period Info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Periode Laporan:', margin, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  const startDate = new Date(data.period.startDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const endDate = new Date(data.period.endDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  doc.text(
    `${startDate} - ${endDate} (${data.period.days} hari terakhir)`,
    margin,
    yPos
  )
  yPos += 10

  // Generated date
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(
    `Dibuat pada: ${new Date().toLocaleString('id-ID')}`,
    margin,
    yPos
  )
  yPos += 15

  // Summary Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RINGKASAN', margin, yPos)
  yPos += 10

  checkPageBreak(30)

  // Summary boxes
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Total Products Sold
  doc.setFillColor(34, 197, 94) // green
  doc.roundedRect(margin, yPos, 85, 25, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Produk Terjual', margin + 5, yPos + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.text(
    data.totalProductsSold.toLocaleString('id-ID'),
    margin + 5,
    yPos + 18
  )

  // Total Revenue
  doc.setFillColor(249, 115, 22) // orange
  doc.roundedRect(margin + 90, yPos, 85, 25, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Total Pendapatan', margin + 95, yPos + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(
    `Rp ${data.totalRevenue.toLocaleString('id-ID')}`,
    margin + 95,
    yPos + 18
  )

  doc.setTextColor(0, 0, 0) // Reset to black
  yPos += 35

  checkPageBreak(50)

  // Payment Methods Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PENDAPATAN PER METODE PEMBAYARAN', margin, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Cash
  doc.setFillColor(59, 130, 246) // blue
  doc.roundedRect(margin, yPos, 60, 20, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('CASH', margin + 5, yPos + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(
    `Rp ${data.revenueByMethod.CASH.toLocaleString('id-ID')}`,
    margin + 5,
    yPos + 15
  )
  const cashPercent =
    data.totalRevenue > 0
      ? ((data.revenueByMethod.CASH / data.totalRevenue) * 100).toFixed(1)
      : '0'
  doc.text(`${cashPercent}%`, margin + 5, yPos + 20)

  // QRIS
  doc.setFillColor(147, 51, 234) // purple
  doc.roundedRect(margin + 65, yPos, 60, 20, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('QRIS', margin + 70, yPos + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(
    `Rp ${data.revenueByMethod.QRIS.toLocaleString('id-ID')}`,
    margin + 70,
    yPos + 15
  )
  const qrisPercent =
    data.totalRevenue > 0
      ? ((data.revenueByMethod.QRIS / data.totalRevenue) * 100).toFixed(1)
      : '0'
  doc.text(`${qrisPercent}%`, margin + 70, yPos + 20)

  // EDC
  doc.setFillColor(34, 197, 94) // green
  doc.roundedRect(margin + 130, yPos, 60, 20, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('EDC', margin + 135, yPos + 8)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(
    `Rp ${data.revenueByMethod.EDC.toLocaleString('id-ID')}`,
    margin + 135,
    yPos + 15
  )
  const edcPercent =
    data.totalRevenue > 0
      ? ((data.revenueByMethod.EDC / data.totalRevenue) * 100).toFixed(1)
      : '0'
  doc.text(`${edcPercent}%`, margin + 135, yPos + 20)

  doc.setTextColor(0, 0, 0) // Reset to black
  yPos += 30

  checkPageBreak(40)

  // Product Sales Detail Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAIL PRODUK TERJUAL', margin, yPos)
  yPos += 10

  if (data.productSales.length > 0) {
    // Table header
    doc.setFillColor(243, 244, 246) // gray-100
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('No', margin + 3, yPos + 6)
    doc.text('Nama Produk', margin + 15, yPos + 6)
    doc.text('Jumlah', pageWidth - margin - 50, yPos + 6, { align: 'right' })
    doc.text('Pendapatan', pageWidth - margin - 5, yPos + 6, { align: 'right' })
    yPos += 10

    // Table rows
    doc.setFont('helvetica', 'normal')
    data.productSales.forEach((item, index) => {
      checkPageBreak(10)

      // Alternate row color
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251) // gray-50
        doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 8)
      }

      doc.setFontSize(8)
      doc.text((index + 1).toString(), margin + 3, yPos + 5)
      
      // Truncate product name if too long
      const maxWidth = pageWidth - margin - 80
      let productName = item.productName
      const nameWidth = doc.getTextWidth(productName)
      if (nameWidth > maxWidth) {
        productName = doc.splitTextToSize(productName, maxWidth)[0] + '...'
      }
      doc.text(productName, margin + 15, yPos + 5)
      
      doc.text(
        `${item.quantitySold.toLocaleString('id-ID')} pcs`,
        pageWidth - margin - 50,
        yPos + 5,
        { align: 'right' }
      )
      doc.text(
        `Rp ${item.totalRevenue.toLocaleString('id-ID')}`,
        pageWidth - margin - 5,
        yPos + 5,
        { align: 'right' }
      )
      yPos += 8
    })
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.text('Belum ada data penjualan produk', margin, yPos)
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `Laporan_Penjualan_${dateStr}.pdf`

  // Save PDF
  doc.save(filename)
}


