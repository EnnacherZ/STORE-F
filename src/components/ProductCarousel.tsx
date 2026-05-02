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
import { ShoppingBag } from "lucide-react";

interface ProductCarouselProps {
  Data: Product[] | undefined;
  productType: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  Data,
  productType,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [productsData, setProductsData] = useState<Product[]>();

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 1024, min: 768 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 768, min: 500 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 500, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    setProductsData(Data);
  }, [Data]);

  const getProductDetail = (product: Product) => {
    window.location.href = `/productDetails/${product.product_type}/${product.category}/${product.ref}/${product.id}/`;
  };

  const productRender = (l: string) => {
    switch (l) {
      case "Shoe":
        return "home.goToShoes";
      case "Sandal":
        return "home.goToSandals";
      case "Shirt":
        return "home.goToShirts";
      case "Pant":
        return "home.goToPants";
      default:
        return "";
    }
  };

  if (!productsData) {
    return <Loading message={t("product.loading")} />;
  } else if (productsData.length === 0) {
    return <NoProduct />;
  }

  return (
    <>
      <Carousel
        className="productCarousel"
        responsive={responsive}
        swipeable={true}
        autoPlay={productsData.length > 1}
        infinite={true}
        autoPlaySpeed={3500}
        transitionDuration={600}
        showDots={true}
        arrows={true}
      >
        {productsData.map((item, index) => {
          const hasPromo = item.promo > 0;
          const finalPrice = (item.price * (1 - item.promo * 0.01)).toFixed(2);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.07 }}
            >
              <div
                className="productCarouselCard"
                onClick={() => getProductDetail(item)}
              >
                {/* ── Image ── */}
                <div className="productCImgCont">
                  <img
                    src={`${item.image}`}
                    alt={`${item.category} ${item.ref}`}
                  />

                  {/* Promo badge */}
                  {hasPromo && (
                    <span className="productCPromo">{item.promo}% OFF</span>
                  )}

                  {/* Quick view pill */}
                  <span className="productCQuickView">👁 Quick View</span>
                </div>

                {/* ── Meta: category · ref ── */}
                <p className="productCMeta">
                  {item.category} · {item.ref}
                </p>

                {/* ── Name ── */}
                <div className="productCInfos1">{item.category.toLowerCase()}</div>
                <div className="productCInfos2">{item.name.toLowerCase()}</div>

                {/* ── Price ── */}
                <div className="productCPrice mb-2">
                  <span className="productCPriceP">{finalPrice} MAD</span>
                  {hasPromo && (
                    <>
                      <span className="productCPriceD">{item.price} MAD</span>
                      <span className="productCDiscount">−{item.promo}%</span>
                    </>
                  )}
                </div>

                {/* ── CTA ── */}
                <button
                  className="productCView"
                  onClick={(e) => {
                    e.stopPropagation();
                    getProductDetail(item);
                  }}
                >
                  <ShoppingBag size={14} />
                  {t("product.view")}
                </button>
              </div>
            </motion.div>
          );
        })}
      </Carousel>

      {/* "See all" browse link */}
      <div className="carsl-see-all">
        <button
          className="btn"
          onClick={() => navigate(`/ProductPage/${productType}`)}
        >
          {t(productRender(productType))} →
        </button>
      </div>
    </>
  );
};

export default ProductCarousel;
