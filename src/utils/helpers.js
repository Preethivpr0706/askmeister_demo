const crypto = require('crypto');

class HelperUtils {
    // Session storage (in-memory for demo - use Redis/Database in production)
    static userSessions = new Map();

    // Generate random ID
    static generateId(length = 8) {
        return crypto.randomBytes(length).toString('hex').toUpperCase();
    }

    // Generate OTP
    static generateOTP(length = 6) {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }
        return otp;
    }

    // Session Management Functions
    static saveUserSession(userId, sessionData) {
        try {
            this.userSessions.set(userId, {
                ...sessionData,
                lastActivity: new Date().toISOString()
            });
            console.log(`Session saved for user: ${userId}`);
            return true;
        } catch (error) {
            console.error('Error saving user session:', error);
            return false;
        }
    }

    static getUserSession(userId) {
        try {
            const session = this.userSessions.get(userId);

            if (!session) {
                return null;
            }

            // Check if session is expired (24 hours)
            const lastActivity = new Date(session.lastActivity);
            const now = new Date();
            const hoursDiff = (now - lastActivity) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                this.userSessions.delete(userId);
                return null;
            }

            return session;
        } catch (error) {
            console.error('Error getting user session:', error);
            return null;
        }
    }

    static deleteUserSession(userId) {
        try {
            this.userSessions.delete(userId);
            console.log(`Session deleted for user: ${userId}`);
            return true;
        } catch (error) {
            console.error('Error deleting user session:', error);
            return false;
        }
    }

    static async updateUserSession(userId, updateData) {
        try {
            const existingSession = this.getUserSession(userId);
            if (!existingSession) {
                return false;
            }

            const updatedSession = {
                ...existingSession,
                ...updateData,
                lastActivity: new Date().toISOString()
            };

            this.userSessions.set(userId, updatedSession);
            await this.saveUserSession(userId, updatedSession);
            console.log(`Session updated for user: ${userId}`);
            return true;
        } catch (error) {
            console.error('Error updating user session:', error);
            return false;
        }
    }

    static getAllActiveSessions() {
        const now = new Date();
        const activeSessions = [];

        for (const [userId, session] of this.userSessions.entries()) {
            const lastActivity = new Date(session.lastActivity);
            const hoursDiff = (now - lastActivity) / (1000 * 60 * 60);

            if (hoursDiff <= 24) {
                activeSessions.push({ userId, ...session });
            } else {
                // Clean up expired sessions
                this.userSessions.delete(userId);
            }
        }

        return activeSessions;
    }

    // Format phone number
    static formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return `+${cleaned}`;
        } else if (cleaned.length === 13 && cleaned.startsWith('91')) {
            return `+${cleaned}`;
        }

        return phone;
    }

    // Format currency (Indian Rupees)
    static formatCurrency(amount, currency = 'INR') {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

        return formatter.format(amount);
    }

    // Format date
    static formatDate(date, format = 'DD/MM/YYYY') {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD MMM YYYY':
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                return `${day} ${months[d.getMonth()]} ${year}`;
            default:
                return d.toLocaleDateString('en-IN');
        }
    }

    // Format time
    static formatTime(date, format = '12') {
        const d = new Date(date);

        if (format === '24') {
            return d.toLocaleTimeString('en-IN', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return d.toLocaleTimeString('en-IN', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit'
            });
        }
    }

    // Calculate age from date of birth
    static calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    // Calculate distance between two coordinates (Haversine formula)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }

    // Convert degrees to radians
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Capitalize first letter of each word
    static capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    // Generate slug from text
    static generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }

    // Truncate text
    static truncateText(text, maxLength = 100, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Check if object is empty
    static isEmpty(obj) {
        if (obj == null) return true;
        if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
        return Object.keys(obj).length === 0;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Generate random color
    static generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    // Convert file size to human readable format
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Generate QR code data URL
    static generateQRCodeURL(text) {
        const baseURL = 'https://api.qrserver.com/v1/create-qr-code/';
        const params = new URLSearchParams({
            size: '200x200',
            data: text,
            format: 'png'
        });

        return baseURL + '?' + params.toString();
    }

    // Extract domain from URL
    static extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return null;
        }
    }

    // Generate password
    static generatePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        return password;
    }

    // Check if date is today
    static isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);

        return checkDate.getDate() === today.getDate() &&
            checkDate.getMonth() === today.getMonth() &&
            checkDate.getFullYear() === today.getFullYear();
    }

    // Check if date is tomorrow
    static isTomorrow(date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const checkDate = new Date(date);

        return checkDate.getDate() === tomorrow.getDate() &&
            checkDate.getMonth() === tomorrow.getMonth() &&
            checkDate.getFullYear() === tomorrow.getFullYear();
    }

    // Get relative time (e.g., "2 hours ago")
    static getRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, seconds] of Object.entries(intervals)) {
            const interval = Math.floor(diffInSeconds / seconds);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    // Mask sensitive data
    static maskData(data, type = 'default') {
        if (!data) return data;

        switch (type) {
            case 'email':
                const [username, domain] = data.split('@');
                return username.charAt(0) + '*'.repeat(username.length - 2) +
                    username.charAt(username.length - 1) + '@' + domain;

            case 'phone':
                return data.substring(0, 2) + '*'.repeat(data.length - 4) +
                    data.substring(data.length - 2);

            case 'card':
                return '*'.repeat(data.length - 4) + data.substring(data.length - 4);

            default:
                return '*'.repeat(data.length);
        }
    }

    // Generate referral code
    static generateReferralCode(name, length = 8) {
        const namePrefix = name.substring(0, 3).toUpperCase();
        const randomSuffix = this.generateId(length - 3);
        return namePrefix + randomSuffix;
    }

    // Calculate percentage
    static calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    // Generate star rating display
    static generateStarRating(rating, maxStars = 5) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

        return '⭐'.repeat(fullStars) +
            (hasHalfStar ? '⭐' : '') +
            '☆'.repeat(emptyStars);
    }

    // Convert text to title case
    static toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    // Remove duplicates from array
    static removeDuplicates(array, key = null) {
        if (key) {
            return array.filter((item, index, self) =>
                index === self.findIndex(t => t[key] === item[key])
            );
        }
        return [...new Set(array)];
    }

    // Sort array of objects
    static sortByKey(array, key, order = 'asc') {
        return array.sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    }

    // Group array by key
    static groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    }

    // Retry function with exponential backoff
    static async retry(fn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    // Sleep function
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Check if string contains only numbers
    static isNumeric(str) {
        return /^\d+$/.test(str);
    }

    // Check if string contains only alphabets
    static isAlpha(str) {
        return /^[a-zA-Z]+$/.test(str);
    }

    // Check if string is alphanumeric
    static isAlphaNumeric(str) {
        return /^[a-zA-Z0-9]+$/.test(str);
    }

    // Generate UUID v4
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

module.exports = HelperUtils;