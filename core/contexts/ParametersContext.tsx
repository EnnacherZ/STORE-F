import React, {useContext, createContext, ReactNode, useEffect, useState} from "react";
import { connecter } from "../server/connecter";



interface ParametersProps {
    productTypes : Array<string> | undefined
    categories : any;
}


const ParametersContext = createContext<ParametersProps | undefined>(undefined);


export const ParametersContextProvider : React.FC<{children:ReactNode}> = ({children}) => {
    const [productTypes, setProductTypes] = useState<Array<string>>()
    const [categories, setCategories] = useState<any>({});

    useEffect(()=>{
        const getParams = async () => {
            try{
                const response = await connecter.get('db/products/parameters/get');
                setCategories(response.data.categories || undefined);
                setProductTypes(response.data.types);
            }catch(error){
                console.error('Failed to load product parameters:', error);
            }

        }
        getParams();
    },[]);


    return(
        <ParametersContext.Provider
        value={{productTypes, categories}}
        
        >
        {children}
        </ParametersContext.Provider>
    )

}


export const useParametersContext = (): ParametersProps => {
    const context = useContext(ParametersContext);
    if (context === undefined) {
      throw new Error('useProductsContext must be used within a Parameters Provider');
    }
    return context;
  };