import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { connecter } from "../server/connecter";
import Header from "./Header";
import "../styles/orderTracking.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faFlagCheckered, faGear, faSearch, faShippingFast, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";


const RESET_DURATION = 24 * 60 * 60 * 1000;

const OrderTracker :React.FC = () => {
    const {t} = useTranslation();
    const {orderID} = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>()
    const [orderFound, setOrderFound] = useState<boolean>();
    const [orderState, setOrderState] = useState<boolean>();
    const [client, setClient] = useState<any>();
    const [attempt, setAttempts] = useState<number>(() => {
      const att = localStorage.getItem('AlFirdaousStoreOrderTrackingLimitAttempts');
      const lastReset = localStorage.getItem('AlFirdaousStoreOrderTrackingLimitAttemptsLastReset');

      const now = Date.now();

      if (lastReset) {
        const lastResetTime = parseInt(lastReset, 10);
        if (now - lastResetTime > RESET_DURATION) {
          localStorage.setItem('AlFirdaousStoreOrderTrackingLimitAttempts', JSON.stringify(0));
          localStorage.setItem('AlFirdaousStoreOrderTrackingLimitAttemptsLastReset', now.toString());
          return 0;
        }
      } else {
        localStorage.setItem('AlFirdaousStoreOrderTrackingLimitAttemptsLastReset', now.toString());
      }

      return att ? JSON.parse(att) : 0;
    });

    useEffect(() => {
      localStorage.setItem('AlFirdaousStoreOrderTrackingLimitAttempts', JSON.stringify(attempt));
      if (attempt === 0) {
        localStorage.setItem('AlFirdaousStoreOrderTrackingLimitAttemptsLastReset', Date.now().toString());
      }
    }, [attempt]);

    const hasFetched = useRef(false);
    useEffect(()=>{
        const checkOrder = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            if(attempt<=2){
                setIsLoading(true);
                try{
                    const response = await connecter.get(`api/orders/check?orderID=${orderID}`);
                    const data = await response.data
                    if(data.error){
                        setError(true)
                    } else {
                        setOrderFound(data.found);
                        setOrderState(data.state);
                        setClient(data.client)
                    }                
                }catch(err){
                }finally{
                    setIsLoading(false);
                }              
            } else {
                setIsLoading(false);
            }
            setAttempts((prev)=>prev+1);
        }
        checkOrder();
    }, [orderID])


return(<>
    <Header/>

    <div className="d-flex justify-content-center fs-2 fw-bold mt-2" style={{color:'#0e92e4'}}>
        {t('tracking.title')}
    </div>

    <div className="d-flex justify-content-center my-5">
        {attempt>3?
            <FontAwesomeIcon icon={faFlagCheckered} size="6x" beatFade style={{ color:"red"}}/>
        :       
        isLoading?
            <FontAwesomeIcon icon={faSearch} size="6x" spin style={{ color:"#0e92e4"}}/>
        :
        error?
            <FontAwesomeIcon icon={faTriangleExclamation} size="10x" shake style={{ color:"#ff0000"}}/>
        :
        orderFound?
            orderState?
                <FontAwesomeIcon icon={faShippingFast} size="5x" bounce style={{ color:"#0e92e4"}}/>
            :
                <FontAwesomeIcon icon={faGear} size="5x" spin style={{ color:"#0e92e4"}}/>
        :
            <FontAwesomeIcon icon={faBan} size="10x" shake style={{ color:"#ff0000"}}/>           
        }
    </div>

    <div className="d-flex align-items-center flex-column fw-bold">
        {attempt>3?
            <p>{t('tracking.limitReached')}</p>
        :
        isLoading?
            <p>{t('tracking.searching')} ...</p>
        :
        error?
            <p>{orderID} {t('tracking.noValidId')}</p>
        :
        orderFound?
            orderState?
            <>            
                <h4 className="my-3 fw-bold">{t('auth.welcomeBack')} {client.first_name + ' ' + client.last_name} !</h4>
                <h4 className="my-3">{t('tracking.validated')} !</h4>
            </>
            :
            <>            
                <h4 className="my-3 fw-bold">{t('auth.welcomeBack')} {client.first_name + ' ' + client.last_name} !</h4>
                <h4 className="my-3">{t('tracking.notValidated')} !</h4>
            </>
        :
            <>
                <p>{t('tracking.noOrderFound')}</p>
                <p>{t('tracking.idProvided')}</p>
                <p>{orderID}</p>
            </>
        }
        <div className={attempt>3?'d-none':''}>{t('tracking.attempts')} : {`${attempt}/3`}</div>
    </div>    

</>)
}

export default OrderTracker;