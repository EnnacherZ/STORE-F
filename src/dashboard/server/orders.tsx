import { useEffect, useState } from "react";
import apiInstance from "../../dashboard/api";



const connecter = apiInstance;

export const getRemainingOrders = () => {
    const [allOrders, setAllOrders] = useState<Array<any>>();
    const [remainingOrders, setRemainingOrders] = useState<Array<any>>();
    const [deliveredOrders, setDeliveredOrders] = useState<Array<any>>();
    const [waitingDeliveryOrders, setWaitingDeliveryOrders] = useState<Array<any>>();

    useEffect(()=>{
        const getRemainingOrdersFunction = async () =>{
            try{
                const response = await connecter.get('db/orders/get');
                setAllOrders(response.data.allOrders || []);
                setRemainingOrders(response.data.remainingOrders || []);
                setDeliveredOrders(response.data.deliveredOrders || []);
                setWaitingDeliveryOrders(response.data.waitingDeliveryOrders || []);
                

            }
            catch{}
        }
        getRemainingOrdersFunction();
    },[])

    return {remainingOrders, allOrders, deliveredOrders, waitingDeliveryOrders};


};

