import React, { useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { selectedLang } from "./constants";
import { useLangContext } from "../contexts/LanguageContext";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:      "#0f1c35",
  navyMid:   "#162040",
  blue:      "#72d4ff",
  blueSoft:  "rgba(114,212,255,0.12)",
  blueBorder:"rgba(114,212,255,0.28)",
  white:     "#ffffff",
  offWhite:  "#f7f8fb",
  border:    "#e2e6ef",
  muted:     "#7a8599",
  text:      "#0f1c35",
  textLight: "#4a5568",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang   = "fr" | "en" | "ar";
type Policy = "terms" | "privacy";

interface Section {
  icon:   string;
  title:  string;
  body:   string | string[];
  isList: boolean;
}

interface PolicyDoc {
  title:    string;
  updated:  string;
  badge:    string;
  sections: Section[];
}

type PolicyContent = Record<Policy, Record<Lang, PolicyDoc>>;

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons: Record<string, React.ReactElement> = {
  accept:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>,
  use:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  ip:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  payment:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  return:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>,
  data:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  liability: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  changes:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>,
  intro:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  collect:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  purpose:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  cookie:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/></svg>,
  security:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  sharing:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  retention: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

// ─── Static content (replace with API call to make dynamic) ───────────────────
const CONTENT: PolicyContent = {
  terms: {
    fr: {
      title: "Conditions Générales d'Utilisation", updated: "Dernière mise à jour : 14 septembre 2025", badge: "CGU",
      sections: [
        { icon: "accept",    isList: false, title: "1. Acceptation des conditions",       body: "En accédant à ce site web (https://www.alfirdaous-store.com) et en effectuant des achats, vous acceptez d'être lié par les présentes conditions générales d'utilisation, toutes les lois et réglementations applicables." },
        { icon: "use",       isList: false, title: "2. Utilisation autorisée",             body: "Vous vous engagez à ne pas utiliser ce site de manière abusive, frauduleuse ou à des fins illégales. Toute tentative de piratage, d'accès non autorisé ou d'interruption de service est strictement interdite." },
        { icon: "ip",        isList: false, title: "3. Propriété intellectuelle",          body: "Tous les contenus présents sur ce site (textes, images, logos, vidéos, code source, etc.) sont la propriété exclusive de AL-Firdaous Store ou de ses partenaires. Toute reproduction, distribution ou exploitation sans autorisation est strictement interdite." },
        { icon: "payment",   isList: true,  title: "4. Produits, commandes et paiements",  body: ["Les produits sont proposés dans la limite des stocks disponibles.", "Les prix sont exprimés en dirham marocain (MAD) TTC, hors frais de livraison.", "Le paiement en ligne s'effectue via des moyens sécurisés.", "Nous nous réservons le droit d'annuler toute commande en cas de problème de stock ou de litige client."] },
        { icon: "return",    isList: false, title: "5. Politique de retour",               body: "Vous disposez d'un droit de rétractation de 7 jours après réception de votre commande. Les produits doivent être retournés intacts, non utilisés et dans leur emballage d'origine." },
        { icon: "data",      isList: false, title: "6. Données personnelles",              body: "Vos données personnelles sont collectées dans le cadre de la gestion des commandes et de la relation client." },
        { icon: "liability", isList: false, title: "7. Responsabilité",                    body: "AL-Firdaous Store ne saurait être tenu responsable des dommages indirects causés par l'utilisation du site." },
        { icon: "changes",   isList: false, title: "8. Modifications des CGU",             body: "Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications prendront effet dès leur publication sur cette page." },
      ],
    },
    en: {
      title: "Terms and Conditions of Use", updated: "Last updated: September 14, 2025", badge: "T&C",
      sections: [
        { icon: "accept",    isList: false, title: "1. Acceptance of Terms",         body: "By accessing this website (https://www.alfirdaous-store.com) and making purchases, you agree to be bound by these Terms and Conditions, all applicable laws and regulations." },
        { icon: "use",       isList: false, title: "2. Authorized Use",              body: "You agree not to use this site for any abusive, fraudulent, or illegal purpose. Any attempt to hack, gain unauthorized access, or disrupt the service is strictly prohibited." },
        { icon: "ip",        isList: false, title: "3. Intellectual Property",       body: "All content on this site (texts, images, logos, videos, source code, etc.) is the exclusive property of AL-Firdaous Store or its partners." },
        { icon: "payment",   isList: true,  title: "4. Products, Orders & Payments", body: ["Products are offered while stocks last.", "Prices are displayed in Moroccan dirham (MAD), including taxes, excluding delivery fees.", "Online payments are made via secure methods.", "We reserve the right to cancel any order in case of stock issues or customer disputes."] },
        { icon: "return",    isList: false, title: "5. Return Policy",               body: "You have a withdrawal period of 7 days after receiving your order. Products must be returned intact, unused, and in their original packaging." },
        { icon: "data",      isList: false, title: "6. Personal Data",               body: "Your personal data is collected as part of order management and customer relationship. For more details, please refer to our Privacy Policy." },
        { icon: "liability", isList: false, title: "7. Liability",                   body: "AL-Firdaous Store cannot be held liable for any indirect damage caused by the use of the website." },
        { icon: "changes",   isList: false, title: "8. Changes to the Terms",        body: "We reserve the right to modify these Terms and Conditions at any time. Changes will take effect as soon as they are published on this page." },
      ],
    },
    ar: {
      title: "الشروط والأحكام العامة للاستخدام", updated: "آخر تحديث: 14 سبتمبر 2025", badge: "الشروط",
      sections: [
        { icon: "accept",    isList: false, title: "1. قبول الشروط",              body: "من خلال الوصول إلى هذا الموقع وإجراء عمليات شراء، فإنك توافق على الالتزام بهذه الشروط والأحكام، وجميع القوانين واللوائح المعمول بها." },
        { icon: "use",       isList: false, title: "2. الاستخدام المصرح به",       body: "تتعهد بعدم استخدام هذا الموقع بطريقة مسيئة أو احتيالية أو لأغراض غير قانونية." },
        { icon: "ip",        isList: false, title: "3. الملكية الفكرية",           body: "جميع المحتويات الموجودة على هذا الموقع هي ملك حصري لـ AL-Firdaous Store أو لشركائها. يُمنع إعادة النشر أو التوزيع أو الاستخدام دون إذن صريح." },
        { icon: "payment",   isList: true,  title: "4. المنتجات والطلبات والدفع",  body: ["تُعرض المنتجات حسب توفرها في المخزون.", "الأسعار معروضة بالدرهم المغربي (MAD) شاملة الضرائب، وغير شاملة رسوم التوصيل.", "يتم الدفع عبر وسائل إلكترونية آمنة.", "نحتفظ بالحق في إلغاء أي طلب في حالة وجود مشكلة في المخزون أو نزاع."] },
        { icon: "return",    isList: false, title: "5. سياسة الإرجاع",            body: "لديك حق التراجع خلال 7 أيام من استلام الطلب. يجب إعادة المنتجات سليمة، غير مستخدمة وفي تغليفها الأصلي." },
        { icon: "data",      isList: false, title: "6. البيانات الشخصية",          body: "نقوم بجمع بياناتك الشخصية في إطار إدارة الطلبات والعلاقة مع العملاء." },
        { icon: "liability", isList: false, title: "7. المسؤولية",                 body: "لا تتحمل AL-Firdaous Store أي مسؤولية عن الأضرار غير المباشرة الناتجة عن استخدام الموقع." },
        { icon: "changes",   isList: false, title: "8. تعديل الشروط",             body: "نحتفظ بحق تعديل هذه الشروط والأحكام في أي وقت. تدخل التعديلات حيز التنفيذ فور نشرها على هذه الصفحة." },
      ],
    },
  },
  privacy: {
    fr: {
      title: "Politique de confidentialité", updated: "Dernière mise à jour : 14 septembre 2025", badge: "Confidentialité",
      sections: [
        { icon: "intro",     isList: false, title: "1. Introduction",               body: "Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web https://www.alfirdaous-store.com." },
        { icon: "collect",   isList: true,  title: "2. Données collectées",         body: ["Informations d'identité : nom, prénom.", "Coordonnées : adresse email, numéro de téléphone, adresse de livraison.", "Données de paiement (gérées via une passerelle de paiement sécurisée).", "Historique de commandes et préférences.", "Adresse IP, type de navigateur, pages consultées (via cookies)."] },
        { icon: "purpose",   isList: true,  title: "3. Finalités de l'utilisation", body: ["Traiter et livrer vos commandes.", "Gérer votre compte client.", "Envoyer des emails de confirmation ou de suivi.", "Améliorer notre site et votre expérience utilisateur."] },
        { icon: "cookie",    isList: false, title: "4. Cookies",                    body: "Nous utilisons des cookies pour améliorer votre navigation, mémoriser vos préférences, qui sont nécessaires pour le fonctionnement de notre site." },
        { icon: "security",  isList: false, title: "5. Sécurité des données",       body: "Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, perte ou divulgation." },
        { icon: "sharing",   isList: true,  title: "6. Partage des données",        body: ["Les prestataires logistiques pour la livraison.", "Les services de paiement pour traiter vos transactions.", "Les outils de marketing ou d'analyse (de façon anonymisée)."] },
        { icon: "retention", isList: false, title: "7. Durée de conservation",      body: "Vos données sont conservées uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, conformément aux exigences légales." },
        { icon: "changes",   isList: false, title: "8. Modifications",              body: "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment." },
      ],
    },
    en: {
      title: "Privacy Policy", updated: "Last updated: September 14, 2025", badge: "Privacy",
      sections: [
        { icon: "intro",     isList: false, title: "1. Introduction",          body: "This privacy policy explains how we collect, use, and protect your personal information when you use our website https://www.alfirdaous-store.com." },
        { icon: "collect",   isList: true,  title: "2. Data Collected",        body: ["Identity information: first name, last name.", "Contact details: email address, phone number, shipping address.", "Payment data (handled via a secure payment gateway).", "Order history and preferences.", "IP address, browser type, pages visited (via cookies)."] },
        { icon: "purpose",   isList: true,  title: "3. Purpose of Data Use",   body: ["Process and deliver your orders.", "Manage your customer account.", "Send confirmation or tracking emails.", "Improve our website and your user experience."] },
        { icon: "cookie",    isList: false, title: "4. Cookies",               body: "We use cookies to enhance your browsing, remember your preferences, which are necessary for our site to function." },
        { icon: "security",  isList: false, title: "5. Data Security",         body: "We implement technical and organizational measures to protect your data from unauthorized access, loss, or disclosure." },
        { icon: "sharing",   isList: true,  title: "6. Data Sharing",          body: ["Logistics providers for delivery.", "Payment services to process your transactions.", "Marketing or analytics tools (anonymized)."] },
        { icon: "retention", isList: false, title: "7. Data Retention",        body: "Your data is retained only as long as necessary for the purposes for which it was collected, in accordance with legal requirements." },
        { icon: "changes",   isList: false, title: "8. Changes",               body: "We reserve the right to modify this privacy policy at any time. Changes will take effect immediately upon posting on this page." },
      ],
    },
    ar: {
      title: "سياسة الخصوصية", updated: "آخر تحديث: 14 سبتمبر 2025", badge: "الخصوصية",
      sections: [
        { icon: "intro",     isList: false, title: "1. المقدمة",                  body: "تصف سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا الإلكتروني https://www.alfirdaous-store.com." },
        { icon: "collect",   isList: true,  title: "2. البيانات التي يتم جمعها",  body: ["معلومات الهوية: الاسم الأول، الاسم الأخير.", "معلومات الاتصال: عنوان البريد الإلكتروني، رقم الهاتف، عنوان الشحن.", "بيانات الدفع (تتم معالجتها عبر بوابة دفع آمنة).", "تاريخ الطلبات والتفضيلات.",] },
        { icon: "purpose",   isList: true,  title: "3. أهداف استخدام البيانات",   body: ["معالجة وتسليم طلباتك.", "إدارة حسابك كعميل.", "إرسال رسائل التأكيد أو تتبع الطلب.", "تحسين موقعنا وتجربتك كمستخدم."] },
        { icon: "cookie",    isList: false, title: "4. الكوكيز",                  body: "نستخدم الكوكيز لتحسين تصفحك، وتذكر تفضيلاتك، وهي ضرورية لعمل الموقع بشكل صحيح." },
        { icon: "security",  isList: false, title: "5. أمان البيانات",             body: "نقوم بتطبيق إجراءات تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الفقدان أو الكشف." },
        { icon: "sharing",   isList: true,  title: "6. مشاركة البيانات",           body: ["مقدمي الخدمات اللوجستية للتوصيل.", "خدمات الدفع لمعالجة معاملتك.", "أدوات التسويق أو التحليل (بشكل مجهول)."] },
        { icon: "retention", isList: false, title: "7. مدة الاحتفاظ بالبيانات",   body: "تُحتفظ بياناتك فقط للمدة اللازمة للأغراض التي جُمعت من أجلها، ووفقًا للمتطلبات القانونية." },
        { icon: "changes",   isList: false, title: "8. التعديلات",                 body: "نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. وستدخل التعديلات حيز التنفيذ فور نشرها على هذه الصفحة." },
      ],
    },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
interface SectionCardProps {
  idx:       number;
  icon:      string;
  title:     string;
  body:      string | string[];
  isList:    boolean;
  isRtl:     boolean;
  activeIdx: number;
  onClick:   () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ idx, icon, title, body, isList, isRtl, activeIdx, onClick }) => {
  const isActive = idx === activeIdx;
  return (
    <div
      id={`section-${idx}`}
      onClick={onClick}
      style={{
        background:   C.white,
        border:       `1.5px solid ${isActive ? C.blue : C.border}`,
        borderRadius: 14,
        padding:      "20px 24px",
        cursor:       "pointer",
        transition:   "all 0.22s ease",
        boxShadow:    isActive
          ? `0 4px 24px rgba(114,212,255,0.14), 0 0 0 3px ${C.blueSoft}`
          : "0 1px 4px rgba(15,28,53,0.06)",
        scrollMarginTop: 20,
        direction:    isRtl ? "rtl" : "ltr",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width:       42,
          height:      42,
          borderRadius: 10,
          flexShrink:  0,
          background:  isActive ? `linear-gradient(135deg, ${C.navy}, ${C.navyMid})` : C.offWhite,
          display:     "flex",
          alignItems:  "center",
          justifyContent: "center",
          color:       isActive ? C.blue : C.muted,
          transition:  "all 0.22s",
          boxShadow:   isActive ? "0 2px 10px rgba(15,28,53,0.25)" : "none",
        }}>
          {icons[icon]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? C.navy : C.text, marginBottom: 8, lineHeight: 1.3 }}>
            {title}
          </div>
          {isList && Array.isArray(body) ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {(body as string[]).map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: C.textLight, lineHeight: 1.6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue, flexShrink: 0, marginTop: 8 }} />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: C.textLight, lineHeight: 1.7 }}>{body as string}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Policies: React.FC = () => {
  const {currentLang} = useLangContext();
  const [policy, setPolicy]       = useState<Policy>("terms");
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const isRtl = selectedLang(currentLang) === "ar";
  const doc   = CONTENT[policy][selectedLang(currentLang)];

  const labels: Record<Lang, { terms: string; privacy: string }> = {
    fr: { terms: "Conditions d'utilisation", privacy: "Confidentialité" },
    en: { terms: "Terms of Use",             privacy: "Privacy Policy"  },
    ar: { terms: "شروط الاستخدام",            privacy: "الخصوصية"        },
  };
  const L = labels[selectedLang(currentLang)];

  const scrollTo = (idx: number): void => {
    setActiveIdx(idx);
    document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const switchPolicy = (p: Policy): void => {
    setPolicy(p);
    setActiveIdx(0);
  };

  return (
    <>
    <Header/>
    <div style={{ minHeight: "100vh", background: C.offWhite, fontFamily: "'Inter','Segoe UI',sans-serif", direction: isRtl ? "rtl" : "ltr" }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 60%, #1a3060 100%)`, padding: "40px 40px 0", position: "relative", overflow: "hidden" }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "rgba(114,212,255,0.18)", top: `${15 + (i % 4) * 20}%`, left: `${(i * 8.5) % 95}%` }} />
        ))}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          </div>

        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {(["terms", "privacy"] as Policy[]).map((p) => (
            <button key={p} onClick={() => switchPolicy(p)} style={{ padding: "11px 24px", border: "none", cursor: "pointer", fontFamily: "inherit", borderRadius: "10px 10px 0 0", transition: "all 0.2s", background: policy === p ? C.white : "transparent", color: policy === p ? C.navy : "rgba(255,255,255,0.60)", fontWeight: policy === p ? 800 : 500, fontSize: 14 }}>
              {p === "terms" ? L.terms : L.privacy}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Sidebar */}
        <div style={{ width: 240, flexShrink: 0, paddingTop: 32, paddingRight: isRtl ? 0 : 24, paddingLeft: isRtl ? 24 : 0, position: "sticky", top: 0, alignSelf: "flex-start", maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, color: C.blue, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, display: "inline-block", marginBottom: 8 }}>
              {doc.badge}
            </span>
            <div style={{ fontSize: 11, color: C.muted }}>{doc.updated}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {doc.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                style={{
                  border:      "none",
                  cursor:      "pointer",
                  fontFamily:  "inherit",
                  padding:     "8px 12px",
                  borderRadius: 8,
                  fontSize:    12.5,
                  transition:  "all 0.18s",
                  display:     "flex",
                  alignItems:  "center",
                  gap:         8,
                  textAlign:   isRtl ? "right" : "left",
                  fontWeight:  activeIdx === i ? 700 : 400,
                  color:       activeIdx === i ? C.blue : C.textLight,
                  background:  activeIdx === i ? C.blueSoft : "transparent",
                  borderLeft:  !isRtl ? `3px solid ${activeIdx === i ? C.blue : "transparent"}` : "none",
                  borderRight: isRtl  ? `3px solid ${activeIdx === i ? C.blue : "transparent"}` : "none",
                } as React.CSSProperties}
              >
                <span style={{ color: activeIdx === i ? C.blue : C.muted, flexShrink: 0 }}>{icons[s.icon]}</span>
                <span style={{ lineHeight: 1.3 }}>{s.title}</span>
              </button>
            ))}
          </div>

          {policy === "terms" && (
            <button onClick={() => switchPolicy("privacy")} style={{ marginTop: 20, width: "100%", padding: "10px 12px", background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, border: `1px solid ${C.blueBorder}`, borderRadius: 9, cursor: "pointer", color: C.blue, fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {L.privacy} →
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, paddingTop: 32, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexDirection: isRtl ? "row-reverse" : "row" }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: C.navy, lineHeight: 1.25, flex: 1 }}>{doc.title}</h1>
            <div style={{ flexShrink: 0, background: C.blueSoft, border: `1px solid ${C.blueBorder}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: C.blue, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {doc.sections.length} {selectedLang(currentLang) === "ar" ? "بند" : selectedLang(currentLang) === "fr" ? "articles" : "sections"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {doc.sections.map((s, i) => (
              <SectionCard
                key={i}
                idx={i}
                icon={s.icon}
                title={s.title}
                body={s.body}
                isList={s.isList}
                isRtl={isRtl}
                activeIdx={activeIdx}
                onClick={() => setActiveIdx(i)}
              />
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 32, background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 14, direction: isRtl ? "rtl" : "ltr" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(114,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: C.blue, flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 13.5 }}>AL-Firdaous Store</div>
              <a style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>https://www.alfirdaousstore.com</a>
            </div>
            <div style={{ marginLeft: isRtl ? 0 : "auto", marginRight: isRtl ? "auto" : 0 }}>
              <div style={{ color: C.blue, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{doc.updated}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Policies;
