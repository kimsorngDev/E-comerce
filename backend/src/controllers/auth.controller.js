import * as authService from "../service/auth.service.js";

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

export {
  register,
  login,
  getMe,
};