import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar";
import DbHeader from "../DbHeader";
import "../styles/deficiency.css";
import { FaSortAmountDown } from "react-icons/fa";
import {getDeficiencies} from "../server/deficiencies";
import { useLangContext } from "../../contexts/LanguageContext";
import NotFound from "../NotFound";
import {selectedLang, showDeficienciesDesktopTable, showDeficienciesPhoneTable } from "../functions";
import { AnimatePresence } from "framer-motion";
import Modals from "../modals";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loading";
import { ToastContainer } from "react-toastify";

const ExceptionsPage : React.FC= () => {
    const {t} = useTranslation();
    const {currentLang} = useLangContext();
    const deficiencies = getDeficiencies();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [targetedItem, setTargetedItem] = useState<any>();
    const [isDeficiencyModal, setIsDeficiencyModal] = useState<boolean>()
    const [isPhoneTable, setIsPhoneTable] = useState<boolean>(false);

    useEffect(()=>{
        const handleResize = () =>{
            if(window.innerWidth<=650){ setIsPhoneTable(true); }
            else { setIsPhoneTable(false); }
        }
        handleResize();
        addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize)
    },[])

    const processDeficiency = (ord: any) => {
        setTargetedItem(ord);
        setIsDeficiencyModal(true);
    }

    return(<>
        <Sidebar/>
        <div className={`db-deficiency ${selectedLang(currentLang)=='ar'&&'rtl'}`}>
            <DbHeader/>
            <div className="fw-bold my-4"><FaSortAmountDown className="me-3" size={20}/>{t('admin.deficiency.title')}</div>
            {deficiencies ? deficiencies.length > 0 ?
                <>
                    {isPhoneTable ?
                        <>{showDeficienciesPhoneTable(deficiencies, t, processDeficiency, isExpanded)}</>
                        : <>{showDeficienciesDesktopTable(deficiencies, t, processDeficiency, isExpanded)}</>
                    }
                    <div className={deficiencies.length > 3 ? 'orders-expansion text-center m-1 d-flex justify-content-center' : 'd-none'}>
                        <button className="btn btn-outline-primary" onClick={() => setIsExpanded(!isExpanded)}>
                            {!isExpanded ? t('product.readMore') : t('product.readLess')}
                        </button>
                    </div>
                </>
                : <NotFound message={t('admin.deficiency.noFound')}/>
                : <Loading message={t('ui.loading')}/>
            }
        </div>

        <AnimatePresence mode="wait">
            {isDeficiencyModal && <Modals
                message={undefined}
                onDelete={undefined}
                cible="deficiencies"
                onBack={() => setIsDeficiencyModal(false)}
                item={targetedItem}
            />}
        </AnimatePresence>

        <ToastContainer/>
    </>)
};

export default ExceptionsPage;