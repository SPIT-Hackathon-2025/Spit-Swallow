import mongoose from 'mongoose' ; 
import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    likes: {
        type: Number,
        default: 0,
    },
    comments: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        }]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' , 
    }
}, {
    timestamps: true
});

const Comment = model('Comment', commentSchema);

export default Comment;
