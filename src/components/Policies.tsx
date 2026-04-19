import React, { Suspense, useEffect} from "react";
import Header from "./Header";
import { useParams } from "react-router-dom";
import Footer from "./Footer";
import Loading from "./loading";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";
import { motion } from "framer-motion";






const Policies : React.FC = () => {
    const {option} = useParams<{option:string}>();
    const {currentLang} = useLangContext();


    useEffect(()=>{
      window.scrollTo(0,0)
        
    }, [option])


    
     return (<>
     <Header/>
              <Suspense fallback={<Loading message="loading"/>}>
                <motion.div
    key={window.location.pathname}
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    onAnimationStart={() => window.scrollTo(0, 0)}
  >
<div className={`${selectedLang(currentLang)=="ar"&&"rtl"}`}>
        {option==="General-terms-of-use"?
        <GeneralUse/>
        :option=="Privacy-policy"?<PrivacyPolicy/>:<></>
        }

</div>
     <Footer/>
    </motion.div>
    </Suspense>
    </>)   
}




const GeneralUse : React.FC = () => {
    const {currentLang} = useLangContext();


    return(<>
    {selectedLang(currentLang)=="fr"?
    <div
      style={{
        padding: '3rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: '1.8',
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#333',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111' }}>
        Conditions Générales d'Utilisation
      </h1>

      <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
        Dernière mise à jour : 14 septembre 2025
      </p>

      <section>
        <h2>1. Acceptation des conditions</h2>
        <p>
          En accédant à ce site web (<strong>https://www.alfirdaous-store.com</strong>) et en effectuant des achats,
          vous acceptez d’être lié par les présentes conditions générales d’utilisation, toutes les lois
          et réglementations applicables, et vous engagez à respecter les lois en vigueur.
        </p>
      </section>

      <section>
        <h2>2. Utilisation autorisée</h2>
        <p>
          Vous vous engagez à ne pas utiliser ce site de manière abusive, frauduleuse ou à des fins illégales.
          Toute tentative de piratage, d'accès non autorisé ou d’interruption de service est strictement interdite.
        </p>
      </section>

      <section>
        <h2>3. Propriété intellectuelle</h2>
        <p>
          Tous les contenus présents sur ce site (textes, images, logos, vidéos, code source, etc.) sont la
          propriété exclusive de <strong>AL-Firdoaus Store</strong> ou de ses partenaires. Toute reproduction,
          distribution ou exploitation sans autorisation est strictement interdite.
        </p>
      </section>

      <section>
        <h2>4. Produits, commandes et paiements</h2>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Les produits sont proposés dans la limite des stocks disponibles.</li>
          <li>Les prix sont exprimés en dirham marocain (MAD) TTC, hors frais de livraison.</li>
          <li>Le paiement en ligne s’effectue via des moyens sécurisés.</li>
          <li>
            Nous nous réservons le droit d’annuler toute commande en cas de problème de stock ou de litige client.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Politique de retour</h2>
        <p>
          Vous disposez d’un droit de rétractation de 7 jours après
          réception de votre commande. Les produits doivent être retournés <em>intacts, non utilisés</em> et
          dans leur emballage d’origine. Les frais de retour sont à votre charge sauf erreur de notre part.
        </p>
      </section>

      <section>
        <h2>6. Données personnelles</h2>
        <p>
          Vos données personnelles sont collectées dans le cadre de la gestion des commandes et de la relation
          client. Pour plus de détails, veuillez consulter notre{' '}
          <a href="/Policies/Privacy-policy" style={{ color: '#007BFF', textDecoration: 'none' }}>
            politique de confidentialité
          </a>.
        </p>
      </section>

      <section>
        <h2>7. Responsabilité</h2>
        <p>
          <b>AL-Firdaous Store</b> ne saurait être tenu responsable des dommages indirects causés par l’utilisation
          du site, notamment en cas d’interruption de service ou de perte de données.
        </p>
      </section>

      <section>
        <h2>8. Modifications des CGU</h2>
        <p>
          Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications prendront
          effet dès leur publication sur cette page. Il vous appartient de consulter régulièrement cette page.
        </p>
      </section>

    </div>:
    selectedLang(currentLang)=="en"?
<div
  style={{
    padding: '3rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: '1.8',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    color: '#333',
  }}
>
  <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111' }}>
    Terms and Conditions of Use
  </h1>

  <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
    Last updated: September 14, 2025
  </p>

  <section>
    <h2>1. Acceptance of Terms</h2>
    <p>
      By accessing this website (<strong>https://www.alfirdaous-store.com</strong>) and making purchases,
      you agree to be bound by these Terms and Conditions, all applicable laws and regulations, and you
      commit to complying with current laws.
    </p>
  </section>

  <section>
    <h2>2. Authorized Use</h2>
    <p>
      You agree not to use this site for any abusive, fraudulent, or illegal purpose.
      Any attempt to hack, gain unauthorized access, or disrupt the service is strictly prohibited.
    </p>
  </section>

  <section>
    <h2>3. Intellectual Property</h2>
    <p>
      All content on this site (texts, images, logos, videos, source code, etc.) is the
      exclusive property of <strong>AL-Firdaous Store</strong> or its partners. Any reproduction,
      distribution, or exploitation without permission is strictly prohibited.
    </p>
  </section>

  <section>
    <h2>4. Products, Orders, and Payments</h2>
    <ul style={{ paddingLeft: '1.5rem' }}>
      <li>Products are offered while stocks last.</li>
      <li>Prices are displayed in Moroccan dirham (MAD), including taxes, excluding delivery fees.</li>
      <li>Online payments are made via secure methods.</li>
      <li>
        We reserve the right to cancel any order in case of stock issues or customer disputes.
      </li>
    </ul>
  </section>

  <section>
    <h2>5. Return Policy</h2>
    <p>
      You have a withdrawal period of 7 days after receiving your order.
      Products must be returned <em>intact, unused</em>, and in their original packaging.
      Return shipping costs are your responsibility unless the error is ours.
    </p>
  </section>

  <section>
    <h2>6. Personal Data</h2>
    <p>
      Your personal data is collected as part of order management and customer relationship.
      For more details, please refer to our{' '}
      <a href="/Policies/privacy" style={{ color: '#007BFF', textDecoration: 'none' }}>
        Privacy Policy
      </a>.
    </p>
  </section>

  <section>
    <h2>7. Liability</h2>
    <p>
      <strong>AL-Firdaous Store</strong> cannot be held liable for any indirect damage caused by
      the use of the website, including service interruption or data loss.
    </p>
  </section>

  <section>
    <h2>8. Changes to the Terms</h2>
    <p>
      We reserve the right to modify these Terms and Conditions at any time.
      Changes will take effect as soon as they are published on this page.
      You are responsible for checking this page regularly.
    </p>
  </section>
</div>
:<div
  style={{
    direction: 'rtl',
    padding: '3rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: '2',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    color: '#333',
  }}
>
  <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111' }}>
    الشروط والأحكام العامة للاستخدام
  </h1>

  <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
    آخر تحديث: 14 سبتمبر 2025
  </p>

  <section>
    <h2>1. قبول الشروط</h2>
    <p>
      من خلال الوصول إلى هذا الموقع (<strong>https://www.alfirdaous-store.com</strong>) وإجراء عمليات شراء،
      فإنك توافق على الالتزام بهذه الشروط والأحكام، وجميع القوانين واللوائح المعمول بها،
      وتتعهد بالامتثال للتشريعات السارية.
    </p>
  </section>

  <section>
    <h2>2. الاستخدام المصرح به</h2>
    <p>
      تتعهد بعدم استخدام هذا الموقع بطريقة مسيئة أو احتيالية أو لأغراض غير قانونية.
      يُحظر تمامًا أي محاولة للاختراق أو الوصول غير المصرح به أو تعطيل الخدمة.
    </p>
  </section>

  <section>
    <h2>3. الملكية الفكرية</h2>
    <p>
      جميع المحتويات الموجودة على هذا الموقع (النصوص، الصور، الشعارات، الفيديوهات، الشيفرات، إلخ)
      هي ملك حصري لـ<strong> AL-Firdaous Store </strong> أو لشركائها. يُمنع إعادة النشر أو التوزيع أو الاستخدام
      دون إذن صريح.
    </p>
  </section>

  <section>
    <h2>4. المنتجات والطلبات والدفع</h2>
    <ul style={{ paddingRight: '1.5rem' }}>
      <li>تُعرض المنتجات حسب توفرها في المخزون.</li>
      <li>الأسعار معروضة بالدرهم المغربي (MAD) شاملة الضرائب، وغير شاملة رسوم التوصيل.</li>
      <li>يتم الدفع عبر وسائل إلكترونية آمنة.</li>
      <li>نحتفظ بالحق في إلغاء أي طلب في حالة وجود مشكلة في المخزون أو نزاع مع العميل.</li>
    </ul>
  </section>

  <section>
    <h2>5. سياسة الإرجاع</h2>
    <p>
      لديك حق التراجع خلال 7 أيام من استلام الطلب.
      يجب إعادة المنتجات <em>سليمة، غير مستخدمة</em> وفي تغليفها الأصلي.
      تكاليف الإرجاع تقع على عاتقك ما لم يكن الخطأ من طرفنا.
    </p>
  </section>

  <section>
    <h2>6. البيانات الشخصية</h2>
    <p>
      نقوم بجمع بياناتك الشخصية في إطار إدارة الطلبات والعلاقة مع العملاء.
      لمزيد من التفاصيل، يُرجى مراجعة{' '}
      <a href="/Policies/privacy" style={{ color: '#007BFF', textDecoration: 'none' }}>
        سياسة الخصوصية
      </a>.
    </p>
  </section>

  <section>
    <h2>7. المسؤولية</h2>
    <p>
      لا تتحمل <strong>AL-Firdaous Store</strong> أي مسؤولية عن الأضرار غير المباشرة الناتجة عن استخدام الموقع،
      بما في ذلك انقطاع الخدمة أو فقدان البيانات.
    </p>
  </section>

  <section>
    <h2>8. تعديل الشروط</h2>
    <p>
      نحتفظ بحق تعديل هذه الشروط والأحكام في أي وقت.
      تدخل التعديلات حيز التنفيذ فور نشرها على هذه الصفحة.
      وتقع على عاتقك مسؤولية مراجعة الصفحة بشكل دوري.
    </p>
  </section>
</div>
}

    </>)
}



const PrivacyPolicy : React.FC = () => {
    const {currentLang} = useLangContext();


    return(<>
    {selectedLang(currentLang)=="fr"?
<div
  style={{
    padding: '3rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: '1.8',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    color: '#333',
  }}
>
  <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111' }}>
    Politique de confidentialité
  </h1>

  <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
    Dernière mise à jour : 14 septembre 2025.
  </p>

  <section>
    <h2>1. Introduction</h2>
    <p>
      Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos
      informations personnelles lorsque vous utilisez notre site web <strong>https://www.alfirdaous-store.com</strong>.
    </p>
  </section>

  <section>
    <h2>2. Données collectées</h2>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>Informations d'identité : nom, prénom.</li>
      <li>Coordonnées : adresse email, numéro de téléphone, adresse de livraison.</li>
      <li>Données de paiement (gérées via une passerelle de paiement sécurisée).</li>
      <li>Historique de commandes et préférences.</li>
      <li>Adresse IP, type de navigateur, pages consultées (via cookies).</li>
    </ul>
  </section>

  <section>
    <h2>3. Finalités de l’utilisation des données</h2>
    <p>Nous utilisons vos données pour :</p>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>Traiter et livrer vos commandes.</li>
      <li>Gérer votre compte client.</li>
      <li>Envoyer des emails de confirmation ou de suivi.</li>
      <li>Améliorer notre site et votre expérience utilisateur.</li>
    </ul>
  </section>

  <section>
    <h2>4. Cookies</h2>
    <p>
      Nous utilisons des cookies pour améliorer votre navigation, mémoriser vos préférences, qui sont nécessaires pour le fonctionnement de notre site.
    </p>
  </section>

  <section>
    <h2>5. Sécurité des données</h2>
    <p>
      Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre
      tout accès non autorisé, perte ou divulgation. Les paiements sont traités via des partenaires
      certifiés et sécurisés.
    </p>
  </section>

  <section>
    <h2>6. Partage des données</h2>
    <p>
      Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement avec :
    </p>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>Les prestataires logistiques pour la livraison.</li>
      <li>Les services de paiement pour traiter vos transactions.</li>
      <li>Les outils de marketing ou d’analyse (de façon anonymisée).</li>
    </ul>
  </section>

  <section>
    <h2>7. Durée de conservation</h2>
    <p>
      Vos données sont conservées uniquement pendant la durée nécessaire aux finalités pour lesquelles
      elles ont été collectées, conformément aux exigences légales.
    </p>
  </section>

  <section>
    <h2>8. Modifications</h2>
    <p>
      Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
      Les modifications prendront effet dès leur publication sur cette page.
    </p>
  </section>
</div>

:selectedLang(currentLang)=="en"?
<div
  style={{
    padding: '3rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: '1.8',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    color: '#333',
  }}
>
  <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111' }}>
    Privacy Policy
  </h1>

  <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
    Last updated: September 14, 2025.
  </p>

  <section>
    <h2>1. Introduction</h2>
    <p>
      This privacy policy explains how we collect, use, and protect your personal information when you use our website <strong>https://www.alfirdaous-store.com</strong>.
    </p>
  </section>

  <section>
    <h2>2. Data Collected</h2>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>Identity information: first name, last name.</li>
      <li>Contact details: email address, phone number, shipping address.</li>
      <li>Payment data (handled via a secure payment gateway).</li>
      <li>Order history and preferences.</li>
      <li>IP address, browser type, pages visited (via cookies).</li>
    </ul>
  </section>

  <section>
    <h2>3. Purpose of Data Use</h2>
    <p>We use your data to:</p>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>Process and deliver your orders.</li>
      <li>Manage your customer account.</li>
      <li>Send confirmation or tracking emails.</li>
      <li>Improve our website and your user experience.</li>
    </ul>
  </section>

  <section>
    <h2>4. Cookies</h2>
    <p>
      We use cookies to enhance your browsing, remember your preferences, which are necessary for our site to function.
    </p>
  </section>

  <section>
    <h2>5. Data Security</h2>
    <p>
      We implement technical and organizational measures to protect your data from unauthorized access, loss, or disclosure. Payments are processed through certified and secure partners.
    </p>
  </section>

  <section>
    <h2>6. Data Sharing</h2>
    <p>
      Your data is never sold. It may only be shared with:
    </p>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>Logistics providers for delivery.</li>
      <li>Payment services to process your transactions.</li>
      <li>Marketing or analytics tools (anonymized).</li>
    </ul>
  </section>

  <section>
    <h2>7. Data Retention Period</h2>
    <p>
      Your data is retained only as long as necessary for the purposes for which it was collected, in accordance with legal requirements.
    </p>
  </section>

  <section>
    <h2>8. Changes</h2>
    <p>
      We reserve the right to modify this privacy policy at any time. Changes will take effect immediately upon posting on this page.
    </p>
  </section>
</div>

:
selectedLang(currentLang)=="ar"?
<div
  style={{
    padding: '3rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: '1.8',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    color: '#333',
    direction: 'rtl',
    textAlign: 'right',
  }}
>
  <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#111' }}>
    سياسة الخصوصية
  </h1>

  <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
    آخر تحديث: 14 سبتمبر 2025.
  </p>

  <section>
    <h2>1. المقدمة</h2>
    <p>
      تصف سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا الإلكتروني <strong>https://www.alfirdaous-store.com</strong>.
    </p>
  </section>

  <section>
    <h2>2. البيانات التي يتم جمعها</h2>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>معلومات الهوية: الاسم الأول، الاسم الأخير.</li>
      <li>معلومات الاتصال: عنوان البريد الإلكتروني، رقم الهاتف، عنوان الشحن.</li>
      <li>بيانات الدفع (تتم معالجتها عبر بوابة دفع آمنة).</li>
      <li>تاريخ الطلبات والتفضيلات.</li>
      <li>عنوان IP، نوع المتصفح، الصفحات التي تم زيارتها (عبر الكوكيز).</li>
    </ul>
  </section>

  <section>
    <h2>3. أهداف استخدام البيانات</h2>
    <p>نستخدم بياناتك من أجل:</p>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>معالجة وتسليم طلباتك.</li>
      <li>إدارة حسابك كعميل.</li>
      <li>إرسال رسائل التأكيد أو تتبع الطلب.</li>
      <li>تحسين موقعنا وتجربتك كمستخدم.</li>
    </ul>
  </section>

  <section>
    <h2>4. الكوكيز</h2>
    <p>
      نستخدم الكوكيز لتحسين تصفحك، وتذكر تفضيلاتك، وهي ضرورية لعمل الموقع بشكل صحيح.
    </p>
  </section>

  <section>
    <h2>5. أمان البيانات</h2>
    <p>
      نقوم بتطبيق إجراءات تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الفقدان أو الكشف. تتم معالجة المدفوعات عبر شركاء معتمدين وآمنين.
    </p>
  </section>

  <section>
    <h2>6. مشاركة البيانات</h2>
    <p>
      بياناتك لا تُباع أبدًا. يمكن مشاركتها فقط مع:
    </p>
    <ul
      style={{
        paddingLeft: '1.5rem',
        fontWeight: '700',
        listStyleType: 'disc',
        listStylePosition: 'inside',
      }}
    >
      <li>مقدمي الخدمات اللوجستية للتوصيل.</li>
      <li>خدمات الدفع لمعالجة معاملتك.</li>
      <li>أدوات التسويق أو التحليل (بشكل مجهول).</li>
    </ul>
  </section>

  <section>
    <h2>7. مدة الاحتفاظ بالبيانات</h2>
    <p>
      تُحتفظ بياناتك فقط للمدة اللازمة للأغراض التي جُمعت من أجلها، ووفقًا للمتطلبات القانونية.
    </p>
  </section>

  <section>
    <h2>8. التعديلات</h2>
    <p>
      نحتفظ بالحق في تعديل سياسة الخصوصية هذه في أي وقت. وستدخل التعديلات حيز التنفيذ فور نشرها على هذه الصفحة.
    </p>
  </section>
</div>

:<></>}

    </>)

}


export default Policies;