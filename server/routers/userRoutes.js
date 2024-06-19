const {Router} =require('express');
const authMiddleware=require('../middleware/authMiddleware');

const {registerUser,loginUser,getUser,changeAvatar,getAuthors,editUser}=require('../controllers/userControllers');
const router=Router()

router.post('/register',registerUser);
router.post('/login',loginUser)
router.get('/:id',getUser)
router.get('/',getAuthors)
router.post('/change-avatar',authMiddleware,changeAvatar)
router.patch('/edit-user',authMiddleware,editUser)
//router.post('/authors',getAuthors)

module.exports=router;