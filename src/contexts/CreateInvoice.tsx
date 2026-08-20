import {
  PDFDocument,
  rgb,
  PDFName,
  PDFArray
} from 'pdf-lib';
import invoiceEn from "./exempEn.pdf";
import deliveryFormPdf from "./delivery_form.pdf"; // ← your ordered-items template page
import QRCode from 'qrcode';
import NotoSansArabicUrl from "./NotoSansArabic-Regular.ttf?url";
import * as fontkitImport from 'fontkit';
type PdfFontkit = Parameters<PDFDocument['registerFontkit']>[0];
const fontkit = fontkitImport as unknown as PdfFontkit;

import * as arabicReshaperModule from "arabic-reshaper";
import type { clientData, PaymentResponse } from "./PaymentContext";

interface InvoiceItem {
  productType?: string;
  product_type?: string;
  category?: string;
  name?: string;
  size?: string | number;
  quantity?: number;
  price?: number;
  promo?: number;
}

const origin = import.meta.env.VITE_ACTUAL_ORIGIN;

// ─────────────────────────────────────────────────────────────────
// Layout constants — measured from delivery_form PDF
// Page size: 595.5 × 842.25 pt  |  pdf-lib uses bottom-up Y
// ─────────────────────────────────────────────────────────────────
const MAX_ROWS_PER_PAGE = 30;

const COL_X = {
  item:        29.6,
  description: 118.2,
  quantity:    295.4,
  price:       351.7,
  total:       445.0,
} as const;

// First data row baseline: page_height(842.25) - pdfplumber_bottom(116.08) + padding(5) = 731.17
const FIRST_ROW_Y  = 731.2;
const ROW_HEIGHT   = 20.5;

// ─── helpers ──────────────────────────────────────────────────────

function rowY(rowIndex: number): number {
  return FIRST_ROW_Y - rowIndex * ROW_HEIGHT;
}

function unitPrice(price: number, promo: number): number {
  return promo > 0 ? price * (1 - promo / 100) : price;
}

// ─── build ordered-items pages and append them to masterDoc ───────

async function appendItemPages(
  masterDoc: PDFDocument,
  items: InvoiceItem[],
  templateBytes: ArrayBuffer
): Promise<void> {
  const totalPages = Math.ceil(items.length / MAX_ROWS_PER_PAGE);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    // Fresh template copy per page so drawings don't bleed
    const templateDoc = await PDFDocument.load(templateBytes);
    const [templatePage] = templateDoc.getPages();

    // Embed Arabic font into this copy
    templateDoc.registerFontkit(fontkit);
    const fontBytes = await fetch(NotoSansArabicUrl).then(r => r.arrayBuffer());
    const pageFont  = await templateDoc.embedFont(fontBytes);

    const slice = items.slice(
      pageIdx * MAX_ROWS_PER_PAGE,
      (pageIdx + 1) * MAX_ROWS_PER_PAGE
    );

    slice.forEach((item, rowIdx: number) => {
      const y         = rowY(rowIdx);
      const qty       = item.quantity ?? 1;
      const unit      = unitPrice(item.price ?? 0, item.promo ?? 0);
      const lineTotal = unit * qty;

      // ITEM → productType
      templatePage.drawText(
        arabicReshaperModule.convertArabic(String(item.productType ?? item.product_type ?? '')),
        { x: COL_X.item, y, size: 9, font: pageFont, color: rgb(0, 0, 0) }
      );

      // DESCRIPTION → "category – name – T:size"
      const desc = [item.category, item.name, item.size ? `T:${item.size}` : '']
        .filter(Boolean)
        .join(' – ');
      templatePage.drawText(
        arabicReshaperModule.convertArabic(desc),
        { x: COL_X.description, y, size: 8, font: pageFont, color: rgb(0, 0, 0) }
      );

      // QUANTITY
      templatePage.drawText(
        String(qty),
        { x: COL_X.quantity, y, size: 9, font: pageFont, color: rgb(0, 0, 0) }
      );

      // PRICE (after promo)
      templatePage.drawText(
        unit.toFixed(2),
        { x: COL_X.price, y, size: 9, font: pageFont, color: rgb(0, 0, 0) }
      );

      // TOTAL = unit × qty
      templatePage.drawText(
        lineTotal.toFixed(2),
        { x: COL_X.total, y, size: 9, font: pageFont, color: rgb(0, 0, 0) }
      );
    });

    // Copy filled page into master doc
    const [copied] = await masterDoc.copyPages(templateDoc, [0]);
    masterDoc.addPage(copied);
  }
}

// ─────────────────────────────────────────────────────────────────
// createInvoice — original first-page logic preserved exactly,
// + successTransItems pages appended at the end
// ─────────────────────────────────────────────────────────────────
const createInvoice = async (
  paymentResponse: PaymentResponse,
  clientForm: clientData | undefined,
  successTransItems: InvoiceItem[] = []
) => {
  const invoiceFile = await fetch(invoiceEn).then(res => res.arrayBuffer());
  const invoicePdf  = await PDFDocument.load(invoiceFile);
  const filePages   = invoicePdf.getPages();
  const firstPage   = filePages[0];

  // ── QR code ────────────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(
    `${origin}${'orders/track/'}${paymentResponse?.order_id}`,
    { color: { dark: '#545454' } }
  );

  const qrImageBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer());
  const qrImage      = await invoicePdf.embedPng(qrImageBytes);
  const qrDims       = qrImage.scale(0.75);

  firstPage.drawImage(qrImage, {
    x: 100,
    y: 100,
    width:  qrDims.width,
    height: qrDims.height,
  });

  // ── Clickable link text ─────────────────────────────────────────
  // NOTE: convertArabic kept exactly as original — do not change
  const linkText = arabicReshaperModule.convertArabic('Click here! | Cliquer ici !');

  const fontSize = 11;
  const x        = 380;
  const y        = 120;

  invoicePdf.registerFontkit(fontkit);
  const fontBytes = await fetch(NotoSansArabicUrl).then(res => res.arrayBuffer());
  const font      = await invoicePdf.embedFont(fontBytes);

  firstPage.drawText(linkText, {
    x,
    y,
    size:  fontSize,
    font,
    color: rgb(0, 0, 1),
  });

  // Clickable area dimensions
  const textWidth  = font.widthOfTextAtSize(linkText, fontSize);
  const textHeight = font.heightAtSize(fontSize);
  const linkRect   = [x, y, x + textWidth, y + textHeight];

  // ── Hyperlink annotation — preserved verbatim from original ─────
  const trackingUrl = `${origin}${'orders/track/'}${paymentResponse?.order_id}`;

  const linkAnnotation = invoicePdf.context.obj({
    Type:    PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect:    linkRect,
    Border:  [1, 0, 0],
    C:       [0, 0, 1],
    A: invoicePdf.context.obj({
      S:   PDFName.of('URI'),
      URI: trackingUrl,
    }),
  });

  const linkRef = invoicePdf.context.register(linkAnnotation);

  let annots = firstPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
  if (!annots) {
    annots = invoicePdf.context.obj([]);
    firstPage.node.set(PDFName.of('Annots'), annots);
  }
  annots.push(linkRef);

  // ── Client info — coordinates measured from actual box borders ──
  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.FirstName ?? '') || '', {
    x: 121.4, y: 662.5, size: 11, color: rgb(0, 0, 0), font
  });
  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.LastName ?? '') || '', {
    x: 374.2, y: 662.5, size: 11, color: rgb(0, 0, 0), font
  });
  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.Address ?? '') || '', {
    x: 121.6, y: 615.5, size: 11, color: rgb(0, 0, 0), font
  });
  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.City ?? '') || '', {
    x: 121.5, y: 574.8, size: 11, color: rgb(0, 0, 0), font
  });
  firstPage.drawText(clientForm?.ZipCode || '', {
    x: 374.3, y: 574.8, size: 11, color: rgb(0, 0, 0), font
  });
  firstPage.drawText(clientForm?.Phone || '', {
    x: 120.9, y: 533.0, size: 11, color: rgb(0, 0, 0), font
  });
  firstPage.drawText(clientForm?.Email || '', {
    x: 353.1, y: 532.0, size: 10, color: rgb(0, 0, 0), font
  });

  // ── Transaction info — coordinates measured from actual box borders ──
  firstPage.drawText(paymentResponse?.code || '', {
    x: 121.5, y: 443.8, size: 11, color: rgb(0, 0, 0),
  });
  firstPage.drawText(String(paymentResponse?.amount || NaN), {
    x: 374.3, y: 441.9, size: 11, color: rgb(0, 0, 0),
  });
  firstPage.drawText(paymentResponse?.currency || '', {
    x: 121.5, y: 402.1, size: 11, color: rgb(0, 0, 0),
  });
  firstPage.drawText(paymentResponse?.date || '', {
    x: 374.3, y: 402.1, size: 11, color: rgb(0, 0, 0),
  });
  firstPage.drawText(paymentResponse?.order_id || '', {
    x: 121.5, y: 355.8, size: 11, color: rgb(0, 0, 0),
  });
  firstPage.drawText(paymentResponse?.transaction_id || '', {
    x: 121.5, y: 309.5, size: 11, color: rgb(0, 0, 0),
  });

  // ── Append ordered-items pages (new) ────────────────────────────
  if (successTransItems.length > 0) {
    const deliveryTemplateBytes = await fetch(deliveryFormPdf).then(r => r.arrayBuffer());
    await appendItemPages(invoicePdf, successTransItems, deliveryTemplateBytes);
  }

  // ── Serialise & return ──────────────────────────────────────────
  const invoiceDoc = await invoicePdf.save();
  const pdfUrl = URL.createObjectURL(
    new Blob([invoiceDoc.buffer as ArrayBuffer], { type: 'application/pdf' })
  );
  return { url: pdfUrl, doc: invoiceDoc };
};

export default createInvoice;
