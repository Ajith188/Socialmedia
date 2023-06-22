const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});


// Customer Schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});


// Order Schema
const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});


const Product = mongoose.model('Product', productSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = {
  Product,
  Customer,
  Order
};
