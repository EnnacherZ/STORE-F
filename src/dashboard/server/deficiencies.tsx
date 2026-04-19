import { useEffect, useState } from "react";
import apiInstance from "../../dashboard/api";

const connecter = apiInstance;

export const getDeficiencies = () => {
    const [deficiencies, setDeficiencies] = useState<Array<any>>([]);

    useEffect(()=>{
        const getDeficienciesData = async () => {
           try{ 
            const response = await connecter.get("db/deficiencies/get");
            setDeficiencies(response.data.deficiencies || []);
            
        }catch{}
        }
        getDeficienciesData();
    },[])
    return deficiencies;
}
