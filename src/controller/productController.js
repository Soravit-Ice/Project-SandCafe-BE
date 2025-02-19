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


exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;


    const productAll = await prisma.PRODUCT.findUnique({
      where:{
        id:parseInt(productId)
      }
    });
    res.status(200).json({ data: productAll, status: 200 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};


exports.addToOrder = async (req, res) => {
  const user_id = req.userId; // Assuming this comes from authentication middleware
  const { product_id, quantity, sweetness_level, price, note } = req.body;

  try {
    if (!user_id || !product_id || !quantity || !price) {
      return res.status(400).json({
        error: "User ID, Product ID, Quantity, and Price are required",
        status: 400,
      });
    }

    // Check if the product already exists in the temporary order (without orderdetail_id)
    const existingItem = await prisma.ORDER_ITEMS.findFirst({
      where: {
        user_id,
        product_id,
        sweetness_level,
        orderdetail_id: null, // Temporary item (not linked to any order detail yet)
      },
    });

    if (existingItem) {
      // Update quantity and price of the existing temporary order item
      const updatedItem = await prisma.ORDER_ITEMS.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          price: existingItem.price + price, // Update total price
        },
      });

      return res.status(200).json({
        data: updatedItem,
        message: "Order item updated successfully",
        status: 200,
      });
    }

    // Create a new temporary order item (without orderdetail_id)
    const newOrderItem = await prisma.ORDER_ITEMS.create({
      data: {
        user_id,
        product_id,
        quantity,
        sweetness_level,
        price, // Total price for the given quantity
        note,
      },
    });

    res.status(201).json({
      data: newOrderItem,
      message: "Item added to order successfully",
      status: 201,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};

const calculatePoints = (totalPrice) => Math.floor(totalPrice / 500);


const sendPushNotification = async (expoPushToken, message) => {
  console.log("expoPushToken",expoPushToken)
  await fetch("https://api.expo.dev/v2/push/send?useFcmV1=true", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: "default",
      title: "New Order Checkout",
      body: message,
    }),
  }).then((data) => {
    console.log("body",data.body)
    console.log(data)
  }).catch((e) => console.log(e));
};


exports.checkoutOrder = async ( req, res) => {
  console.log("start1")
  const user_id = req.userId;
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded.", status: 400 });
  }

  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Project-SandCafe",
      resource_type: "auto",
    });

    if (!user_id) {
      return res.status(400).json({
        error: "User ID is required",
        status: 400,
      });
    }

    // Fetch all temporary order items for the user (orderdetail_id: null)
    const orderItems = await prisma.ORDER_ITEMS.findMany({
      where: {
        user_id,
        orderdetail_id: null,
      },
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        error: "No items to checkout",
        status: 400,
      });
    }

    // Calculate total price
    let totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

    // Attempt to apply a discount
    const unusedDiscount = await prisma.POINTS_REDEMPTION.findFirst({
      where: { user_id, status: "NOT_USE" },
    });

    if (unusedDiscount) {
      // Assuming a discount value exists in `unusedDiscount`
      const discountValue = unusedDiscount.discount || 0;
      totalPrice = totalPrice - (totalPrice * discountValue); // Ensure totalPrice doesn't go below 0

      // Mark discount as used
      await prisma.POINTS_REDEMPTION.update({
        where: { id: unusedDiscount.id },
        data: { status: "USED" },
      });
    }

    // Create a new ORDER_DETAIL
    const newOrderDetail = await prisma.ORDER_DETAIL.create({
      data: {
        user_id,
        price: totalPrice,
        image: result.secure_url,
        status: "Pending", // Default status
      },
    });

    

    // Update all order items to link to the new order detail
    await prisma.ORDER_ITEMS.updateMany({
      where: {
        user_id,
        orderdetail_id: null,
      },
      data: {
        orderdetail_id: newOrderDetail.id,
      },
    });

    const admins = await prisma.USER.findMany({
      where: {
        roles: { some: { roleId: 2 } },
        device_token: { not: null }, // Ensure admin has a push token
      },
      select: { device_token: true },
    });

    const notificationPromises = admins.map((admin) =>
      sendPushNotification(admin.device_token, `A new order has been placed!`)
    );
    await Promise.all(notificationPromises);


    res.status(201).json({
      data: newOrderDetail,
      message: unusedDiscount
        ? "Order successfully checked out with discount applied"
        : "Order successfully checked out",
      status: 201,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};



exports.getOrderDetailItems = async (req, res) => {
  const user_id = req.userId;

  try {
    if (!user_id) {
      return res.status(400).json({
        error: "User ID is required",
        status: 400,
      });
    }

    // Fetch all temporary order items for the user (orderdetail_id: null)
    const orderItems = await prisma.ORDER_ITEMS.findMany({
      where: {
        user_id,
        orderdetail_id: null,
      },
      include: {
        product: true,
      },
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(200).json({
        error: "No items to checkout",
        data:[],
        status: 200,
      });
    }

    // Calculate total price
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

    // Create a new ORDER_DETAIL

    let response = {orderItems , totalPrice}
    res.status(200).json({
      data: response,
      message: "Get Order successfully",
      status: 201,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};


exports.deleteOrderItem = async (req, res) => {
  const user_id = req.userId; // Extract user ID from authenticated token
  const { itemId } = req.params; // Item ID from the request parameters

  try {
    if (!user_id || !itemId) {
      return res.status(400).json({
        error: "User ID and item ID are required",
        status: 400,
      });
    }

    // Check if the item exists and belongs to the user
    const orderItem = await prisma.ORDER_ITEMS.findFirst({
      where: {
        id: parseInt(itemId),
        user_id,
        orderdetail_id: null, // Only items that haven't been checked out can be deleted
      },
    });

    if (!orderItem) {
      return res.status(404).json({
        error: "Order item not found or already checked out",
        status: 404,
      });
    }

    // Delete the order item
    await prisma.ORDER_ITEMS.delete({
      where: {
        id: parseInt(itemId),
      },
    });

    res.status(200).json({
      message: "Order item deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};


exports.updateOrderItem = async (req, res) => {
  const user_id = req.userId; // Extract user ID from authenticated token
  const { itemId } = req.params; // Item ID from the request parameters
  const { quantity } = req.body; // New quantity from the request body

  try {
    if (!user_id || !itemId || quantity === undefined) {
      return res.status(400).json({
        error: "User ID, item ID, and quantity are required",
        status: 400,
      });
    }

    // Ensure quantity is valid
    if (quantity < 1) {
      return res.status(400).json({
        error: "Quantity must be at least 1",
        status: 400,
      });
    }

    // Check if the item exists and belongs to the user
    const orderItem = await prisma.ORDER_ITEMS.findFirst({
      where: {
        id: parseInt(itemId),
        user_id,
        orderdetail_id: null, // Only items that haven't been checked out can be updated
      },
    });

    if (!orderItem) {
      return res.status(404).json({
        error: "Order item not found or already checked out",
        status: 404,
      });
    }

    // Retrieve the unit price of the item
    const { price } = await prisma.PRODUCT.findUnique({
      where: { id: orderItem.product_id }, // Assuming `product_id` exists in ORDER_ITEMS
      select: { price: true },
    });

    if (!price) {
      return res.status(404).json({
        error: "Product not found",
        status: 404,
      });
    }

    // Calculate the new total price
    const newTotalPrice = price * quantity;

    // Update the order item with new quantity and total price
    const updatedOrderItem = await prisma.ORDER_ITEMS.update({
      where: {
        id: parseInt(itemId),
      },
      data: {
        quantity,
        price: newTotalPrice, // Assuming `total_price` is a field in ORDER_ITEMS
      },
    });

    res.status(200).json({
      data: updatedOrderItem,
      message: "Order item updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};



exports.getOrderDetailItems = async (req, res) => {
  const user_id = req.userId;

  try {
    if (!user_id) {
      return res.status(400).json({
        error: "User ID is required",
        status: 400,
      });
    }

    // Fetch all temporary order items for the user (orderdetail_id: null)
    const orderItems = await prisma.ORDER_ITEMS.findMany({
      where: {
        user_id,
        orderdetail_id: null,
      },
      include: {
        product: true,
      },
    });

    if (!orderItems || orderItems.length === 0) {
      return res.status(200).json({
        error: "No items to checkout",
        data:[],
        status: 200,
      });
    }

    // Calculate total price
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

    // Create a new ORDER_DETAIL

    let response = {orderItems , totalPrice}
    res.status(200).json({
      data: response,
      message: "Get Order successfully",
      status: 201,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};


exports.getOrderDetail = async (req, res) => {

  try {

    const orderDetail = await prisma.ORDER_DETAIL.findMany({ orderBy: {
      created_at: 'desc',
    },});

    if (!orderDetail || orderDetail.length === 0) {
      return res.status(200).json({
        error: "No items to orderDetail",
        data:[],
        status: 200,
      });
    }

    res.status(200).json({
      data: orderDetail,
      message: "Get OrderDetail successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};



exports.changeStatusOrderDetail = async (req, res) => {
  try {
    const { idOrder } = req.params; // Extract order ID from request parameters
    const { status } = req.body;   // Extract status from request body

    // Validate status input
    if (![1, 2].includes(status)) {
      return res.status(400).json({
        error: "Invalid status value. Use 1 for Confirm and 2 for Reject.",
        status: 400,
      });
    }

    // Find the order detail by ID
    const orderDetail = await prisma.ORDER_DETAIL.findUnique({
      where: {
        id: parseInt(idOrder),
      },
    });

    // Check if the orderDetail exists
    if (!orderDetail) {
      return res.status(200).json({
        error: "OrderDetail not found",
        status: 404,
      });
    }

    // Update status based on the provided value
    const updatedOrderDetail = await prisma.ORDER_DETAIL.update({
      where: {
        id: parseInt(idOrder),
      },
      data: {
        status: status === 1 ? "Confirm" : "Reject",
      },
    });

    if (parseInt(orderDetail.price) >= 500 && status === 1) {
      const earnedPoints = calculatePoints(parseInt(orderDetail.price));
      await prisma.POINTS.create({
        data: {
          user_id:orderDetail.user_id,
          earned_points: earnedPoints,
          order_id: orderDetail.id,
        },
      });
    }

    res.status(200).json({
      data: updatedOrderDetail,
      message: `OrderDetail status updated to ${status === 1 ? "Confirm" : "Reject"} successfully`,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};


exports.getOrderHistoryByDate = async (req, res) => {
  const { date } = req.query;
  let response = { data: [], status: 200 };
  try {
    if (!date) {
      return res.status(400).json({ error: "date parameter is required (format: DD/MM/YYYY)" });
    }

    const [day, month, year] = date.split("/").map(Number);

    // Convert date to UTC range
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // Start of the day in UTC
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59)); // End of the day in UTC

    // Fetch orders with status "Success" for the exact date
    const orderDetail = await prisma.ORDER_ITEMS.findMany({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include:{
        product:true
      }
    });

    console.log("orderDetail", orderDetail);
    if (orderDetail && orderDetail.length > 0) {
      // Using for...of loop to wait for async operations
      for (const data of orderDetail) {
        if (data) {
          console.log("data",data)
          const order = await prisma.ORDER_DETAIL.findUnique({
            where: {
              id: data?.orderdetail_id,
              status: "Confirm",
            },
          });  
          console.log("orderDetail 2", order);
          if (order) {
            response.data.push(data);
          }
        }
      }
    }

    // Return the filtered orders
    return res.status(response.status).json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.getOrderHistoryByUserId = async (req, res) => {
  const userId = req.userId
  let response = { data: [], status: 200 };
  try {
    // Fetch orders with status "Success" for the exact date
    const orderDetail = await prisma.ORDER_ITEMS.findMany({
      where: {
        user_id: userId
      },
      include:{
        product:true
      },
       orderBy: {
        created_at: 'desc',
      },}
    );

    console.log("orderDetail", orderDetail);
    if (orderDetail && orderDetail.length > 0) {
      // Using for...of loop to wait for async operations
      for (const data of orderDetail) {
        if (data && data?.orderdetail_id) {
          const order = await prisma.ORDER_DETAIL.findUnique({
            where: {
              id: data?.orderdetail_id,
              status: "Confirm",
            },
          });
          console.log("orderDetail 2", order);
          if (order) {
            response.data.push(data);
          }
        }
      }
    }

    // Return the filtered orders
    return res.status(response.status).json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.redeemPoints = async (req, res) => {
  const userId = req.userId;
  const { redeemedPoints } = req.body;

  try {
    // Get all points records for the user
    const userPointsRecords = await prisma.POINTS.findMany({
      where: { user_id: userId },
      select: { id: true, earned_points: true, used_points: true },
    });

    if (!userPointsRecords.length) {
      return res.status(200).json({ error: "User has no points" });
    }

    // Calculate total available points
    const totalEarnedPoints = userPointsRecords.reduce((sum, record) => sum + record.earned_points, 0);
    const totalUsedPoints = userPointsRecords.reduce((sum, record) => sum + record.used_points, 0);
    const availablePoints = totalEarnedPoints - totalUsedPoints;

    if (availablePoints < redeemedPoints) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    // Calculate discount (assuming 10 points = 10% discount)
    const discount = redeemedPoints >= 10 ? 0.1 : 0;

    // Redeem points and create redemption record
    await prisma.POINTS_REDEMPTION.create({
      data: {
        user_id: userId,
        redeemed_points: redeemedPoints,
        discount: discount,
        status: "NOT_USE",
      },
    });

    // Deduct points across multiple records, starting from the oldest
    let remainingPointsToRedeem = redeemedPoints;
    for (const record of userPointsRecords) {
      const recordAvailablePoints = record.earned_points - record.used_points;

      if (remainingPointsToRedeem <= 0) break;

      const pointsToDeduct = Math.min(remainingPointsToRedeem, recordAvailablePoints);

      await prisma.POINTS.update({
        where: { id: record.id },
        data: {
          used_points: { increment: pointsToDeduct },
        },
      });

      remainingPointsToRedeem -= pointsToDeduct;
    }

    return res.status(200).json({
      message: "Points redeemed successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error redeeming points:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.getDiscount = async (req, res) => {
  console.log(":styart")
  const userId = req.userId;

  try {
    // Fetch the latest unused discount for the user
    const unusedDiscount = await prisma.POINTS_REDEMPTION.findFirst({
      where: {
        user_id: userId,
        status: "NOT_USE",
      },
      orderBy: {
        created_at: "desc", // Get the latest unused discount
      },
    });

    if (!unusedDiscount) {
      return res.status(200).json({ message: "No unused discounts found"  ,     discount: 0,
        status: 200,});
    }

    return res.status(200).json({
      message: "Unused discount found",
      discount: unusedDiscount.discount,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching discount:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.applyDiscount = async (req, res) => {
  const userId = req.userId;

  try {
    // Fetch the latest unused discount
    const unusedDiscount = await prisma.POINTS_REDEMPTION.findFirst({
      where: { user_id: userId, status: "NOT_USE" },
    });

    if (!unusedDiscount) {
      return res.status(404).json({ message: "No discount to apply" });
    }

    // Mark discount as used
    await prisma.POINTS_REDEMPTION.update({
      where: { id: unusedDiscount.id },
      data: { status: "USED" },
    });

    return res.status(200).json({ message: "Discount applied successfully" });
  } catch (error) {
    console.error("Error applying discount:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.deleteProduct = async (req, res) => {
  const { productId } = req.params; // Item ID from the request parameters

  try {
    if (!productId) {
      return res.status(400).json({
        error: "productId are required",
        status: 400,
      });
    }

    // Check if the item exists and belongs to the user
    await prisma.PRODUCT.delete({
      where: {
        id: parseInt(productId),
      },
    });


    res.status(200).json({
      message: "Product deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      status: 500,
    });
  }
};



exports.getOrderItemsDetailByOrderId = async (req, res) => {
  try {
      const { orderId } = req.params;
      
      // Fetch order details including user and products
      const orderDetails = await prisma.ORDER_DETAIL.findUnique({
          where: { id: parseInt(orderId) },
          include: {
              order_items: {
                  include: {
                      product: true, // Include product details
                  },
              },
          },
      });

      if (!orderDetails) {
          return res.status(404).json({ message: 'Order not found' });
      }

      // Fetch user details
      const user = await prisma.USER.findUnique({
          where: { id: orderDetails.user_id },
          select: { id: true, name: true, email: true, phone_number: true },
      });

      return res.status(200).json({
          user,
          orderId: orderDetails.id,
          price: orderDetails.price,
          status: orderDetails.status,
          slip : orderDetails.image,
          created_at :orderDetails.created_at,
          products: orderDetails.order_items.map(item => ({
              id: item.product.id,
              name: item.product.name,
              image: item.product.image,
              price: item.product.price,
              quantity: item.quantity,
              sweetness_level: item.sweetness_level,
              note: item.note,
          })),
      });
  } catch (error) {
      console.error('Error fetching order details:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
};








