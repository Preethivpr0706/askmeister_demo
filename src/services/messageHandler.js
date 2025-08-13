const whatsappService = require('./whatsappService');
const flowManager = require('./flowManager');
const HelperUtils = require('../utils/helpers'); // Import the HelperUtils class

class MessageHandler {
    async processMessage(message, contact) {
        try {
            const from = message.from;
            const messageType = message.type;
            let messageText = '';
            let buttonId = '';

            // Extract message content based on type
            switch (messageType) {
                case 'text':
                    messageText = message.text.body.toLowerCase().trim();
                    break;
                case 'interactive':
                    if (message.interactive.type === 'button_reply') {
                        buttonId = message.interactive.button_reply.id;
                        messageText = message.interactive.button_reply.title.toLowerCase();
                    } else if (message.interactive.type === 'list_reply') {
                        buttonId = message.interactive.list_reply.id;
                        messageText = message.interactive.list_reply.title.toLowerCase();
                    }
                    break;
                default:
                    messageText = 'unsupported_message';
            }

            // Get user session using HelperUtils
            let userSession = HelperUtils.getUserSession(from);

            // If new user or session expired, initialize
            if (!userSession) {
                let name = 'Friend';
                if (contact && contact.profile && contact.profile.name) {
                    name = contact.profile.name;
                }

                userSession = {
                    phone: from,
                    name: name,
                    currentFlow: 'main',
                    currentStep: 'welcome',
                    data: {},
                    lastActivity: new Date().toISOString()
                };
                HelperUtils.saveUserSession(from, userSession);
            }

            // Update last activity
            userSession.lastActivity = new Date().toISOString();

            // Process the message through flow manager
            await flowManager.processUserInput(from, messageText, buttonId, userSession);

            // Save updated session using HelperUtils
            HelperUtils.saveUserSession(from, userSession);

        } catch (error) {
            console.error('Error processing message:', error);
            await whatsappService.sendTextMessage(
                message.from,
                "Sorry, I encountered an error. Please try again or type 'help' for assistance."
            );
        }
    }
}

module.exports = new MessageHandler();