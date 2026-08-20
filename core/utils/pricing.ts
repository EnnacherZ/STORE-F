/**
 * pricing.ts
 *
 * Shared discount math — previously re-implemented independently (with the
 * same formula) in cart.tsx, products.tsx, ProductCarousel.tsx,
 * FeaturedProducts.tsx, ProductsPage.tsx, and Modal.tsx.
 */

export const getDiscountedPrice = (price: number, promo: number): number =>
  price * (1 - promo * 0.01);

export const getLineTotal = (price: number, promo: number, quantity: number): number =>
  getDiscountedPrice(price, promo) * quantity;
