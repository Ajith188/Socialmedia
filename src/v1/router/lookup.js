const router=require('express').Router()
const ctrl=require('../controller/lookup')


router.post('/customerAdd',ctrl.customerAdd)
router.post('/productAdd',ctrl.productAdd)
router.post('/orderAdd',ctrl.orderAdd)


router.get('/orderLookup',ctrl.orderLookup)



module.exports=router
