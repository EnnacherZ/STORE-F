import React, {useEffect, useState } from "react";
import Sidebar from "../sidebar";
import { useLangContext } from "../../contexts/LanguageContext";
import DbHeader from "../DbHeader";
import { FaWpforms } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import {getRemainingOrders} from "../server/orders";
import { IoWarning } from "react-icons/io5";
import { MdOutlineFileDownloadDone } from "react-icons/md";
import {ToastContainer } from "react-toastify";
import NotFound from "../NotFound";
import { AnimatePresence } from "framer-motion";
import Modals from "../modals";
import {selectedLang, showDesktopTable, showPhoneTable } from "../functions";
import Loading from "../../components/loading";


const Orders : React.FC = () => {
    const {t} = useTranslation();
    const {currentLang} = useLangContext();
    const {remainingOrders, allOrders, deliveredOrders, waitingDeliveryOrders} = getRemainingOrders();
    const [isExpanded, setIsExpanded] = useState<{remaining:boolean, delivered:boolean, all:boolean, waitingDelivery:boolean}>({waitingDelivery:false, remaining:false, delivered:false, all:false});
    const [isOrdModal, setIsOrdModal] = useState<boolean>(false);
    const [targetedItem, setTargetedItem] = useState<any>();
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

    const orderExceptions = [<IoWarning color="red" size={25}/>, <MdOutlineFileDownloadDone color="green" size={25}/>]
    const orderStatus = [
        <p style={{fontSize:"1em", fontWeight:"bold", color:"rgb(234 179 8)"}}>{t('admin.orders.waiting')}</p>,
        <p style={{fontSize:"1em", fontWeight:"bold", color:"green"}}>{t('admin.orders.done')}</p>
    ]

    const toggleExpand = (product:string) => {
        setIsExpanded((prev)=>({...prev, [product]:!prev[product as keyof {remaining:boolean, delivered:boolean, all:boolean}]}));
    };

    const processOrder = (ord:any) => {
        setTargetedItem(ord);
        setIsOrdModal(true);
    }

    return(<>
        <Sidebar/>
        <div className={`db-deficiency ${selectedLang(currentLang)=='ar'&&'rtl'}`}>
            <DbHeader/>
            <hr/>
            <div className="fw-bold my-4"><FaWpforms className="me-3" size={20}/>{t('admin.orders.remaining')}</div>
            {remainingOrders ? remainingOrders.length > 0 ?
                <>
                    {isPhoneTable ?
                        <>{showPhoneTable(remainingOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.remaining)}</>
                        : <>{showDesktopTable(remainingOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.remaining)}</>
                    }
                    <div className={remainingOrders.length > 3 ? "orders-expansion text-center m-1 d-flex justify-content-center" : 'd-none'}>
                        <button className="btn btn-outline-primary" onClick={() => toggleExpand("remaining")}>
                            {!isExpanded.remaining ? `${t('product.readMore')} ${remainingOrders.length >= 3 ? `(+ ${remainingOrders.length - 3})` : ''}` : t('product.readLess')}
                        </button>
                    </div>
                </>
                : <NotFound message={t('admin.orders.noRemaining')}/>
                : <Loading message={t('ui.loading')}/>
            }
            <hr/>
            <div className="fw-bold my-3"><FaWpforms className="me-3" size={20}/>{t('admin.orders.delivered')}</div>
            {waitingDeliveryOrders ? waitingDeliveryOrders.length > 0 ?
                <>
                    {isPhoneTable ?
                        <>{showPhoneTable(waitingDeliveryOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.waitingDelivery)}</>
                        : <>{showDesktopTable(waitingDeliveryOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.waitingDelivery)}</>
                    }
                    <div className={waitingDeliveryOrders.length > 3 ? "orders-expansion text-center m-1 d-flex justify-content-center" : 'd-none'}>
                        <button className="btn btn-outline-primary" onClick={() => toggleExpand("waitingDelivery")}>
                            {!isExpanded.waitingDelivery ? `${t('product.readMore')} ${waitingDeliveryOrders.length >= 3 ? `(+ ${waitingDeliveryOrders.length - 3})` : ''}` : t('product.readLess')}
                        </button>
                    </div>
                </>
                : <NotFound message={t('admin.orders.noDelivered')}/>
                : <Loading message={t('ui.loading')}/>
            }
            <hr/>
            <div className="fw-bold my-3"><FaWpforms className="me-3" size={20}/>{t('admin.orders.delivered')}</div>
            {deliveredOrders ? deliveredOrders.length > 0 ?
                <>
                    {isPhoneTable ?
                        <>{showPhoneTable(deliveredOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.delivered)}</>
                        : <>{showDesktopTable(deliveredOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.delivered)}</>
                    }
                    <div className={deliveredOrders.length > 3 ? "orders-expansion text-center m-1 d-flex justify-content-center" : 'd-none'}>
                        <button className="btn btn-outline-primary" onClick={() => toggleExpand("delivered")}>
                            {!isExpanded.delivered ? `${t('product.readMore')} ${deliveredOrders.length >= 3 ? `(+ ${deliveredOrders.length - 3})` : ''}` : t('product.readLess')}
                        </button>
                    </div>
                </>
                : <NotFound message={t('admin.orders.noDelivered')}/>
                : <Loading message={t('ui.loading')}/>
            }
            <hr/>
            <div className="fw-bold my-3"><FaWpforms className="me-3" size={20}/>{t('admin.orders.all')}</div>
            {allOrders ? allOrders.length > 0 ?
                <>
                    {isPhoneTable ?
                        <>{showPhoneTable(allOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.all)}</>
                        : <>{showDesktopTable(allOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.all)}</>
                    }
                    <div className={allOrders.length > 3 ? "orders-expansion text-center m-1 d-flex justify-content-center" : 'd-none'}>
                        <button className="btn btn-outline-primary" onClick={() => toggleExpand("all")}>
                            {!isExpanded.all ? `${t('product.readMore')} ${allOrders.length >= 3 ? `(+ ${allOrders.length - 3})` : ''}` : t('product.readLess')}
                        </button>
                    </div>
                </>
                : <NotFound message={t('admin.orders.noRemaining')}/>
                : <Loading message={t('ui.loading')}/>
            }
        </div>

        <AnimatePresence mode="wait">
            {isOrdModal && <Modals message={undefined} onDelete={undefined} cible="orders" onBack={()=>setIsOrdModal(false)} item={targetedItem}/>}
        </AnimatePresence>
        <ToastContainer/>
    </>)
};
export default Orders;