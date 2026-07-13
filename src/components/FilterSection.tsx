import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa6";
import { useLangContext } from "../contexts/LanguageContext";
import { useParametersContext } from "../contexts/ParametersContext";
import { selectedLang } from "./constants";
import "../styles/FilterSection.css";

export interface DataToFilter {
  product: string;
  category: string;
  ref: string;
  name: string;
}

export interface FilterSectionProps {
  handleFilter: (criteria: DataToFilter) => void;
  productType: string;
  handleReset: () => void;
}

const DROPDOWN_BP = 650;

const FilterSection: React.FC<FilterSectionProps> = ({
  handleFilter,
  productType,
  handleReset,
}) => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const { categories } = useParametersContext();
  const isRtl = selectedLang(currentLang) === "ar";

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRef, setSelectedRef] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const [isDroppable, setIsDroppable] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useLayoutEffect(() => {
    const update = () => {
      setIsDroppable(window.innerWidth <= DROPDOWN_BP);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleSearch = () => {
    handleFilter({
      product: productType,
      category: selectedCategory,
      ref: selectedRef,
      name: selectedName,
    });
    if (isDroppable) setDropOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Category list applies immediately on click — no separate "Search"
  // step needed for this field, matching the instant-refine pattern of
  // luxury retail filter panels.
  const handleCategoryToggle = (cat: string) => {
    const next = selectedCategory === cat ? "" : cat;
    setSelectedCategory(next);
    handleFilter({
      product: productType,
      category: next,
      ref: selectedRef,
      name: selectedName,
    });
  };

  const handleGlobalReset = () => {
    handleReset();
    setSelectedCategory("");
    setSelectedRef("");
    setSelectedName("");
  };

  const categoryList = (categories[productType] as string[] | undefined) ?? [];

  // ── IMPORTANT ──────────────────────────────────────────────────────────────
  // The previous version defined CategoryList/RefInput/NameInput/etc. as
  // separate function components *inside* this component's body. Doing that
  // means a brand-new function reference is created on every render, so React
  // treats them as a different component type each time — it unmounts the old
  // <input> DOM node and mounts a fresh one. That's exactly what was causing
  // the input to lose focus after every keystroke (state update → re-render →
  // new component identity → remount → focus lost).
  //
  // Fix: render the JSX directly below instead of through intermediate
  // component functions. Same visual output, but the <input> elements keep a
  // stable identity across re-renders since they're not wrapped in a
  // dynamically-recreated component.
  // ──────────────────────────────────────────────────────────────────────────

  const panelBody = (
    <>
      <div className="filter-block">
        <p className="filter-block__title">{t("product.category")}</p>
        <div className="filter-checklist" role="group" aria-label={t("product.category") as string}>
          {categoryList.length === 0 ? (
            <p className="filter-block__empty">{t("admin.product.noCategoryData")}</p>
          ) : (
            categoryList.map((cat, i) => {
              const checked = selectedCategory === cat;
              return (
                <label key={i} className="filter-check">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  <span>{cat}</span>
                </label>
              );
            })
          )}
        </div>
      </div>

      <div className="filter-block">
        <p className="filter-block__title">{t("product.ref")}</p>
        <input
          className="filter-input"
          type="text"
          placeholder={t("ui.enterRef")}
          value={selectedRef}
          onChange={(e) => setSelectedRef(e.target.value)}
        />
      </div>

      <div className="filter-block">
        <p className="filter-block__title">{t("product.name")}</p>
        <input
          className="filter-input"
          type="text"
          placeholder={t("ui.enterName")}
          value={selectedName}
          onChange={(e) => setSelectedName(e.target.value)}
        />
      </div>

      <div className="filter-actions">
        <button className="filter-btn filter-btn--primary" onClick={handleSearch}>
          {t("ui.search")}
        </button>
        <button className="filter-btn filter-btn--secondary" onClick={handleGlobalReset}>
          {t("ui.reset")}
        </button>
      </div>
    </>
  );

  return (
    <aside
      className={[
        "filter-section",
        isRtl ? "rtl" : "",
      ].join(" ")}
    >
      {!isDroppable && (
        <div className="filter-section__title">
          <p className="filter-section__eyebrow">{t("ui.search")}</p>
          <p className="filter-section__heading">
            {t(`productTypes.${productType.toLowerCase()}`, { defaultValue: productType })}
          </p>
        </div>
      )}

      {isDroppable ? (
        <>
          {!dropOpen && (
            <button
              className="filter-drop-toggle"
              onClick={() => setDropOpen(true)}
              aria-expanded={dropOpen}
            >
              <FaSearch aria-hidden />
              <span>{t("ui.search")}</span>
            </button>
          )}

          <div className={`filter-drop-body ${dropOpen ? "filter-drop-body--open" : ""}`}>
            {panelBody}
            <button
              className="filter-drop-close"
              onClick={() => setDropOpen(false)}
              aria-label={t("ui.back") as string}
            >
              <FaChevronUp aria-hidden />
            </button>
          </div>
        </>
      ) : (
        panelBody
      )}
    </aside>
  );
};

export default FilterSection;
