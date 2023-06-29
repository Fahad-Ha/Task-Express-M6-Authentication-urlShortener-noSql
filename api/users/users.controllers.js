const User = require("../../db/models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_EXPIRATION, SECRET_KEY } = require("../../config/keys");

const generateToken = (user) => {
  const payload = {
    _id: user._id,
    username: user.username,
  };
  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: JWT_EXPIRATION,
  });
  return token;
};

exports.signin = async (req, res, next) => {
  try {
    const { user } = req;
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json("Server Error");
  }
};

exports.signup = async (req, res, next) => {
  const { password } = req.body;
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.body.password = hashedPassword;
    const newUser = await User.create(req.body);
    const token = generateToken(newUser);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json("Server Error");
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate("urls");
    res.status(201).json(users);
  } catch (err) {
    res.status(500).json("Server Error");
  }
};
