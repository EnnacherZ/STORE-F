import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa6";
import { useLangContext } from "../contexts/LanguageContext";
import { useParametersContext } from "../dashboard/contexts/ParametersContext";
import { selectedLang } from "./constants";
import "../styles/FilterSection.css";

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Breakpoints ──────────────────────────────────────────────────────────────
const MOBILE_BP   = 800;
const DROPDOWN_BP = 650;

// ── Component ────────────────────────────────────────────────────────────────
const FilterSection: React.FC<FilterSectionProps> = ({
  handleFilter,
  productType,
  handleReset,
}) => {
  const { t }           = useTranslation();
  const { currentLang } = useLangContext();
  const { categories }  = useParametersContext();
  const isRtl = selectedLang(currentLang) === "ar";

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRef,      setSelectedRef]      = useState("");
  const [selectedName,     setSelectedName]     = useState("");

  // ── Responsive flags — single listener ───────────────────────────────────
  const [isMobile,     setIsMobile]     = useState(false);
  const [isDroppable,  setIsDroppable]  = useState(false);
  const [dropOpen,     setDropOpen]     = useState(false);

  useLayoutEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth <= MOBILE_BP);
      setIsDroppable(window.innerWidth <= DROPDOWN_BP);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearch = () => {
    handleFilter({
      product:  productType,
      category: selectedCategory,
      ref:      selectedRef,
      name:     selectedName,
    });
    if (isDroppable) setDropOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGlobalReset = () => {
    handleReset();
    setSelectedCategory("");
    setSelectedRef("");
    setSelectedName("");
  };

  // ── Shared field group (used in both dropdown and inline layouts) ─────────
  const CategorySelect = () => (
    <div className={isMobile ? "" : "filter-field"}>
      <label className="filter-label">{t("product.category")}:</label>
      <select
        className="filter-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">{t("admin.product.selectCategory")}</option>
        {(categories[productType] as string[] | undefined)?.map((cat, i) => (
          <option key={i} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );

  const RefInput = () => (
    <div className={isMobile ? "" : "filter-field"}>
      <label className="filter-label">{t("product.ref")}:</label>
      <input
        className="filter-input"
        type="text"
        placeholder={t("ui.enterRef")}
        value={selectedRef}
        onChange={(e) => setSelectedRef(e.target.value)}
      />
    </div>
  );

  const NameInput = () => (
    <div className={isMobile ? "" : "filter-field"}>
      <label className="filter-label">{t("product.name")}:</label>
      <input
        className="filter-input"
        type="text"
        placeholder={t("ui.enterName")}
        value={selectedName}
        onChange={(e) => setSelectedName(e.target.value)}
      />
    </div>
  );

  const ActionButtons = () => (
    <>
      <div className={isMobile ? "" : "filter-field"}>
        <button
          className="filter-btn filter-btn--primary"
          onClick={handleSearch}
          type="button"
        >
          {t("ui.search")}
        </button>
      </div>
      <div className={isMobile ? "" : "filter-field"}>
        <button
          className="filter-btn filter-btn--secondary"
          onClick={handleGlobalReset}
          type="button"
        >
          {t("ui.reset")}
        </button>
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={[
        "filter-section",
        dropOpen   ? "filter-section--expanded" : "",
        isMobile   ? ""                          : "filter-section--rounded",
        isRtl      ? "rtl"                       : "",
      ].join(" ")}
    >
      {/* Title */}
      <div className="filter-section__title">
        <FaSearch aria-hidden />
        <span>{t("ui.search")}</span>
      </div>

      {/* ── Dropdown mode (≤ 650px) ─────────────────────────────────────── */}
      {isDroppable ? (
        <>
          {/* Collapsed toggle button */}
          {!dropOpen && (
            <button
              className="filter-drop-toggle"
              onClick={() => setDropOpen(true)}
              aria-label="Open filters"
            >
              <FaSearch size={20} aria-hidden />
            </button>
          )}

          {/* Expanded inputs */}
          <div className={`filter-drop-body ${dropOpen ? "filter-drop-body--open" : ""}`}>
            <div className="filter-drop-row">
              {/* Type (read-only) */}
              <div>
                <label className="filter-label">{t("product.type")}</label>
                <input
                  className="filter-input filter-input--readonly"
                  readOnly
                  disabled
                  value={t(`productTypes.${productType.toLowerCase()}`)}
                />
              </div>
              <CategorySelect />
              <RefInput />
            </div>

            <div className="filter-drop-row">
              <NameInput />
              <ActionButtons />
            </div>

            {/* Collapse button */}
            <button
              className="filter-drop-close"
              onClick={() => setDropOpen(false)}
              aria-label="Close filters"
            >
              <FaArrowUp size={20} aria-hidden />
            </button>
          </div>
        </>
      ) : (
        /* ── Inline mode (> 650px) ──────────────────────────────────────── */
        <div className="filter-inputs">
          {/* Type (read-only) */}
          <div className={isMobile ? "" : "filter-field"}>
            <label className="filter-label">{t("product.type")}:</label>
            <input
              className="filter-input filter-input--readonly"
              readOnly
              disabled
              value={t(`productTypes.${productType.toLowerCase()}`)}
            />
          </div>

          <CategorySelect />
          <RefInput />
          <NameInput />
          <ActionButtons />
        </div>
      )}
    </div>
  );
};

export default FilterSection;