import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL
export const ACCESS_TOKEN = 'FirdaousAccess'
export const REFRESH_TOKEN = 'FirdaousRefresh'
export const USER_ROLE = 'AlFirdaousStoreDBUserRole'
export const USER_USERNAME = 'AlFirdaousStoreDBUserUsername'
export const USER_IMAGE = 'AlFirdaousStoreDBUserImage'
export const USER_FIRSTNAME = 'AlFirdaousStoreDBUserFirstname'
export const USER_LASTNAME = 'AlFirdaousStoreDBUserLastname'

const apiInstance = axios.create(
    {
        baseURL : apiUrl,
        withCredentials: true,
        xsrfCookieName:"csrftoken",
        xsrfHeaderName:'X-CSRFToken',
        headers: {
            'Content-Type': 'application/json',
        },
    }
);

// apiInstance.interceptors.request.use((config)=>{
//     const token = localStorage.getItem(ACCESS_TOKEN);
//     if(token){
//         config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
// },
//     (error)=> Promise.reject(error))

export default apiInstance