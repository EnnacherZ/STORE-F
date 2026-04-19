import React, {useState} from "react";
import "./styles/prodForm.css"
import { toast, ToastContainer, Zoom } from "react-toastify";
import { OptionType } from "./pages/ProductsManager";
import apiInstance from "./api";
import { useTranslation } from "react-i18next";
import ProductOptions from "./ProductOptions";

const connecter = apiInstance;

const ProdStockForm : React.FC = () => {
    const {t} = useTranslation();
    const [size, setSize] = useState<string | number>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<OptionType|null>(null);

    const handleOption = async (option: OptionType | null) => {
        setSelectedOption(option);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(selectedOption && size != '' && quantity != 0){
            try{
                const response = await connecter.post('db/product/stock/update', {
                    productId: selectedOption.value,
                    size: size,
                    quantity: quantity
                });
                if(response.status == 201){ window.location.reload(); }
            } catch {}
        } else {
            toast.error(`Check the fields of : ${!selectedOption ? 'product' : ''} ${size == '' ? 'size' : ''} ${quantity == 0 ? 'quantity' : ''}`, {
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
            <form onSubmit={handleSubmit}>
                <ProductOptions value={selectedOption} handleOption={handleOption}/>
                <div className={`mb-2 ${selectedOption ? "d-flex" : 'd-none'} justify-content-center`}>
                    <img src={selectedOption?.picture} alt="" className="border border-dark shadow"/>
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('product.size')} :</label>
                    <input
                        type="text"
                        className="form-control"
                        id="size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">{t('product.quantity')} :</label>
                    <input
                        type="number"
                        className="form-control"
                        id="quantity"
                        value={quantity == 0 ? undefined : quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        required
                        min={1}
                    />
                </div>
                <button type="submit" className="btn btn-primary">{t('form.submit')}</button>
            </form>
        </div>
        <ToastContainer/>
    </>)
}

export default ProdStockForm;