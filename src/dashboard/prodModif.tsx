import React, {useState} from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import Modals from "./modals";
import { AnimatePresence } from "framer-motion";
import { OptionType } from "./pages/ProductsManager";
import apiInstance from "./api";
import { useTranslation } from "react-i18next";
import ProductOptions from "./ProductOptions";

const connecter = apiInstance;

const ProdModif : React.FC = () => {
    const {t} = useTranslation();
    const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
    const [isModal, setIsModal] = useState<boolean>(false);
    const [ref, setRef] = useState<number | string>('');
    const [name, setName] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [price, setPrice] = useState<number | string>('');
    const [newest, setNewest] = useState<boolean>(false);
    const [promo, setPromo] = useState<number | string>('');
    const [imageP, setImageP] = useState<File | null>(null);
    const [images, setImages] = useState<File[]>([]);

    const handleOption = (option: OptionType | null) => {
        setSelectedOption(option)
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length !== newFiles.length) {
            alert('Certains fichiers ne sont pas des images.');
        }
        const totalImages = images.length + imageFiles.length;
        if (totalImages > 4) {
            alert('Vous ne pouvez télécharger que 4 images maximum.');
            return;
        }
        setImages(prevImages => [...prevImages, ...imageFiles]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files){ setImageP(e.target.files[0]) }
    }

    const handleSubmit = async () => {
        const formData = new FormData();
        if(selectedOption){
            const prodId = selectedOption.value;
            if(
                (ref === null || ref === '' || ref === undefined) &&
                (name === null || name.trim() === '' || name === undefined) &&
                (category === null || category.trim() === '' || category === undefined) &&
                (price === null || price === '' || price === undefined) &&
                (promo === null || promo === '' || promo === undefined) &&
                (imageP === null || imageP === undefined) &&
                (images === null || images.length == 0 || images === undefined)
            ){
                alert("You should fill one field at least!");
            }
            if(!(ref === null || ref === '' || ref === undefined)){ formData.append('ref', ref.toString()); }
            if(!(name === null || name.trim() === '' || name === undefined)){ formData.append('name', name); }
            if(!(category === null || category.trim() === '' || category === undefined)){ formData.append('category', category); }
            if(!(price === null || price === '' || price === undefined)){ formData.append('price', price.toString()); }
            if(!(promo === null || promo === '' || promo === undefined)){ formData.append('promo', promo.toString()); }
            if(!(imageP === null || imageP === undefined)){ formData.append('image', imageP || '') }
            if(!(images === null || images === undefined)){
                images.forEach((image, index) => { formData.append(`image${index + 1}`, image); });
            }
            formData.append('newest', newest ? 'true' : 'false');
            const response = await connecter.patch(`db/products/manager/${prodId}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if(response.status == 201){ window.location.reload(); }
        } else {
            toast.error(`Check the fields of : ${!selectedOption ? 'product' : ''}`, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Zoom,
            });
        }
    }

    return(<>
        <div className="prodForm">
            <form>
                <ProductOptions value={selectedOption} handleOption={handleOption}/>
                <div className={`mb-2 ${selectedOption ? "d-flex" : 'd-none'} justify-content-center`}>
                    <img src={selectedOption?.picture} alt="" className="border border-dark shadow"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="ref" className="form-label">{t('product.category')} :</label>
                    <input type="text" className="form-control" id="category" value={category} onChange={(e) => setCategory(e.target.value)} required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="ref" className="form-label">{t('product.ref')} :</label>
                    <input type="number" className="form-control" id="ref" value={ref} onChange={(e) => setRef(Number(e.target.value))} required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">{t('product.name')} :</label>
                    <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="price" className="form-label">{t('product.price')} :</label>
                    <input type="number" className="form-control" id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} min="0" required/>
                </div>
                <div className="mb-3 form-check form-switch">
                    <input type="checkbox" className="form-check-input" id="flexSwitchCheckDefault" checked={newest} onChange={() => setNewest(!newest)}/>
                    <label htmlFor="newest" className="form-check-label">{t('admin.product.newer')} :</label>
                </div>
                <div className="mb-3">
                    <label htmlFor="promo" className="form-label">{t('product.promotion')} (%):</label>
                    <input type="number" className="form-control" id="promo" value={promo} onChange={(e) => setPromo(Number(e.target.value))} min="0" max="100"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="images" className="form-label">{t('admin.product.mainImage')} :</label>
                    <input type="file" className="form-control" id="images" multiple onChange={handleImageChange} required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="images" className="form-label">{t('admin.product.additionalImages')} :</label>
                    <input type="file" className="form-control" id="images" multiple onChange={handleImagesChange}/>
                    <div className="images-counter fw-bold" style={{fontSize:12}}>
                        {t('admin.product.uploadedImages')} : {images.length < 4 ? images.length : `4 (Max)`}
                    </div>
                </div>
                <button type="button" className="btn btn-primary fw-bold" onClick={() => setIsModal(true)}>{t('form.submit')}</button>
            </form>
        </div>
        <ToastContainer/>
        <AnimatePresence>
            {isModal && <Modals
                message={undefined}
                cible="db/delete"
                item={{}}
                onBack={() => setIsModal(false)}
                onDelete={handleSubmit}
            />}
        </AnimatePresence>
    </>)
};

export default ProdModif;