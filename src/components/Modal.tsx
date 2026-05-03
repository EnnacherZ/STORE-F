import React, { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/modals.css';
import { FaRegTrashAlt } from 'react-icons/fa';
import { IoArrowBackOutline, IoClose } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { MdReviews } from 'react-icons/md';
import { FaStar, FaUser } from 'react-icons/fa6';
import { useLangContext } from '../contexts/LanguageContext';
import { selectedLang } from './constants';
import { CartItem } from '../contexts/CartContext';
import ModalBackdrop from './modalBackdrop';

interface ConfirmModalProps {
  action: 'remove' | 'clear-all' | 'reviews' | string;
  item: CartItem | undefined;
  rev_productType: string | undefined;
  rev_productId: number | undefined;
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
  rev_productType,
  rev_productId,
}) => {
  const { t } = useTranslation();
  const { currentLang } = useLangContext();
  const isRtl = selectedLang(currentLang) === 'ar';

  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [starRating, setStarRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewerEmail, setReviewerEmail] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');

  useLayoutEffect(() => {
    const checkBreakpoint = () => setIsMobileView(window.innerWidth < 600);
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  const handleStarClick = (selectedStar: number) => {
    setStarRating((prev) => (prev === selectedStar ? selectedStar - 1 : selectedStar));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewerName || !reviewerEmail || !reviewText || starRating === 0) {
      alert(t('review.fillAllFields') ?? 'Please fill in all fields and provide a rating.');
      return;
    }

    const now = new Date();

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: reviewerName,
          email: reviewerEmail,
          date: now.toISOString(),
          review: reviewText,
          stars: starRating,
          productType: rev_productType,
          productId: rev_productId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error — status: ${response.status}`);
      }

      await response.json();
      onBack();
    } catch {
      onBack();
    }
  };

  const getDiscountedPrice = (price = 0, promo = 0) =>
    (price * (1 - promo * 0.01)).toFixed(2);

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
        {action === 'reviews' && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3><MdReviews /> {t('review.add')}</h3>
            <button type="button" className="review-form__close" onClick={onBack} aria-label="Close review form">
              <IoClose />
            </button>
            <hr />

            <label className="my-2 fw-bold">{t('review.username')}:</label>
            <div className="input-group mb-3">
              <span className="input-group-text"><FaUser /></span>
              <input onChange={(e) => setReviewerName(e.target.value)} type="text" className="form-control" placeholder={t('review.username')} aria-label="Username" />
            </div>

            <label className="my-2 fw-bold">{t('form.email.label')}:</label>
            <div className="input-group mb-3">
              <span className="input-group-text">@</span>
              <input onChange={(e) => setReviewerEmail(e.target.value)} type="email" className="form-control" placeholder={t('form.email.label')} aria-label="Email" />
            </div>

            <label className="my-2 fw-bold">{t('review.stars')}:</label>
            <div className="star-rating d-flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className={`star-rating__star mx-3 rounded ${starRating >= n ? 'star-rating__star--active' : ''}`} onClick={() => handleStarClick(n)} aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}>
                  <FaStar />
                </button>
              ))}
            </div>

            <label className="my-3 fw-bold">{t('review.yourReview')}:</label>
            <div className="input-group mb-3">
              <textarea onChange={(e) => setReviewText(e.target.value)} maxLength={300} className="form-control" aria-label="Review text" />
            </div>

            <button type="submit" className="btn btn-success my-2">{t('review.submit')}</button>
          </form>
        )}

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
