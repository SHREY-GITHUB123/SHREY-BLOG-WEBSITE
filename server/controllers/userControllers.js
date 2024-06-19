const HttpError =require("../models/errorModel");
const User =require('../models/userModel');
const bcrypt=require('bcryptjs');
const jwt=require("jsonwebtoken");
const fs=require('fs');
const path =require('path');
const {v4:uuid}=require('uuid');




// ****************Register a new User
//Post:/api/users/register
//Unprotected
const registerUser=async(req,res,next)=>{
  try {
    const {name,email,password,password2}=req.body;

    if(!name || !email || !password){
        return next(new HttpError("Fill all the required fields!",422))
    }

    const newEmail =email.toLowerCase();

    const emailExists=await User.findOne({email:newEmail});
    if(emailExists){
        return next(new HttpError("Email already exists",422))
    }

    if((password.trim()).length <8){
        return next(new HttpError("Password must be of atleast 8 characters",422))
    }
    
    if(password!=password2){
        return next(new HttpError("Password and Confirm Password doesn't match!",422))
    }

    const salt=await bcrypt.genSalt(10);
    const hashedPass=await bcrypt.hash(password,salt);
    const newUser=await User.create({name,email:newEmail,password:hashedPass});
    res.status(201).json(`New User ${newUser.email} registered.`);

  } catch (error) {
    return next(new HttpError("User Registration Failed!",422))
  }
}







// ****************Login User
//Post:/api/users/login
//Unprotected
const loginUser=async(req,res,next)=>{
    try {
       const {email,password}=req.body;
       if(!email || !password){
        return next(new HttpError("Fill all the fields properly!",422))
       } 

        const user=await User.findOne({email:email})
       if(!user){
        return next(new HttpError("Invalid Credentials!",422))
       }

       const comparePass=await bcrypt.compare(password,user.password)

       if(!comparePass){
        return next(new HttpError("Invalid Credentials!",422))
       }


       const {_id:id,name}=user;

       const token=jwt.sign({id,name},process.env.JWT_SECRET,{expiresIn:"1d"});

       res.status(200).json({token,id,name})

    } catch (error) {
        return next(new HttpError("User Login Failed!",422))
    }
}









// **************** User Profile
//Post:/api/users/:id
//Protected
const getUser=async(req,res,next)=>{
    try {
        const {id}=req.params;
        const user= await User.findById(id).select('-password');
        if(!user){
            return next(new HttpError("User Not Found!",404))
        }

        res.status(200).json(user);
    } catch (error) {
        return next(new HttpError(error))
    }
}









// **************** Change User Avatar (Profile pic)
//Post:/api/users/change-avatar
//Protected
const changeAvatar=async(req,res,next)=>{
    try {
        if(!req.files.avatar){
            return next(new HttpError("Please choose an image.",422))
        }

        // find user from database
        const user =await User.findById(req.user.id)
        //delete old avatar if exists
        if(user.avatar){
            fs.unlink(path.join(__dirname,'..','uploads',user.avatar),(err)=>{
                if(err){
                    return next(new HttpError(err))
                }
            })
        }

        const {avatar}=req.files;
        //check file size
        if(avatar.size > 500000){
            return next(new HttpError("Profile picture too big. It should be less than 500KB"),422)
        }

        let filename;
        filename=avatar.name;
        let splittedFilename=filename.split('.');
        let newFilename=splittedFilename[0] + uuid() + '.' + splittedFilename[splittedFilename.length -1]
        avatar.mv(path.join(__dirname,'..' ,'uploads',newFilename),async (err)=>{
            if(err){
                return next(new HttpError(err))
            }

            const updatedAvatar=await User.findByIdAndUpdate(req.user.id,{avatar:newFilename},{new:true})
            if(!updatedAvatar){
                return next(new HttpError("Avatar couldn't changed.",422))
            }
            res.status(200).json(updatedAvatar);
        })

    } catch (error) {
        return next(new HttpError(error))
    }
}











// **************** Edit User Details (Profile)
//Post:/api/users/edit-user
//Protected
const editUser=async(req,res,next)=>{
    try {
        const {name,email,currentPassword,newPassword,confirmNewPassword}=req.body;
    
        if(!name || !email || !currentPassword || !newPassword || !confirmNewPassword){
            return next(new HttpError("Fill all the required fields!",422))
        }

        //get user by id from database
        const user=await User.findById(req.user.id);
        if(!user){
            return next(new HttpError("User Not Found!",403))
        }

        //make sure new email doesn't already exists
        const emailExists=await User.findOne({email});
        //we want to update other details with/without changing the email
        if(emailExists && (emailExists._id != req.user.id)){
            return next(new HttpError("Emmail already exists.",422))
        }
//compare current password with db password
        const validateUserPassword=await bcrypt.compare(currentPassword,user.password);
        if(!validateUserPassword){
            return next(new HttpError("Invalid Credentials!",422))
        }

        if(newPassword != confirmNewPassword){
            return next(new HttpError("Password doesn't match",422))
        }

        const salt=await bcrypt.genSalt(10);
        const hash=await bcrypt.hash(newPassword,salt);
        const newInfo=await User.findByIdAndUpdate(req.user.id,{name,email,password:hash},{new:true})
        res.status(201).json(newInfo);


    }catch(error){
        return next(new HttpError(error))
    }
}















// **************** Get Authors
//Post:/api/users/authors
//UnProtected
const getAuthors=async(req,res,next)=>{
   try {
    const authors=await User.find().select('-password');
    res.json(authors);
   } catch (error) {
    return next(new HttpError(error))
   }
}

module.exports ={registerUser,loginUser,getUser,changeAvatar,getAuthors,editUser};