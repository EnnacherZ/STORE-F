import { Product } from "../contexts/ProductsContext";
import { DataToFilter } from "./FilterSection";
import { validate } from "uuid";
import { connecter } from "../server/connecter";
import { clientData } from "../contexts/PaymentContext";
import { toast, Zoom } from "react-toastify";

type Lang   = "fr" | "en" | "ar";

export const goTo = (ref:string) => {window.location.href = ref}

  export const selectedLang = (l:string) : Lang => {
    let a : Lang = 'ar';
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


export const sendEmail = async (emailData:clientData | undefined, file: File, subject:any, body: any): Promise<boolean> => {


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
      return res.status == 200

    

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

import React from "react";

export const homePagePromotion = 10