const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("./model/user");
const bcrypt = require("bcrypt");
const errorMiddleware = require("./errorMiddleware");

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database running"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Welcome to the MERN stack backend!");
});

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied, no token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(decoded, "decoded", req.user);
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token." });
  }
};

app.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    console.log(user, "user register");
    if (user) {
      return res.status(400).json({ msg: "User already registered" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    user = new User({ name, email, password: hashPassword });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User registered successfully", data: user, token });
  } catch (error) {
    next(error)
    // if (error instanceof mongoose.Error.ValidationError) {
    //   return res.status(400).json({
    //     message: error.message,
    //     errors: error.errors,
    //   });
    // }
    // res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 1000,
    });
    //   res.header('Authorization', token).json({ token });
    res.json({ message: "User login successfully", data: user, token });
  } catch (error) {
    next(error);
  }
});

app.post("/users", async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

app.get("/protected", authenticateToken, (req, res) => {
  res.send("This is a protected route, accessible only with a valid token.");
});

app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
