import React, { useState } from 'react';
import "./styles/prodForm.css";
import apiInstance from './api';
import { AnimatePresence, motion } from 'framer-motion';
import { dropIn, showToast } from './functions';
import { Rings } from 'react-loader-spinner';
import ModalBackDrop from '../components/modalBackdrop';
import { useParametersContext } from './contexts/ParametersContext';
import { useTranslation } from 'react-i18next';

const connecter = apiInstance;

const ProductForm: React.FC = () => {
    const { t } = useTranslation();
    const { productTypes = [], categories = {} } = useParametersContext();

    const [productType, setProductType] = useState<string>('');
    const [ref, setRef] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [price, setPrice] = useState<number>(0);
    const [newest, setNewest] = useState<boolean>(false);
    const [promo, setPromo] = useState<number>(0);
    const [imageP, setImageP] = useState<File | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files).slice(0, 4));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageP(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !productType || !name || !price || !imageP) {
            showToast(t('form.submit'), "error");
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('ref', ref.toString());
        formData.append('price', price.toString());
        formData.append('newest', newest ? 'true' : 'false');
        formData.append('promo', promo.toString());
        formData.append('product_type', productType);
        if (imageP) { formData.append('image', imageP); }
        images.forEach((image, index) => { formData.append(`image${index + 1}`, image); });
        try {
            const response = await connecter.post('db/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.status === 201) { window.location.reload(); }
        } catch (error) {
            showToast(t('error.elementNotFound'), "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="prodForm">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">{t('product.type')} :</label>
                    <select className="form-select" value={productType} onChange={(e) => { setProductType(e.target.value); setCategory(''); }} required>
                        <option value="">{t('admin.product.selectType')}</option>
                        {productTypes.map((type_, index) => (
                            <option value={type_} key={index}>{type_}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('product.category')} :</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} disabled={!productType} required>
                        <option value="">{t('admin.product.selectCategory')}</option>
                        {(categories?.[productType] ?? []).map((cat: string, index: number) => (
                            <option value={cat} key={index}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('product.ref')} :</label>
                    <input type="number" className="form-control" value={ref} onChange={(e) => setRef(Number(e.target.value) || 0)} required/>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('product.name')} :</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('product.price')} :</label>
                    <input type="number" className="form-control" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} required/>
                </div>
                <div className="mb-3 form-check form-switch">
                    <input type="checkbox" className="form-check-input" id="newest" checked={newest} onChange={() => setNewest(prev => !prev)}/>
                    <label className="form-check-label" htmlFor="newest">{t('admin.product.newer')} :</label>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('product.promotion')} (%) :</label>
                    <input type="number" className="form-control" value={promo} onChange={(e) => setPromo(Number(e.target.value) || 0)}/>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('admin.product.mainImage')} :</label>
                    <input type="file" className="form-control" onChange={handleImageChange} required/>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('admin.product.additionalImages')} :</label>
                    <input type="file" className="form-control" multiple onChange={handleImagesChange}/>
                </div>
                <button type="submit" disabled={isLoading} className="btn btn-primary fw-bold">
                    {isLoading ? t('ui.loading') : t('admin.product.add')}
                </button>
            </form>
            <AnimatePresence>
                {isLoading && (
                    <ModalBackDrop onClose={() => {}} onOpen={true}>
                        <motion.div variants={dropIn} initial="hidden" animate="visible" exit="exit">
                            <Rings height="100" width="100" color="#0e92e4"/>
                            <p>{t('ui.loading')}...</p>
                        </motion.div>
                    </ModalBackDrop>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductForm;