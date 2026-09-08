"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError("Invalid email or password.");
        return;
      }

      console.log("Login successful:", data);

      // Save login state
      localStorage.setItem("isLoggedIn", "true");

      // Save token if backend sends one
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Tell other components that login state changed
      window.dispatchEvent(new Event("storage"));

      // Check for redirect query parameter
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/";

      router.push(redirectUrl);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {/* Title */}
        <h1 className="mb-6 text-center text-3xl font-bold">
          Login
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {emailError && (
            <p className="mb-4 text-sm text-red-500">
              {emailError}
            </p>
          )}

          {/* Password */}
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {passwordError && (
            <p className="mb-4 text-sm text-red-500">
              {passwordError}
            </p>
          )}

          {/* Login Error */}
          {loginError && (
            <p className="mb-4 text-center text-sm text-red-500">
              {loginError}
            </p>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          {/* Register Link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}