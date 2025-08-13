// Application Constants
const CONSTANTS = {
    // Flow Types
    FLOWS: {
        MAIN: 'main',
        EDUCATION: 'education',
        AUTOMOBILE: 'automobile',
        ECOMMERCE: 'ecommerce',
        APPOINTMENTS: 'appointments',
        FEEDBACK: 'feedback',
        CONSTRUCTION: 'construction',
        SALES: 'sales',
        SUPPORT: 'support',
        JEWELLERY: 'jewellery',
        TRAVEL: 'travel'
    },

    // Message Types
    MESSAGE_TYPES: {
        TEXT: 'text',
        BUTTON: 'button',
        LIST: 'list',
        IMAGE: 'image',
        DOCUMENT: 'document',
        AUDIO: 'audio',
        VIDEO: 'video',
        LOCATION: 'location',
        CONTACT: 'contact',
        TEMPLATE: 'template'
    },

    // Session Status
    SESSION_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        EXPIRED: 'expired',
        BLOCKED: 'blocked'
    },

    // User Roles
    USER_ROLES: {
        CUSTOMER: 'customer',
        ADMIN: 'admin',
        AGENT: 'agent',
        MANAGER: 'manager'
    },

    // Order Status
    ORDER_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        PROCESSING: 'processing',
        SHIPPED: 'shipped',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled',
        RETURNED: 'returned',
        REFUNDED: 'refunded'
    },

    // Appointment Status
    APPOINTMENT_STATUS: {
        SCHEDULED: 'scheduled',
        CONFIRMED: 'confirmed',
        RESCHEDULED: 'rescheduled',
        CANCELLED: 'cancelled',
        COMPLETED: 'completed',
        NO_SHOW: 'no_show'
    },

    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'pending',
        PROCESSING: 'processing',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded'
    },

    // Priority Levels
    PRIORITY: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        URGENT: 'urgent',
        CRITICAL: 'critical'
    },

    // Support Ticket Status
    TICKET_STATUS: {
        OPEN: 'open',
        IN_PROGRESS: 'in_progress',
        PENDING_CUSTOMER: 'pending_customer',
        RESOLVED: 'resolved',
        CLOSED: 'closed',
        ESCALATED: 'escalated'
    },

    // Lead Status
    LEAD_STATUS: {
        NEW: 'new',
        CONTACTED: 'contacted',
        QUALIFIED: 'qualified',
        PROPOSAL: 'proposal',
        NEGOTIATION: 'negotiation',
        WON: 'won',
        LOST: 'lost'
    },

    // Vehicle Types
    VEHICLE_TYPES: {
        HATCHBACK: 'hatchback',
        SEDAN: 'sedan',
        SUV: 'suv',
        MUV: 'muv',
        LUXURY: 'luxury',
        SPORTS: 'sports',
        ELECTRIC: 'electric'
    },

    // Fuel Types
    FUEL_TYPES: {
        PETROL: 'petrol',
        DIESEL: 'diesel',
        CNG: 'cng',
        ELECTRIC: 'electric',
        HYBRID: 'hybrid'
    },

    // Transmission Types
    TRANSMISSION_TYPES: {
        MANUAL: 'manual',
        AUTOMATIC: 'automatic',
        CVT: 'cvt',
        AMT: 'amt'
    },

    // Education Levels
    EDUCATION_LEVELS: {
        PRIMARY: 'primary',
        SECONDARY: 'secondary',
        HIGHER_SECONDARY: 'higher_secondary',
        UNDERGRADUATE: 'undergraduate',
        POSTGRADUATE: 'postgraduate',
        DOCTORATE: 'doctorate',
        DIPLOMA: 'diploma',
        CERTIFICATE: 'certificate'
    },

    // Course Types
    COURSE_TYPES: {
        FULL_TIME: 'full_time',
        PART_TIME: 'part_time',
        ONLINE: 'online',
        HYBRID: 'hybrid',
        WEEKEND: 'weekend',
        EVENING: 'evening'
    },

    // Property Types
    PROPERTY_TYPES: {
        RESIDENTIAL: 'residential',
        COMMERCIAL: 'commercial',
        INDUSTRIAL: 'industrial',
        AGRICULTURAL: 'agricultural',
        PLOT: 'plot'
    },

    // Construction Types
    CONSTRUCTION_TYPES: {
        NEW_CONSTRUCTION: 'new_construction',
        RENOVATION: 'renovation',
        EXTENSION: 'extension',
        REPAIR: 'repair',
        MAINTENANCE: 'maintenance'
    },

    // Jewellery Categories
    JEWELLERY_CATEGORIES: {
        GOLD: 'gold',
        SILVER: 'silver',
        DIAMOND: 'diamond',
        PLATINUM: 'platinum',
        GEMSTONE: 'gemstone',
        ARTIFICIAL: 'artificial'
    },

    // Jewellery Types
    JEWELLERY_TYPES: {
        RING: 'ring',
        NECKLACE: 'necklace',
        EARRINGS: 'earrings',
        BRACELET: 'bracelet',
        PENDANT: 'pendant',
        CHAIN: 'chain',
        BANGLES: 'bangles',
        ANKLET: 'anklet'
    },

    // Travel Types
    TRAVEL_TYPES: {
        DOMESTIC: 'domestic',
        INTERNATIONAL: 'international',
        BUSINESS: 'business',
        LEISURE: 'leisure',
        ADVENTURE: 'adventure',
        PILGRIMAGE: 'pilgrimage'
    },

    // Booking Status
    BOOKING_STATUS: {
        ENQUIRY: 'enquiry',
        QUOTATION: 'quotation',
        CONFIRMED: 'confirmed',
        PAID: 'paid',
        CANCELLED: 'cancelled',
        COMPLETED: 'completed'
    },

    // Travel Class
    TRAVEL_CLASS: {
        ECONOMY: 'economy',
        PREMIUM_ECONOMY: 'premium_economy',
        BUSINESS: 'business',
        FIRST: 'first'
    },

    // Hotel Categories
    HOTEL_CATEGORIES: {
        BUDGET: 'budget',
        STANDARD: 'standard',
        DELUXE: 'deluxe',
        LUXURY: 'luxury',
        PREMIUM: 'premium'
    },

    // Room Types
    ROOM_TYPES: {
        SINGLE: 'single',
        DOUBLE: 'double',
        TWIN: 'twin',
        TRIPLE: 'triple',
        SUITE: 'suite',
        FAMILY: 'family'
    },

    // Notification Types
    NOTIFICATION_TYPES: {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error',
        REMINDER: 'reminder',
        PROMOTIONAL: 'promotional'
    },

    // File Types
    FILE_TYPES: {
        IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        VIDEO: ['video/mp4', 'video/avi', 'video/mov']
    },

    // Response Templates
    RESPONSES: {
        WELCOME: {
            GENERAL: "🙏 Welcome! I'm here to help you. How can I assist you today?",
            RETURNING: "Welcome back! How can I help you today?",
            BUSINESS_HOURS: "Welcome! Please note our business hours are 9 AM to 6 PM, Monday to Saturday."
        },

        ERRORS: {
            INVALID_INPUT: "❌ Invalid input. Please try again.",
            SESSION_EXPIRED: "⏰ Your session has expired. Please start over.",
            TECHNICAL_ERROR: "🔧 Technical error occurred. Please try again later.",
            UNAUTHORIZED: "🚫 You're not authorized to perform this action.",
            NOT_FOUND: "❓ Requested information not found.",
            RATE_LIMIT: "⚠️ Too many requests. Please wait a moment."
        },

        SUCCESS: {
            SAVED: "✅ Information saved successfully!",
            UPDATED: "✅ Updated successfully!",
            DELETED: "✅ Deleted successfully!",
            SENT: "✅ Sent successfully!",
            COMPLETED: "✅ Process completed successfully!"
        },

        CONFIRMATION: {
            DELETE: "⚠️ Are you sure you want to delete this?",
            CANCEL: "⚠️ Are you sure you want to cancel?",
            PROCEED: "Do you want to proceed?",
            SAVE: "Do you want to save these changes?"
        }
    },

    // Business Hours
    BUSINESS_HOURS: {
        MONDAY: { start: '09:00', end: '18:00' },
        TUESDAY: { start: '09:00', end: '18:00' },
        WEDNESDAY: { start: '09:00', end: '18:00' },
        THURSDAY: { start: '09:00', end: '18:00' },
        FRIDAY: { start: '09:00', end: '18:00' },
        SATURDAY: { start: '10:00', end: '16:00' },
        SUNDAY: { start: null, end: null } // Closed
    },

    // Time Slots
    TIME_SLOTS: {
        MORNING: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
        AFTERNOON: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
        EVENING: ['15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
    },

    // Indian States
    INDIAN_STATES: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
        'Andaman and Nicobar Islands'
    ],

    // Major Cities
    MAJOR_CITIES: [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai',
        'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
        'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
        'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'
    ],

    // Languages
    LANGUAGES: {
        ENGLISH: 'en',
        HINDI: 'hi',
        BENGALI: 'bn',
        TELUGU: 'te',
        MARATHI: 'mr',
        TAMIL: 'ta',
        GUJARATI: 'gu',
        URDU: 'ur',
        KANNADA: 'kn',
        ODIA: 'or',
        MALAYALAM: 'ml',
        PUNJABI: 'pa'
    },

    // Currencies
    CURRENCIES: {
        INR: 'INR',
        USD: 'USD',
        EUR: 'EUR',
        GBP: 'GBP',
        AED: 'AED',
        SGD: 'SGD'
    },

    // Payment Methods
    PAYMENT_METHODS: {
        CASH: 'cash',
        CARD: 'card',
        UPI: 'upi',
        NET_BANKING: 'net_banking',
        WALLET: 'wallet',
        EMI: 'emi',
        COD: 'cod'
    },

    // Rating Scale
    RATING_SCALE: {
        EXCELLENT: 5,
        GOOD: 4,
        AVERAGE: 3,
        POOR: 2,
        VERY_POOR: 1
    },

    // NPS Categories
    NPS_CATEGORIES: {
        PROMOTER: 'promoter',
        PASSIVE: 'passive',
        DETRACTOR: 'detractor'
    },

    // Age Groups
    AGE_GROUPS: {
        CHILD: '0-12',
        TEEN: '13-19',
        YOUNG_ADULT: '20-35',
        MIDDLE_AGED: '36-55',
        SENIOR: '56+'
    },

    // Gender Options
    GENDER: {
        MALE: 'male',
        FEMALE: 'female',
        OTHER: 'other',
        PREFER_NOT_TO_SAY: 'prefer_not_to_say'
    },

    // Marital Status
    MARITAL_STATUS: {
        SINGLE: 'single',
        MARRIED: 'married',
        DIVORCED: 'divorced',
        WIDOWED: 'widowed'
    },

    // Employment Status
    EMPLOYMENT_STATUS: {
        EMPLOYED: 'employed',
        UNEMPLOYED: 'unemployed',
        SELF_EMPLOYED: 'self_employed',
        STUDENT: 'student',
        RETIRED: 'retired'
    },

    // Income Ranges
    INCOME_RANGES: {
        BELOW_2L: 'below_2_lakhs',
        '2L_5L': '2_to_5_lakhs',
        '5L_10L': '5_to_10_lakhs',
        '10L_20L': '10_to_20_lakhs',
        '20L_50L': '20_to_50_lakhs',
        ABOVE_50L: 'above_50_lakhs'
    },

    // Communication Preferences
    COMMUNICATION_PREFERENCES: {
        WHATSAPP: 'whatsapp',
        SMS: 'sms',
        EMAIL: 'email',
        PHONE: 'phone',
        IN_PERSON: 'in_person'
    },

    // Urgency Levels
    URGENCY_LEVELS: {
        IMMEDIATE: 'immediate',
        WITHIN_24_HOURS: 'within_24_hours',
        WITHIN_WEEK: 'within_week',
        WITHIN_MONTH: 'within_month',
        NO_RUSH: 'no_rush'
    },

    // Budget Ranges
    BUDGET_RANGES: {
        BELOW_10K: 'below_10k',
        '10K_25K': '10k_to_25k',
        '25K_50K': '25k_to_50k',
        '50K_1L': '50k_to_1_lakh',
        '1L_5L': '1_lakh_to_5_lakhs',
        '5L_10L': '5_lakhs_to_10_lakhs',
        ABOVE_10L: 'above_10_lakhs'
    },

    // Experience Levels
    EXPERIENCE_LEVELS: {
        BEGINNER: 'beginner',
        INTERMEDIATE: 'intermediate',
        ADVANCED: 'advanced',
        EXPERT: 'expert'
    },

    // Skill Levels
    SKILL_LEVELS: {
        BASIC: 'basic',
        INTERMEDIATE: 'intermediate',
        ADVANCED: 'advanced',
        PROFESSIONAL: 'professional'
    },

    // Availability
    AVAILABILITY: {
        IMMEDIATE: 'immediate',
        WITHIN_WEEK: 'within_week',
        WITHIN_MONTH: 'within_month',
        FLEXIBLE: 'flexible'
    },

    // Social Media Platforms
    SOCIAL_PLATFORMS: {
        FACEBOOK: 'facebook',
        INSTAGRAM: 'instagram',
        TWITTER: 'twitter',
        LINKEDIN: 'linkedin',
        YOUTUBE: 'youtube',
        WHATSAPP: 'whatsapp'
    },

    // Regex Patterns
    REGEX: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^[6-9]\d{9}$/,
        PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        AADHAAR: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
        PINCODE: /^[1-9][0-9]{5}$/,
        IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
        GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        VEHICLE_NUMBER: /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/
    },

    // API Endpoints
    API_ENDPOINTS: {
        WHATSAPP: {
            SEND_MESSAGE: '/messages',
            SEND_MEDIA: '/media',
            WEBHOOK: '/webhook'
        },
        PAYMENT: {
            CREATE_ORDER: '/orders',
            VERIFY_PAYMENT: '/verify',
            REFUND: '/refunds'
        }
    },

    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    },

    // Cache Keys
    CACHE_KEYS: {
        USER_SESSION: 'user_session:',
        PRODUCT_CATALOG: 'product_catalog',
        BUSINESS_HOURS: 'business_hours',
        RATE_LIMIT: 'rate_limit:'
    },

    // Cache TTL (in seconds)
    CACHE_TTL: {
        SHORT: 300, // 5 minutes
        MEDIUM: 1800, // 30 minutes
        LONG: 3600, // 1 hour
        VERY_LONG: 86400 // 24 hours
    },

    // Rate Limits
    RATE_LIMITS: {
        MESSAGES_PER_MINUTE: 60,
        MESSAGES_PER_HOUR: 1000,
        MESSAGES_PER_DAY: 10000
    },

    // File Size Limits (in bytes)
    FILE_SIZE_LIMITS: {
        IMAGE: 5 * 1024 * 1024, // 5MB
        DOCUMENT: 10 * 1024 * 1024, // 10MB
        AUDIO: 16 * 1024 * 1024, // 16MB
        VIDEO: 64 * 1024 * 1024 // 64MB
    },

    // Session Timeouts (in milliseconds)
    SESSION_TIMEOUTS: {
        INACTIVE: 30 * 60 * 1000, // 30 minutes
        ABSOLUTE: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Retry Configuration
    RETRY_CONFIG: {
        MAX_ATTEMPTS: 3,
        INITIAL_DELAY: 1000,
        MAX_DELAY: 10000,
        BACKOFF_FACTOR: 2
    },

    // Webhook Events
    WEBHOOK_EVENTS: {
        MESSAGE_RECEIVED: 'message_received',
        MESSAGE_DELIVERED: 'message_delivered',
        MESSAGE_READ: 'message_read',
        STATUS_UPDATE: 'status_update'
    },

    // Log Levels
    LOG_LEVELS: {
        ERROR: 'error',
        WARN: 'warn',
        INFO: 'info',
        DEBUG: 'debug'
    },

    // Environment Types
    ENVIRONMENTS: {
        DEVELOPMENT: 'development',
        STAGING: 'staging',
        PRODUCTION: 'production'
    }
};

module.exports = CONSTANTS;