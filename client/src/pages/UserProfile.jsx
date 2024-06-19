import React, { useState,useEffect,useContext } from 'react';
import { Link } from 'react-router-dom';

import {FaEdit} from "react-icons/fa";
import {FaCheck} from "react-icons/fa";
import { UserContext } from '../context/userContext';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader'


const UserProfile = () => {
  const [avatar,setAvatar]=useState('');
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmNewPassword,setConfirmNewPassword]=useState('');
 const [isLoading,setIsLoading]=useState(false);
  const [isAvatarTouched,setIsAvatarTouched]=useState(false);
  const [error,setError]=useState('');
 

  const navigate =useNavigate();

  const [currentUser]=useContext(UserContext);
  const token=currentUser?.token;

  //redirect to login page for any user who isn't logged in
useEffect(()=>{
  if(!token){
    navigate('/login');
  }
},[navigate, token])



useEffect(()=>{
  const getUser=async()=>{
  const response=await axios.get(`${process.env.REACT_APP_BASE_URI}/users/${currentUser.id}`,{withCredentials:true,headers:{Authorization:`Bearer ${token}`}})
  const {name,email,avatar}=response.data

  setName(name);
  setEmail(email);
  setAvatar(avatar);
  }
  
getUser();
},[currentUser.id,token])

if(isLoading){
  return <Loader/>
}

const changeAvatarHandler=async()=>{
  setIsAvatarTouched(false);
  try {
    const postData=new FormData();
    postData.set('avatar',avatar)

    const response=await axios.post(`${process.env.REACT_APP_BASE_URI}/users/change-avatar`,postData,{withCredentials:true,headers:{Authorization:`Bearer ${token}`, 'Content-Type': 'multipart/form-data'}})
    setAvatar(response?.data.avatar);
  } catch (error) {
    console.log(error);
  }
}



const updateUserDetails = async (e) => {
  e.preventDefault();
  if (newPassword !== confirmNewPassword) {
    setError('New password and confirm password do not match.');
    return;
  }

  setIsLoading(true);

  try {
    const userData = new FormData();
    userData.set('name', name);
    userData.set('email', email);
    userData.set('currentPassword', currentPassword);
    userData.set('newPassword', newPassword);
    userData.set('confirmNewPassword', confirmNewPassword);

    const response = await axios.patch(
      `${process.env.REACT_APP_BASE_URI}/users/edit-user`,
      userData,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200 || response.status===201) {
      
      //setIsLoading(false);
      return navigate('/logout');
    }
  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
      setError(err.response.data.message || 'Failed to update user details.');
    } else if (err.request) {
      setError('Network error. Please try again later.');
    } else {
      setError('An unexpected error occurred.');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <section className="profile">
      <div className="container profile__container">
        <Link to={`/myposts/${currentUser.id}`} className='btn'>My posts</Link>

        <div className="profile__details">
          <div className="avatar__wrapper">
          <div className="profile__avatar">
            <img src={`${process.env.REACT_APP_ASSETS_URI}/uploads/${avatar}`} alt=""/>
          </div>
          {/*Form to Update Avatar*/}
          <form className="avatar__form">
            <input type="file" name="avatar" id="avatar" onChange={e=>setAvatar(e.target.files[0])} accept="png,jpg,jpeg"/>
            <label htmlFor="avatar" onClick={()=> setIsAvatarTouched(true)}><FaEdit/></label>
          </form>

         {isAvatarTouched && <button className="profile__avatar-btn" onClick={changeAvatarHandler}><FaCheck/></button>}
          </div>
          <h1>{currentUser.name}</h1>

          <form className="form profile__form" onSubmit={updateUserDetails}>
        {error && <p className="form__error-message">{error}</p>}
        <input type="text" placeholder='Full Name' value={name} onChange={e=>setName(e.target.value)}/>
        <input type="email" placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)}/>
        <input type="password" placeholder='Current Password' value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/>
        <input type="password" placeholder='New Password' value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
        <input type="password" placeholder='Confirm Password' value={confirmNewPassword} onChange={e=>setConfirmNewPassword(e.target.value)}/>
        <button type="submit" className='btn primary'>Update Details</button>
        </form>
        </div>
      </div>
    </section>
    
  )
}

export default UserProfile