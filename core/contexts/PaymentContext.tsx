import React, {useState, useEffect, createContext, useContext, ReactNode, Dispatch} from "react";
import { useStoreConfig } from "../config/StoreConfigContext";


export interface Order {
  orderId : string;
  transactionId : string;
  date : string;
  amount : number;
  status : boolean;
  client : number;
}

export interface clientData{
    FirstName : string;
    LastName : string;
    Email : string;
    Phone: string;
    City: string;
    Address : string;
    Amount : number;
    Currency : string;
}

export interface PaymentResponse {
    code: string;
    message: string;
    order_id: string;
    success: boolean;
    transaction_id: string;
    amount : number | undefined;
    currency : string | undefined;
    date : string | undefined;
    isOnlinePayment : boolean | undefined;
}

export interface paymentContextProps {
    clientForm : clientData | undefined;
    setClientForm : (data:clientData) => void;
    paymentResponse : PaymentResponse | undefined;
    setPaymentResponse : Dispatch<React.SetStateAction<PaymentResponse | undefined>>;
    clearPaymentResponse : () => void;
    currentCurrency : string;
    setCurrentCurrency : Dispatch<React.SetStateAction<string>>;
    currencyIsAvailable: boolean;
}

const paymentContext = createContext<paymentContextProps|undefined>(undefined)

export const PaymentProvider : React.FC<{children:ReactNode}> =({children}) => {
    const { storageKeys } = useStoreConfig();
    const PAYMENT_STORAGE_KEY = storageKeys.paymentResponse;
    const CLIENT_STORAGE_KEY  = storageKeys.clientForm;
    const currencyIsAvailable : boolean = import.meta.env.VITE_CURRENCY_AVAILABILITY === "true";
    const [currentCurrency, setCurrentCurrency] = useState<string>('MAD');

    const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | undefined>(() => {
      try {
        const response = sessionStorage.getItem(PAYMENT_STORAGE_KEY);
        if (response) {
          const parsed = JSON.parse(response);
          // Guard against a previously-persisted empty object (`{}`) from
          // the old buggy default — treat it as "no payment response".
          if (parsed && typeof parsed === 'object' && 'success' in parsed) {
            return parsed;
          }
        }
        return undefined;
      } catch (err) {
        return undefined;
      }
    });

    useEffect(() => {
      try {
        if (paymentResponse === undefined) {
          sessionStorage.removeItem(PAYMENT_STORAGE_KEY);
        } else {
          sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(paymentResponse));
        }
      } catch (err) {}
    }, [paymentResponse, PAYMENT_STORAGE_KEY]);

    // Call before starting any new payment attempt, and after a transaction's
    // outcome has been fully consumed — prevents a previous transaction's
    // success/failure data from leaking into the next one.
    const clearPaymentResponse = () => {
      setPaymentResponse(undefined);
    };

    const [clientForm, setClientForm] = useState<clientData | undefined>(() => {
        try {
            const savedClientData = sessionStorage.getItem(CLIENT_STORAGE_KEY);
            if (savedClientData === null || savedClientData === undefined) {
                return undefined;
            }
            return JSON.parse(savedClientData);
        } catch {
            return undefined;
        }
    });

    useEffect(() => {
        try {
            if (clientForm === undefined) {
              sessionStorage.removeItem(CLIENT_STORAGE_KEY);
            } else {
              sessionStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clientForm));
            }
        } catch (error) {
            console.error('Error saving clientData to sessionStorage:', error);
        }
    }, [clientForm, CLIENT_STORAGE_KEY])

    return(
        <paymentContext.Provider value={{clientForm,
                                        setClientForm,
                                        paymentResponse,
                                        setPaymentResponse,
                                        clearPaymentResponse,
                                        currentCurrency,
                                        setCurrentCurrency,
                                        currencyIsAvailable,
                                        }}>
            {children}
        </paymentContext.Provider>
    )
}
export const usePayment = (): paymentContextProps => {
    const context = useContext(paymentContext);
    if (context === undefined) {
      throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
  };