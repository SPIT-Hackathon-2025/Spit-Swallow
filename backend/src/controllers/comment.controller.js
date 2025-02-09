import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';


//tested
const addCommentToPost = async (req, res) => {
    try{
        const {postId , content , userId} = req.body ; 
        console.log('C ' , postId);
        
        if(!postId || !content || !userId){
            res.send({success: false , message: "Post ID and Comment are required"}) ; 
        }

        const comment = await Comment.create({
            content , 
            user: userId , 
            comments:[]
        })
        // Add Comment to Post
        let post = await Post.findById(postId) ; 
        if(!post) throw new Error("Post not found") ; 
        post.comments.push(comment._id) ; 
        await post.save() ; 
        post = await Post.findById(post._id) ; 
        res.status(200).send({success: true , data : post , message: "Comment added successfully"}) ;
    }catch(err){
        res.status(400).send({success: false , message: err.message , data: {}}) ; 
    }
};

const getCommentsByPost = async (req , res) => {
      const { postId } = req.params ; 

      try {
        const post =  await Post.findById(postId).populate("comments") ; 

        res.status(200).json({success: true , message: "Fetched comments successfully" , data: post.comments}) ; 
      } catch (error) {
         return res.status(400).json({success: false , message: "Unable to fetch" , data:{}}) ; 
      }
}
//tested
const addCommentToComment = async (req, res) => {
    try{
        const {commentId , reply , userId} = req.body ; 
        if(!commentId || !reply || !userId){
            res.send({success: false , message: "Comment ID and Comment are required"}) ; 
        }

        const newComment = await Comment.create({
            content : reply, 
            user: userId , 
            comments:[]
        })

        let oldComment = await Comment.findById(commentId) ; 
        if(!oldComment) throw new Error("Comment not found") ; 
        
        oldComment.comments.push(newComment) ; 

        await oldComment.save() ; 
        oldComment  = await Comment.findById(oldComment._id) ; 
        res.send({success: true , data: oldComment , message: "Comment added"}) ;
    }catch(err){
        res.send({success: false , message: err.message , data: {}}) ; 
    }
};

const likeComment = async (req, res) => {
    try{
        const {commentId} = req.body ; 
        if(!commentId){
            res.send({success: false , message: "Comment ID are required"}) ; 
        }
        // Like Comment
        const comment = await Comment.findById(commentId) ; 
        comment.likes += 1 ; 
        await comment.save() ; 
        res.send({success: true , post}) ;
    }catch(err){
        res.send({success: false , message: err.message});
    }
};

export { addCommentToPost, addCommentToComment , likeComment  , getCommentsByPost};