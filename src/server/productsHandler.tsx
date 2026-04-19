import { useState, useEffect } from "react";
import { Product } from "../contexts/ProductsContext";
import { connecter } from "./connecter";

export function useProductsHandler(productType:string | undefined){
    const [products, setProducts] = useState<Product[]>([]);
    // const [productsDetails, setProductsDetails] = useState<ProductDetail[]>([]);

    // useEffect(() => {
    //             const eventSourceProducts = new EventSource(`${apiUrl}events/shoes/`);
    //             const eventSourceProductsDetails = new EventSource(`${apiUrl}events/shoes_sizes/`);  
    //             eventSourceProducts.onmessage = (event) => {
    //               const { data } = JSON.parse(event.data);
    //               setShoesData(data);          
    //             };
    //             eventSourceProductsDetails.onmessage = (event) => {
    //               const { data } = JSON.parse(event.data);
    //               setShoesDataDetails(data);
    //             };
    //             eventSourceProducts.onerror = (error) => {
    //                 console.log(error)
    //               setShoesError1(error)
    //             };
    //             eventSourceProductsDetails.onerror = (error) => {
    //             console.log(error)
    //               setShoesError2(error)
    //             };
    //             return () => {
    //               eventSourceProducts.close();
    //               eventSourceProductsDetails.close();
    //             };
    //           },[]);
  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await connecter.get(`api/products/get?productType=${productType}`);
        setProducts(res.data.products || []);
        // setProductsDetails(res.data.products_details || []);
      } catch (err) {
        console.error("Erreur lors du chargement des produits :", err);
      }
    };

    getProducts();
  }, [productType]);
        return ({"products":products})
};
