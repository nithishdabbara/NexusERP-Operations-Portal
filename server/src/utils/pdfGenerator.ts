import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateChallanPDF = (challan: any, res: Response) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  doc.pipe(res);

  // Colors
  const primaryColor = '#1E3A8A';
  const secondaryColor = '#4B5563';

  // Header Banner
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(24)
    .text('NEXUS ERP', 40, 40)
    .font('Helvetica')
    .fontSize(10)
    .fillColor(secondaryColor)
    .text('Wholesale & CRM Operations Portal', 40, 68);

  // Title: Sales Challan / Invoice
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text('SALES CHALLAN / INVOICE', 350, 40, { align: 'right' })
    .font('Helvetica')
    .fontSize(10)
    .fillColor(secondaryColor)
    .text(`Challan No: ${challan.challanNumber}`, 350, 65, { align: 'right' })
    .text(`Date: ${new Date(challan.createdAt).toLocaleDateString()}`, 350, 80, { align: 'right' })
    .text(`Status: ${challan.status}`, 350, 95, { align: 'right' });

  doc.moveTo(40, 115).lineTo(555, 115).strokeColor('#E5E7EB').stroke();

  // Customer & Company Info Box
  const startY = 130;

  // Bill To (Customer)
  doc
    .fontSize(11)
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .text('BILL TO / CUSTOMER DETAILS:', 40, startY)
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#111827')
    .text(challan.customer.name, 40, startY + 18)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(`Business: ${challan.customer.businessName}`, 40, startY + 32)
    .text(`Mobile: ${challan.customer.mobile}`, 40, startY + 46)
    .text(`Email: ${challan.customer.email}`, 40, startY + 60)
    .text(`GST: ${challan.customer.gstNumber || 'N/A'}`, 40, startY + 74)
    .text(`Address: ${challan.customer.address}`, 40, startY + 88, { width: 220 });

  // Issued By
  doc
    .fontSize(11)
    .fillColor(primaryColor)
    .text('ISSUED BY:', 320, startY)
    .fontSize(10)
    .fillColor('#111827')
    .text('Global Distribution Corp', 320, startY + 18)
    .fillColor(secondaryColor)
    .text('Warehouse 4B, Industrial Park', 320, startY + 32)
    .text('New Delhi, India - 110001', 320, startY + 46)
    .text(`Created By: ${challan.createdBy?.name || 'System'} (${challan.createdBy?.role || 'Admin'})`, 320, startY + 60);

  // Items Table Header
  const tableTop = 260;
  doc.rect(40, tableTop, 515, 24).fill('#F3F4F6');

  doc
    .fillColor(primaryColor)
    .fontSize(9)
    .text('SKU', 48, tableTop + 7)
    .text('PRODUCT DESCRIPTION', 130, tableTop + 7)
    .text('PRICE', 330, tableTop + 7, { align: 'right' })
    .text('QTY', 420, tableTop + 7, { align: 'right' })
    .text('SUBTOTAL', 480, tableTop + 7, { align: 'right' });

  let y = tableTop + 30;

  // Items List
  doc.fillColor('#1F2937').fontSize(9);

  challan.items.forEach((item: any) => {
    doc
      .text(item.productSku, 48, y)
      .text(item.productName, 130, y, { width: 180 })
      .text(`₹${item.unitPrice.toFixed(2)}`, 330, y, { align: 'right' })
      .text(item.quantity.toString(), 420, y, { align: 'right' })
      .text(`₹${item.subtotal.toFixed(2)}`, 480, y, { align: 'right' });

    y += 24;
    doc.moveTo(40, y - 6).lineTo(555, y - 6).strokeColor('#F3F4F6').stroke();
  });

  // Total Summary
  y += 10;
  doc.rect(320, y, 235, 50).fill('#F9FAFB');

  doc
    .fillColor(secondaryColor)
    .fontSize(10)
    .text(`Total Quantity:`, 330, y + 10)
    .text(`${challan.totalQuantity} Units`, 480, y + 10, { align: 'right' })
    .fillColor(primaryColor)
    .fontSize(12)
    .text(`Grand Total:`, 330, y + 28)
    .text(`₹${challan.totalAmount.toFixed(2)}`, 480, y + 28, { align: 'right' });

  // Footer / Terms
  doc
    .fontSize(8)
    .fillColor('#9CA3AF')
    .text('Thank you for your business! Terms: Payment due within 30 days of receipt.', 40, 780, {
      align: 'center',
      width: 515
    });

  doc.end();
};
