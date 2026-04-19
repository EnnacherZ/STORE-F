import React from "react";
import {Rings}  from 'react-loader-spinner';


const Loading : React.FC<{message : string}> = ({message}) =>{
    return(<>
                <div className="flex-column m-2" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                    }}>
                <div className="m-3">
                <Rings
                        
                        height="10em"
                        width="10em"
                        color="#0e92e4"
                        ariaLabel="loading"
                        wrapperStyle={{justifyContent:'center', alignItems:"center",}}
                        
                        
                    />
                </div>
                    <div className="loading-msg fs-3 fw-bold text-center m-4">
                        {message}
                    </div>
            </div>
                    

    </>)
}
export default Loading;