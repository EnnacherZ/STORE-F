import React from "react";
import "../styles/CommandDetails.css"
import { MdOutlineAccessTimeFilled, MdPayments } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";

const CommandDetails : React.FC = () => {
    const {t} = useTranslation();
    const {currentLang} = useLangContext();

    const lang = () =>{return selectedLang(currentLang)}
    const getDateAfterDays = (days:number) :string => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString();
    }
return(<>

    <div className={`command-time ${(lang()==='ar')&&'rtl'} px-2`}>
        <h2 className="command-details-title pt-3">{t('product.details')} :</h2>
        <ul className="list-command-details">
            <li className="Delai-command d-flex ">
                <h6 className="Delai-command-title d-flex my-1">
                    <MdOutlineAccessTimeFilled className="me-1" size={22}/> {t('delivery.time')} :
                </h6>
                <div className="delai-command-details" style={{fontSize:16}}>
                    {t('delivery.expected')} : {t('delivery.from')} {getDateAfterDays(1)} {t('delivery.to')} {getDateAfterDays(5)}
                </div>
            </li>
            <li className="Delai-command d-flex">
                <h6 className="Delai-command-title my-1">
                    <MdPayments size={22}/> {t('payment.cod')} :
                </h6>
                <div className="delai-command-details command-cod-note">
                    <strong>{t('payment.codHint')}</strong>
                </div>
            </li>
        </ul>
    </div>
</>);
};
export default CommandDetails;
