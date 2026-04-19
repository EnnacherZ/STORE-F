import React from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../sidebar";
import DbHeader from "../DbHeader";
import "../styles/Statistics.css";
import { selectedLang } from "../functions";
import { useLangContext } from "../../contexts/LanguageContext";

const Statistics : React.FC = () => {
    const {t} = useTranslation();
    const {currentLang} = useLangContext();

    return(<>
        <Sidebar/>
        <div className={`db-home ${selectedLang(currentLang)=='ar'&&'rtl'}`}>
            <DbHeader/>
            <div className="d-flex justify-content-center fs-2 fw-bold">
                {t('admin.overview.notDeveloped')}
            </div>
        </div>
    </>)
}

export default Statistics;