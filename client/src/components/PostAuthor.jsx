import React, { useEffect, useState } from 'react';
import {Link} from "react-router-dom";
import axios from 'axios';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import ru from 'javascript-time-ago/locale/ru.json';

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

const PostAuthor = ({authorID,createdAt}) => {
  
  const [author,setAuthor]=useState({});

  useEffect(()=>{
   const getAuthor=async()=>{
    try {
      const response =await axios.get(`${process.env.REACT_APP_BASE_URI}/users/${authorID}`)

      setAuthor(response?.data)

    } catch (error) {
      console.log(error);
    }
   }

   getAuthor();
  },[authorID])


  const isValidDate = (date) => {
    return !isNaN(new Date(date).getTime());
  };

  return (
    <Link to={`/posts/users/${authorID}`} className="post__author"> 
      <div className="post__author-avatar">
        {author?.avatar ? (
          <img src={`${process.env.REACT_APP_ASSETS_URI}/uploads/${author?.avatar}`} alt={`${author?.name}'s avatar`} /> 
        ) : (
          <img src="default-avatar.jpg" alt="Default Avatar" /> 
        )}
      </div>
      <div className="post__author-details">
        <h5>By: {author?.name}</h5>
        {isValidDate(createdAt) ? (
          <small><ReactTimeAgo date={new Date(createdAt)} locale='en-US' /></small> 
        ) : (
          <small>Invalid date</small> 
        )}
      </div>
    </Link>
  );
}

export default PostAuthor