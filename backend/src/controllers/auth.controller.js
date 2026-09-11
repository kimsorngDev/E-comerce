import * as authService from "../service/auth.service.js";

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    if (err.message === "Email is already registered") err.statusCode = 409;
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({ success: true, message: "Login successful", ...result });
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

export { register, login, getMe };