import React, { useEffect, useState } from "react";
import "./styles/DbHeader.css"
import { GrOverview } from "react-icons/gr";
import {getRemainingOrders} from "./server/orders";
import { FaWpforms } from "react-icons/fa6";
import { FaSortAmountDown } from "react-icons/fa";
import {getDeficiencies} from "./server/deficiencies";
import { useTranslation } from "react-i18next";
import SidebarHeader from "./SidebarHeader";
import { USER_FIRSTNAME, USER_LASTNAME, USER_USERNAME } from "./api";

const DbHeader : React.FC = () => {
    const {t} = useTranslation();
    const {remainingOrders} = getRemainingOrders();
    const deficiencies = getDeficiencies();
    const [isPhone, setIsPhone] = useState<boolean>();
    const [userUsername, setUserUsername] = useState<string>();

    useEffect(()=>{
        const firstname = localStorage.getItem(USER_FIRSTNAME);
        const lastname = localStorage.getItem(USER_LASTNAME);
        const username = localStorage.getItem(USER_USERNAME)
        if(firstname && lastname){ setUserUsername(firstname + " " + lastname) }
        else { if(username){ setUserUsername(username) } }
    },[])

    useEffect(()=>{
        const handleResize = () =>{
            if(window.innerWidth <= 855){ setIsPhone(true); }
            else { setIsPhone(false); }
        }
        handleResize();
        addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize)
    },[])

    return(<>
        {isPhone && <SidebarHeader/>}
        <div className="db-header d-flex flex-column" style={isPhone ? {marginTop:80} : {}}>
            <div className="fw-bold my-1 text-center" style={{color:"#0e92e4"}}>
                {t('auth.welcomeBack')} {userUsername}
            </div>
            <div className="db-home-overview m-1 fs-5 mb-3 fw-bold"><GrOverview className="mx-2"/>{t('admin.overview.general')}</div>
            <div className="d-flex flex-wrap">
                <div className={`m-1 border db-notConfirmed ${!remainingOrders || remainingOrders.length == 0 ? 'null border-warning' : 'border-danger'} fw-bold rounded d-flex flex-row p-1 align-items-center`}>
                    <div className={`db-notConfirmed-lg ${!remainingOrders || remainingOrders.length == 0 ? 'null' : ''} rounded mx-2`}>
                        <FaWpforms className="p-1" size={50} color={!remainingOrders || remainingOrders.length == 0 ? '#ffc107' : 'red'}/>
                    </div>
                    <div className="mx-1 text-muted">{t('admin.orders.notConfirmed')} :</div>
                    <div className="mx-1" style={{color: !remainingOrders || remainingOrders.length == 0 ? '#ffc107' : 'red'}}>{remainingOrders?.length}</div>
                </div>
                <div className={`m-1 border db-notConfirmed ${!deficiencies || deficiencies.length == 0 ? 'null border-warning' : 'border-danger'} fw-bold rounded d-flex flex-row p-1 align-items-center`}>
                    <div className={`db-notConfirmed-lg ${!deficiencies || deficiencies.length == 0 ? 'null' : ''} rounded mx-2`}>
                        <FaSortAmountDown className="p-1" size={50} color={!deficiencies || deficiencies.length == 0 ? '#ffc107' : 'red'}/>
                    </div>
                    <div className="mx-1 text-muted">{t('admin.deficiency.current')} :</div>
                    <div className="mx-1" style={{color: !deficiencies || deficiencies?.length == 0 ? '#ffc107' : 'red'}}>{deficiencies?.length}</div>
                </div>
            </div>
        </div>
    </>)
};

export default DbHeader;