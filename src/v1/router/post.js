const router=require('express').Router()
const ctrl=require('../controller/post')

router.post('/create',ctrl.createPost)







module.exports=router