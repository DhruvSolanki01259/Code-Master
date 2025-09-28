import React, { useState } from "react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "username":
        if (!value.trim()) error = "Username is required";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value))
          error = "Please enter a valid email address";
        break;
      case "password":
        if (!value.trim()) error = "Password is required";
        else if (value.length < 6)
          error = "Password must be at least 6 characters";
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {
      username: validateField("username", formData.username),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };
    setErrors(newErrors);
    setTouched({ username: true, email: true, password: true });
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API
    console.log("Form submitted:", formData);
    alert("Account created successfully!");

    setIsSubmitting(false);
    setFormData({ username: "", email: "", password: "" });
    setTouched({ username: false, email: false, password: false });
    setErrors({ username: "", email: "", password: "" });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg p-6 border-0'>
          <div className='text-center pb-8'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-green-800'>
              Create Account
            </h2>
            <p className='text-green-600'>
              Join us today and get started on your journey
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-6'>
            {/* Username */}
            <div className='space-y-2'>
              <label
                htmlFor='username'
                className='text-green-700 font-medium'>
                Username
              </label>
              <input
                type='text'
                id='username'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder='Enter your username'
                className={`w-full px-4 py-2 rounded-lg transition-all duration-200 border-2 focus:ring-2 focus:ring-green-500/20 ${
                  errors.username
                    ? "border-red-400 focus:border-red-500"
                    : "border-green-200 focus:border-green-500 hover:border-green-300"
                }`}
              />
              {errors.username && (
                <p className='text-red-500 text-sm'>{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className='space-y-2'>
              <label
                htmlFor='email'
                className='text-green-700 font-medium'>
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder='Enter your email'
                className={`w-full px-4 py-2 rounded-lg transition-all duration-200 border-2 focus:ring-2 focus:ring-green-500/20 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500"
                    : "border-green-200 focus:border-green-500 hover:border-green-300"
                }`}
              />
              {errors.email && (
                <p className='text-red-500 text-sm'>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <label
                htmlFor='password'
                className='text-green-700 font-medium'>
                Password
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder='Create a password'
                className={`w-full px-4 py-2 rounded-lg transition-all duration-200 border-2 focus:ring-2 focus:ring-green-500/20 ${
                  errors.password
                    ? "border-red-400 focus:border-red-500"
                    : "border-green-200 focus:border-green-500 hover:border-green-300"
                }`}
              />
              {errors.password && (
                <p className='text-red-500 text-sm'>{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2'>
              {isSubmitting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-green-600'>
            Already have an account?{" "}
            <a
              href='#'
              className='font-medium text-green-700 hover:text-green-800 transition-colors duration-200 hover:underline'>
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
