const { PrismaClient } = require("@prisma/client");
var bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('../config/config.js')
const userClient = new PrismaClient().USER;
const userRolesClient = new PrismaClient().USER_ROLES;


exports.login = async (req, res) => {
  const { email, password } = req.body;

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


