import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "../styles/ProductCarousel.css";
import { useNavigate } from "react-router-dom";
import { Product } from "../contexts/ProductsContext";
import { useTranslation } from "react-i18next";
import Loading from "./loading";
import NoProduct from "./NoProduct";
import { motion } from "framer-motion";

interface ProductCarouselProps {
  Data : Product[] | undefined;
  productType : string;
}

const ProductCarousel : React.FC<ProductCarouselProps> = ({Data, productType}) => {

  const {t} = useTranslation();
  const navigate = useNavigate();
  const [productsData, setProductsData] = useState<Product[]>();
    const responsive = {
        superLargeDesktop: {
          breakpoint: { max: 4000, min: 1024 },
          items: 4
        },
        desktop: {
          breakpoint: { max: 1024, min: 768 },
          items: 3
        },
        tablet: {
          breakpoint: { max: 768, min: 500 },
          items: 2
        },
        mobile: {
          breakpoint: { max: 500, min: 0 },
          items: 1
        }
      };

      useEffect(()=>{
        setProductsData(Data);
      },[Data]);
      
      const getProductDetail = (product : Product) =>{
        window.location.href = `/productDetails/${product.product_type}/${product.category}/${product.ref}/${product.id}/` 
      }

      const productRender = (l:string) => {
        switch(l){
          case 'Shoe':   return 'home.goToShoes';
          case 'Sandal': return 'home.goToSandals';
          case 'Shirt':  return 'home.goToShirts';
          case 'Pant':   return 'home.goToPants';
          default:       return '';
        }
      }

    if(!productsData){return <Loading message={t('product.loading')}/>}
    else if(productsData.length==0){<NoProduct/>}
    return(
      <><hr className="my-1"/>
        
        <Carousel className={`mt-1 productCarousel z-0 `} 
                responsive={responsive}
                swipeable={true}
                autoPlay={productsData.length>1}
                infinite={true}
                autoPlaySpeed={1000}
                transitionDuration={1000}
                showDots={true}
                >
            {productsData.map((item, index)=>(
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}>
                <div className="productCarouselCard card text-center d-flex flex-column" 
                      key={index} onClick={()=>getProductDetail(item)}>
                  <div className="productCImgCont rounded-">
                    <img src={`${item.image}`} className="rounded-top" alt="" />
                  </div>
                  <div className="productCInfos1 my-1 fw-bold">
                    {(item.category).toLowerCase()} {item.ref}
                  </div>
                  <div className="productCInfos2 my-1 fw-bold">
                    {(item.name).toLowerCase()}
                  </div>
                  <div className="productCPrice my-1">
                    <div className="productCPriceP my-2">{(item.price*(1-item.promo*0.01)).toFixed(2)} MAD</div>
                    <div className={`productCPriceD my-2 ${item.promo==0?'d-none':''}`}>{item.price} MAD</div>
                    <div className={`productCDiscount my-2 ${item.promo==0?'d-none':''}`}> {item.promo}% off</div>
                  </div>
                  <button className="fw-bold productCView mb-0"
                        onClick={()=>getProductDetail(item)}>
                    {t('product.view')} 
                  </button>
                </div>
              </motion.div>
            ))}
        </Carousel>
        <div className="d-flex justify-content-center mt-3">
          <button className="btn btn-outline-secondary fw-bold"
                  onClick={()=>navigate(`/ProductPage/${productType}`)}> 
            {t(productRender(productType))} 
          </button>
        </div>
        <hr className="my-1"/>
      </>
    )
}
export default ProductCarousel;