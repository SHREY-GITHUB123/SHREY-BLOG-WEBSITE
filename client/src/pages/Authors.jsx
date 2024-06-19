import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';



const Authors = () => {
  const [authors,setAuthors]=useState([]);

  const [isLoading,setIsLoading]=useState(false);

  useEffect(()=>{
    const getAuthors=async()=>{
        setIsLoading(true);

        try {
          const response=await axios.get(`${process.env.REACT_APP_BASE_URI}/users`)
          setAuthors(response?.data)
        } catch (err) {
          console.log(err);
        }

        setIsLoading(false);
    }

    getAuthors();
  },[])

  if(isLoading){
    return <Loader/>
  }

  return (
    <section className="authors">
    {
      authors.length>0 ?<div className="container authors__container">
         {
          authors.map(({_id,avatar,name,posts})=>{
            return(
              <Link key={_id} to={`/posts/users/${_id}`} className="author">
                <div className="author__avatar">
                  <img src={`${process.env.REACT_APP_ASSETS_URI}/uploads/${avatar}`} alt={`PicImage of ${name}`}/>
                </div>
                <div className="author__info">
                  <h4>{name}</h4>
                  <p>{posts}</p>
                </div>
              </Link>
            )
          })
         }
    </div>:<h2 className="center"> No Authors Found!</h2>
    }
    </section>
    
  )
}

export default Authors