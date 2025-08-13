class ValidationUtils {
    // Email validation
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone number validation (Indian format)
    static isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/\D/g, '');
        return phoneRegex.test(cleanPhone);
    }

    // International phone validation
    static isValidInternationalPhone(phone) {
        const intlPhoneRegex = /^\+[1-9]\d{1,14}$/;
        return intlPhoneRegex.test(phone);
    }

    // Name validation
    static isValidName(name) {
        if (!name || typeof name !== 'string') return false;
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name.trim());
    }

    // Age validation
    static isValidAge(age) {
        const ageNum = parseInt(age);
        return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120;
    }

    // Date validation (YYYY-MM-DD format)
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
    }

    // Time validation (HH:MM format)
    static isValidTime(timeString) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    // PIN code validation (Indian)
    static isValidPinCode(pinCode) {
        const pinRegex = /^[1-9][0-9]{5}$/;
        return pinRegex.test(pinCode);
    }

    // PAN number validation (Indian)
    static isValidPAN(pan) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan.toUpperCase());
    }

    // Aadhaar number validation (Indian)
    static isValidAadhaar(aadhaar) {
        const aadhaarRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
        const cleanAadhaar = aadhaar.replace(/\s/g, '');
        return aadhaarRegex.test(cleanAadhaar);
    }

    // Vehicle registration number validation (Indian)
    static isValidVehicleNumber(vehicleNumber) {
        const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
        const cleanNumber = vehicleNumber.replace(/\s/g, '').toUpperCase();
        return vehicleRegex.test(cleanNumber);
    }

    // Credit card validation (basic Luhn algorithm)
    static isValidCreditCard(cardNumber) {
        const cleanNumber = cardNumber.replace(/\D/g, '');
        if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

        let sum = 0;
        let isEven = false;

        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber.charAt(i));

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    // CVV validation
    static isValidCVV(cvv) {
        const cvvRegex = /^[0-9]{3,4}$/;
        return cvvRegex.test(cvv);
    }

    // IFSC code validation (Indian)
    static isValidIFSC(ifsc) {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifsc.toUpperCase());
    }

    // GST number validation (Indian)
    static isValidGST(gst) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst.toUpperCase());
    }

    // URL validation
    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Password strength validation
    static isStrongPassword(password) {
        if (password.length < 8) return false;

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }

    // Sanitize input text
    static sanitizeText(text) {
        if (!text || typeof text !== 'string') return '';
        return text.trim().replace(/[<>]/g, '');
    }

    // Validate required fields
    static validateRequiredFields(data, requiredFields) {
        const errors = [];

        for (const field of requiredFields) {
            if (!data[field] || data[field].toString().trim() === '') {
                errors.push(`${field} is required`);
            }
        }

        return errors;
    }

    // Validate form data based on rules
    static validateFormData(data, rules) {
        const errors = {};

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            const fieldErrors = [];

            // Required validation
            if (fieldRules.required && (!value || value.toString().trim() === '')) {
                fieldErrors.push(`${field} is required`);
                continue;
            }

            // Skip other validations if field is empty and not required
            if (!value && !fieldRules.required) continue;

            // Type validations
            if (fieldRules.type === 'email' && !this.isValidEmail(value)) {
                fieldErrors.push(`${field} must be a valid email`);
            }

            if (fieldRules.type === 'phone' && !this.isValidPhone(value)) {
                fieldErrors.push(`${field} must be a valid phone number`);
            }

            if (fieldRules.type === 'number') {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    fieldErrors.push(`${field} must be a number`);
                } else {
                    if (fieldRules.min !== undefined && num < fieldRules.min) {
                        fieldErrors.push(`${field} must be at least ${fieldRules.min}`);
                    }
                    if (fieldRules.max !== undefined && num > fieldRules.max) {
                        fieldErrors.push(`${field} must be at most ${fieldRules.max}`);
                    }
                }
            }

            // Length validations
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters`);
            }

            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                fieldErrors.push(`${field} must be at most ${fieldRules.maxLength} characters`);
            }

            // Pattern validation
            if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                fieldErrors.push(`${field} format is invalid`);
            }

            // Custom validation
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customError = fieldRules.custom(value, data);
                if (customError) fieldErrors.push(customError);
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }

        return errors;
    }

    // Check if validation errors exist
    static hasValidationErrors(errors) {
        return Object.keys(errors).length > 0;
    }

    // Format validation errors for display
    static formatValidationErrors(errors) {
        const messages = [];

        for (const [field, fieldErrors] of Object.entries(errors)) {
            messages.push(`❌ ${fieldErrors.join(', ')}`);
        }

        return messages.join('\n');
    }

    // Validate business hours
    static isWithinBusinessHours(time = new Date()) {
        const hour = time.getHours();
        const day = time.getDay(); // 0 = Sunday, 6 = Saturday

        // Monday to Friday: 9 AM to 6 PM
        // Saturday: 10 AM to 4 PM
        // Sunday: Closed

        if (day === 0) return false; // Sunday

        if (day >= 1 && day <= 5) { // Monday to Friday
            return hour >= 9 && hour < 18;
        }

        if (day === 6) { // Saturday
            return hour >= 10 && hour < 16;
        }

        return false;
    }

    // Validate appointment slot
    static isValidAppointmentSlot(dateTime) {
        const appointmentDate = new Date(dateTime);
        const now = new Date();

        // Must be in future
        if (appointmentDate <= now) return false;

        // Must be within business hours
        if (!this.isWithinBusinessHours(appointmentDate)) return false;

        // Must be within next 30 days
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        if (appointmentDate > maxDate) return false;

        return true;
    }

    // Validate file upload
    static isValidFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
        if (!file) return { valid: false, error: 'No file provided' };

        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
            };
        }

        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `File type must be one of: ${allowedTypes.join(', ')}`
            };
        }

        return { valid: true };
    }

    // Validate coordinates
    static isValidCoordinates(lat, lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        return !isNaN(latitude) &&
            !isNaN(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180;
    }

    // Validate Indian state
    static isValidIndianState(state) {
        const indianStates = [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
            'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
            'Andaman and Nicobar Islands'
        ];

        return indianStates.includes(state);
    }
}

module.exports = ValidationUtils;