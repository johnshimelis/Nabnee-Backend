const validatePassword = (password) => {
  const minLength = 6;
  console.log(
    "DEBUG: Password validation - minLength:",
    minLength,
    "password length:",
    password?.length
  );
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!password || password.length < minLength) {
    const errorMessage = `Password must be at least ${minLength} characters long`;
    console.log("DEBUG: Password validation failed:", errorMessage);
    return {
      isValid: false,
      reason: errorMessage,
    };
  }

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      reason: "Password must contain at least one letter and one number",
    };
  }

  return { isValid: true };
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      reason: "Please enter a valid email address",
    };
  }

  return { isValid: true };
};

module.exports = {
  validatePassword,
  validateEmail,
};
