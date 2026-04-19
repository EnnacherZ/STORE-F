import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar";
import DbHeader from "../DbHeader";
import "../styles/settings.css";
import Accordion from "react-bootstrap/esm/Accordion";
import apiInstance, { USER_ROLE } from "../api";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../../contexts/LanguageContext";
import { toast, ToastContainer, Zoom } from "react-toastify";
import { GiSettingsKnobs } from "react-icons/gi";
import { selectedLang, showToast, usersRoles, wait } from "../functions";
import { useParametersContext } from "../contexts/ParametersContext";

const connecter = apiInstance;

const Settings : React.FC = () => {
    const {t} = useTranslation();
    const {currentLang} = useLangContext();
    const {productTypes} = useParametersContext();


    return(<>
        <Sidebar/>
        <div className={`db-settings ${selectedLang(currentLang)=='ar'&&'rtl'}`}>
            <DbHeader/>
            <hr/>
            <div className="Prod-manage-title m-4 fw-bold">
                <GiSettingsKnobs size={20}/> <span className="mx-3">{t('product.settings')} </span>
            </div>
            <Accordion>
                <Accordion.Item eventKey="0" className="my-3 rounded card shadow">
                    <ProductTypes/>
                </Accordion.Item>
                <Accordion.Item eventKey="1" className="my-3 rounded card shadow">
                    <ProductParameters productType={productTypes ? productTypes : [""]} param="categories"/>
                </Accordion.Item>

                {localStorage.getItem(USER_ROLE) == 'admin' ? <>
                    <hr/>
                    <div className="Prod-manage-title m-4 fw-bold">
                        <GiSettingsKnobs size={20}/> <span className="mx-3">{t('admin.users.manager')} </span>
                    </div>
                    <Accordion.Item eventKey="2" className="my-3 rounded card shadow">
                        <Accordion.Header><span className="fw-bold mx-2">{t('admin.users.add')}</span></Accordion.Header>
                        <Accordion.Body>
                            <AddUser/>
                        </Accordion.Body>
                    </Accordion.Item>
                </> : <></>}
            </Accordion>
        </div>
    </>)
}


const ProductParameters : React.FC<{productType:string[], param:string}> = ({productType, param}) => {
    const {t} = useTranslation();
    const capitalize = (str:string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const [valuesText, setValuesText] = useState("");
    const [selectedType, setSelectedType] = useState<string>();

    const handlePostParameters = async (e: React.FormEvent) => {
        e.preventDefault();
        const values = valuesText.split(",").map((v) => capitalize(v.trim())).filter((v) => v.length > 0);
        try {
            if(!selectedType){
                toast.error(t('admin.product.categoryError'), {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Zoom,
                })
            } else {
                const response = await connecter.post("db/products/parameters/add", {
                    productType: selectedType, param: param, values: values
                })
                if(response.status == 201){ window.location.reload() }
            }
        } catch(error) {}
    };

    return(<>
        <Accordion.Header><span className="fw-bold mx-2">{t('admin.product.addCategories')}</span></Accordion.Header>
        <Accordion.Body>
            <form onSubmit={handlePostParameters}>
                <div className="mb-3">
                    <label htmlFor="ref" className="form-label">{t('product.type')} :</label>
                    {productType.length > 0 ? (<>
                        <select className="form-select" onChange={(e) => setSelectedType(e.target.value)}>
                            <option value={undefined}>{t('admin.product.selectType')} </option>
                            {productType.map((type, index) => (
                                <option value={type} key={index}>{t(`productTypes.${type.toLowerCase()}`)}</option>
                            ))}
                        </select>
                    </>) : (<>
                        <input type="text" className="form-control" value={"There is no product type in database"} disabled/>
                    </>)}
                </div>
                <div className="mb-3">
                    <label htmlFor="ref" className="form-label">{t('product.category')} :</label>
                    <input className="form-control" type="text" value={valuesText} onChange={(e) => setValuesText(e.target.value)} placeholder="ex: val1, val2, val3" required/>
                </div>
                <button type="submit" className="btn btn-primary">{t('form.submit')} </button>
            </form>
        </Accordion.Body>
        <ToastContainer/>
    </>)
};


const ProductTypes : React.FC = () => {
    const {t} = useTranslation();
    const [productTypes, setProductTypes] = useState("");

    const handlePostParameters = async (e: React.FormEvent) => {
        e.preventDefault();
        const values = productTypes.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
        try {
            const response = await connecter.post("db/products/types/add", { values: values })
            if(response.status == 201){ window.location.reload() }
        } catch(error) {}
    };

    return(<>
        <Accordion.Header><span className="fw-bold mx-2">{t('admin.product.addTypes')}</span></Accordion.Header>
        <Accordion.Body>
            <form onSubmit={handlePostParameters}>
                <div className="mb-3">
                    <label htmlFor="ref" className="form-label">{t('product.type')} :</label>
                    <input className="form-control" type="text" value={productTypes} onChange={(e) => setProductTypes(e.target.value)} placeholder="ex: val1, val2, val3" required/>
                </div>
                <button type="submit" className="btn btn-primary">{t('form.submit')} </button>
            </form>
        </Accordion.Body>
    </>)
};


const AddUser = () => {
    const {t} = useTranslation();
    const [username, setUsername] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [firstname, setFirstname] = useState<string>('');
    const [lastname, setLastname] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [image, setImage] = useState<File>();
    const [loading, setLoading] = useState<boolean>(false);
    const [passwordMatch, setPasswordMatch] = useState<boolean>();
    const [passwordsWritten, setPasswordsWritten] = useState<boolean>();

    useEffect(()=>{
        setPasswordMatch(password.trim() === confirmPassword.trim())
    },[confirmPassword])
    useEffect(()=>{
        setPasswordsWritten(password.trim() != "" && confirmPassword.trim() != "")
    }, [password, confirmPassword])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files){ setImage(e.target.files[0]); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!passwordMatch){
            showToast(t('admin.users.passwordMismatch'), "error");
            return
        }
        if(role == ''){
            toast.error(t('admin.product.categoryError'), {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Zoom,
            });
        } else {
            setLoading(true);
            const formData = new FormData();
            formData.append('first_name', firstname);
            formData.append('last_name', lastname);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('role', role);
            if(image){ formData.append('image', image); }
            try {
                const response = await connecter.post('db/user/register', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if(response.status === 201){
                    showToast(t('admin.users.registrationSuccess'), "success");
                    await wait(1500);
                    window.location.reload();
                }
            } catch(error) {
                alert(`Erreur lors de la création du produit: ${error}`);
            }
            setLoading(false);
        }
    };

    return(<form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label className="form-label">{t('form.firstName.label')} :</label>
            <input type="text" className="form-control" value={firstname} onChange={(e) => setFirstname(e.target.value)} required/>
        </div>
        <div className="mb-3">
            <label className="form-label">{t('form.lastName.label')} :</label>
            <input type="text" className="form-control" value={lastname} onChange={(e) => setLastname(e.target.value)} required/>
        </div>
        <div className="mb-3">
            <label className="form-label">{t('admin.users.username')} :</label>
            <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required/>
        </div>
        <div className="mb-3">
            <label className="form-label">{t('admin.users.password')} :</label>
            <input type="password"
                className={`form-control ${confirmPassword.trim() != "" ? passwordMatch ? "is-valid" : "" : ""}`}
                value={password} onChange={(e) => setPassword(e.target.value)} required/>
        </div>
        <div className="mb-3">
            <label className="form-label">{t('admin.users.confirmPassword')} :</label>
            <input type="password"
                className={`form-control ${!passwordMatch ? "is-invalid" : passwordsWritten ? "is-valid" : ""}`}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
            <label className="form-label">{t('admin.users.role')} :</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value={''}>{t('admin.users.selectRole')} </option>
                {usersRoles(t).map((cat, index) => (
                    <option value={cat.roleValue} key={index}>{cat.roleName}</option>
                ))}
            </select>
        </div>
        <div className="mb-3">
            <label className="form-label">{t('admin.product.mainImage')} :</label>
            <input type="file" className="form-control" onChange={handleImageChange} required/>
        </div>
        <button className="btn btn-primary" type="submit">
            {loading ? 'Ajout en cours...' : t('form.submit')}
        </button>
    </form>)
}

export default Settings;