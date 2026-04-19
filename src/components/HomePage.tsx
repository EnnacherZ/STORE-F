import React, { useEffect, useState } from "react";
import Header from "./Header.tsx";
import HomeBanner from "./HomeBanner.tsx";
import Footer from "./Footer.tsx";
import "../styles/HomePage.css";
import { Product} from "../contexts/ProductsContext.tsx";
import { useTranslation } from "react-i18next";
import { LiaShoePrintsSolid } from "react-icons/lia";
import ProductCarousel from "./ProductCarousel.tsx";
import { connecter } from "../server/connecter.tsx";
import Loading from "./loading.tsx";

export interface HomePageData{
    promo : Product[];
    noPromo : Product[]
}

export const undefinedHomePageData:HomePageData = {promo:[], noPromo:[]}

const HomePage: React.FC = () => {
    const {t} = useTranslation();
    const [allProducts, setAllProducts] = useState<{[key:string]: Product[]}>(); 

    useEffect(()=>{
      const getData = async () =>{
            const allProducts = await connecter.get(`api/products/get/all`);
            setAllProducts(allProducts.data.products)
     };
      getData();
    },[])

    return (<>
        <Header />        
        <HomeBanner/>
        {allProducts ? Object.keys(allProducts).map((_type, index)=>(
            <div key={index}>
            {!(allProducts[_type].length==0)&&
            <>
            <div className="ProductsPromoAnnouncement my-1 HomeTitle fw-bold carsl-item-title">
                <LiaShoePrintsSolid className="mx-2 HomeTitleIconL"/>
                {t(`productTypes.${_type.toLowerCase()}`)}
                <LiaShoePrintsSolid className="mx-2 HomeTitleIconR"/>
            </div>
            <ProductCarousel Data={allProducts[_type]} productType={_type}/>
            </>
            }
            </div>
        ))
        : <Loading message={t('ui.loading')}/>}
        <Footer/>    
    </>
    );
};

export default HomePage;