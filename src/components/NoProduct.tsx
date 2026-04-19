import React from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlineWavingHand } from "react-icons/md";
import "../styles/ProductPage.css";

const NoProduct: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="no-product" role="status">
      <AiOutlineProduct className="no-product__icon" aria-hidden />
      <p className="no-product__title">{t("product.noneYet")}</p>
      <MdOutlineWavingHand className="no-product__wave" aria-hidden />
      <p className="no-product__subtitle">{t("product.stayTuned")}</p>
    </div>
  );
};

export default NoProduct;