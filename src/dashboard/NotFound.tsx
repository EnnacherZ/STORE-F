import React from "react";





const NotFound : React.FC<{message:string}> = ({message}) => {





    return(<>
        <div className="d-flex justify-content-center flex-wrap flex-rows shadow p-4">
            <p className="fs-6 fw-bold" >{message}</p>
        </div> 
    </>)




}
export default NotFound