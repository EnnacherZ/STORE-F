import React, {useState } from "react";
import "../styles/Login.css";
import logo from "../assets/FIRDAOUS STORE.png"
import Loading from "../components/loading";
import {Navigate} from "react-router-dom";
import { useAuth } from "./contexts/Authentication";



const Login : React.FC = () => {
    const {signIn, isAuthorized, isLoading} = useAuth();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');


    const handleSubmit = (e:React.FormEvent) =>{
        signIn(e, username, password);

    };



if(isAuthorized){

    return <Navigate to={"/Dashboard/Home"}/>

}else{

if(isLoading){

    return(<><Loading message="Authentication..."/></>)

}

return(<>
    <div className="login-div card shadow align-items-center p-2">
        <div className="login-logo-div d-flex mt-2">
            <img src={logo} alt="" />
        </div>
        <h3 className="m-3 fw-bold">STORE DASHBOARD</h3>
        <form action="/submit" onSubmit={handleSubmit}>
        <div className="login-input mt-2 p-1">

        <div className="form-floating mb-3 my-1">
            <input type="text" className="form-control" id="floatingInput" autoComplete="current-username" placeholder="Username" value={username} onChange={(e)=>{setUsername(e.target.value)}}/>
            <label className="floatingInput">Username</label>
        </div>
        <div className="form-floating my-1">
            <input type="password" className="form-control" id="floatingPassword" autoComplete="current-password" placeholder="Password" value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
            <label htmlFor="floatingPassword">Password</label>
        </div> 
        </div>
        <button className="btn btn-primary login-btn m-2" type="submit" >
            Log In
        </button>
        </form>
    </div>
</>)
}
}
export default Login