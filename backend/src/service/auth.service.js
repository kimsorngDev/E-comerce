import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

/**
 * Register a new user
 */
const register = async ({ name, email, password }) => {
  // 1. Validate required fields
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // 2. Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      name: name || null,
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });

  // 5. Never return password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};


/**
 * Login user
 */
const login = async ({ email, password }) => {
  // 1. Validate required fields
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // 2. Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  // Don't reveal whether the email exists
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 3. Compare entered password with hashed password
  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  // 4. Create JWT (include role so middleware can read it without DB query)
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  // 5. Return user information + token
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};


export {
  register,
  login,
};