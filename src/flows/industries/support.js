const whatsappService = require('../../services/whatsappService');

class SupportFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        console.log(`SupportFlow processing step: ${step}, buttonId: ${buttonId}`);

        switch (step) {
            case 'start':
                return await this.showSupportWelcome(phone, userSession);
            case 'main_menu':
                return await this.handleMainMenu(phone, buttonId, userSession);
            case 'technical':
                return await this.handleTechnicalSupport(phone, buttonId, userSession);
            case 'billing':
                return await this.handleBillingSupport(phone, buttonId, userSession);
            case 'general':
                return await this.handleGeneralInquiry(phone, buttonId, userSession);
            case 'technical_complete':
            case 'billing_complete':
            case 'general_complete':
                return await this.handleFlowComplete(phone, buttonId, userSession);
            default:
                return await this.showSupportWelcome(phone, userSession);
        }
    }

    async showSupportWelcome(phone, userSession) {
        const welcomeText = `🛠️ *Technical Support*\n\n` +
            `Hello ${userSession.name || 'there'}! Welcome to our support center!\n\n` +
            `I can help you with:\n` +
            `🔧 Technical issues\n` +
            `💳 Billing questions\n` +
            `❓ General inquiries\n\n` +
            `*How can I assist you?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'technical', title: '🔧 Technical' },
                { id: 'billing', title: '💳 Billing' },
                { id: 'general', title: '❓ General' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'technical':
                return await this.showTechnicalSupport(phone, userSession);
            case 'billing':
                return await this.showBillingSupport(phone, userSession);
            case 'general':
                return await this.showGeneralInquiry(phone, userSession);
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

    // ==================== TECHNICAL SUPPORT FLOW ====================
    async showTechnicalSupport(phone, userSession) {
        const techText = `🔧 *Technical Support*\n\n` +
            `Common solutions:\n` +
            `• Check internet connection\n` +
            `• Clear browser cache\n` +
            `• Restart application\n\n` +
            `*What do you need?*`;

        await whatsappService.sendButtonMessage(
            phone,
            techText, [
                { id: 'create_ticket', title: '🎫 Create Ticket' },
                { id: 'faq_tech', title: '❓ Tech FAQ' },
                { id: 'back_menu', title: '🔙 Back' }
            ]
        );

        return { nextStep: 'technical' };
    }

    async handleTechnicalSupport(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'create_ticket':
                const ticketId = `TK${Date.now().toString().slice(-6)}`;

                await whatsappService.sendTextMessage(
                    phone,
                    `🎫 *Ticket Created*\n\n` +
                    `Ticket ID: #${ticketId}\n` +
                    `Status: Open ⏳\n\n` +
                    `Our tech team will contact you within 2 hours.\n\n` +
                    `Keep this ID for reference.`
                );
                break;

            case 'faq_tech':
                await whatsappService.sendTextMessage(
                    phone,
                    `❓ *Technical FAQ*\n\n` +
                    `*Q: App not loading?*\n` +
                    `A: Clear cache & restart\n\n` +
                    `*Q: Login issues?*\n` +
                    `A: Reset password or contact support\n\n` +
                    `*Q: Slow performance?*\n` +
                    `A: Check internet speed`
                );
                break;

            case 'back_menu':
                return this.showSupportWelcome(phone, userSession);

            case 'support_menu':
                return this.showSupportWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                await whatsappService.sendTextMessage(phone, "Please select a valid option.");
                return { nextStep: 'technical' };
        }

        // Flow completion with navigation options
        await whatsappService.sendButtonMessage(
            phone,
            "*Need anything else?*", [
                { id: 'billing', title: '💳 Billing Help' },
                { id: 'support_menu', title: '🏠 Support Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'technical_complete' };
    }

    // ==================== BILLING SUPPORT FLOW ====================
    async showBillingSupport(phone, userSession) {
        const billingText = `💳 *Billing Support*\n\n` +
            `I can help with:\n` +
            `📄 Invoice details\n` +
            `💳 Payment issues\n` +
            `💰 Refund requests\n\n` +
            `*What do you need?*`;

        await whatsappService.sendButtonMessage(
            phone,
            billingText, [
                { id: 'view_invoice', title: '📄 View Invoice' },
                { id: 'payment_help', title: '💳 Payment Help' },
                { id: 'back_menu', title: '🔙 Back' }
            ]
        );

        return { nextStep: 'billing' };
    }

    async handleBillingSupport(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'view_invoice':
                await whatsappService.sendTextMessage(
                    phone,
                    `📄 *Latest Invoice*\n\n` +
                    `Invoice: #INV-2024-001\n` +
                    `Amount: ₹5,000\n` +
                    `Date: 15 Dec 2024\n` +
                    `Status: Paid ✅\n\n` +
                    `📧 Copy sent to your email`
                );
                break;

            case 'payment_help':
                await whatsappService.sendTextMessage(
                    phone,
                    `💳 *Payment Support*\n\n` +
                    `*Accepted Methods:*\n` +
                    `• Credit/Debit Cards\n` +
                    `• UPI & Net Banking\n` +
                    `• Wallet payments\n\n` +
                    `*Issues?* Contact billing team:\n` +
                    `📞 +91-XXXXXXXXXX\n` +
                    `📧 billing@company.com`
                );
                break;

            case 'back_menu':
                return this.showSupportWelcome(phone, userSession);

            case 'support_menu':
                return this.showSupportWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                await whatsappService.sendTextMessage(phone, "Please select a valid option.");
                return { nextStep: 'billing' };
        }

        // Flow completion with navigation options
        await whatsappService.sendButtonMessage(
            phone,
            "*Need anything else?*", [
                { id: 'technical', title: '🔧 Tech Support' },
                { id: 'support_menu', title: '🏠 Support Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'billing_complete' };
    }

    // ==================== GENERAL INQUIRY FLOW ====================
    async showGeneralInquiry(phone, userSession) {
        const generalText = `❓ *General Inquiry*\n\n` +
            `How can I help you today?\n\n` +
            `*Available options:*\n` +
            `👤 Contact live agent\n` +
            `ℹ️ Company information\n` +
            `📋 Service status\n\n` +
            `*Choose an option:*`;

        await whatsappService.sendButtonMessage(
            phone,
            generalText, [
                { id: 'contact_agent', title: '👤 Live Agent' },
                { id: 'company_info', title: 'ℹ️ Company Info' },
                { id: 'back_menu', title: '🔙 Back' }
            ]
        );

        return { nextStep: 'general' };
    }

    async handleGeneralInquiry(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'contact_agent':
                await whatsappService.sendTextMessage(
                    phone,
                    `👤 *Connect to Agent*\n\n` +
                    `🔄 Connecting you to live support...\n\n` +
                    `Expected wait: 2-3 minutes\n` +
                    `Business hours: 9 AM - 6 PM\n\n` +
                    `Please describe your query and an agent will respond shortly.`
                );
                break;

            case 'company_info':
                await whatsappService.sendTextMessage(
                    phone,
                    `ℹ️ *Company Information*\n\n` +
                    `🏢 TechSolutions Pvt Ltd\n` +
                    `📍 Bangalore, India\n` +
                    `📞 +91-XXXXXXXXXX\n` +
                    `📧 support@techsolutions.com\n` +
                    `🌐 www.techsolutions.com\n\n` +
                    `*Business Hours:*\n` +
                    `Mon-Fri: 9 AM - 6 PM\n` +
                    `Sat: 9 AM - 1 PM`
                );
                break;

            case 'back_menu':
                return this.showSupportWelcome(phone, userSession);

            case 'support_menu':
                return this.showSupportWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                await whatsappService.sendTextMessage(phone, "Please select a valid option.");
                return { nextStep: 'general' };
        }

        // Flow completion with navigation options
        await whatsappService.sendButtonMessage(
            phone,
            "*Need anything else?*", [
                { id: 'technical', title: '🔧 Tech Support' },
                { id: 'support_menu', title: '🏠 Support Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'general_complete' };
    }

    // ==================== FLOW COMPLETION HANDLER ====================
    async handleFlowComplete(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'technical':
                return this.showTechnicalSupport(phone, userSession);
            case 'billing':
                return this.showBillingSupport(phone, userSession);
            case 'general':
                return this.showGeneralInquiry(phone, userSession);
            case 'support_menu':
                return this.showSupportWelcome(phone, userSession);
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

module.exports = new SupportFlow();