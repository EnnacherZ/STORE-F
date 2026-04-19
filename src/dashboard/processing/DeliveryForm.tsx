import { PDFDocument, rgb } from "pdf-lib";
import deliveryForm from "./delivery form.pdf";
import deliveryFormPages from "./delivery form pages.pdf";
import * as arabicReshaperModule from "arabic-reshaper"
import NotoSansArabicUrl from "../../contexts/NotoSansArabic-Regular.ttf";
import * as fontkitImport from 'fontkit';
const fontkit = (fontkitImport as any).default || fontkitImport;

const DeliveryForm = async(items:any[], orderDetails:any, client:any) => {

const formFile = await fetch(deliveryForm).then(res => res.arrayBuffer());
const formItemsPagesFile = await fetch(deliveryFormPages).then(res => res.arrayBuffer());
const formPdf = await PDFDocument.load(formFile);
const filePages = formPdf.getPages();
const firstPage = filePages[0];

formPdf.registerFontkit(fontkit);
const fontBytes = await fetch(NotoSansArabicUrl).then(res => res.arrayBuffer());
const font = await formPdf.embedFont(fontBytes);

const orderResume = [orderDetails.amount, orderDetails.discount, orderDetails.shipping];
orderResume.push(orderDetails.amount + orderDetails.discount + orderDetails.shipping);
const orderMethods = [orderDetails.paymentMethod, orderDetails.shippingMethod, orderDetails.shippingDate];

const pagesList = [];

if (items.length - 10 > 0) {
    const pagesNumber = Math.floor((items.length - 10) / 30) + 1;

    for (let i = 0; i < pagesNumber; i++) {
        const formItemsDoc = await PDFDocument.load(formItemsPagesFile); // nouveau doc à chaque fois
        const [formItemsPage] = await formPdf.copyPages(formItemsDoc, [0]); // copie la première page
        formPdf.addPage(formItemsPage); // ajoute la page au document final
        pagesList.push(formItemsPage);

        const itemsSlice = items.slice(10 + 30 * i, 10 + 30 * (i + 1));
        for (let y = 0; y < itemsSlice.length; y++) {
            const item = itemsSlice[y];

            formItemsPage.drawText(item.product_type, {
                x: 40,
                y: 735 - y * 20.5,
                size: 11,
                color: rgb(0, 0, 0),
            });
            formItemsPage.drawText(`${item.ref} ${item.name} Size:${item.size}`, {
                x: 128,
                y: 735 - y * 20.5,
                size: 11,
                color: rgb(0, 0, 0),
            });
            formItemsPage.drawText(`${item.quantity}`, {
                x: 305,
                y: 735 - y * 20.5,
                size: 11,
                color: rgb(0, 0, 0),
            });
            formItemsPage.drawText(`${item.price}`, {
                x: 362,
                y: 735 - y * 20.5,
                size: 11,
                color: rgb(0, 0, 0),
            });
            formItemsPage.drawText(`${item.price * item.quantity}`, {
                x: 456,
                y: 735 - y * 20.5,
                size: 11,
                color: rgb(0, 0, 0),
            });
        }
    }
}

// Informations commande sur firstPage
firstPage.drawText(orderDetails.date, { x: 360, y: 800, size: 11, color: rgb(0, 0, 0) });
firstPage.drawText(orderDetails.order_id, { x: 360, y: 735, size: 11, color: rgb(0, 0, 0) });
firstPage.drawText(`${arabicReshaperModule.convertArabic(client.first_name)} ${arabicReshaperModule.convertArabic(client.last_name)}`, { x: 70, y: 640, size: 11, color: rgb(0, 0, 0), font});
firstPage.drawText(client.phone, { x: 70, y: 615, size: 11, color: rgb(0, 0, 0) });
firstPage.drawText(arabicReshaperModule.convertArabic(client.address), { x: 70, y: 588, size: 11, color: rgb(0, 0, 0), font});
firstPage.drawText(client.email, { x: 365, y: 640, size: 11, color: rgb(0, 0, 0) });
firstPage.drawText(arabicReshaperModule.convertArabic(client.city), { x: 365, y: 616, size: 11, color: rgb(0, 0, 0), font});

// Items (max 10) sur la première page
const firstItems = items.slice(0, 10);
for (let y = 0; y < firstItems.length; y++) {
    const item = firstItems[y];
    firstPage.drawText(item.product_type, { x: 40, y: 483 - y * 20.5, size: 11, color: rgb(0, 0, 0) });
    firstPage.drawText(`${item.ref} ${item.name} Size:${item.size}`, { x: 128, y: 483 - y * 20.5, size: 11, color: rgb(0, 0, 0) });
    firstPage.drawText(`${item.quantity}`, { x: 305, y: 483 - y * 20.5, size: 11, color: rgb(0, 0, 0) });
    firstPage.drawText(`${item.price}`, { x: 362, y: 483 - y * 20.5, size: 11, color: rgb(0, 0, 0) });
    firstPage.drawText(`${item.price * item.quantity}`, { x: 456, y: 483 - y * 20.5, size: 11, color: rgb(0, 0, 0) });
}

// Résumé commande
for (let y = 0; y < 4; y++) {
    firstPage.drawText(`${orderResume[y]}`, {
        x: 456,
        y: 483 - (y + 10) * 20.5,
        size: 11,
        color: rgb(0, 0, 0),
    });
}

// Méthodes de commande
for (let y = 0; y < 3; y++) {
    firstPage.drawText(`${orderMethods[y]}`, {
        x: 167,
        y: 253 - 25 * y,
        size: 11,
        color: rgb(0, 0, 0),
    });
}

const formDoc = await formPdf.save();
const pdfUrl = URL.createObjectURL(new Blob([formDoc.buffer as ArrayBuffer], { type: 'application/pdf' }));
return pdfUrl;
    

};

export default DeliveryForm