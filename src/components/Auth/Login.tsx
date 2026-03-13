import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FiMail } from "react-icons/fi";
import { CiLock } from "react-icons/ci";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import ToastNotification from "../ToastNotification";
import GoogleSignInButton from "./GoogleSignInButton";

export default function Login() {
  const navigate = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState("success");
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (type: string, title: string, message: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      const msg = "Please enter email and password.";
      setErr(msg);
      showToast("error", "Login failed", msg);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password");
      }

      showToast("success", "Welcome back!", "You have logged in successfully.");
      setTimeout(() => {
        navigate.replace("/");
      }, 500);
    } catch (e: any) {
      const msg = e.message || "Something went wrong";
      setErr(msg);
      showToast("error", "Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-[#F7F5F0] py-20 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-[0_6px_28px_rgba(0,0,0,0.08)] border border-gray-200 p-6 sm:p-8">
          {/* Title */}
          <h1 className="text-center text-3xl sm:text-[34px] leading-tight text-[#0a4c4f]">
            Login or Create Account
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Sign in with your email address
          </p>

          {err && (
            <div className="mt-4 mb-2 rounded-md bg-red-50 text-red-700 text-sm p-3">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label className="block mt-6 text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-2 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FiMail className="text-lg" />
              </span>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <label className="block mt-6 text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-2 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <CiLock className="text-lg" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              {/* Eye Icon */}
              <span
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="text-xl" />
                ) : (
                  <AiOutlineEye className="text-xl" />
                )}
              </span>
            </div>

            {/* Continue button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#0b5a5e] text-white font-semibold py-3.5 tracking-wide hover:bg-[#0a4f52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b5a5e] transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-gray-400 text-sm">Or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google Sign-In */}
          <GoogleSignInButton label="Sign in with Google" />

          <p className="text-center text-sm text-gray-600 mt-5 mb-4">
            Don't Have an account{" "}
            <Link href="/register" className="text-teal-700 underline">
              Register
            </Link>
          </p>

          {/* Privacy notice */}
          <p className="text-center text-sm text-gray-600">
            By proceeding, you agree to our{" "}
            <a href="#" className="text-teal-700 underline">
              Privacy policy
            </a>{" "}
            and{" "}
            <a href="#" className="text-teal-700 underline">
              Terms &amp; Conditions
            </a>
          </p>

          {/* Recaptcha note */}
          <p className="mt-6 text-center text-xs text-gray-400">
            This page is protected by reCAPTCHA and is subject to the Google{" "}
            <a href="#" className="underline">
              Privacy policy
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>

      {/* Global Toast for Login */}
      <ToastNotification
        open={toastOpen}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
        duration={3000}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
