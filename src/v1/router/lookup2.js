const router=require('express').Router()
const ctrl=require('../controller/lookup2')


router.post('/CustomerLook',ctrl.customerAdd)
router.post('/OrderLook',ctrl.orderAdd)
router.post('/pipelineLookup',ctrl.pipelineLookup)
router.post('/equal',ctrl.equal)   ///////$eq used or   $expr or  $let match the result only get




module.exports=router
