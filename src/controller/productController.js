const { PrismaClient } = require("@prisma/client");
var bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('../config/config.js')
const userClient = new PrismaClient().USER;
const prisma = new PrismaClient();
const userRolesClient = new PrismaClient().USER_ROLES;


exports.getAllProduct = async (req, res) => {
  try {
    const productAll = await prisma.PRODUCT.findMany();

    
    res.status(200).json({ data: productAll, status: 200 });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};


exports.saveOrderDetail = async (req, res) => {
    const { order_items, price, status } = req.body;
  
    try {
      if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
        return res
          .status(400)
          .json({ error: "Order items are required", status: 400 });
      }
  
      const createOrderDetail = await prisma.ORDER_DETAIL.create({
        data: {
          price,
          status,
          order_items: {
            create: order_items.map((item) => ({
              product_id: item.product_id,
              sweetness_level: item.sweetness_level,
              price: item.price,
              note: item.note,
            })),
          },
        },
        include: {
          order_items: true,
        },
      });
  
      res
        .status(201)
        .json({ data: createOrderDetail, message: "Order saved successfully", status: 201 });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error", status: 500 });
    }
  };


  exports.saveProduct = async (req, res) => {
    const { image, quantity, price } = req.body;
  
    try {
      if (!price) {
        return res
          .status(400)
          .json({ error: "Price is required", status: 400 });
      }
  
      const newProduct = await prisma.PRODUCT.create({
        data: {
          image: image || null, 
          quanitity: quantity || 0, 
          price: price,
        },
      });
  
      res
        .status(201)
        .json({ data: newProduct, message: "Product created successfully", status: 201 });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error", status: 500 });
    }
  };

exports.cancelOrder = async (req, res) => {
    const { detailCancel, orderDetailId } = req.body;

    try {
        const cancelOrderDetail = await prisma.ORDER_DETAIL.update({
            where: {
                id: orderDetailId
            },
            data: {
                status: 'canceled',
                detail_cancel: detailCancel 
            }
        });

        res.status(200).json({ data: cancelOrderDetail, status: 200 });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", status: 500 });
    }
};


