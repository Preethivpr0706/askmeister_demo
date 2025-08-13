const whatsappService = require('../../services/whatsappService');

class SalesFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        console.log(`SalesFlow processing step: ${step}, buttonId: ${buttonId}`);

        switch (step) {
            case 'start':
                return await this.showSalesWelcome(phone, userSession);
            case 'main_menu':
                return await this.handleMainMenu(phone, buttonId, userSession);
            case 'leads':
                return await this.handleLeads(phone, buttonId, userSession);
            case 'pricing':
                return await this.handlePricing(phone, buttonId, userSession);
            case 'inquiry':
                return await this.handleInquiry(phone, messageText, buttonId, userSession);
            case 'leads_complete':
            case 'pricing_complete':
            case 'inquiry_complete':
                return await this.handleFlowComplete(phone, buttonId, userSession);
            default:
                return await this.showSalesWelcome(phone, userSession);
        }
    }

    async showSalesWelcome(phone, userSession) {
        const welcomeText = `💼 *Sales & Support*\n\n` +
            `Hello ${userSession.name || 'there'}! Welcome to our sales team!\n\n` +
            `I can help you with:\n` +
            `🎯 Lead generation\n` +
            `💰 Pricing information\n` +
            `❓ Product inquiries\n\n` +
            `*What interests you?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'leads', title: '🎯 Leads' },
                { id: 'pricing', title: '💰 Pricing' },
                { id: 'inquiry', title: '❓ Inquiry' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'leads':
                return await this.showLeadsFlow(phone, userSession);
            case 'pricing':
                return await this.showPricingFlow(phone, userSession);
            case 'inquiry':
                return await this.showInquiryFlow(phone, userSession);
            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };
            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the available options 👆"
                );
                return { nextStep: 'main_menu' };
        }
    }

    // ==================== LEADS FLOW ====================
    async showLeadsFlow(phone, userSession) {
        const leadsText = `🎯 *Lead Generation*\n\n` +
            `Let us help you grow your business!\n\n` +
            `*Our Services:*\n` +
            `📊 Qualified leads\n` +
            `🎯 Targeted campaigns\n` +
            `📈 Conversion tracking\n\n` +
            `*Choose an option:*`;

        await whatsappService.sendButtonMessage(
            phone,
            leadsText, [
                { id: 'get_demo', title: '🎬 Get Demo' },
                { id: 'lead_packages', title: '📦 Packages' },
                { id: 'back_menu', title: '🔙 Back' }
            ]
        );

        return { nextStep: 'leads' };
    }

    async handleLeads(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'get_demo':
                const demoId = `DEMO${Date.now().toString().slice(-4)}`;

                await whatsappService.sendTextMessage(
                    phone,
                    `🎬 *Demo Scheduled*\n\n` +
                    `Demo ID: #${demoId}\n` +
                    `Duration: 30 minutes\n` +
                    `When: Next available slot\n\n` +
                    `📅 Our sales team will contact you within 2 hours to confirm timing.\n\n` +
                    `What to expect:\n` +
                    `• Live product walkthrough\n` +
                    `• Q&A session\n` +
                    `• Custom pricing discussion`
                );
                break;

            case 'lead_packages':
                await whatsappService.sendTextMessage(
                    phone,
                    `📦 *Lead Packages*\n\n` +
                    `*Starter Package*\n` +
                    `• 100 leads/month - ₹15,000\n\n` +
                    `*Business Package*\n` +
                    `• 500 leads/month - ₹50,000\n\n` +
                    `*Enterprise Package*\n` +
                    `• 1000+ leads/month - ₹85,000\n\n` +
                    `*All packages include:*\n` +
                    `✅ Qualified leads\n` +
                    `✅ Real-time tracking\n` +
                    `✅ 24/7 support`
                );
                break;

            case 'back_menu':
                return this.showSalesWelcome(phone, userSession);

            case 'sales_menu':
                return this.showSalesWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                await whatsappService.sendTextMessage(phone, "Please select a valid option.");
                return { nextStep: 'leads' };
        }

        // Flow completion with navigation options
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'pricing', title: '💰 View Pricing' },
                { id: 'sales_menu', title: '🏠 Sales Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'leads_complete' };
    }

    // ==================== PRICING FLOW ====================
    async showPricingFlow(phone, userSession) {
        const pricingText = `💰 *Pricing Information*\n\n` +
            `Transparent pricing for all our services!\n\n` +
            `*What pricing info do you need?*\n` +
            `📋 Service packages\n` +
            `🔄 Subscription plans\n` +
            `🎯 Custom quotes\n\n` +
            `*Select option:*`;

        await whatsappService.sendButtonMessage(
            phone,
            pricingText, [
                { id: 'service_price', title: '📋 Services' },
                { id: 'subscription', title: '🔄 Subscription' },
                { id: 'back_menu', title: '🔙 Back' }
            ]
        );

        return { nextStep: 'pricing' };
    }

    async handlePricing(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'service_price':
                await whatsappService.sendTextMessage(
                    phone,
                    `📋 *Service Pricing*\n\n` +
                    `*WhatsApp Bot Setup*\n` +
                    `Basic: ₹25,000\n` +
                    `Advanced: ₹50,000\n` +
                    `Enterprise: ₹1,00,000\n\n` +
                    `*Monthly Maintenance*\n` +
                    `Basic: ₹5,000/month\n` +
                    `Pro: ₹10,000/month\n` +
                    `Enterprise: ₹20,000/month\n\n` +
                    `*Includes:*\n` +
                    `✅ 24/7 monitoring\n` +
                    `✅ Regular updates\n` +
                    `✅ Technical support`
                );
                break;

            case 'subscription':
                await whatsappService.sendTextMessage(
                    phone,
                    `🔄 *Subscription Plans*\n\n` +
                    `*Monthly Plans:*\n` +
                    `Starter: ₹2,999/month\n` +
                    `• Up to 1,000 messages\n` +
                    `• Basic features\n\n` +
                    `Professional: ₹9,999/month\n` +
                    `• Up to 10,000 messages\n` +
                    `• Advanced features\n\n` +
                    `Enterprise: ₹24,999/month\n` +
                    `• Unlimited messages\n` +
                    `• All features + priority support\n\n` +
                    `*Annual discount: 20% off*`
                );
                break;

            case 'back_menu':
                return this.showSalesWelcome(phone, userSession);

            case 'sales_menu':
                return this.showSalesWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                await whatsappService.sendTextMessage(phone, "Please select a valid option.");
                return { nextStep: 'pricing' };
        }

        // Flow completion with navigation options
        await whatsappService.sendButtonMessage(
            phone,
            "*Interested in our services?*", [
                { id: 'inquiry', title: '❓ Ask Question' },
                { id: 'sales_menu', title: '🏠 Sales Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'pricing_complete' };
    }

    // ==================== INQUIRY FLOW ====================
    async showInquiryFlow(phone, userSession) {
        // Initialize inquiry form if not exists
        if (!userSession.data || !userSession.data.inquiryForm) {
            userSession.data = {
                ...(userSession.data || {}),
                inquiryForm: { step: 'start' }
            };
        }

        const inquiryText = `❓ *Product Inquiry*\n\n` +
            `I'd love to help you with any questions!\n\n` +
            `*Quick options:*\n` +
            `📞 Request callback\n` +
            `📧 Email consultation\n` +
            `💬 Custom inquiry\n\n` +
            `*How can I help?*`;

        await whatsappService.sendButtonMessage(
            phone,
            inquiryText, [
                { id: 'callback', title: '📞 Callback' },
                { id: 'email_consult', title: '📧 Email' },
                { id: 'back_menu', title: '🔙 Back' }
            ]
        );

        return {
            nextStep: 'inquiry',
            data: userSession.data
        };
    }

    async handleInquiry(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.inquiryForm) {
            userSession.data = {
                ...(userSession.data || {}),
                inquiryForm: { step: 'start' }
            };
        }

        const form = userSession.data.inquiryForm;

        // Handle button selections
        if (buttonId) {
            switch (buttonId) {
                case 'callback':
                    form.type = 'callback';
                    form.step = 'collect_phone';

                    await whatsappService.sendTextMessage(
                        phone,
                        `📞 *Request Callback*\n\n📱 Please provide your phone number:`
                    );

                    return {
                        nextStep: 'inquiry',
                        data: { inquiryForm: form }
                    };

                case 'email_consult':
                    form.type = 'email';
                    form.step = 'collect_email';

                    await whatsappService.sendTextMessage(
                        phone,
                        `📧 *Email Consultation*\n\n📧 Please provide your email address:`
                    );

                    return {
                        nextStep: 'inquiry',
                        data: { inquiryForm: form }
                    };

                case 'back_menu':
                    return this.showSalesWelcome(phone, userSession);

                case 'sales_menu':
                    return this.showSalesWelcome(phone, userSession);

                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };

                default:
                    break;
            }
        }

        // Handle form steps
        switch (form.step) {
            case 'collect_phone':
                if (!messageText || messageText.length < 10) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid phone number:"
                    );
                    return { nextStep: 'inquiry' };
                }

                form.phone = messageText;
                form.step = 'completed';

                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Callback Requested*\n\n` +
                    `📞 Phone: ${form.phone}\n\n` +
                    `Our sales team will call you within 30 minutes during business hours (9 AM - 6 PM).\n\n` +
                    `Reference ID: #CB${Date.now().toString().slice(-4)}`
                );
                break;

            case 'collect_email':
                if (!messageText || !messageText.includes('@')) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid email address:"
                    );
                    return { nextStep: 'inquiry' };
                }

                form.email = messageText;
                form.step = 'completed';

                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Email Consultation*\n\n` +
                    `📧 Email: ${form.email}\n\n` +
                    `Detailed product information and consultation will be sent to your email within 2 hours.\n\n` +
                    `Reference ID: #EC${Date.now().toString().slice(-4)}`
                );
                break;

            default:
                return { nextStep: 'inquiry' };
        }

        // Flow completion with navigation options
        await whatsappService.sendButtonMessage(
            phone,
            "*What else can I help with?*", [
                { id: 'leads', title: '🎯 Lead Gen' },
                { id: 'sales_menu', title: '🏠 Sales Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return {
            nextStep: 'inquiry_complete',
            data: { inquiryForm: form }
        };
    }

    // ==================== FLOW COMPLETION HANDLER ====================
    async handleFlowComplete(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'leads':
                return this.showLeadsFlow(phone, userSession);
            case 'pricing':
                return this.showPricingFlow(phone, userSession);
            case 'inquiry':
                return this.showInquiryFlow(phone, userSession);
            case 'sales_menu':
                return this.showSalesWelcome(phone, userSession);
            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };
            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the available options 👆"
                );
                return { nextStep: userSession.currentStep || 'start' };
        }
    }
}

module.exports = new SalesFlow();