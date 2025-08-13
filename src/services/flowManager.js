const mainFlow = require('../flows/mainFlow');
const { getUserSession, saveUserSession } = require('../utils/helpers');

// Import industry flows
const educationFlow = require('../flows/industries/education');
const automobileFlow = require('../flows/industries/automobile');
const jewelleryFlow = require('../flows/industries/jewellery');
const constructionFlow = require('../flows/industries/construction');
const travelFlow = require('../flows/industries/travel');
const appointmentsFlow = require('../flows/industries/appointments');
const ecommerceFlow = require('../flows/industries/ecommerce');
const feedbackFlow = require('../flows/industries/feedback');
const supportFlow = require('../flows/industries/support');
const salesFlow = require('../flows/industries/sales');
const HelperUtils = require('../utils/helpers');

class FlowManager {
    constructor() {
        this.flows = {
            main: mainFlow,
            education: educationFlow,
            automobile: automobileFlow,
            jewellery: jewelleryFlow,
            construction: constructionFlow,
            travel: travelFlow,
            appointments: appointmentsFlow,
            ecommerce: ecommerceFlow,
            feedback: feedbackFlow,
            support: supportFlow,
            sales: salesFlow
        };
    }

    async processUserInput(phone, messageText, buttonId, userSession) {
        try {
            console.log(`Processing input for ${phone}: ${messageText || buttonId}`);
            console.log(`Current flow: ${userSession.currentFlow}, step: ${userSession.currentStep}`);

            // Handle global commands first
            if (messageText && this.isGlobalCommand(messageText)) {
                return await this.handleGlobalCommand(phone, messageText, userSession);
            }

            // Get current flow handler
            const currentFlow = this.flows[userSession.currentFlow];
            if (!currentFlow) {
                console.error(`Flow not found: ${userSession.currentFlow}`);
                return await this.resetToMainFlow(phone, userSession);
            }

            // Verify processStep method exists
            if (typeof currentFlow.processStep !== 'function') {
                console.error(`processStep method not found in flow: ${userSession.currentFlow}`);
                return await this.resetToMainFlow(phone, userSession);
            }

            // Process current step
            const result = await currentFlow.processStep(
                phone,
                userSession.currentStep,
                messageText,
                buttonId,
                userSession
            );

            // Handle result and update session
            if (result) {
                // Handle flow transitions FIRST
                if (result.nextFlow) {
                    console.log(`Transitioning from ${userSession.currentFlow} to ${result.nextFlow}`);

                    // Update session for new flow
                    userSession.currentFlow = result.nextFlow;
                    userSession.currentStep = result.nextStep || 'start';

                    // Save any data
                    if (result.data) {
                        userSession.data = {...userSession.data, ...result.data };
                    }

                    // Save session before transition
                    HelperUtils.saveUserSession(phone, userSession);

                    // Start the new flow
                    return await this.transitionToFlow(phone, result.nextFlow, userSession);

                } else if (result.nextStep) {
                    // Just update step in current flow
                    userSession.currentStep = result.nextStep;

                    // Save any data
                    if (result.data) {
                        userSession.data = {...userSession.data, ...result.data };
                    }
                }
            }

            // Save session
            HelperUtils.saveUserSession(phone, userSession);
            return result;

        } catch (error) {
            console.error('Error in flow manager:', error);
            await this.handleError(phone, userSession);
        }
    }

    isGlobalCommand(messageText) {
        if (!messageText || typeof messageText !== 'string') return false;
        const globalCommands = ['menu', 'main menu', 'start', 'help', 'back'];
        return globalCommands.includes(messageText.toLowerCase().trim());
    }

    async handleGlobalCommand(phone, messageText, userSession) {
        const command = messageText.toLowerCase().trim();

        switch (command) {
            case 'menu':
            case 'main menu':
            case 'start':
                return await this.resetToMainFlow(phone, userSession);

            case 'help':
                return await this.showHelp(phone, userSession);

            case 'back':
                return await this.goBack(phone, userSession);

            default:
                return null;
        }
    }

    async resetToMainFlow(phone, userSession) {
        console.log('Resetting to main flow');

        userSession.currentFlow = 'main';
        userSession.currentStep = 'welcome';
        userSession.data = {};

        // Save session
        HelperUtils.saveUserSession(phone, userSession);

        const mainFlowInstance = this.flows['main'];
        return await mainFlowInstance.processStep(phone, 'welcome', '', '', userSession);
    }

    async transitionToFlow(phone, flowName, userSession) {
        console.log(`Executing transition to flow: ${flowName}`);

        const targetFlow = this.flows[flowName];
        if (!targetFlow) {
            console.error(`Target flow not found: ${flowName}`);
            return await this.resetToMainFlow(phone, userSession);
        }

        if (typeof targetFlow.processStep !== 'function') {
            console.error(`processStep method not found in target flow: ${flowName}`);
            return await this.resetToMainFlow(phone, userSession);
        }

        // Start the new flow
        try {
            const result = await targetFlow.processStep(phone, 'start', '', '', userSession);

            // Update session after successful transition
            if (result && result.nextStep) {
                userSession.currentStep = result.nextStep;
            }

            HelperUtils.saveUserSession(phone, userSession);
            return result;

        } catch (error) {
            console.error(`Error transitioning to flow ${flowName}:`, error);
            return await this.resetToMainFlow(phone, userSession);
        }
    }

    async showHelp(phone, userSession) {
        const whatsappService = require('./whatsappService');

        await whatsappService.sendTextMessage(
            phone,
            `🆘 *Help & Commands*\n\n` +
            `Available commands:\n` +
            `• Type "menu" - Go to main menu\n` +
            `• Type "back" - Go to previous step\n` +
            `• Type "help" - Show this help\n\n` +
            `For support: +91-XXXXXXXXXX`
        );

        return { nextStep: userSession.currentStep }; // Stay on current step
    }

    async goBack(phone, userSession) {
        // Simple back logic - go to main menu if not already there
        if (userSession.currentFlow !== 'main') {
            return await this.resetToMainFlow(phone, userSession);
        } else {
            // If already in main, go to welcome
            userSession.currentStep = 'welcome';
            HelperUtils.saveUserSession(phone, userSession);
            return await this.flows.main.processStep(phone, 'welcome', '', '', userSession);
        }
    }

    async handleError(phone, userSession) {
        const whatsappService = require('./whatsappService');

        await whatsappService.sendTextMessage(
            phone,
            `❌ Something went wrong. Let me take you back to the main menu.`
        );

        return await this.resetToMainFlow(phone, userSession);
    }
}

module.exports = new FlowManager();