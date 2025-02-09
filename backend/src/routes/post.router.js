import { Router } from 'express' ; 
import { upload } from '../middlewares/multer.middleware.js';
import { addDisapproval, addVerification, createPost, deletePost, getAllPosts, getPostById, getPostsbyCommunity, getPostsByUserId, likePost } from '../controllers/post.controller.js';


const router = Router() ; 

router.post('/create' , upload.single('media') , createPost) ;
router.post('/like', likePost) ;
router.delete('/delete', deletePost) ;
router.get('/user/:userId', getPostsByUserId) ;
router.get('/:postId', getPostById) ;
router.get('/', getAllPosts) ;
router.post('/addVerification', addVerification) ;
router.post('/addDisapproval', addDisapproval) ;
router.get('/community/:communityName', getPostsbyCommunity) ;

 
export default router ; 