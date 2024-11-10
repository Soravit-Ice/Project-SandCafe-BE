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
        const createOrderDetail = await prisma.ORDER_DETAIL.create({
            data: {
                price: price,
                status: status,
                order_items: {
                    create: order_items.map(item => ({
                        product_id: item.product_id,
                        sweetness_level: item.sweetness_level,
                        price: item.price,
                        note: item.note,
                    }))
                }
            },
            include: {
                order_items: true
            }
        });
        res.status(200).json({ data: createOrderDetail, status: 200 });
    } catch (e) {
        console.log(e);
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


