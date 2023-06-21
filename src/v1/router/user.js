const router=require('express').Router()
const ctrl=require('../controller/user')

router.post('/register',ctrl.register)
router.post('/login',ctrl.login)
router.post('/info',ctrl.info)
router.post('/update',ctrl.update)
router.post('/remove',ctrl.remove)
router.post('/list',ctrl.list)
router.post('/follow',ctrl.followUser)
router.post('/unfollow',ctrl.unFollowUser)







module.exports=router