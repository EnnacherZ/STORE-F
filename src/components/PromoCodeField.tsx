import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { FaCheck, FaTag, FaXmark } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

import { useCart, AppliedPromotion } from '../contexts/CartContext';
import { connecter } from '../server/connecter';
import '../styles/promo-code.css';

interface ValidationResponse extends AppliedPromotion {
  valid: boolean;
  reason?: string;
  detail?: string;
}

const PromoCodeField: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { allItems, appliedPromotion, applyPromotion, removePromotion } = useCart();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError(t('promoCode.required'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await connecter.post<ValidationResponse>('api/promotions/validate/', {
        code: normalized,
        items: allItems.map((item) => ({ id: item.id, size: item.size, quantity: item.quantity })),
      });
      if (!response.data.valid) {
        setError(t(`promoCode.errors.${response.data.reason ?? 'invalid'}`));
        return;
      }
      applyPromotion(response.data);
      setCode('');
    } catch (requestError) {
      if (isAxiosError<ValidationResponse>(requestError)) {
        const reason = requestError.response?.data?.reason;
        setError(reason ? t(`promoCode.errors.${reason}`) : t('promoCode.errors.network'));
      } else {
        setError(t('promoCode.errors.network'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (appliedPromotion) {
    return (
      <div className={`promo-applied${compact ? ' promo-applied--compact' : ''}`} role="status">
        <span className="promo-applied__icon"><FaCheck /></span>
        <div className="promo-applied__copy">
          <strong>{appliedPromotion.code}</strong>
          <span>{t('promoCode.saved', { amount: appliedPromotion.discount_amount.toFixed(2) })}</span>
        </div>
        <button type="button" onClick={removePromotion} aria-label={t('promoCode.remove')}><FaXmark /></button>
      </div>
    );
  }

  return (
    <form className={`promo-field${compact ? ' promo-field--compact' : ''}`} onSubmit={applyCode}>
      <label htmlFor={compact ? 'promo-code-compact' : 'promo-code'}><FaTag /> {t('promoCode.label')}</label>
      <div className="promo-field__controls">
        <input id={compact ? 'promo-code-compact' : 'promo-code'} value={code} maxLength={40}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder={t('promoCode.placeholder')} autoComplete="off" />
        <button type="submit" disabled={loading || allItems.length === 0}>
          {loading ? t('promoCode.checking') : t('promoCode.apply')}
        </button>
      </div>
      {error && <span className="promo-field__error" role="alert">{error}</span>}
    </form>
  );
};

export default PromoCodeField;
