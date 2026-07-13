import { useState, useEffect } from "react";
import { Product } from "../contexts/ProductsContext";
import { connecter } from "./connecter";

export function useProductsHandler(productType: string | undefined) {
  const [products, setProducts]   = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError]         = useState<unknown>(null);

  useEffect(() => {
    // Guard: nothing to fetch yet (e.g. route param not resolved on first render).
    if (!productType) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const getProducts = async () => {
      // Reset to a loading state every time productType changes, so
      // switching categories doesn't briefly show the *previous*
      // category's products (or a stale empty state) while the new
      // request is in flight.
      setIsLoading(true);
      setError(null);

      try {
        const res = await connecter.get(`api/products/get?productType=${productType}`);
        if (cancelled) return;
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Erreur lors du chargement des produits :", err);
        if (cancelled) return;
        setError(err);
        setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    getProducts();

    // Avoids a late-arriving response from an earlier productType
    // overwriting the correct state for the current one.
    return () => {
      cancelled = true;
    };
  }, [productType]);

  return { products, isLoading, error };
}
