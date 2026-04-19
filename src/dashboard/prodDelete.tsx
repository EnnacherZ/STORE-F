import React, {useState} from "react";
import Modals from "./modals";
import "../styles/modals.css";
import { AnimatePresence } from "framer-motion";
import { OptionType } from "./pages/ProductsManager";
import apiInstance from "./api";
import { useTranslation } from "react-i18next";
import { showToast } from "./functions";
import ProductOptions from "./ProductOptions";

const connecter = apiInstance;

const ProdDelete : React.FC = () => {
    const {t} = useTranslation();
    const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
    const [isModal, setIsModal] = useState<boolean>(false);

    const handleOption = (option: OptionType | null) => {
        setSelectedOption(option)
    };

    const handleSubmit = async () => {
        if(selectedOption){
            const prodId = selectedOption.value;
            const response = await connecter.delete(`db/products/manager/${prodId}/`)
            if(response.status == 201){ window.location.reload(); }
        } else {
            showToast(`Check the fields of : ${!selectedOption ? 'product' : ''}`, "error");
        }
    }

    return(<>
        <div className="prodForm">
            <form>
                <ProductOptions value={selectedOption} handleOption={handleOption}/>
                <div className={`mb-2 ${selectedOption ? "d-flex" : 'd-none'} justify-content-center`}>
                    <img src={selectedOption?.picture} alt="" className="border border-dark shadow"/>
                </div>
                <button type="button" className="btn btn-danger fw-bold" onClick={() => setIsModal(true)} disabled={!selectedOption}>
                    {t('confirm.delete')}
                </button>
            </form>
        </div>
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

export default ProdDelete;