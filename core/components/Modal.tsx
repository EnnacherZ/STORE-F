import React, { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/modals.css';
import { FaRegTrashAlt } from 'react-icons/fa';
import { IoArrowBackOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useLangContext } from '../contexts/LanguageContext';
import { selectedLang } from './constants';
import { CartItem } from '../contexts/CartContext';
import ModalBackdrop from './modalBackdrop';
import { getDiscountedPrice as calcDiscountedPrice } from '../utils/pricing';

interface ConfirmModalProps {
  action: 'remove' | 'clear-all' | string;
  item: CartItem | undefined;
  onRemove: (() => void) | undefined;
  onBack: () => void;
  onClearAll: (() => void) | undefined;
}

const slideInVariants = {
  hidden: { y: 28, opacity: 0, scale: 0.985 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
  exit: { y: 16, opacity: 0, scale: 0.99 },
};

const Modal: React.FC<ConfirmModalProps> = ({
  item,
  action,
  onBack,
  onRemove,
  onClearAll,
}) => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const isRtl = selectedLang(currentLang) === 'ar';

  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  useLayoutEffect(() => {
    const checkBreakpoint = () => setIsMobileView(window.innerWidth < 600);
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  const getDiscountedPrice = (price = 0, promo = 0) =>
    calcDiscountedPrice(price, promo).toFixed(2);

  return (
    <ModalBackdrop onClose={onBack} onOpen>
      <motion.div
        className="modal-content-wrap"
        onClick={(e) => e.stopPropagation()}
        variants={slideInVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {action === 'remove' && (
          <div className="confirm-modal card">
            <div className={`confirm-modal__title ms-3 fw-bold ${isRtl ? 'rtl me-2' : ''}`}>
              {t('confirm.deleteTitle')}
            </div>
            <hr />
            <div className={`confirm-modal__subtitle ms-3 mt-1 ${isRtl ? 'rtl me-2' : ''}`} style={isMobileView ? { fontSize: 16 } : { fontSize: 18 }}>
              {t('confirm.removeItem')}
            </div>

            <div className="confirm-modal__item-preview card-body d-flex flex-column align-items-center px-0 mb-2">
              <div className="confirm-modal__item-image py-1 px-1">
                <img src={item?.image} className="confirm-modal__item-image-img rounded" alt={item?.name} />
              </div>

              <div className={`confirm-modal__item-meta d-flex justify-content-around mt-2 ${isRtl ? 'rtl' : ''}`}>
                <div className={`confirm-modal__item-meta-left ${isRtl ? '' : 'text-start'}`}>
                  <div className="confirm-modal__meta-row"><strong>{t('product.category')}: </strong>{item?.category.toLowerCase()}</div>
                  <div className="confirm-modal__meta-row"><strong>{t('product.ref')}: </strong>{item?.ref}</div>
                  <div className="confirm-modal__meta-row"><strong>{t('product.name')}: </strong>{item?.name.toLowerCase()}</div>
                </div>
                <div className="confirm-modal__item-meta-right">
                  <div className="confirm-modal__meta-row">
                    <strong>{t('product.price')}: </strong>
                    <b className="price--current">{getDiscountedPrice(item?.price, item?.promo)} {t('product.currency')}</b>
                  </div>
                  {item?.promo !== 0 && (
                    <div className="confirm-modal__meta-row">
                      <strong>{t('product.before')}: </strong>
                      <b className="price--original">{item?.price.toFixed(2)} {t('product.currency')}</b>
                    </div>
                  )}
                  <div className="confirm-modal__meta-row"><strong>{t('product.size')}: </strong>{item?.size}</div>
                </div>
              </div>
            </div>

            <div className="confirm-modal__actions">
              <button className="btn btn-secondary mt-2" style={{ fontSize: 14 }} onClick={onBack}><IoArrowBackOutline size={20} /> {t('confirm.cancelBack')}</button>
              <button className="btn btn-danger mt-2" style={{ fontSize: 14 }} onClick={onRemove}><FaRegTrashAlt /> {t('confirm.remove')}</button>
            </div>
          </div>
        )}

        {action === 'clear-all' && (
          <div className="confirm-modal confirm-modal--clear-all card">
            <div className={`confirm-modal__title ms-3 fw-bold ${isRtl ? 'rtl me-2' : ''}`}>
              {t('confirm.deleteTitle')}
            </div>
            <hr />
            <div className={`confirm-modal__subtitle mx-3 mt-1 ${isRtl ? 'rtl me-2' : ''}`}>
              {t('confirm.removeAll')}
            </div>
            <div className="confirm-modal__actions confirm-modal__actions--clear-all mt-4">
              <button className="btn btn-secondary" style={isMobileView ? { fontSize: 13 } : {}} onClick={onBack}><IoArrowBackOutline /> {t('confirm.cancelBack')}</button>
              <button className="btn btn-danger" style={isMobileView ? { fontSize: 13 } : {}} onClick={onClearAll}><FaRegTrashAlt /> {t('confirm.clearAllItems')}</button>
            </div>
          </div>
        )}
      </motion.div>
    </ModalBackdrop>
  );
};

export default Modal;
