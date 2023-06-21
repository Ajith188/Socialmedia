const mongoose=require('mongoose')


const PostSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        description:String,
        likes:[],
        Image:String,
    },
    {timestamps: true}
)

const PostModel= mongoose.model("Post", PostSchema);

module.exports={
    PostModel
}