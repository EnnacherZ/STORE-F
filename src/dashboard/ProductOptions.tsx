import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { OptionType } from "./pages/ProductsManager";
import { connecter } from "../server/connecter";
import { Product } from "../contexts/ProductsContext";
import { useTranslation } from "react-i18next";
import { useParametersContext } from "./contexts/ParametersContext";

interface ProductOptionsProps {
    value: any,
    handleOption: (option: OptionType | null) => void,
}

const ProductOptions: React.FC<ProductOptionsProps> = ({value, handleOption}) => {
    const {t} = useTranslation();
    const {productTypes} = useParametersContext();
    const [products, setProducts] = useState<{[key:string]: Product[]}>();
    const [productType, setProductType] = useState<string>()

    useEffect(()=>{
        const getOptions = async () => {
            const response = await connecter.get('api/products/get/all');
            setProducts(response.data.products);
        }
        getOptions();
    }, [])

    const _options = useMemo((): OptionType[] => {
        if (!productType || !products?.[productType]) return [];
        return products[productType].map((product) => ({
            label: product.category + " " + product.name + " " + product.ref,
            value: product.id,
            picture: product.image,
        }));
    }, [productType, products]);

    return(<>
        <div className="mb-3">
            <label className="form-label">{t('product.type')} :</label>
            <select
                className="form-select"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
            >
                <option value="">{t('admin.product.selectType')}</option>
                {productTypes.map((type_, index) => (
                    <option value={type_} key={index}>{type_}</option>
                ))}
            </select>
        </div>

        <div className="mb-3">
            <label className="form-label">{t('product.label')} :</label>
            <Select
                options={_options}
                value={value}
                onChange={handleOption}
                placeholder={t('admin.product.select')}
                isClearable
                isDisabled={!productType}
            />
        </div>
    </>)
}

export default ProductOptions;