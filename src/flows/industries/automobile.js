const whatsappService = require('../../services/whatsappService');

class AutomobileFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        switch (step) {
            case 'start':
                return this.showAutomobileWelcome(phone, userSession);

            case 'main_menu':
                return this.handleMainMenu(phone, buttonId, userSession);

                // Test Drive Flow
            case 'test_drive_start':
                return this.startTestDriveFlow(phone, userSession);
            case 'test_drive_model':
                return this.selectTestDriveModel(phone, buttonId, userSession);
            case 'test_drive_form':
                return this.handleTestDriveForm(phone, messageText, buttonId, userSession);
            case 'test_drive_complete':
                return this.completeTestDrive(phone, buttonId, userSession);

                // View Models Flow
            case 'models_start':
                return this.startModelsFlow(phone, userSession);
            case 'models_category':
                return this.selectModelCategory(phone, buttonId, userSession);
            case 'models_complete':
                return this.completeModelsFlow(phone, buttonId, userSession);

                // Service Flow
            case 'service_start':
                return this.startServiceFlow(phone, userSession);
            case 'service_type':
                return this.selectServiceType(phone, buttonId, userSession);
            case 'service_complete':
                return this.completeServiceFlow(phone, buttonId, userSession);

            default:
                return this.showAutomobileWelcome(phone, userSession);
        }
    }

    // Helper function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async showAutomobileWelcome(phone, userSession) {
        // Send showroom image first
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/automobile-showroom.jpg`,
            '🚗 Welcome to Premium Motors!'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const welcomeText = `🚗 *Welcome to AutoBot*\n\n` +
            `Hello ${userSession.name || 'there'}! Welcome to Premium Motors! 🏎️\n\n` +
            `I'm here to help you with:\n` +
            `🚙 New car models & offers\n` +
            `🔧 Service appointments\n` +
            `🚗 Test drive bookings\n\n` +
            `*What brings you here today?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'test_drive', title: '🚗 Test Drive' },
                { id: 'view_models', title: '🚙 View Models' },
                { id: 'service', title: '🔧 Service' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'test_drive':
                return this.startTestDriveFlow(phone, userSession);
            case 'view_models':
                return this.startModelsFlow(phone, userSession);
            case 'service':
                return this.startServiceFlow(phone, userSession);
            case 'back_to_main':
                return { nextFlow: 'main', nextStep: 'welcome' };
            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the available options 👆"
                );
                return { nextStep: 'main_menu' };
        }
    }

    // ==================== TEST DRIVE FLOW ====================
    async startTestDriveFlow(phone, userSession) {
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/test-drive-banner.jpg`,
            '🚗 Book your test drive today!'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const testDriveText = `🚗 *Book Your Test Drive*\n\n` +
            `Experience the thrill before you buy!\n\n` +
            `*Available Models:*\n` +
            `🚗 Hatchbacks - Swift, Baleno\n` +
            `🚙 Sedans - City, Verna\n` +
            `🚐 SUVs - Creta, XUV700\n\n` +
            `*Choose your category:*`;

        await whatsappService.sendButtonMessage(
            phone,
            testDriveText, [
                { id: 'hatchback', title: '🚗 Hatchback' },
                { id: 'sedan', title: '🚙 Sedan' },
                { id: 'suv', title: '🚐 SUV' }
            ]
        );

        return { nextStep: 'test_drive_model' };
    }

    async selectTestDriveModel(phone, buttonId, userSession) {
        const categories = {
            hatchback: {
                title: 'Hatchbacks',
                models: [
                    { id: 'swift', name: 'Swift', price: '₹6.5L' },
                    { id: 'baleno', name: 'Baleno', price: '₹7.2L' }
                ]
            },
            sedan: {
                title: 'Sedans',
                models: [
                    { id: 'city', name: 'City', price: '₹12.5L' },
                    { id: 'verna', name: 'Verna', price: '₹11.8L' }
                ]
            },
            suv: {
                title: 'SUVs',
                models: [
                    { id: 'creta', name: 'Creta', price: '₹15.2L' },
                    { id: 'xuv700', name: 'XUV700', price: '₹18.5L' }
                ]
            }
        };

        const category = categories[buttonId];
        if (!category) {
            await whatsappService.sendTextMessage(phone, "Please select a valid category.");
            return { nextStep: 'test_drive_model' };
        }

        const modelText = `🚗 *${category.title}*\n\n` +
            `Select your model:\n\n` +
            category.models.map(m => `• ${m.name} - ${m.price}`).join('\n');

        const buttons = category.models.map(m => ({
            id: m.id,
            title: m.name
        }));

        await whatsappService.sendButtonMessage(phone, modelText, buttons);

        return {
            nextStep: 'test_drive_form',
            data: { selectedCategory: buttonId, categoryData: category }
        };
    }

    async handleTestDriveForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.testDriveForm) {
            userSession.data = {
                ...(userSession.data || {}),
                testDriveForm: { step: 'model_selected' }
            };
        }

        const form = userSession.data.testDriveForm;

        // Handle model selection
        if (['swift', 'baleno', 'city', 'verna', 'creta', 'xuv700'].includes(buttonId)) {
            form.selectedModel = buttonId;
            form.step = 'collect_name';

            await whatsappService.sendTextMessage(
                phone,
                `✅ *${buttonId.toUpperCase()} Selected*\n\n📝 Please provide your full name:`
            );

            return {
                nextStep: 'test_drive_form',
                data: { testDriveForm: form }
            };
        }

        // Handle form steps
        switch (form.step) {
            case 'collect_name':
                if (!messageText || messageText.length < 2) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid name:"
                    );
                    return { nextStep: 'test_drive_form' };
                }

                form.name = messageText;
                form.step = 'collect_phone';

                await whatsappService.sendTextMessage(
                    phone,
                    "📱 Please provide your phone number:"
                );
                break;

            case 'collect_phone':
                if (!messageText || messageText.length < 10) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid phone number:"
                    );
                    return { nextStep: 'test_drive_form' };
                }

                form.phone = messageText;
                form.step = 'select_date';

                await whatsappService.sendButtonMessage(
                    phone,
                    "📅 When would you like to schedule?", [
                        { id: 'today', title: '📅 Today' },
                        { id: 'tomorrow', title: '📅 Tomorrow' },
                        { id: 'weekend', title: '📅 Weekend' }
                    ]
                );
                break;

            case 'select_date':
                const dateMap = {
                    'today': 'Today',
                    'tomorrow': 'Tomorrow',
                    'weekend': 'This Weekend'
                };

                form.preferredDate = dateMap[buttonId] || 'Today';
                form.step = 'completed';

                return this.completeTestDrive(phone, null, userSession);

            default:
                return { nextStep: 'test_drive_form' };
        }

        return {
            nextStep: 'test_drive_form',
            data: { testDriveForm: form }
        };
    }

    async completeTestDrive(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'view_models':
                    return this.startModelsFlow(phone, userSession);
                case 'book_service':
                    return this.startServiceFlow(phone, userSession);
                case 'auto_menu':
                    return this.showAutomobileWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.testDriveForm;
        const bookingId = `TD${Date.now().toString().slice(-6)}`;

        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/booking-success.jpg`,
            '✅ Test drive booked successfully!'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const confirmationText = `✅ *Test Drive Booked!*\n\n` +
            `*Booking Details:*\n` +
            `👤 Name: ${form.name}\n` +
            `📱 Phone: ${form.phone}\n` +
            `🚗 Model: ${form.selectedModel.toUpperCase()}\n` +
            `📅 Date: ${form.preferredDate}\n` +
            `🆔 ID: ${bookingId}\n\n` +
            `📍 Showroom: MG Road, Bangalore\n` +
            `📞 We'll call you within 2 hours!`;

        await whatsappService.sendTextMessage(phone, confirmationText);

        // Small delay before final buttons
        await this.delay(1000);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'view_models', title: '🚙 View Models' },
                { id: 'auto_menu', title: '🏠 Auto Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'test_drive_complete' };
    }

    // ==================== VIEW MODELS FLOW ====================
    async startModelsFlow(phone, userSession) {
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/car-models-showcase.jpg`,
            '🚙 Explore our latest models!'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const modelsText = `🚙 *Our Latest Models*\n\n` +
            `Discover amazing cars!\n\n` +
            `🎉 *Festival Offers:*\n` +
            `• Cash discount up to ₹50,000\n` +
            `• Exchange bonus up to ₹25,000\n` +
            `• EMI starting ₹8,999/month\n\n` +
            `*Browse by category:*`;

        await whatsappService.sendButtonMessage(
            phone,
            modelsText, [
                { id: 'budget_cars', title: '💰 Budget Cars' },
                { id: 'premium_cars', title: '✨ Premium Cars' },
                { id: 'luxury_cars', title: '👑 Luxury Cars' }
            ]
        );

        return { nextStep: 'models_category' };
    }

    async selectModelCategory(phone, buttonId, userSession) {
        const categories = {
            budget_cars: {
                title: 'Budget Cars (₹5-10L)',
                models: [
                    'Maruti Swift - ₹6.5L',
                    'Tata Tiago - ₹5.8L',
                    'Hyundai Grand i10 - ₹6.2L'
                ]
            },
            premium_cars: {
                title: 'Premium Cars (₹10-20L)',
                models: [
                    'Honda City - ₹12.5L',
                    'Hyundai Creta - ₹15.2L',
                    'Kia Seltos - ₹14.8L'
                ]
            },
            luxury_cars: {
                title: 'Luxury Cars (₹20L+)',
                models: [
                    'BMW 3 Series - ₹45L',
                    'Audi A4 - ₹48L',
                    'Mercedes C-Class - ₹52L'
                ]
            }
        };

        const category = categories[buttonId];
        if (!category) {
            await whatsappService.sendTextMessage(phone, "Please select a valid category.");
            return { nextStep: 'models_category' };
        }

        const categoryText = `🚙 *${category.title}*\n\n` +
            category.models.map((m, i) => `${i + 1}. ${m}`).join('\n') +
            `\n\n*What would you like?*`;

        await whatsappService.sendButtonMessage(
            phone,
            categoryText, [
                { id: 'get_brochure', title: '📄 Get Brochure' },
                { id: 'book_test', title: '🚗 Book Test' },
                { id: 'get_quote', title: '💰 Get Quote' }
            ]
        );

        return { nextStep: 'models_complete' };
    }

    async completeModelsFlow(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'get_brochure':
                await whatsappService.sendTextMessage(
                    phone,
                    `📄 *Brochure Sent!*\n\n` +
                    `✅ Detailed specifications\n` +
                    `✅ Latest prices & offers\n` +
                    `✅ Comparison charts\n\n` +
                    `📧 Also sent to your email!`
                );
                break;

            case 'book_test':
                await whatsappService.sendTextMessage(
                    phone,
                    `🚗 *Redirecting to Test Drive...*`
                );
                // Small delay before redirecting
                await this.delay(1000);
                return this.startTestDriveFlow(phone, userSession);

            case 'get_quote':
                await whatsappService.sendTextMessage(
                    phone,
                    `💰 *Price Quote*\n\n` +
                    `*Best Offers:*\n` +
                    `• On-road price calculation\n` +
                    `• Exchange value estimation\n` +
                    `• Finance options\n\n` +
                    `📞 Sales team will call you!`
                );
                break;

            case 'test_drive':
                return this.startTestDriveFlow(phone, userSession);

            case 'service':
                return this.startServiceFlow(phone, userSession);

            case 'auto_menu':
                return this.showAutomobileWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                break;
        }

        // Small delay before final navigation options
        await this.delay(1000);

        // Always provide navigation options at the end
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'test_drive', title: '🚗 Test Drive' },
                { id: 'auto_menu', title: '🏠 Auto Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'models_complete' };
    }

    // ==================== SERVICE FLOW ====================
    async startServiceFlow(phone, userSession) {
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/car-service-center.jpg`,
            '🔧 Professional car service'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const serviceText = `🔧 *Car Service Booking*\n\n` +
            `Keep your car perfect!\n\n` +
            `*Our Services:*\n` +
            `🔧 Regular maintenance\n` +
            `🛠️ Repairs & diagnostics\n` +
            `🚗 Body work & painting\n\n` +
            `*What type of service?*`;

        await whatsappService.sendButtonMessage(
            phone,
            serviceText, [
                { id: 'regular', title: '🔧 Regular' },
                { id: 'repair', title: '🛠️ Repair' },
                { id: 'emergency', title: '🚨 Emergency' }
            ]
        );

        return { nextStep: 'service_type' };
    }

    async selectServiceType(phone, buttonId, userSession) {
        const serviceTypes = {
            regular: {
                title: 'Regular Service',
                duration: '2-3 hours',
                price: '₹2,500 - ₹5,000'
            },
            repair: {
                title: 'Repair Service',
                duration: '4-8 hours',
                price: '₹1,500 - ₹15,000'
            },
            emergency: {
                title: 'Emergency Service',
                duration: '30 mins - 2 hours',
                price: '₹500 - ₹3,000'
            }
        };

        const service = serviceTypes[buttonId];
        if (!service) {
            await whatsappService.sendTextMessage(phone, "Please select a valid service.");
            return { nextStep: 'service_type' };
        }

        const serviceText = `🔧 *${service.title}*\n\n` +
            `*Duration:* ${service.duration}\n` +
            `*Price:* ${service.price}\n\n` +
            `*Ready to book?*`;

        await whatsappService.sendButtonMessage(
            phone,
            serviceText, [
                { id: 'book_now', title: '✅ Book Now' },
                { id: 'get_quote', title: '💰 Get Quote' },
                { id: 'call_support', title: '📞 Call Support' }
            ]
        );

        return {
            nextStep: 'service_complete',
            data: { selectedService: buttonId, serviceData: service }
        };
    }

    async completeServiceFlow(phone, buttonId, userSession) {
        const serviceData = (userSession.data && userSession.data.serviceData) ? userSession.data.serviceData : null;

        switch (buttonId) {
            case 'book_now':
                const bookingId = `SV${Date.now().toString().slice(-6)}`;

                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Service Booked!*\n\n` +
                    `*Details:*\n` +
                    `🔧 Service: ${serviceData ? serviceData.title : 'Service'}\n` +
                    `⏱️ Duration: ${serviceData ? serviceData.duration : 'TBD'}\n` +
                    `💰 Price: ${serviceData ? serviceData.price : 'TBD'}\n` +
                    `🆔 ID: ${bookingId}\n\n` +
                    `📞 We'll call you to confirm!`
                );
                break;

            case 'get_quote':
                await whatsappService.sendTextMessage(
                    phone,
                    `💰 *Service Quote*\n\n` +
                    `*Estimated Cost:* ${serviceData ? serviceData.price : 'Contact for pricing'}\n` +
                    `*Duration:* ${serviceData ? serviceData.duration : 'Contact for details'}\n\n` +
                    `📞 Team will call you!`
                );
                break;

            case 'call_support':
                await whatsappService.sendTextMessage(
                    phone,
                    `📞 *Service Support*\n\n` +
                    `*Helpline:* 1800-123-SERVICE\n` +
                    `*WhatsApp:* +91 98765 43210\n` +
                    `*Hours:* Mon-Sat 9AM-7PM`
                );
                break;

            case 'test_drive':
                return this.startTestDriveFlow(phone, userSession);

            case 'view_models':
                return this.startModelsFlow(phone, userSession);

            case 'auto_menu':
                return this.showAutomobileWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                break;
        }

        // Small delay before final navigation options
        await this.delay(1000);

        // Always provide navigation options at the end
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'view_models', title: '🚙 View Models' },
                { id: 'auto_menu', title: '🏠 Auto Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'service_complete' };
    }
}

module.exports = new AutomobileFlow();