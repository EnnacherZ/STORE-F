import React from "react";
import { MdDoNotDisturbAlt } from "react-icons/md";
import { useTranslation } from "react-i18next";


const NotFound: React.FC<{onReset :() => void}> = ({onReset}) => {
  const {t} = useTranslation();

  return (
    <>
    <div  className="d-flex flex-column align-items-center pt-5 rounded" 
          style={{marginBlock:20, height:200, margin:'auto'}}>
      <div><MdDoNotDisturbAlt size={50}/></div>
      <div className="fw-bold">
        {t('error.elementNotFound')}
      </div>
      <button className="reset-button btn btn-primary mt-4" onClick={onReset}>
        {t('ui.reset')}
      </button>
    </div>
    </>
  );
};

export default NotFound;