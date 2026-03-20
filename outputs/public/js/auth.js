/**
 * Authentication Utilities
 * Shared auth functions for login and signup pages
 */

/**
 * Validate email format
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  return password && password.length >= 8;
}

/**
 * Check password strength
 */
function getPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
  
  return strength;
}

/**
 * Get password strength text
 */
function getPasswordStrengthText(strength) {
  if (strength < 25) return 'Weak';
  if (strength < 50) return 'Fair';
  if (strength < 75) return 'Good';
  return 'Strong';
}

/**
 * Get password strength color
 */
function getPasswordStrengthColor(strength) {
  if (strength < 25) return '#ff6b6b';
  if (strength < 50) return '#ffa500';
  if (strength < 75) return '#ffeb3b';
  return '#4caf50';
}

/**
 * Show error message
 */
function showError(element, message) {
  element.textContent = message;
  element.style.display = message ? 'block' : 'none';
}

/**
 * Clear all errors
 */
function clearAllErrors() {
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  
  document.querySelectorAll('.alert').forEach(el => {
    el.style.display = 'none';
  });
}

/**
 * Show loading state
 */
function setLoadingState(button, isLoading) {
  const spinner = button.querySelector('.spinner');
  const text = button.querySelector('span:not(.spinner)');
  
  if (isLoading) {
    button.disabled = true;
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
  } else {
    button.disabled = false;
    if (text) text.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

/**
 * Show success message
 */
function showSuccess(element, message, duration = 3000) {
  element.textContent = message;
  element.style.display = 'block';
  
  if (duration > 0) {
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  }
}

/**
 * Show error alert
 */
function showErrorAlert(element, message) {
  element.textContent = message;
  element.style.display = 'block';
}

/**
 * Check if all required fields are filled
 */
function validateRequiredFields(fields) {
  for (const [fieldId, fieldName] of Object.entries(fields)) {
    const field = document.getElementById(fieldId);
    if (!field || !field.value.trim()) {
      return { valid: false, fieldId, fieldName };
    }
  }
  return { valid: true };
}

/**
 * Common login validation
 */
function validateLoginForm(email, password) {
  const errors = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  }
  
  return errors;
}

/**
 * Common signup validation
 */
function validateSignupForm(name, email, password, confirmPassword, terms) {
  const errors = {};
  
  if (!name || name.trim().length < 2) {
    errors.name = 'Please enter your name';
  }
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (!terms) {
    errors.terms = 'You must agree to the terms';
  }
  
  return errors;
}

/**
 * Display validation errors
 */
function displayValidationErrors(errors) {
  clearAllErrors();
  
  for (const [fieldId, message] of Object.entries(errors)) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
      showError(errorElement, message);
    }
  }
}

export {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthText,
  getPasswordStrengthColor,
  showError,
  clearAllErrors,
  setLoadingState,
  showSuccess,
  showErrorAlert,
  validateRequiredFields,
  validateLoginForm,
  validateSignupForm,
  displayValidationErrors
};
