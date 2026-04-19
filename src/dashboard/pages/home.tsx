import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar";
import DbHeader from "../DbHeader";
import "../styles/DbHome.css";
import { FaSortAmountDown, FaWpforms } from "react-icons/fa";
import {getRemainingOrders} from "../server/orders";
import { IoWarning } from "react-icons/io5";
import { MdOutlineFileDownloadDone } from "react-icons/md";
import Modals from "../modals";
import { AnimatePresence } from "framer-motion";
import {getDeficiencies} from "../server/deficiencies";
import { useLangContext } from "../../contexts/LanguageContext";
import NotFound from "../NotFound";
import { toast, ToastContainer, Zoom } from "react-toastify";
import {goTo, selectedLang, showDeficienciesDesktopTable, showDeficienciesPhoneTable, showDesktopTable, showPhoneTable } from "../functions";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loading";


export interface ClientOrder {
    id:number;
    order_id:string;
    transaction_id:string;
    date: Date;
    amount:number;
    client:any;
    status:boolean;
    exception:boolean;
    product_ordered:any;
    currency: string;
}


const DBHome : React.FC = () => {
    const {t} = useTranslation();
    const {currentLang } = useLangContext();
    const {remainingOrders} = getRemainingOrders();
    const deficiencies = getDeficiencies();
    const [isExpanded, setIsExpanded] = useState<{orders:boolean, deficiencies:boolean}>({orders:false, deficiencies:false});
    const [isOrdModal, setIsOrdModal] = useState<boolean>(false);
    const [targetedOrder, setTargetedOrder] = useState<any>();
    const [targetedDeficiency, setTargetedDeficiency] = useState<any>();
    const [isDeficiencyModal, setIsDeficiencyModal] = useState<boolean>();
    const [isPhoneTable, setIsPhoneTable] = useState<boolean>(false);

    useEffect(()=>{
        const handleResize = () =>{
            if(window.innerWidth<=650){
                setIsPhoneTable(true);
            }else{
                setIsPhoneTable(false);
            }
        }
        handleResize();
        addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize)
    },[])

    const deficiencyOnClick = (ord: any) => {
        setTargetedDeficiency(ord);
        setIsDeficiencyModal(true);
    }

    const orderExceptions = [<IoWarning color="red" size={25}/>, <MdOutlineFileDownloadDone color="green" size={25}/>]
    const orderStatus = [
        <p style={{fontSize:"1em", fontWeight:"bold", color:"rgb(234 179 8)"}}>{t('admin.orders.waiting')}</p>,
        <p style={{fontSize:"1em", fontWeight:"bold", color:"green"}}>{t('admin.orders.done')}</p>
    ]

    const orderOnClick = (ord:any) => {
        setTargetedOrder(ord);
        setIsOrdModal(true);
    }

    const processOrder = (ord:any) => {
        if(ord.exception){
            toast.error(t('admin.deficiency.message'),{
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
        }else{
            orderOnClick(ord);
        }
    }

    const toggleExpand = (product:string) => {
        setIsExpanded((prev)=>({...prev, [product]:!prev[product as keyof {orders:boolean, deficiencies:boolean}]}));
    };

    return(<>
         <Sidebar/>
        <div className={`db-home ${selectedLang(currentLang)=='ar'&&'rtl'}`}>
            <DbHeader/>
            <hr/>
            <div className="fw-bold d-flex justify-content-between me-2 my-3">
                <span><FaWpforms className="m-3" size={20}/>{t('admin.orders.remaining')} </span>
                <a href="Orders" onClick={()=>goTo("Orders")}>{t('admin.orders.showAll')} </a>
            </div>
            
            {remainingOrders ? remainingOrders.length > 0 ?
                <>
                    {isPhoneTable ?
                        <>{showPhoneTable(remainingOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.orders)}</>
                        :
                        <>{showDesktopTable(remainingOrders, t, orderStatus, orderExceptions, processOrder, isExpanded.orders)}</>
                    }
                    <div className={remainingOrders.length > 3 ? 'orders-expansion text-center m-1 d-flex justify-content-center' : 'd-none'}>
                        <button className="btn btn-outline-primary" onClick={() => toggleExpand("orders")}>
                            {!isExpanded.orders ? `${t('product.readMore')} ${remainingOrders.length >= 3 ? `(+ ${remainingOrders.length - 3})` : ''}` : t('product.readLess')}
                        </button>
                    </div>
                </>
                : <NotFound message={t('admin.orders.noRemaining')}/>
                : <Loading message={t('ui.loading')}/>
            }

            <hr/>
            <div className="fw-bold me-2 my-3 d-flex justify-content-between">
                <span><FaSortAmountDown className="m-3" size={20}/>{t('admin.deficiency.title')} </span>
                <a href="Deficiency">{t('admin.deficiency.showAll')}</a>
            </div>
            {deficiencies ? deficiencies.length > 0 ?
                <>
                    {isPhoneTable ?
                        <>{showDeficienciesPhoneTable(deficiencies, t, deficiencyOnClick, isExpanded.deficiencies)}</>
                        :
                        <>{showDeficienciesDesktopTable(deficiencies, t, deficiencyOnClick, isExpanded.deficiencies)}</>
                    }
                    <div className={deficiencies.length > 3 ? 'orders-expansion text-center m-1 d-flex justify-content-center' : 'd-none'}>
                        <button className="btn btn-outline-primary" onClick={() => toggleExpand("deficiencies")}>
                            {!isExpanded.deficiencies ? `${t('product.readMore')} ${deficiencies.length >= 3 ? `(+ ${deficiencies.length - 3})` : ''}` : t('product.readLess')}
                        </button>
                    </div>
                </>
                : <NotFound message={t('admin.deficiency.noFound')}/>
                : <Loading message={t('ui.loading')}/>
            }
        </div>

        <AnimatePresence mode="wait">
            {isOrdModal && <Modals message={undefined} onDelete={undefined} cible="orders" onBack={()=>setIsOrdModal(false)} item={targetedOrder}/>}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {isDeficiencyModal && <Modals message={undefined} onDelete={undefined} cible="deficiencies" onBack={()=>setIsDeficiencyModal(false)} item={targetedDeficiency}/>}
        </AnimatePresence>

        <ToastContainer/>
    </>)
}
export default DBHome;