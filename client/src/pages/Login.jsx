import React, { useState,useContext } from 'react';
import {Link,useNavigate} from "react-router-dom"; 
import axios from 'axios';
import { UserContext } from '../context/userContext';

const Login = () => {
  const [userData,setUserData]=useState({
    email:'',
    password:''
  })

    const [error,setError]=useState('');
    const navigate=useNavigate();

    const [,setCurrentUser]=useContext(UserContext)

  const changeInputHandler=(e)=>{
   setUserData(prevState=>{
    return {...prevState,[e.target.name]:e.target.value}
   })
  }

  const loginuser=async(e)=>{
    e.preventDefault();
    setError('');
try {
  const response=await axios.post(`${process.env.REACT_APP_BASE_URI}/users/login`,userData);
  const user=await response.data;
  
  console.log(user);
  if(!user){
    setError("Couldn't login user.Please try again!")
  }else{
    setCurrentUser(user);
  navigate('/');
  }
} catch (err) {
  setError(err.response?.data?.message || 'An error occured. Please try again!');
}
  }

  return (
    <section className="register">
      <div className="container">
        <h2>Sign In</h2>
        <form className="form login__form" onSubmit={loginuser}>
        {error && <p className="form__error-message">{error}</p>}
        <input type="text" placeholder="Email" name="email" value={userData.email} onChange={changeInputHandler} autoFocus/>
        <input type="password" placeholder="Password" name="password" value={userData.password} onChange={changeInputHandler}/> 
        <button type="submit" className="btn primary">Login</button>
        </form>
        <small>Don&apos;t have an account? <Link to="/register">Sign Up</Link></small>
      </div>
    </section>
  )
}


export default Login