import React, { useMemo, useState } from "react";
import { Product } from "../contexts/ProductsContext";
import { CartItem, useCart } from "../contexts/CartContext";

type Props = { products: Product[] };

const availableQuantity = (product: Product): number =>
  product.stock.reduce((sum, stock) => sum + Math.max(0, stock.quantity), 0);

const CapDuoOffer: React.FC<Props> = ({ products }) => {
  const { addItem, allItems } = useCart();
  const [firstId, setFirstId] = useState<number | null>(null);
  const [secondId, setSecondId] = useState<number | null>(null);

  const byId = useMemo(() => new Map(products.map(product => [product.id, product])), [products]);
  const first = firstId ? byId.get(firstId) : undefined;
  const second = secondId ? byId.get(secondId) : undefined;
  const sameModel = Boolean(first && second && first.id === second.id);
  const alreadyInCart = (product: Product): number =>
    allItems.filter(item => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
  const valid = Boolean(
    first && second
    && availableQuantity(first) >= alreadyInCart(first) + (sameModel ? 2 : 1)
    && availableQuantity(second) >= alreadyInCart(second) + (sameModel ? 2 : 1)
  );

  const addPair = () => {
    if (!valid || !first || !second) return;
    const selections = [first, second];
    const grouped = new Map<number, { product: Product; quantity: number }>();
    selections.forEach(product => {
      const current = grouped.get(product.id);
      grouped.set(product.id, { product, quantity: (current?.quantity ?? 0) + 1 });
    });
    const entries = [...grouped.values()];
    entries.forEach(({ product, quantity }, index) => {
      const stock = product.stock.find(item => item.quantity >= quantity);
      if (!stock) return;
      const item: CartItem = {
        product_type: product.product_type,
        id: product.id,
        category: product.category,
        ref: product.ref,
        name: product.name,
        price: product.price,
        size: stock.size,
        quantity,
        image: product.image,
        promo: product.promo,
        maxQuantity: stock.quantity,
      };
      addItem(item, { showConfirmation: index === entries.length - 1 });
    });
  };

  const selector = (
    label: string,
    selectedId: number | null,
    onSelect: (id: number) => void,
  ) => (
    <section className="cap-duo__selector">
      <h3>{label}</h3>
      <div className="cap-duo__models" role="radiogroup" aria-label={label}>
        {products.map(product => {
          const stock = availableQuantity(product);
          const needsTwo = selectedId === product.id
            && (firstId === product.id && secondId === product.id);
          const unavailable = stock < alreadyInCart(product) + (needsTwo ? 2 : 1);
          return (
            <button
              type="button"
              key={product.id}
              className={`cap-duo__model${selectedId === product.id ? " cap-duo__model--selected" : ""}`}
              onClick={() => onSelect(product.id)}
              disabled={unavailable}
              role="radio"
              aria-checked={selectedId === product.id}
            >
              <img src={product.image} alt="" />
              <span>{product.name}</span>
              <small>{unavailable ? "غير متوفر" : `${stock} متوفر`}</small>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="cap-duo" dir="rtl">
      <div className="cap-duo__heading">
        <span>وفر 25 درهم</span>
        <h2>اختار جوج كاسكيطات بـ 155 درهم</h2>
        <p>تقدر تخلط بين الموديلات، أو تختار نفس الموديل مرتين إلا كان متوفر.</p>
      </div>
      <div className="cap-duo__selectors">
        {selector("الاختيار الأول", firstId, setFirstId)}
        {selector("الاختيار الثاني", secondId, setSecondId)}
      </div>
      {!valid && first && second && (
        <p className="cap-duo__error">
          {sameModel
            ? "الاختيار الثاني خاصو يتبدل: ما كايناش جوج وحدات من هاد الموديل."
            : availableQuantity(first) < alreadyInCart(first) + 1
              ? "الاختيار الأول ما بقاش متوفر، بدلو باش تكمل العرض."
              : "الاختيار الثاني ما بقاش متوفر، بدلو باش تكمل العرض."}
        </p>
      )}
      <button type="button" className="cap-duo__add" disabled={!valid} onClick={addPair}>
        زيد جوج للسلة • 155 درهم
      </button>
    </div>
  );
};

export default CapDuoOffer;
