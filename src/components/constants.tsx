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

export const categories = {
    "Shoe": ["Mocassins", "Classics", "Baskets", "Medical"],
    "Sandal": ["Cuir", "Sport"],
    "Shirt": ["T-Shirt", "Polo", "Casual", "Chemise"],
    "Pant":["Classic", "Sport", "Jeans"]
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


export const sendEmail = async (
  emailData: clientData | undefined,
  file: File,
  subject: string,
  body: string
): Promise<boolean> => {
      const recipient = emailData?.Email?.trim();
      if (!recipient) {
        throw new Error('Cannot send invoice email without a recipient address.');
      }

      const formData = new FormData();

      // 👇 ajouter les champs
      formData.append("to", recipient);
      formData.append(
        "customer_name",
        [emailData?.FirstName, emailData?.LastName].filter(Boolean).join(" ")
      );
      //formData.append("cc", emailData.cc);
      //formData.append("bcc", emailData.bcc);
      formData.append("subject", subject);
      formData.append("body", body);

      // 👇 ajouter fichier si موجود
      if (file) {
        formData.append("file", file);
      }    

      // Do not set Content-Type manually: the browser must add the multipart
      // boundary or Django can receive an empty request payload.
      const res = await connecter.post("api/send_mail/", formData)
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



export const homePagePromotion = 10
