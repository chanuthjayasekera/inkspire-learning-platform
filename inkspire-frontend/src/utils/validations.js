export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return {
        isValid: phoneRegex.test(phone),
        error: 'Phone number must be exactly 10 digits'
    };
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: emailRegex.test(email),
        error: 'Please enter a valid email address'
    };
};

export const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return {
        isValid: nameRegex.test(name),
        error: 'Name must be 2-50 characters long and contain only letters'
    };
}; 