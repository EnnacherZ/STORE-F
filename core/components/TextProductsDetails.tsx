import React from "react";
import "../styles/TextProductsDetails.css";

// Déclaration correcte de l'interface Lang
interface Lang {
  fr: {
    classic: {
      title: string;
      description: string[];
    };
    basket: {
      title: string;
      description: string[];
    };
    medical: {
      title: string;
      description: string[];
    };
    mocassin: {
      title: string;
      description: string[];
    };
  };
  en: {
    classic: {
      title: string;
      description: string[];
    };
    basket: {
      title: string;
      description: string[];
    };
    medical: {
      title: string;
      description: string[];
    };
    mocassin: {
      title: string;
      description: string[];
    };
  };
  ar: {
    classic: {
      title: string;
      description: string[];
    };
    basket: {
      title: string;
      description: string[];
    };
    medical: {
      title: string;
      description: string[];
    };
    mocassin: {
      title: string;
      description: string[];
    };
  };
}

const Text: React.FC<{ productType: string; Category: string; lang: string }> = ({
  productType,
  Category,
  lang,
}) => {
  // Traduction des titres et descriptions selon la langue
  const shoeProductsDetail: Lang = {
    fr: {
      classic: {
        title: "Chaussure de Cuir Classique",
        description: [
          "Élégance intemporelle et sophistication.",
          "Confectionnée avec du cuir de haute qualité.",
          "Disponible dans des couleurs sobres.",
          "Semelle en cuir ou en gomme pour plus de confort.",
          "Doublure intérieure en cuir pour un confort optimal.",
          "Idéale pour des occasions formelles ou professionnelles.",
        ],
      },
      basket: {
        title: "Chaussure de Cuir Basket",
        description: [
          "Combinaison de confort et robustesse du cuir.",
          "Design dynamique avec une allure décontractée.",
          "Semelle en caoutchouc pour une excellente adhérence.",
          "Idéale pour un usage quotidien ou un look décontracté.",
          "Convient aussi bien avec un jean qu’un pantalon casual.",
        ],
      },
      medical: {
        title: "Chaussure de Cuir Médicale",
        description: [
          "Soutien optimal et stabilité accrue.",
          "Semelle ergonomique et intérieur rembourré pour un confort maximal.",
          "Technologies comme des semelles orthopédiques amovibles.",
          "Conçue pour ceux qui passent de longues heures debout.",
          "Design sobre et fonctionnel adapté à un cadre médical.",
        ],
      },
      mocassin: {
        title: "Chaussure de Cuir Mocassin",
        description: [
          "Confort et style décontracté.",
          "Fabriqué en cuir souple de qualité supérieure.",
          "Design slip-on sans lacets ni fermetures.",
          "Doublure intérieure en cuir ou tissu pour plus de confort.",
          "Semelle flexible en caoutchouc ou cuir.",
          "Parfait pour des occasions semi-formelles ou des journées relaxantes.",
        ],
      },
    },
    en: {
      classic: {
        title: "Classic Leather Shoe",
        description: [
          "Timeless elegance and sophistication.",
          "Crafted with high-quality leather.",
          "Available in subtle colors.",
          "Leather or rubber sole for added comfort.",
          "Leather lining for optimal comfort.",
          "Ideal for formal or professional occasions.",
        ],
      },
      basket: {
        title: "Leather Basketball Shoe",
        description: [
          "Combination of comfort and leather durability.",
          "Dynamic design with a casual look.",
          "Rubber sole for excellent grip.",
          "Ideal for everyday use or a casual look.",
          "Perfect with both jeans and casual pants.",
        ],
      },
      medical: {
        title: "Medical Leather Shoe",
        description: [
          "Optimal support and increased stability.",
          "Ergonomic sole and padded interior for maximum comfort.",
          "Technologies such as removable orthopedic insoles.",
          "Designed for those who stand for long hours.",
          "Subtle and functional design suited for a medical setting.",
        ],
      },
      mocassin: {
        title: "Leather Moccasin Shoe",
        description: [
          "Comfort and casual style.",
          "Made from soft, high-quality leather.",
          "Slip-on design with no laces or fastenings.",
          "Leather or fabric lining for additional comfort.",
          "Flexible rubber or leather sole.",
          "Perfect for semi-formal occasions or relaxing days.",
        ],
      },
    },
    ar: {
      classic: {
        title: "حذاء جلد كلاسيكي",
        description: [
          "أناقة خالدة ورفاهية.",
          "مصنوع من جلد عالي الجودة.",
          "متوفر بألوان هادئة.",
          "نعل من الجلد أو المطاط لمزيد من الراحة.",
          "بطانة جلدية لراحة مثالية.",
          "مثالي للمناسبات الرسمية أو المهنية.",
        ],
      },
      basket: {
        title: "حذاء كرة سلة من الجلد",
        description: [
          "مزيج من الراحة وقوة الجلد.",
          "تصميم ديناميكي مع مظهر غير رسمي.",
          "نعل مطاطي لثبات ممتاز.",
          "مثالي للاستخدام اليومي أو المظهر غير الرسمي.",
          "مناسب مع الجينز أو السراويل غير الرسمية.",
        ],
      },
      medical: {
        title: "حذاء طبي من الجلد",
        description: [
          "دعم مثالي وثبات متزايد.",
          "نعل مريح وداخل مبطن لأقصى درجات الراحة.",
          "تقنيات مثل النعال الطبية القابلة للإزالة.",
          "مصمم لأولئك الذين يقفون لساعات طويلة.",
          "تصميم بسيط ووظيفي مناسب للإعدادات الطبية.",
        ],
      },
      mocassin: {
        title: "حذاء مَوكاسين من الجلد",
        description: [
          "راحة وأسلوب غير رسمي.",
          "مصنوع من جلد ناعم وعالي الجودة.",
          "تصميم سهل الارتداء بدون أربطة أو إغلاق.",
          "بطانة جلدية أو قماشية لمزيد من الراحة.",
          "نعل مرن من المطاط أو الجلد.",
          "مثالي للمناسبات شبه الرسمية أو الأيام المريحة.",
        ],
      },
    },
  };

  // Déterminer la classe à utiliser pour le sens du texte RTL si la langue est arabe
  const isRtl = lang === "ar" ? "rtl" : "";
  const keyLang = lang as keyof Lang;
  const translations : {[key:string] :Lang} = {
    "shoe": shoeProductsDetail,
  };
  // const product_type = productType as keyof {[key:string] :Lang}
  


    return (
      <>
        <div className={`shoe-category card ${Category === "classic" ? Category : "d-none"} ${isRtl}`}>
          <h2 className="category-title">{translations[productType][keyLang]?.classic?.title}</h2>
          <ul className="category-description">
            {translations[productType][keyLang]?.classic?.description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>
        </div>
        <div className={`shoe-category card ${Category === "basket" ? Category : "d-none"} ${isRtl}`}>
          <h2 className="category-title">{translations[productType][keyLang]?.basket?.title}</h2>
          <ul className="category-description">
            {translations[productType][keyLang]?.basket?.description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>
        </div>
        <div className={`shoe-category card ${Category === "medical" ? Category : "d-none"} ${isRtl}`}>
          <h2 className="category-title">{translations[productType][keyLang]?.medical?.title}</h2>
          <ul className="category-description">
            {translations[productType][keyLang]?.medical?.description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>
        </div>
        <div className={`shoe-category shadow card ${Category === "mocassin" ? Category : "d-none"} ${isRtl}`}>
          <h2 className="category-title">{translations[productType][keyLang]?.mocassin?.title}</h2>
          <ul className="category-description">
            {translations[productType][keyLang]?.mocassin?.description.map((desc, index) => (
              <li key={index}>{desc}</li>
            ))}
          </ul>
        </div>
      </>
    );

};

export default Text;
