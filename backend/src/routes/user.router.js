import { Router } from 'express' ; 
import { upload } from '../middlewares/multer.middleware.js';
import { signIn, signUp } from '../controllers/user.controller.js';


const router = Router() ; 

 router.post('/signup' , upload.single('media') , signUp) ;
 router.post('/signin', signIn) ;
 
 export default router ; 