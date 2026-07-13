import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';


const NotFoundPage: React.FC = () => {
  const {t} = useTranslation();
  return (
    <>
    <Header/>

    <div 
      className="d-flex align-items-center justify-content-center flex-column" 
      style={{ height: '100vh' }}
    >
      <h1>404 - Page Not Found</h1>
      <p>{t('error.pageNotFound')}</p>
    </div>
  </>);
};

export default NotFoundPage;