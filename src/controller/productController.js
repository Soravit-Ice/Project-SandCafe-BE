const { PrismaClient } = require("@prisma/client");
var bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('../config/config.js')
const userClient = new PrismaClient().USER;
const prisma = new PrismaClient();
const cloudinary = require('cloudinary').v2;
const userRolesClient = new PrismaClient().USER_ROLES;


exports.getAllProduct = async (req, res) => {
  try {
    const { tab, subcategory, skip = 0, limit = 10 } = req.query;

    // Base query
    const query = {
      skip: Number(skip),
      take: Number(limit),
      where: {},
    };

    // Add category filter if `tab` is provided
    if (tab) {
      query.where.category = tab;

      // Add subcategory filter only if applicable
      if (tab === "drinks" && subcategory) {
        query.where.subcategory = subcategory;
      }
    }

    const productAll = await prisma.PRODUCT.findMany(query);
    res.status(200).json({ data: productAll, status: 200 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};


exports.saveOrderDetail = async (req, res) => {
    const { order_items, price, status , category , subcategory } = req.body;
  
    try {
      if (!order_items || !Array.isArray(order_items) || order_items.length === 0) {
        return res
          .status(400)
          .json({ error: "Order items are required", status: 400 });
      }
  
      const createOrderDetail = await prisma.ORDER_DETAIL.create({
        data: {
          price,
          category,
          subcategory,
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
    const { name, price , category , subcategory } = req.body;
    
    console.log("sdfsdf",name, price)
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." , status:400 });
    }

    if (!name || !price) {
      return res.status(400).send({ message: "Name or Price Require", status:400 });
    }

  
    try {

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Project-SandCafe",
        resource_type: "auto",
      });

      if (!price) {
        return res
          .status(400)
          .json({ error: "Price is required", status: 400 });
      }
  

      const newProduct = await prisma.PRODUCT.create({
        data: {
          image: result.secure_url, 
          name: name || 0,  
          price: parseInt(price),
          category,
          subcategory
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


