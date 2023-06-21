const router=require('express').Router()
const ctrl=require('../controller/post')

router.post('/create',ctrl.createPost)
router.post('/info',ctrl.getPost)
router.post('/list',ctrl.list)
router.post('/update',ctrl.update)
router.post('/remove',ctrl.remove)
router.post('/like',ctrl.like)


module.exports=router