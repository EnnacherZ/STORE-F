import {
  PDFDocument,
  rgb,
  PDFName,
  PDFArray
} from 'pdf-lib';
import invoiceEn from "./exempEn.pdf";
import QRCode from 'qrcode';
import NotoSansArabicUrl from "./NotoSansArabic-Regular.ttf?url";
import * as fontkitImport from 'fontkit';
const fontkit = (fontkitImport as any).default || fontkitImport;

import * as arabicReshaperModule from "arabic-reshaper"
// import * as bidiRaw from 'bidi-js';
// const bidiFactory = (bidiRaw as any).default || bidiRaw;
// const bidi = bidiFactory();

const origin = import.meta.env.VITE_ACTUAL_ORIGIN;


const createInvoice = async (paymentResponse: any, clientForm: any) => {
  const invoiceFile = await fetch(invoiceEn).then(res => res.arrayBuffer());
  const invoicePdf = await PDFDocument.load(invoiceFile);
  const filePages = invoicePdf.getPages();
  const firstPage = filePages[0];

  // Générer le QR code
  const qrDataUrl = await QRCode.toDataURL(`${origin}${'MyOrder/'}${paymentResponse?.order_id}`, {
    color: {
      dark: '#545454'
    },
  });

  // Convertir en image utilisable par pdf-lib
  const qrImageBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer());
  const qrImage = await invoicePdf.embedPng(qrImageBytes);
  const qrDims = qrImage.scale(0.75);

  // Ajouter l’image QR sur le PDF
  firstPage.drawImage(qrImage, {
    x: 100,
    y: 100,
    width: qrDims.width,
    height: qrDims.height,
  });

  // Texte du lien

const linkText = arabicReshaperModule.convertArabic('Click here! | Cliquer ici !' );
// const bidi = bidiFactory.default();
// // 2. Convertir en visuel RTL
// const linkText = bidi.getVisualString(reshaped);
  
  const fontSize = 11;
  const x = 380;
  const y = 120; // This `y` is the baseline for the text

invoicePdf.registerFontkit(fontkit);
const fontBytes = await fetch(NotoSansArabicUrl).then(res => res.arrayBuffer());
const font = await invoicePdf.embedFont(fontBytes);


// function reorderArabicText(input: string): string {
//   // Étape 1: reshape les lettres arabes
//   const reshaped = arabicReshaperModule.convertArabic(input);

//   // Étape 2: réordonner avec l'algo bidi
//   const levels = bidi.getEmbeddingLevels(reshaped);
//   const reordered = bidi.getReorderedString(reshaped, levels);

//   return reordered;
// }

  // Dessiner le texte
  firstPage.drawText(linkText, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 1),
  });

  // Calculate text dimensions for the clickable area
  const textWidth = font.widthOfTextAtSize(linkText, fontSize);
  const textHeight = font.heightAtSize(fontSize); // Height of the font itself

  const linkRect = [x, y, x + textWidth, y + textHeight];

  // --- START MODIFICATION HERE ---

  
  const trackingUrl = `${origin}${'MyOrder/'}${paymentResponse?.order_id}`; // <-- TEST URL HERE
 


  const linkAnnotation = invoicePdf.context.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: linkRect,
    Border: [1, 0, 0], 
    C: [0, 0, 1], 
    A: invoicePdf.context.obj({
      S: PDFName.of('URI'),
      
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


  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.FirstName) || '', {
    x: 115,
    y: 663,
    size: 11,
    color: rgb(0, 0, 0), // Noir
    font
  });
  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.LastName) || '', {
    x: 368,
    y: 663,
    size: 11,
    color: rgb(0, 0, 0), // Noir
    font
  });
  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.Address) || '', {
    x: 115,
    y: 618,
    size: 11,
    color: rgb(0, 0, 0), // Noir
    font
  });
  firstPage.drawText(arabicReshaperModule.convertArabic(clientForm?.City) || '', {
    x: 115,
    y: 578,
    size: 11,
    color: rgb(0, 0, 0), // Noir
    font
  });
  firstPage.drawText('', { //Zip code
    x: 368,
    y: 578,
    size: 11,
    color: rgb(0, 0, 0), // Noir
    font
  });
  firstPage.drawText(clientForm?.Phone || '', {
    x: 115,
    y: 535,
    size: 11,
    color: rgb(0, 0, 0), // Noir
    font
  });
  firstPage.drawText(clientForm?.Email || '', {
    x: 346,
    y: 535,
    size: 9,
    color: rgb(0, 0, 0), // Noir
    font
  });

  // Transaction infos

  firstPage.drawText(paymentResponse?.code || '', {
    x: 115,
    y: 445,
    size: 11,
    color: rgb(0, 0, 0), // Noir
  });
  firstPage.drawText(String(paymentResponse?.amount || NaN), {
    x: 368,
    y: 445,
    size: 11,
    color: rgb(0, 0, 0), // Noir
  });
  firstPage.drawText(paymentResponse?.currency || '', {
    x: 115,
    y: 405,
    size: 11,
    color: rgb(0, 0, 0), // Noir
  });
  firstPage.drawText(paymentResponse?.date || '', {
    x: 368,
    y: 405,
    size: 11,
    color: rgb(0, 0, 0), // Noir
  })
  firstPage.drawText(paymentResponse?.order_id || '', {
    x: 115,
    y: 358,
    size: 11,
    color: rgb(0, 0, 0), // Noir
  });
  firstPage.drawText(paymentResponse?.transaction_id || '', {
    x: 115,
    y: 312,
    size: 11,
    color: rgb(0, 0, 0), // Noir
  });


  const invoiceDoc = await invoicePdf.save();
  const pdfUrl = URL.createObjectURL(new Blob([invoiceDoc.buffer as ArrayBuffer], {
    type: 'application/pdf'
  }));
  return {url:pdfUrl, doc: invoiceDoc};
}

export default createInvoice;