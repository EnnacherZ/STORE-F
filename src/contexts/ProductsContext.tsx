import React, {createContext, useContext, useState, ReactNode} from "react";

export interface ProductStock {
    id: number;
    product: number;
    size: string | number;
    quantity: number;
}

export interface Product {
    id: number;
    product_type : string;
    category: string;
    ref: string;
    name: string;
    price: number;
    promo: number;
    image: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    newest: boolean;
    stock: ProductStock[];
}

export interface ProductReviews{
    product_type:string;
    product_id:number;
    name:string;
    email:string;
    review:string;
    stars:number;
    date:string;
    id:number
}

interface ProductContextProps {
    rev_star:number;
    rev_name:string;
    rev_email:string;
    reviewText:string;
    setRev_star: React.Dispatch<React.SetStateAction<number>>;
    setRev_name: React.Dispatch<React.SetStateAction<string>>;
    setRev_email: React.Dispatch<React.SetStateAction<string>>;
    setReviewText: React.Dispatch<React.SetStateAction<string>>
}
const ProductsContext = createContext<ProductContextProps| undefined>(undefined);

export const ProductsContextProvider : React.FC<{children : ReactNode}> = ({children}) =>{
    const [rev_star, setRev_star] = useState<number>(0);
    const [rev_name, setRev_name] = useState<string>("");
    const [rev_email, setRev_email] = useState<string>("");
    const [reviewText, setReviewText] = useState<string>("");



    // useEffect(()=>{
    //     const productTypee = DetailledProduct.selectedProduct?.productType || '';
    //     switch(productTypee){
    //         case 'Shoe': setDetailledProductDetails(shoesDataDetails);break;
    //         case 'Sandal': setDetailledProductDetails(sandalsDataDetails);break;
    //         case 'Shirt': setDetailledProductDetails(shirtsDataDetails);break;
    //         case 'Pant': setDetailledProductDetails(pantsDataDetails);break;
            
    //     }
    // },[DetailledProduct])


    return(
    <ProductsContext.Provider value={{ 
    rev_star,rev_email,rev_name,reviewText,setRev_email,setRev_name,setRev_star,setReviewText}}>
        {children}
    </ProductsContext.Provider>)
} 

export const useProductsContext = (): ProductContextProps => {
    const context = useContext(ProductsContext);
    if (context === undefined) {
      throw new Error('useProductsContext must be used within a ProductsProvider');
    }
    return context;
  };