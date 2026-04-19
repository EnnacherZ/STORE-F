import React, {useState } from "react";
import Sidebar from "../sidebar";
import DbHeader from "../DbHeader";
import ProductForm from "../prodForm";
import Loading from "../../components/loading";
import Accordion from 'react-bootstrap/Accordion';
import ProdStockForm from "../prodDetailsForm";
import ProdDelete from "../prodDelete";
import ProdModif from "../prodModif";
import { IoSettings } from "react-icons/io5";
import apiInstance from "../api";
import { useLangContext } from "../../contexts/LanguageContext";
import { selectedLang } from "../functions";
import { useTranslation } from "react-i18next";
import { ProductStock } from "../../contexts/ProductsContext";
import ProductOptions from "../ProductOptions";

export interface OptionType {
    label:string,
    value : number,
    picture : string
}

const connecter = apiInstance;

const ProductsManager : React.FC = () => {
    const {t} = useTranslation();
    const {currentLang} = useLangContext();

    return(<>
        <Sidebar/>
        <div className={`db-home ${selectedLang(currentLang)=='ar'&&'rtl'}`}>
            <DbHeader/>
            <hr/>
            <div className="Prod-manage-title m-4 fw-bold">
                <IoSettings size={20}/> <span className="mx-3">{t('admin.product.managementOf')} </span>
            </div>
            <ProductsOperations/>
        </div>
    </>)
};


const ProductsOperations : React.FC= () => {
    const {t} = useTranslation();
    return (
        <Accordion>
            <Accordion.Item eventKey="0" className="my-3 rounded card shadow">
                <Accordion.Header><span className="fw-bold mx-2">{t('admin.product.advancedSearch')} </span></Accordion.Header>
                <Accordion.Body>
                    <div className="developement-issue d-flex justify-content-center fs-6 fw-bold">
                        {t('admin.overview.notDeveloped')}
                    </div>
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1" className="my-3 rounded card shadow">
                <Accordion.Header><span className="fw-bold mx-2">{t('product.details')}</span></Accordion.Header>
                <Accordion.Body>
                    <ProductDetails/>
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2" className="my-3 rounded card shadow">
                <Accordion.Header><span className="fw-bold mx-2">{t('admin.product.add')}</span></Accordion.Header>
                <Accordion.Body>
                    <ProductForm/>
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3" className="my-3 rounded card shadow">
                <Accordion.Header><span className="fw-bold mx-2">{t('admin.product.addData')}</span></Accordion.Header>
                <Accordion.Body>
                    <ProdStockForm/>
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4" className="my-3 rounded card shadow">
                <Accordion.Header><span className="fw-bold mx-2">{t('admin.product.modify')}</span></Accordion.Header>
                <Accordion.Body>
                    <ProdModif/>
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="5" className="my-3 rounded card shadow">
                <Accordion.Header><span className="fw-bold mx-2">{t('admin.product.delete')}</span></Accordion.Header>
                <Accordion.Body>
                    <ProdDelete/>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
}


const ProductDetails : React.FC = () => {
    const {t} = useTranslation();
    const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
    const [productStock, setProductStock] = useState<ProductStock[]>();
    const [isLoading, setIsLoading] = useState<boolean>();

    const handleOption = async (option: OptionType | null) => {
        setSelectedOption(option);
        if(option?.value){
            setIsLoading(true);
            const res = connecter.get(`db/product/stock/get?productId=${option.value}`);
            setProductStock((await res).data.data);
            setIsLoading(false);
        } else {
            setProductStock(undefined)
        }
    };

    return(<>
        <ProductOptions value={selectedOption} handleOption={handleOption}/>
        <div className={`mb-2 ${selectedOption ? "d-flex" : 'd-none'} justify-content-center`}>
            <img src={selectedOption?.picture} alt="" className="border border-dark shadow" style={{width:280}}/>
        </div>
        <div className="mb-3">
            {!productStock ? (
                <>{isLoading ? <Loading message={t('ui.loading')}/> : <span>{t('admin.product.noChosen')}</span>}</>
            ) : <>
                {productStock.length > 0 ?
                    <table className="table table-bordred table-hover mt-2 orders-table rounded shadow border border-dark">
                        <thead>
                            <tr className="text-muted">
                                <th>{t('product.size')}</th>
                                <th>{t('product.quantity')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productStock.map((pro, index) => (
                                <tr key={index}>
                                    <td>{pro.size}</td>
                                    <td>{pro.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    : <span>{t('admin.product.noData')}</span>
                }
            </>}
        </div>
    </>)
}

export default ProductsManager;