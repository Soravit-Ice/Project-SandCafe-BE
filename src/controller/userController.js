const { PrismaClient } = require("@prisma/client");
var bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('../config/config.js')
const userClient = new PrismaClient().USER;
const userRolesClient = new PrismaClient().USER_ROLES;
const points = new PrismaClient().POINTS;
const points_redemption = new PrismaClient().POINTS_REDEMPTION;


exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("email",email + password)
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required", status: 400 });
  }

  try {
    const user = await userClient.findUnique({
      where: { email: email },
      include: { roles: { include: { role: true } } }
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, roles: user.roles }, config.secret, { expiresIn: 86400 }); // 24 hours

      // await userClient.update({
      //   where: { id: user.id },
      //   data: { updated_at: new Date() }
      // });

      res.status(200).json({ token: token, email: user.email, roles: user.roles, status: 200 });
    } else {
      res.status(400).json({ error: "Invalid email or password", status: 400 });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};


exports.signup = async (req, res) => {
  const { name, email, password, phone_number, role } = req.body;
  console.log(req.body)
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required", status: 400 });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await userClient.create({
      data: {
        name,
        email,
        phone_number,
        password: hashedPassword,
        roles: {
          create: {
            role: {
              connect: { name: role } // Assuming role name is provided
            }
          }
        }
      }
    });

    res.status(201).json({ message: "User registered successfully", status: 201 });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};


exports.getUserById = async (req, res) => {
  let userId = req.userId

  if (!userId) {
    return res.status(400).json({ error: "userId are required", status: 400 });
  }

  try {

    const user = await userClient.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });

    res.status(200).json({ message: "Get User Success" , data:user , status: 200});
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};


exports.getAllUser = async (req, res) => {
  try {
    const users = await userClient.findMany({
      where: {
        roles: {
          some: {
            roleId: 1, 
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true, 
          },
        },
      },
    });

    res.status(200).json({
      message: "Get Users with Role 1 Success",
      data: users,
      status: 200,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", status: 500 });
  }
};


exports.updateUserById = async (req, res) => {
  const userId = req.userId; 
  const { name, phoneNumber, email } = req.body; 

  if (!userId) {
    return res.status(400).json({ error: "User ID is required", status: 400 });
  }

  try {

    const user = await userClient.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found", status: 404 });
    }


    const updatedUser = await userClient.update({
      where: { id: userId },
      data: {
        name: name || user.name, 
        phone_number: phoneNumber || user.phoneNumber, 
        email: email || user.email, 
      },
    });

    return res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser, status: 200 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error", status: 500 });
  }
};



exports.getPointByUser = async (req, res) => {
  const userId = parseInt(req.userId);

  try {
      // Calculate total earned and redeemed points for the user
      const earnedPoints = await points.aggregate({
          where: {
              user_id: userId,
          },
          _sum: {
              earned_points: true,
          },
      });

      const redeemedPoints = await points_redemption.aggregate({
          where: {
              user_id: userId,
          },
          _sum: {
              redeemed_points: true,
          },
      });

      // Calculate available points
      const totalEarnedPoints = earnedPoints._sum.earned_points || 0;
      const totalRedeemedPoints = redeemedPoints._sum.redeemed_points || 0;
      const availablePoints = totalEarnedPoints - totalRedeemedPoints;

      res.json({data:{
          totalEarnedPoints,
          totalRedeemedPoints,
          availablePoints,
      }});
  } catch (error) {
      console.error('Error fetching user points:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


exports.saveFCMToken = async (req, res) => {
  const { token } = req.body;
  const userId = req.userId;

  try {
    await userClient.update({
      where: { id: userId },
      data: { firebase_token: token },
    });

    return res.status(200).json({ message: "FCM token saved successfully" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return res.status(500).json({ error: "Failed to save FCM token" });
  }
};




