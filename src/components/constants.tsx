import { Product } from "../contexts/ProductsContext";
import { DataToFilter } from "./FilterSection";
import shoesBanner from "../assets/shoes.png";
import sandalsBanner from "../assets/sandals.png";
import shirtsBanner from "../assets/shirts.png";
import pantsBanner from "../assets/pants.png";
import { validate } from "uuid";
import { connecter } from "../server/connecter";
import { clientData } from "../contexts/PaymentContext";
import { toast, Zoom } from "react-toastify";


export const goTo = (ref:string) => {window.location.href = ref}

  export const selectedLang = (l:string) => {
    let a = '';
    switch(l){
        case    'العربية':
            a = 'ar';
            break;
        case 'Français':
            a = 'fr';
            break;
        case 'English':
            a='en';
            break
    }return a
}

export const productTypeList = [
    "Shoe",
    "Sandal",
    "Shirt",
    "Pant"
]

export const categories = {
    "Shoe": ["Mocassins", "Classics", "Baskets", "Medical"],
    "Sandal": ["Cuir", "Sport"],
    "Shirt": ["T-Shirt", "Polo", "Casual", "Chemise"],
    "Pant":["Classic", "Sport", "Jeans"]
}

export const productTitle = {
    "Shoe": "Shoes models",
    "Sandal": "Sandals models",
    "Shirt": "Shirts models",
    "Pant":"Pants models"
}

export const productBanner = {
    "Shoe": shoesBanner,
    "Sandal": sandalsBanner,
    "Shirt": shirtsBanner,
    "Pant": pantsBanner
}

export const policiesAcceptanceText = (lang:string) => {
    switch(lang){
        case "fr":
            return <p>J’accepte les <a href="/Policies/General-terms-of-use" target="_blank">conditions générales d’utilisation</a> et la <a href="/Policies/Privacy-policy" target="_blank">politique de confidentialité</a>.</p>
        case "en":
            return <p>I agree to the <a href="/Policies/General-terms-of-use" target="_blank">Terms of Service</a> and the <a href="/Policies/Privacy-policy" target="_blank">Privacy Policy</a>.</p>
        case "ar":
            return <p> أوافق على <a href="/Policies/General-terms-of-use" target="_blank">شروط الاستخدام</a> و<a href="/Policies/Privacy-policy" target="_blank">سياسة الخصوصية</a>.</p>
        }   
}

export const filterData = (data: Product[], criterias: DataToFilter) => {
    if(!data){return []}
    return data.filter((item) => {
      if(criterias.category===""&& criterias.name===""&& criterias.ref===""){return true}
      const categoryMatch = criterias.category
      ? item.category.replace(/\s/g, "").toLowerCase().includes(criterias.category.replace(/\s/g, "").toLowerCase())
      : false;

    const refMatch = criterias.ref
      ? item.ref.replace(/\s/g, "").toLowerCase().includes(criterias.ref.replace(/\s/g, "").toLowerCase())
      : false;

    const nameMatch = criterias.name
      ? item.name.replace(/\s/g, "").toLowerCase().includes(criterias.name.replace(/\s/g, "").toLowerCase())
      : false;

    return categoryMatch || refMatch || nameMatch;
    });
  };


export const isValidUUIDv4 = (orderID: string): boolean => {
  return validate(orderID) && orderID.includes('-4');
};


export const cities = [
  "Laâyoune",
//   "Casablanca",
//   "Rabat",
//   "Marrakech",
//   "Fès",
//   "Tanger",
//   "Agadir",
//   "Meknès",
//   "Oujda",
//   "El Jadida",
//   "Tétouan",
//   "Safi",
//   "Nador",
//   "Khouribga",
//   "Béni Mellal",
//   "Kenitra",
//   "Mohammedia",
//   "Essaouira",
//   "Errachidia",
//   "Ouarzazate",
];


export const sendEmail = async (emailData:clientData | undefined, file: File, subject:any, body: any): Promise<void> => {
  try {

      const formData = new FormData();

      // 👇 ajouter les champs
      formData.append("to", emailData?.Email || "");
      //formData.append("cc", emailData.cc);
      //formData.append("bcc", emailData.bcc);
      formData.append("subject", subject);
      formData.append("body", body);

      // 👇 ajouter fichier si موجود
      if (file) {
        formData.append("file", file);
      }    

      const res = await connecter.post("api/send_mail/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      if(res.status == 200){
        showToast(res.data.message, "success");
      }

    
  } catch (error: any) {
    console.error(error);
    alert("Error sending email");
  }
};

export const showToast = (message:string, event : "success" | "error") => {
            if(event == "error"){
                toast.error(message,{
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false, 
                  closeOnClick: false,
                  pauseOnHover: false,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Zoom,
                })
            }else if(event == "success"){
                toast.success(message,{
                  position: "top-center",
                  autoClose: 2000,
                  hideProgressBar: false, 
                  closeOnClick: false,
                  pauseOnHover: false,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Zoom,
                })
            }


}



import { FaRegUserCircle } from "react-icons/fa";


type FirstNameInputProps = {
  register: any;
  errors: any;
  isModify: boolean;
  selectedLang: (lang: string) => string;
  currentLang: string;
  t: (key: string) => string;
};

export const FirstNameInput: React.FC<FirstNameInputProps> = ({
  register,
  errors,
  isModify,
  selectedLang,
  currentLang,
  t,
}) => {
  return (
    <div className="input-group flex-column px-1">
      <div className={`form-label ${selectedLang(currentLang) == 'ar' && 'rtl'}`}>
        {t('firstN')}:
      </div>

      <div className="input-group">
        <span className="input-group-text">
          <FaRegUserCircle />
        </span>

        <input
          {...register("FirstName", {
            required: t('fnreq') + ' !',
          })}
          type="text"
          className={errors.FirstName ? "form-control is-invalid" : "form-control"}
          placeholder={t('firstN')}
          readOnly={isModify}
          disabled={isModify}
        />
      </div>

      {errors.FirstName && (
        <span style={{ color: "red" }}>
          {errors.FirstName.message}
        </span>
      )}
    </div>
  );
};

import { LiaShoePrintsSolid } from "react-icons/lia";
import { GiSandal }           from "react-icons/gi";
import { FaShirt }            from "react-icons/fa6";
import { PiPantsBold }        from "react-icons/pi";
import React                  from "react";
 
// 2. Add this export:
//    Maps each productType string → its React icon component.
//    Used in ProductPage.tsx to render the title icon dynamically.
//    To add a new product type, just add one line here.
export const productIcon: Record<string, React.ElementType> = {
  Shoe:   LiaShoePrintsSolid,
  Sandal: GiSandal,
  Shirt:  FaShirt,
  Pant:   PiPantsBold,
};