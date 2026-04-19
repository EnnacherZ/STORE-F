import React, {useEffect, useState } from "react";
import icon2 from "./../assets/FIRDAOUS STORE.png"
import { goTo, selectedLang } from "./functions";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import "./styles/SidebarHeader.css";
import { FaSignOutAlt, FaHome } from "react-icons/fa";
import { MdLanguage, MdOutlineSettings } from "react-icons/md";
import { useAuth } from "./contexts/Authentication";
import { useNavigate } from "react-router-dom";
import { ImStatsDots } from "react-icons/im";
import { PiPantsBold } from "react-icons/pi";
import { FaArrowDownWideShort, FaShirt } from "react-icons/fa6";
import { LiaShoePrintsSolid } from "react-icons/lia";
import { GiSandal } from "react-icons/gi";
import { BsInboxesFill } from "react-icons/bs";
import { GrLanguage } from "react-icons/gr";
import { USER_FIRSTNAME, USER_IMAGE, USER_LASTNAME, USER_USERNAME } from "./api";


const SidebarHeader : React.FC = () => {
    const {t} = useTranslation();
    const {signOut} = useAuth();
    const navigate = useNavigate();
    const {currentLang, setCurrentLang} = useLangContext();
    const [sidebar, setSidebar] = useState<boolean>(false);
    const actual = window.location.pathname.slice(1);
    const [userFirstName, setUserFirstName] = useState<string>();
    const [userLastName, setUserLastName] = useState<string>();
    const [userUsername, setUserUsername] = useState<string>();
    const [userImage, setUserImage] = useState<string>();


    useEffect(()=>{
        const firstname = localStorage.getItem(USER_FIRSTNAME);
        const lastname = localStorage.getItem(USER_LASTNAME);
        const username = localStorage.getItem(USER_USERNAME)
        const image = localStorage.getItem(USER_IMAGE);
        if(firstname){setUserFirstName(firstname)};
        if(lastname){setUserLastName(lastname)};
        if(username){setUserUsername(username)};
        if(image){setUserImage(image)};
    },[])

    const SignOut = () => {
        
        signOut();
        navigate('/Dashboard/Login');
    }



    return(<>
<div className="shadow db-sidebar-phone-header">
            <div className="icon-section">
                <a onClick={() => goTo("/Home")}>
                    <img className="icon1" src={icon2} alt="Icon" />
                </a>
            </div>
            <div className="sideBarIcon" onClick={()=>setSidebar(!sidebar)}>
                <div  className="d-flex flex-column justify-content-evenly align-items-center" style={{height:60}}>
                <div className={sidebar?`db-sideBarIconLine1 active`:"db-sideBarIconLine1"}
                        onClick={()=>setSidebar(!sidebar)}></div>
                <div className={sidebar?`db-sideBarIconLine2 active`:"db-sideBarIconLine2"}
                        onClick={()=>setSidebar(!sidebar)}></div>
                <div className={sidebar?`db-sideBarIconLine3 active`:"db-sideBarIconLine3"}
                        onClick={()=>setSidebar(!sidebar)}></div>
                </div>
                <div className="fs-6 fw-bold text-center" style={{color:"#0e92e4"}}>{t('menu')}</div>
            </div>
            <div className="db-lang-icon-div d-flex align-items-center">
                <GrLanguage  className="db-lang-icon" />
                <span className="rounded" style={{backgroundColor:'#fff', color:"#0e92e4", direction:'rtl'}}>
                {currentLang}</span>
            </div>


            <nav className={`db-header-navbar ${sidebar&&"active"} ${selectedLang(currentLang)=="ar"&&'rtl'} shadow`}
                style={selectedLang(currentLang)==="ar"?{right:0}:{left:0}}>
             
        <div className="db-header-sidebar-user d-flex flex-column align-items-center">
            <div className="db-user-image">
                <img src={userImage} style={{width:"100%", height:"100%"}}/>
            </div>
            <div className="db-user-name text-center fw-bold my-1" style={{color:"#0782ce"}}>{userFirstName} {userLastName}</div>
            <div className="db-user-name text-center fw-bold my-1" style={{color:"#0782ce"}}>{t('username')}: {userUsername}</div>
        </div>

        <ul className={`db-header-sidebar-list ${selectedLang(currentLang)=='ar'?'rtl':''} mt-2`}>
                    <li className="d-flex rounded " style={{zIndex:11000}}>
                    <MdLanguage size={20}/>
                        <select className="mx-1 sidebar-lang fw-bold"
                                onChange={(e)=>setCurrentLang(e.target.value)}
                                value={currentLang}
                                >
                            <option className="mx-2">
                                Français
                            </option>
                            <option className="mx-2">
                                العربية
                            </option>
                            <option className="mx-2">
                                English
                            </option>
                        </select>
            </li>
            <li className={`my-3 rounded ${actual.toLowerCase()=='dashboard/home'&&'DbIsClicked'}`} onClick={()=>{goTo("/Dashboard/Home")}}><FaHome className="me-2"/> {t('home')} </li>
            <li className={`my-3 rounded ${actual.toLowerCase()=='dashboard/orders'&&'DbIsClicked'}`} onClick={()=>{goTo("/Dashboard/Orders")}}><BsInboxesFill className="me-2"/> {t('orders')} </li>
            <li className={`my-3 rounded ${actual.toLowerCase()=='dashboard/deficiency'&&'DbIsClicked'}`} onClick={()=>{goTo("/Dashboard/Deficiency")}}><FaArrowDownWideShort className="me-2"/> {t('deficiencies')} </li>
            <li className={`my-3 rounded ${actual.toLowerCase()=='dashboard/shoe'&&'DbIsClicked'}`} onClick={()=>{goTo('/Dashboard/Shoe')}}><LiaShoePrintsSolid className="me-2"/> {t('shoes')}</li>
            <li className={`my-3 rounded ${actual.toLowerCase()=='dashboard/sandal'&&'DbIsClicked'}`} onClick={()=>{goTo('/Dashboard/Sandal')}}><GiSandal className="me-2"/> {t('sandals')}</li>
            <li className={`my-3 rounded ${actual.toLowerCase()=='dashboard/shirt'&&'DbIsClicked'}`} onClick={()=>{goTo('/Dashboard/Shirt')}}><FaShirt className="me-2"/> {t('shirts')}</li>
            <li className={`my-3 rounded ${actual.toLowerCase()=='dashboard/pant'&&'DbIsClicked'}`} onClick={()=>{goTo('/Dashboard/Pant')}}><PiPantsBold className="me-2"/> {t('pants')}</li>
            <div className="my-2 rounded db-statistics-btn shadow " onClick={()=>goTo("/Dashboard/Statistics")}><ImStatsDots  className="me-2"/> {t('statistics')}</div>
            <div className="my-2 rounded db-settings-btn shadow " onClick={()=>goTo("/Dashboard/Settings")}><MdOutlineSettings  className="me-2"/> {t('settings')}</div>
            <div className="my-2 rounded db-signout shadow " onClick={SignOut}><FaSignOutAlt className="me-2"/> {t('signOut')}</div>
        </ul>
            </nav>
<div className={`db-voidSectionSideBarReducer ${sidebar&&"active"}`} 
style={selectedLang(currentLang)==="ar"?{left:0}:{right:0}}
onClick={()=>setSidebar(false)}></div>

</div>
    </>)
}

export default SidebarHeader;