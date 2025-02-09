import { Router } from 'express' ; 
import { addCommentToComment, addCommentToPost, getCommentsByPost } from '../controllers/comment.controller.js';


const router = Router() ; 

router.post('/post/create', addCommentToPost) ;
router.post('/comment/create', addCommentToComment) ;
router.get('/:postId', getCommentsByPost) ;

 
export default router ; 