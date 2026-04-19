import React, {useContext, createContext, ReactNode, useEffect, useState} from "react";
import { connecter } from "../../server/connecter";



interface ParametersProps {
    productTypes : Array<string>
    categories : any;
}


const ParametersContext = createContext<ParametersProps | undefined>(undefined);


export const ParametersContextProvider : React.FC<{children:ReactNode}> = ({children}) => {
    const [productTypes, setProductTypes] = useState<Array<string>>([])
    const [categories, setCategories] = useState<any>({});

    useEffect(()=>{
        const getParams = async () => {
            const response = await connecter.get('db/products/parameters/get');
            try{
                setCategories(response.data.categories || undefined);
                setProductTypes(response.data.types);
            }catch(error){
                alert(error)
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
      throw new Error('useProductsContext must be used within a ProductsProvide');
    }
    return context;
  };