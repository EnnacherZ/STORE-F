import React from "react";
import { FaRegCopyright } from "react-icons/fa6";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram} from '@fortawesome/free-brands-svg-icons';
import iconStoreWhite from "../assets/WHITE FIRDAOUS STORE.png";
import '../styles/footer.css'
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLangContext } from "../contexts/LanguageContext";
import { selectedLang } from "./constants";

const Footer : React.FC = () => {
    const {t} = useTranslation();
    const {currentLang} = useLangContext();

    return(<>
        <div className={`footerX d-flex flex-column pt-2 mt-2 shadow ${selectedLang(currentLang)=="ar"&&'rtl'}`}>
            <div className="iconStoreWDiv mb-4">
                <img src={iconStoreWhite}  />
            </div>
            <div className="d-flex flex-wrap justify-content-around">

            <div className="p-3">
              <div className="fw-bold text-center fs-4">{t('footer.policies')}</div>
              <ul className="">
                <li className="my-2"><Link to={"/Policies/General-terms-of-use"} className="socialLinks privacy-policy">{t('footer.usePolicy')}</Link></li>
                <li className="my-2"><Link to={"/Policies/Privacy-policy"} className="socialLinks privacy-policy">{t('footer.privacyPolicy')}</Link></li>
              </ul>
            </div>

            <div className=" p-3">
              <div className="fw-bold text-center fs-4">{t('footer.followUs')}</div>
              <div className="rounded-pill footer-sm fb my-2">
                <a target="_blank" className="socialLinks text-decoration-none" href="https://web.facebook.com/profile.php?id=61581025313047"><FontAwesomeIcon icon={faFacebook} beat style={{}} /> Facebook</a>
              </div>
              <div className="rounded-pill footer-sm ig my-2">
                <a target="_blank" className="socialLinks text-decoration-none" href="https://www.instagram.com/store_alfirdaous/"><FontAwesomeIcon icon={faInstagram} beat style={{}} /> Instagram</a>
              </div>
            </div>

            <div className="p-3">
              <div className="fw-bold text-center fs-4">{t('footer.contactUs')}</div>
              <div className=" text-center mt-2" style={{fontSize:14}}>
                <p>{t('form.phone.label')} : +212600000000</p>
                <p>{t('form.email.label')} : alfirdaousstore.services@gmail.com</p>
              </div>
            </div>
            </div>
            <div className="copyrightTitle fw-bold mt-1 d-flex justify-content-center">
              AL FIRDAOUS STORE <FaRegCopyright style={{margin:5}}/> 2025
            </div>

        </div>

    </>)
}
export default Footer;