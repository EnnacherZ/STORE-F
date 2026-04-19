import React, { useEffect, useState } from "react";
import "./styles/dbSidebar.css";
import { BsInboxesFill } from "react-icons/bs";
import { GiClothes } from "react-icons/gi";
import { FaArrowDownWideShort } from "react-icons/fa6";
import logo from "../assets/FIRDAOUS STORE.png";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { MdLanguage, MdOutlineSettings } from "react-icons/md";
import { useLangContext } from "../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { ImStatsDots } from "react-icons/im";
import { goTo, selectedLang } from "./functions";
import { useAuth } from "./contexts/Authentication";
import { useNavigate } from "react-router-dom";

const Sidebar : React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {signOut} = useAuth();
    const {currentLang, setCurrentLang} = useLangContext();
    const actual = window.location.pathname.slice(1);
    const [isPhone, setIsPhone] = useState<boolean>();

    useEffect(()=>{
        const handleResize = () =>{
            if(window.innerWidth <= 855){ setIsPhone(true); }
            else { setIsPhone(false); }
        }
        handleResize();
        addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize)
    },[])

    const SignOut = () => {
        signOut();
        navigate('/Dashboard/Login');
    }

    if(isPhone){ return <></> }

    return(<>
        <div className={`${selectedLang(currentLang) == 'ar' ? 'db-sidebar-rtl rtl' : 'db-sidebar'} shadow justify-content-between`}>
            <div className={`${selectedLang(currentLang) == 'ar' ? 'db-sidebar-header-rtl rtl' : 'db-sidebar-header'} shadow-sm`}>
                <div className="db-sidebar-logo my-2" onClick={() => goTo('/Dashboard/Home')}><img src={logo} alt=""/></div>
                <h5 className="text-center fw-bold my-2">STORE DASHBOARD</h5>
            </div>
            <ul className={`db-sidebar-list ${selectedLang(currentLang) == 'ar' ? 'rtl' : ''}`}>
                <li className="d-flex rounded" style={{zIndex:11000}}>
                    <MdLanguage size={20}/>
                    <select className="mx-1 sidebar-lang fw-bold" onChange={(e) => setCurrentLang(e.target.value)} value={currentLang}>
                        <option>Français</option>
                        <option>العربية</option>
                        <option>English</option>
                    </select>
                </li>
                <li className={`my-3 rounded ${actual.toLowerCase() == 'dashboard/home' && 'DbIsClicked'}`} onClick={() => goTo("/Dashboard/Home")}><FaHome className="me-2"/> {t('nav.home')}</li>
                <li className={`my-3 rounded ${actual.toLowerCase() == 'dashboard/orders' && 'DbIsClicked'}`} onClick={() => goTo("/Dashboard/Orders")}><BsInboxesFill className="me-2"/> {t('nav.orders')}</li>
                <li className={`my-3 rounded ${actual.toLowerCase() == 'dashboard/deficiency' && 'DbIsClicked'}`} onClick={() => goTo("/Dashboard/Deficiency")}><FaArrowDownWideShort className="me-2"/> {t('admin.deficiency.title')}</li>
                <li className={`my-3 rounded ${actual.toLowerCase() == 'dashboard/productmanager' && 'DbIsClicked'}`} onClick={() => goTo('/Dashboard/ProductManager')}><GiClothes className="me-2"/> {t('admin.product.management')}</li>
                <div className="my-2 rounded db-statistics-btn shadow" onClick={() => goTo("/Dashboard/Statistics")}><ImStatsDots className="me-2"/> {t('nav.statistics')}</div>
                <div className="my-2 rounded db-settings-btn shadow" onClick={() => goTo("/Dashboard/Settings")}><MdOutlineSettings className="me-2"/> {t('nav.settings')}</div>
                <div className="my-2 rounded db-signout shadow" onClick={SignOut}><FaSignOutAlt className="me-2"/> {t('nav.signOut')}</div>
            </ul>
        </div>
    </>)
};

export default Sidebar;