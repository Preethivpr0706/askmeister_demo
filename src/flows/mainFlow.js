const whatsappService = require('../services/whatsappService');
const CONSTANTS = require('../utils/constants');

class MainFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        console.log(`MainFlow processing step: ${step}, buttonId: ${buttonId}`);

        switch (step) {
            case 'welcome':
                return await this.sendWelcomeMessage(phone, userSession);

            case 'main_menu':
                return await this.handleMainMenu(phone, buttonId, userSession);

            case 'demo_booking':
                return await this.handleDemoBooking(phone, messageText, buttonId, userSession);

            case 'demo_form':
                return await this.handleDemoForm(phone, messageText, buttonId, userSession);

            case 'demo_complete':
                return await this.handleDemoComplete(phone, buttonId, userSession);

            case 'industry_selection':
                return await this.handleIndustrySelection(phone, buttonId, userSession);

            case 'support_menu':
                return await this.handleSupportMenu(phone, buttonId, userSession);

            default:
                return await this.sendWelcomeMessage(phone, userSession);
        }
    }

    async sendWelcomeMessage(phone, userSession) {
        let welcomeText = `🙏 Welcome to AskMeister!\n\n`;

        if (userSession && userSession.name) {
            welcomeText = `🙏 Welcome ${userSession.name}!\n\n`;
        }

        welcomeText += `I'm your WhatsApp Business Assistant. How can I help you today?\n\n` +
            `*Choose an option below:*`;

        const mainMenuButtons = [
            { id: 'book_demo', title: '📞 Book Demo' },
            { id: 'case_studies', title: '📁 Case Studies' },
            { id: 'support', title: '🎧 Support' }
        ];

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText,
            mainMenuButtons
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        console.log(`Handling main menu with buttonId: ${buttonId}`);

        switch (buttonId) {
            case 'book_demo':
                return await this.handleBookDemo(phone, userSession);

            case 'case_studies':
                return await this.showCaseStudies(phone, userSession);

            case 'support':
                // FIXED: Direct transition to support flow
                console.log('Transitioning to support flow from main menu');
                return {
                    nextFlow: 'support',
                    nextStep: 'start',
                    data: { supportType: 'general', fromMainMenu: true }
                };

            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the options from the menu above 👆"
                );
                return { nextStep: 'main_menu' };
        }
    }

    async handleBookDemo(phone, userSession) {
        const userName = userSession ? userSession.name : 'there';

        const demoText = `📞 *Book a Demo with AskMeister*\n\n` +
            `Great choice, ${userName}! 🎉\n\n` +
            `Our WhatsApp Business solutions have helped 500+ businesses:\n\n` +
            `✅ Increase customer engagement by 300%\n` +
            `✅ Reduce response time to under 30 seconds\n` +
            `✅ Automate 80% of customer queries\n` +
            `✅ Boost sales conversion by 45%\n\n` +
            `*Choose your preferred way to book:*`;

        const demoButtons = [
            { id: 'call_now', title: '📞 Call Now' },
            { id: 'schedule_demo', title: '📅 Schedule Demo' },
            { id: 'back_menu', title: '🔙 Back to Menu' }
        ];

        await whatsappService.sendButtonMessage(
            phone,
            demoText,
            demoButtons
        );

        return { nextStep: 'demo_booking' };
    }

    async handleDemoBooking(phone, messageText, buttonId, userSession) {
        console.log(`Demo booking action: ${buttonId}`);

        switch (buttonId) {
            case 'call_now':
                await whatsappService.sendTextMessage(
                    phone,
                    `📞 *Call Now*\n\n` +
                    `Please call us at: +91-XXXXXXXXXX\n\n` +
                    `Our team is available:\n` +
                    `⏰ Mon-Fri: 9 AM - 6 PM IST\n` +
                    `⏰ Sat: 10 AM - 4 PM IST\n\n` +
                    `We'll be happy to give you a personalized demo!`
                );

                // Show navigation options
                await whatsappService.sendButtonMessage(
                    phone,
                    "*What would you like to do next?*", [
                        { id: 'case_studies', title: '📁 Case Studies' },
                        { id: 'schedule_demo', title: '📅 Schedule Demo' },
                        { id: 'main_menu', title: '🔙 Main Menu' }
                    ]
                );

                return { nextStep: 'demo_complete' };

            case 'schedule_demo':
                console.log('Starting demo scheduling form');
                return await this.startDemoForm(phone, userSession);

            case 'back_menu':
                // FIXED: Actually send the welcome message instead of just changing step
                return await this.sendWelcomeMessage(phone, userSession);

            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the options above."
                );
                return { nextStep: 'demo_booking' };
        }
    }

    // ==================== DEMO SCHEDULING FORM ====================
    async startDemoForm(phone, userSession) {
        // Initialize demo form
        if (!userSession.data) {
            userSession.data = {};
        }

        userSession.data.demoForm = {
            step: 'collect_name',
            type: 'demo'
        };

        await whatsappService.sendTextMessage(
            phone,
            `📅 *Schedule Demo*\n\n` +
            `Let's get you set up for a personalized demo!\n\n` +
            `📝 Please provide your full name:`
        );

        return {
            nextStep: 'demo_form',
            data: userSession.data
        };
    }

    async handleDemoForm(phone, messageText, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'back_menu':
                case 'main_menu':
                    // FIXED: Actually send the welcome message instead of just changing step
                    return await this.sendWelcomeMessage(phone, userSession);
                case 'case_studies':
                    return await this.showCaseStudies(phone, userSession);
                default:
                    break;
            }
        }

        // Initialize form if not exists
        if (!userSession.data || !userSession.data.demoForm) {
            return await this.startDemoForm(phone, userSession);
        }

        const form = userSession.data.demoForm;

        switch (form.step) {
            case 'collect_name':
                if (!messageText || messageText.length < 2) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid name:"
                    );
                    return { nextStep: 'demo_form' };
                }

                form.name = messageText;
                form.step = 'collect_email';

                await whatsappService.sendTextMessage(
                    phone,
                    "📧 Great! Please provide your email address:"
                );
                break;

            case 'collect_email':
                if (!messageText || !messageText.includes('@')) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid email address:"
                    );
                    return { nextStep: 'demo_form' };
                }

                form.email = messageText;
                form.step = 'collect_company';

                await whatsappService.sendTextMessage(
                    phone,
                    "🏢 Please provide your company name:"
                );
                break;

            case 'collect_company':
                if (!messageText || messageText.length < 2) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide your company name:"
                    );
                    return { nextStep: 'demo_form' };
                }

                form.company = messageText;
                form.step = 'select_time';

                await whatsappService.sendButtonMessage(
                    phone,
                    "📅 When would you prefer the demo?", [
                        { id: 'today', title: '📅 Today' },
                        { id: 'tomorrow', title: '📅 Tomorrow' },
                        { id: 'this_week', title: '📅 This Week' }
                    ]
                );
                break;

            case 'select_time':
                const timeMap = {
                    'today': 'Today',
                    'tomorrow': 'Tomorrow',
                    'this_week': 'This Week'
                };

                form.preferredTime = timeMap[buttonId] || 'This Week';
                form.step = 'completed';

                return await this.completeDemoBooking(phone, userSession);

            default:
                return await this.startDemoForm(phone, userSession);
        }

        return {
            nextStep: 'demo_form',
            data: { demoForm: form }
        };
    }

    async completeDemoBooking(phone, userSession) {
        const form = userSession.data.demoForm;
        const demoId = `DEMO${Date.now().toString().slice(-6)}`;

        const confirmationText = `✅ *Demo Scheduled Successfully!*\n\n` +
            `*Booking Details:*\n` +
            `👤 Name: ${form.name}\n` +
            `📧 Email: ${form.email}\n` +
            `🏢 Company: ${form.company}\n` +
            `📅 Preferred Time: ${form.preferredTime}\n` +
            `🆔 Demo ID: ${demoId}\n\n` +
            `📞 Our team will contact you within 2 hours to confirm the exact timing!\n\n` +
            `*What's included in your demo:*\n` +
            `• Live product walkthrough\n` +
            `• Industry-specific use cases\n` +
            `• Q&A session\n` +
            `• Custom pricing discussion`;

        await whatsappService.sendTextMessage(phone, confirmationText);

        await whatsappService.sendButtonMessage(
            phone,
            "*What would you like to explore next?*", [
                { id: 'case_studies', title: '📁 Case Studies' },
                { id: 'support', title: '🎧 Support' },
                { id: 'main_menu', title: '🔙 Main Menu' }
            ]
        );

        return { nextStep: 'demo_complete' };
    }

    async handleDemoComplete(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'case_studies':
                return await this.showCaseStudies(phone, userSession);
            case 'support':
                // FIXED: Direct transition to support flow
                console.log('Transitioning to support flow from demo complete');
                return {
                    nextFlow: 'support',
                    nextStep: 'start',
                    data: { supportType: 'general' }
                };
            case 'back_menu':
            case 'main_menu': // FIXED: Added main_menu case
                // FIXED: Actually send the welcome message instead of just changing step
                return await this.sendWelcomeMessage(phone, userSession);
            case 'schedule_demo':
                return await this.startDemoForm(phone, userSession);
            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the available options 👆"
                );
                return { nextStep: 'demo_complete' };
        }
    }

    // ==================== CASE STUDIES ====================
    async showCaseStudies(phone, userSession) {
        const caseStudyText = `📁 *Industry Case Studies*\n\n` +
            `Explore our WhatsApp Bot solutions across different industries.\n\n` +
            `*Select an industry to explore:*`;

        const sections = [{
                title: "Service Industries",
                rows: [
                    { id: "education", title: "🎓 Education", description: "Admissions, courses, campus tours" },
                    { id: "travel", title: "✈️ Tours & Travel", description: "Bookings, packages, itineraries" },
                    { id: "appointments", title: "📅 Appointments", description: "Booking, scheduling, reminders" }
                ]
            },
            {
                title: "Retail & Commerce",
                rows: [
                    { id: "automobile", title: "🚗 Automobile", description: "Test drives, models, service" },
                    { id: "jewellery", title: "💎 Jewellery", description: "Catalogue, appointments, offers" },
                    { id: "ecommerce", title: "🛒 E-Commerce", description: "Orders, tracking, support" }
                ]
            },
            {
                title: "Business Solutions",
                rows: [
                    { id: "construction", title: "🏗️ Construction", description: "Projects, investors, partners" },
                    { id: "sales", title: "💼 Sales Support", description: "Leads, pricing, inquiries" },
                    { id: "support_flow", title: "🎧 Customer Support", description: "Tickets, tracking, escalation" },
                    { id: "feedback", title: "📝 Feedback & Surveys", description: "Forms, questionnaires, analytics" }
                ]
            }
        ];

        await whatsappService.sendListMessage(
            phone,
            caseStudyText,
            "Select Industry",
            sections
        );

        return { nextStep: 'industry_selection' };
    }

    async handleIndustrySelection(phone, buttonId, userSession) {
        console.log(`Industry selected: ${buttonId}`);

        // Map button IDs to flow names
        const industryFlowMap = {
            'education': 'education',
            'travel': 'travel',
            'appointments': 'appointments',
            'automobile': 'automobile',
            'jewellery': 'jewellery',
            'ecommerce': 'ecommerce',
            'construction': 'construction',
            'sales': 'sales',
            'support_flow': 'support', // Fixed: support_flow maps to support
            'feedback': 'feedback'
        };

        const targetFlow = industryFlowMap[buttonId];

        if (targetFlow) {
            console.log(`Transitioning to ${targetFlow} flow`);
            return {
                nextFlow: targetFlow,
                nextStep: 'start',
                data: { selectedIndustry: buttonId }
            };
        } else {
            // Invalid selection, show case studies again
            await whatsappService.sendTextMessage(
                phone,
                "Please select a valid industry from the list above."
            );
            return await this.showCaseStudies(phone, userSession);
        }
    }

}

module.exports = new MainFlow();