const Post=require('../models/postModel');
const User=require('../models/userModel');
const path=require('path');
const fs=require('fs');
const {v4:uuid}=require('uuid');
const HttpError=require('../models/errorModel');


//****************Create a Post */
//Post: api/posts
//Protected
const createPost=async(req,res,next)=>{
    try {
        let{title,category,description}=req.body;
        if(!title || !category || !description || !req.body){
            return next(new HttpError("Fill all the required fields!",422));
        }

        const {thumbnail}=req.files;
        if(thumbnail.size > 2000000){
            return next(new HttpError("Thumbnail too big. It should be less than 2MB",422))
        }

        let filename=thumbnail.name;
        let splittedFilename=filename.split(".");
        let newFilename=splittedFilename[0] + uuid()+"."+splittedFilename[splittedFilename.length -1];
        thumbnail.mv(path.join(__dirname,"..","/uploads",newFilename),async (err)=>{
            if(err){
                return next(new HttpError(err))
            }else{
                const newPost=await Post.create({title,category,description,thumbnail:newFilename,creator:req.user.id})

                if(!newPost){
                    return next(new HttpError("Post couldn't be created.",422))
                }
                //find the user and increment the post count by 1

                const currentUser=await User.findById(req.user.id);
                const userPostCount=currentUser.posts + 1;
                await User.findByIdAndUpdate(req.user.id,{posts:userPostCount})

                res.status(200).json(newPost);
            }
        })
    } catch (error) {
        return next(new HttpError(error));
    }
}





//****************get all Post */
//Post: api/posts
//Protected
const getPosts=async(req,res,next)=>{
    try {
        const posts=await Post.find().sort({updatedAt:-1});
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error));
    }
}





//****************Get Single Post */
//GET: api/posts/:id
//UnProtected
const getPost=async(req,res,next)=>{
    try {
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post){
            return next(new HttpError("Post Not Found!",404));
        }
        res.status(200).json(post);
        } catch (error) {
        return next(new HttpError(error));
    }
}






//****************Get Post By Categories */
//GET: api/posts/categories/:category
//UnProtected
const getCatPosts=async(req,res,next)=>{
    try {
        const {category}=req.params;
        const catPosts=await Post.find({category}).sort({createdAt: -1});
        res.status(200).json(catPosts);
    } catch (error) {
        return next(new HttpError(error));
    }
}







//****************Get Author Post */
//GET: api/posts/users/:id
//UnProtected
const getUserPosts=async(req,res,next)=>{
    try {
        const {id}=req.params;
        const posts=await Post.find({creator:id}).sort({createdAt:-1})
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
}






//****************Edit Post */
//PATCH: api/posts/:id
//Protected
const editPost=async(req,res,next)=>{
    try{
    let filename;
    let newFilename;
    let updatedPost;
    const postId=req.params.id;
    let {title,category,description}=req.body;
    //ReactQuill has a paragraph opening and closing tag with a break tag in between so there are 11 characters already.
    if(!title || !category || description.length < 12){
        return next(new HttpError("Fill all the fields",422));
    }
    //GET old post from db
    const oldPost=await Post.findById(postId);
    if(req.user.id==oldPost.creator){
    if(!req.files){
        updatedPost=await Post.findByIdAndUpdate(postId,{title,category,description},{next:true})
    }else{
        
        //DELETE old Thumbnail from uploads
        fs.unlink(path.join(__dirname,'..','uploads',oldPost.thumbnail),async(err)=>{
            if(err){
                return next(new HttpError(err))
            }
            
        })
        //upload new thumbnail
        const {thumbnail}=req.files;
        //check file size

        if(thumbnail.size > 2000000){
            return next(new HttpError("Thumbnail too big. It should be less than 2MB",422))
        }
        
    let filename=thumbnail.name;
    let splittedFilename=filename.split(".");
    let newFilename=splittedFilename[0] + uuid()+"."+splittedFilename[splittedFilename.length -1];
    thumbnail.mv(path.join(__dirname,"..","/uploads",newFilename),async (err)=>{
        if(err){
            return next(new HttpError(err))
        }
    })
        updatedPost=await Post.findByIdAndUpdate(postId,{title,category,description,thumbnail:newFilename},{next:true})
        }
    }
    if(!updatedPost){
        return next(new HttpError("Couldn't update the post",400));
    }
    res.status(200).json(updatedPost);
}catch(error){
    return next(new HttpError(error));
}
}









//****************Delete Post */
//Delete: api/posts/:id
//Protected
const deletePost=async(req,res,next)=>{
    try {
        const postId=req.params.id;
        if(!postId){
            return next(new HttpError("Post Unavailable!",400));
        }

        const post=await Post.findById(postId);
        const filename=post?.thumbnail;
   if(req.user.id==post.creator){
        //Delete thumbnail from uploads
        fs.unlink(path.join(__dirname,'..','uploads',filename),async(err)=>{
            if(err){
                return next(new HttpError(err))
            }else{
                await Post.findByIdAndDelete(postId)
            //find user/author and decrease the post count
            const currentUser=await User.findById(req.user.id);
            const userPostCount=currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, {posts:userPostCount})
            res.status(200).json(`Post ${postId} deleted successfully.`)
        }   
        })
    }else{
        return next(new HttpError("Post cannot be deleted. ",403));
    }

    } catch (error) {
        return next(new HttpError(error));
    }
}




module.exports={createPost,getPosts,getPost,getCatPosts,getUserPosts,editPost,deletePost};