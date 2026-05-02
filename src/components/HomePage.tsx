import React, { useEffect, useState } from "react";
import Header from "./Header.tsx";
import HomeBanner from "./HomeBanner.tsx";
import Footer from "./Footer.tsx";
import "../styles/HomePage.css";
import { Product } from "../contexts/ProductsContext.tsx";
import { useTranslation } from "react-i18next";
import { LiaShoePrintsSolid } from "react-icons/lia";
import { ChevronRight } from "lucide-react";
import ProductCarousel from "./ProductCarousel.tsx";
import { connecter } from "../server/connecter.tsx";
import Loading from "./loading.tsx";

export interface HomePageData {
  promo: Product[];
  noPromo: Product[];
}

export const undefinedHomePageData: HomePageData = { promo: [], noPromo: [] };

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [allProducts, setAllProducts] = useState<{ [key: string]: Product[] }>();

  useEffect(() => {
    const getData = async () => {
      const allProducts = await connecter.get(`api/products/get/all`);
      setAllProducts(allProducts.data.products);
    };
    getData();
  }, []);

  return (
    <>
      <Header />
      <HomeBanner />

      {/* ── Category filter pills ── */}
      <div className="home-category-bar">
        <div className="home-category-inner">
          {["home.all", "home.shoes", "home.sandals", "home.shirts", "home.pants"].map((key, i) => (
            <button key={i} className={`home-cat-pill ${i === 0 ? "active" : ""}`}>
              {t(key, { defaultValue: key.split(".")[1] })}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product type sections ── */}
      <div className="home-sections-wrap">
        {allProducts ? (
          Object.keys(allProducts).map((_type, index) =>
            allProducts[_type].length === 0 ? null : (
              <div key={index} className="home-section">
                {/* Section title */}
                <div className="home-section-header">
                  <div className="home-section-title-group">
                    <div className="home-section-accent-bar" />
                    <div>
                      <p className="home-section-badge">
                        {index === 0 ? t("home.newArrivals", { defaultValue: "New Arrivals" })
                          : t("home.featured", { defaultValue: "Featured" })}
                      </p>
                      <h2 className="home-section-title">
                        <LiaShoePrintsSolid className="HomeTitleIconL" />
                        {t(`productTypes.${_type.toLowerCase()}`)}
                        <LiaShoePrintsSolid className="HomeTitleIconR" />
                      </h2>
                    </div>
                  </div>
                  <button
                    className="home-section-see-all"
                    onClick={() => window.location.href = `/ProductPage/${_type}`}
                  >
                    {t("home.seeAll", { defaultValue: "See All" })}
                    <ChevronRight size={14} />
                  </button>
                </div>

                <ProductCarousel Data={allProducts[_type]} productType={_type} />
              </div>
            )
          )
        ) : (
          <div className="home-loading">
            <Loading message={t("ui.loading")} />
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default HomePage;
