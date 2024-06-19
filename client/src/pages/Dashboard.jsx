import React, { useState ,useEffect,useContext} from 'react';
//import {DUMMY_POSTS} from "../data";
import { Link } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import {useNavigate,useParams} from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import DeletePost from './DeletePost';

const Dashboard = () => {
const [posts,setPosts]=useState([])
const [isLoading,setIsLoading]=useState(false);

const navigate =useNavigate();
const {id}=useParams();

  const [currentUser]=useContext(UserContext);
  const token=currentUser?.token;

  //redirect to login page for any user who isn't logged in
useEffect(()=>{
  if(!token){
    navigate('/login');
  }
},[navigate, token])


useEffect(()=>{
  const fetchPosts=async()=>{
      setIsLoading(true);

      try {
        const response=await axios.get(`${process.env.REACT_APP_BASE_URI}/posts/users/${id}`,{withCredentials:true,headers:{Authorization:`Bearer ${token}`}})
        setPosts(response?.data)
      } catch (err) {
        console.log(err);
      }

      setIsLoading(false);
  }

  fetchPosts();
},[id,token])


if(isLoading){
  return <Loader/>
}





  return (
    <section className="dashboard">
     {
      posts.length ? <div className="container dashboard__container">
          {
            posts.map(post=>{
              return <article key={post.id} className='dashboard__post'>
                <div className="dashboard__post-info">
                  <div className="dashboard__post-thumbnail">
                    <img src={`${process.env.REACT_APP_ASSETS_URI}/uploads/${post.thumbnail}`} alt="" />
                  </div>
                   <h5>{posts.title}</h5>
                </div>
                <div className="dashboard__posts-actions"></div>
              <Link to={`/posts/${post._id}`} className='btn sm'>View</Link>
              <Link to={`/posts/${post._id}/edit`} className='btn sm primary'>Edit</Link>
              <DeletePost postID={post._id}/>
              </article>
            })
          }
      </div>: <h2 className='center'> You don&apos;t have any posts yet!</h2>
     }
    </section>
    
  )
}

export default Dashboard