const mongoose = require('mongoose');


const customerSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email:{
        type: String,
        required: true
      },
     
  },
  {timestamps: true}
)


const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true
      },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerLooks',
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
},
{timestamps: true}
)

const CustomerLook = mongoose.model('CustomerLook', customerSchema);
const OrderLook = mongoose.model('OrderLook', orderSchema);


module.exports={
    CustomerLook,
    OrderLook
}