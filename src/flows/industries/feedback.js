const whatsappService = require('../../services/whatsappService');

class FeedbackFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        switch (step) {
            case 'start':
                return this.showFeedbackWelcome(phone, userSession);

            case 'main_menu':
                return this.handleMainMenu(phone, buttonId, userSession);

                // Quick Rating Flow
            case 'quick_rating_start':
                return this.startQuickRating(phone, userSession);
            case 'quick_rating_form':
                return this.handleQuickRatingForm(phone, messageText, buttonId, userSession);
            case 'quick_rating_complete':
                return this.completeQuickRating(phone, buttonId, userSession);

                // Service Review Flow  
            case 'service_review_start':
                return this.startServiceReview(phone, userSession);
            case 'service_review_form':
                return this.handleServiceReviewForm(phone, messageText, buttonId, userSession);
            case 'service_review_complete':
                return this.completeServiceReview(phone, buttonId, userSession);

                // Suggestion Flow
            case 'suggestion_start':
                return this.startSuggestionFlow(phone, userSession);
            case 'suggestion_form':
                return this.handleSuggestionForm(phone, messageText, buttonId, userSession);
            case 'suggestion_complete':
                return this.completeSuggestionFlow(phone, buttonId, userSession);

            default:
                return this.showFeedbackWelcome(phone, userSession);
        }
    }

    async showFeedbackWelcome(phone, userSession) {
        try {
            // Send feedback image first and wait for completion
            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/feedback-welcome.jpg`,
                '📝 Your feedback matters!'
            );

            // Add small delay to ensure image is processed
            await this.delay(1000);

            const welcomeText = `📝 *Welcome to FeedbackBot*\n\n` +
                `Hi ${userSession.name || 'there'}! 👋\n\n` +
                `Your opinion helps us improve!\n\n` +
                `*Choose your feedback type:*`;

            await whatsappService.sendButtonMessage(
                phone,
                welcomeText, [
                    { id: 'quick_rating', title: '⭐ Quick Rating' },
                    { id: 'service_review', title: '🔧 Service Review' },
                    { id: 'suggestion', title: '💡 Suggestion' }
                ]
            );
        } catch (error) {
            console.error('Error in showFeedbackWelcome:', error);
            // If image fails, continue with text message
            const welcomeText = `📝 *Welcome to FeedbackBot*\n\n` +
                `Hi ${userSession.name || 'there'}! 👋\n\n` +
                `Your opinion helps us improve!\n\n` +
                `*Choose your feedback type:*`;

            await whatsappService.sendButtonMessage(
                phone,
                welcomeText, [
                    { id: 'quick_rating', title: '⭐ Quick Rating' },
                    { id: 'service_review', title: '🔧 Service Review' },
                    { id: 'suggestion', title: '💡 Suggestion' }
                ]
            );
        }

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'quick_rating':
                return this.startQuickRating(phone, userSession);
            case 'service_review':
                return this.startServiceReview(phone, userSession);
            case 'suggestion':
                return this.startSuggestionFlow(phone, userSession);
            case 'back_to_main':
                return { nextFlow: 'main', nextStep: 'welcome' };
            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the options above 👆"
                );
                return { nextStep: 'main_menu' };
        }
    }

    // ==================== QUICK RATING FLOW ====================
    async startQuickRating(phone, userSession) {
        const ratingText = `⭐ *Quick Rating*\n\n` +
            `How was your experience?\n\n` +
            `*Rate us in 30 seconds!*`;

        await whatsappService.sendButtonMessage(
            phone,
            ratingText, [
                { id: 'excellent', title: '⭐⭐⭐⭐⭐ Excellent' },
                { id: 'good', title: '⭐⭐⭐⭐ Good' },
                { id: 'average', title: '⭐⭐⭐ Average' }
            ]
        );

        return { nextStep: 'quick_rating_form' };
    }

    async handleQuickRatingForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.quickRating) {
            userSession.data = {
                ...(userSession.data || {}),
                quickRating: { step: 'rating_selected' }
            };
        }

        const form = userSession.data.quickRating;

        // Handle rating selection
        if (['excellent', 'good', 'average'].includes(buttonId)) {
            form.rating = buttonId;
            form.step = 'collect_comment';

            const ratingText = this.getRatingText(buttonId);

            await whatsappService.sendTextMessage(
                phone,
                `✅ *${ratingText} Rating!*\n\n` +
                `📝 Any quick comment? (optional)\n\n` +
                `Type your comment or send 'skip':`
            );

            return {
                nextStep: 'quick_rating_form',
                data: { quickRating: form }
            };
        }

        // Handle form steps
        switch (form.step) {
            case 'collect_comment':
                form.comment = messageText === 'skip' ? 'No comment' : messageText;
                form.step = 'completed';

                return this.completeQuickRating(phone, null, userSession);

            default:
                return { nextStep: 'quick_rating_form' };
        }
    }

    async completeQuickRating(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'service_review':
                    return this.startServiceReview(phone, userSession);
                case 'suggestion':
                    return this.startSuggestionFlow(phone, userSession);
                case 'feedback_menu':
                    return this.showFeedbackWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.quickRating;
        const ratingId = `QR${Date.now().toString().slice(-6)}`;

        try {
            // Send thank you image first and wait
            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/thank-you.jpg`,
                '🙏 Thank you for your feedback!'
            );

            // Add delay to ensure proper order
            await this.delay(1000);

            const thankYouText = `🎉 *Rating Submitted!*\n\n` +
                `*Your Feedback:*\n` +
                `⭐ Rating: ${this.getRatingText(form.rating)}\n` +
                `💭 Comment: ${form.comment}\n` +
                `🆔 ID: ${ratingId}\n\n` +
                `Thank you for taking time to rate us! 🙏`;

            await whatsappService.sendTextMessage(phone, thankYouText);

            await whatsappService.sendButtonMessage(
                phone,
                "*What's next?*", [
                    { id: 'service_review', title: '🔧 Service Review' },
                    { id: 'feedback_menu', title: '🏠 Feedback Menu' },
                    { id: 'main_menu', title: '🏠 Main Menu' }
                ]
            );
        } catch (error) {
            console.error('Error in completeQuickRating:', error);
            // Continue without image if it fails
            const thankYouText = `🎉 *Rating Submitted!*\n\n` +
                `*Your Feedback:*\n` +
                `⭐ Rating: ${this.getRatingText(form.rating)}\n` +
                `💭 Comment: ${form.comment}\n` +
                `🆔 ID: ${ratingId}\n\n` +
                `Thank you for taking time to rate us! 🙏`;

            await whatsappService.sendTextMessage(phone, thankYouText);

            await whatsappService.sendButtonMessage(
                phone,
                "*What's next?*", [
                    { id: 'service_review', title: '🔧 Service Review' },
                    { id: 'feedback_menu', title: '🏠 Feedback Menu' },
                    { id: 'main_menu', title: '🏠 Main Menu' }
                ]
            );
        }

        return { nextStep: 'quick_rating_complete' };
    }

    // ==================== SERVICE REVIEW FLOW ====================
    async startServiceReview(phone, userSession) {
        const reviewText = `🔧 *Service Review*\n\n` +
            `Help us improve our service!\n\n` +
            `*What service did you use?*`;

        await whatsappService.sendButtonMessage(
            phone,
            reviewText, [
                { id: 'delivery', title: '🚚 Delivery' },
                { id: 'support', title: '📞 Support' },
                { id: 'technical', title: '💻 Technical' }
            ]
        );

        return { nextStep: 'service_review_form' };
    }

    async handleServiceReviewForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.serviceReview) {
            userSession.data = {
                ...(userSession.data || {}),
                serviceReview: { step: 'service_selected' }
            };
        }

        const form = userSession.data.serviceReview;

        // Handle service selection
        if (['delivery', 'support', 'technical'].includes(buttonId)) {
            form.service = buttonId;
            form.step = 'collect_rating';

            const serviceText = this.getServiceText(buttonId);

            await whatsappService.sendButtonMessage(
                phone,
                `🔧 *${serviceText} Review*\n\nHow would you rate it?`, [
                    { id: 'rating_5', title: '⭐⭐⭐⭐⭐ Excellent' },
                    { id: 'rating_4', title: '⭐⭐⭐⭐ Good' },
                    { id: 'rating_3', title: '⭐⭐⭐ Average' }
                ]
            );

            return {
                nextStep: 'service_review_form',
                data: { serviceReview: form }
            };
        }

        // Handle form steps
        switch (form.step) {
            case 'collect_rating':
                if (buttonId && buttonId.startsWith('rating_')) {
                    form.rating = buttonId;
                    form.step = 'collect_feedback';

                    await whatsappService.sendTextMessage(
                        phone,
                        `📝 *Share your experience:*\n\n` +
                        `What went well? What can improve?\n\n` +
                        `Type your feedback or send 'skip':`
                    );
                }
                break;

            case 'collect_feedback':
                form.feedback = messageText === 'skip' ? 'No feedback' : messageText;
                form.step = 'completed';

                return this.completeServiceReview(phone, null, userSession);

            default:
                return { nextStep: 'service_review_form' };
        }

        return {
            nextStep: 'service_review_form',
            data: { serviceReview: form }
        };
    }

    async completeServiceReview(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'quick_rating':
                    return this.startQuickRating(phone, userSession);
                case 'suggestion':
                    return this.startSuggestionFlow(phone, userSession);
                case 'feedback_menu':
                    return this.showFeedbackWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.serviceReview;
        const reviewId = `SR${Date.now().toString().slice(-6)}`;

        const reviewText = `✅ *Service Review Submitted!*\n\n` +
            `*Your Review:*\n` +
            `🔧 Service: ${this.getServiceText(form.service)}\n` +
            `⭐ Rating: ${this.getNumericRating(form.rating)} stars\n` +
            `📝 Feedback: ${form.feedback}\n` +
            `🆔 ID: ${reviewId}\n\n` +
            `Our team will review and improve! 🚀`;

        await whatsappService.sendTextMessage(phone, reviewText);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'suggestion', title: '💡 Suggestion' },
                { id: 'feedback_menu', title: '🏠 Feedback Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'service_review_complete' };
    }

    // ==================== SUGGESTION FLOW ====================
    async startSuggestionFlow(phone, userSession) {
        const suggestionText = `💡 *Share Your Suggestion*\n\n` +
            `We love creative ideas!\n\n` +
            `*What type of suggestion?*`;

        await whatsappService.sendButtonMessage(
            phone,
            suggestionText, [
                { id: 'feature', title: '✨ New Feature' },
                { id: 'improvement', title: '🔧 Improvement' },
                { id: 'other', title: '💭 Other Idea' }
            ]
        );

        return { nextStep: 'suggestion_form' };
    }

    async handleSuggestionForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.suggestion) {
            userSession.data = {
                ...(userSession.data || {}),
                suggestion: { step: 'type_selected' }
            };
        }

        const form = userSession.data.suggestion;

        // Handle type selection
        if (['feature', 'improvement', 'other'].includes(buttonId)) {
            form.type = buttonId;
            form.step = 'collect_details';

            const typeText = this.getSuggestionTypeText(buttonId);

            await whatsappService.sendTextMessage(
                phone,
                `💡 *${typeText}*\n\n` +
                `📝 Please describe your suggestion:\n\n` +
                `Be as detailed as you like!`
            );

            return {
                nextStep: 'suggestion_form',
                data: { suggestion: form }
            };
        }

        // Handle form steps
        switch (form.step) {
            case 'collect_details':
                if (!messageText || messageText.length < 10) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide more details about your suggestion:"
                    );
                    return { nextStep: 'suggestion_form' };
                }

                form.details = messageText;
                form.step = 'collect_priority';

                await whatsappService.sendButtonMessage(
                    phone,
                    "How important is this to you?", [
                        { id: 'high', title: '🔥 High Priority' },
                        { id: 'medium', title: '📝 Medium' },
                        { id: 'low', title: '💭 Nice to Have' }
                    ]
                );
                break;

            case 'collect_priority':
                if (['high', 'medium', 'low'].includes(buttonId)) {
                    form.priority = buttonId;
                    form.step = 'completed';

                    return this.completeSuggestionFlow(phone, null, userSession);
                }
                break;

            default:
                return { nextStep: 'suggestion_form' };
        }

        return {
            nextStep: 'suggestion_form',
            data: { suggestion: form }
        };
    }

    async completeSuggestionFlow(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'quick_rating':
                    return this.startQuickRating(phone, userSession);
                case 'service_review':
                    return this.startServiceReview(phone, userSession);
                case 'feedback_menu':
                    return this.showFeedbackWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.suggestion;
        const suggestionId = `SG${Date.now().toString().slice(-6)}`;

        try {
            // Send suggestion image first and wait
            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/suggestion-received.jpg`,
                '💡 Great suggestion received!'
            );

            // Add delay to ensure proper order
            await this.delay(1000);

            const suggestionText = `💡 *Suggestion Received!*\n\n` +
                `*Your Suggestion:*\n` +
                `📋 Type: ${this.getSuggestionTypeText(form.type)}\n` +
                `📝 Details: ${form.details.substring(0, 100)}${form.details.length > 100 ? '...' : ''}\n` +
                `⚡ Priority: ${this.getPriorityText(form.priority)}\n` +
                `🆔 ID: ${suggestionId}\n\n` +
                `Thank you! Our team will review this. 🚀`;

            await whatsappService.sendTextMessage(phone, suggestionText);

            await whatsappService.sendButtonMessage(
                phone,
                "*What's next?*", [
                    { id: 'quick_rating', title: '⭐ Quick Rating' },
                    { id: 'feedback_menu', title: '🏠 Feedback Menu' },
                    { id: 'main_menu', title: '🏠 Main Menu' }
                ]
            );
        } catch (error) {
            console.error('Error in completeSuggestionFlow:', error);
            // Continue without image if it fails
            const suggestionText = `💡 *Suggestion Received!*\n\n` +
                `*Your Suggestion:*\n` +
                `📋 Type: ${this.getSuggestionTypeText(form.type)}\n` +
                `📝 Details: ${form.details.substring(0, 100)}${form.details.length > 100 ? '...' : ''}\n` +
                `⚡ Priority: ${this.getPriorityText(form.priority)}\n` +
                `🆔 ID: ${suggestionId}\n\n` +
                `Thank you! Our team will review this. 🚀`;

            await whatsappService.sendTextMessage(phone, suggestionText);

            await whatsappService.sendButtonMessage(
                phone,
                "*What's next?*", [
                    { id: 'quick_rating', title: '⭐ Quick Rating' },
                    { id: 'feedback_menu', title: '🏠 Feedback Menu' },
                    { id: 'main_menu', title: '🏠 Main Menu' }
                ]
            );
        }

        return { nextStep: 'suggestion_complete' };
    }

    // ==================== HELPER METHODS ====================

    // Add delay helper method
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getRatingText(rating) {
        const ratingMap = {
            'excellent': 'Excellent',
            'good': 'Good',
            'average': 'Average'
        };
        return ratingMap[rating] || 'Unknown';
    }

    getServiceText(service) {
        const serviceMap = {
            'delivery': 'Delivery Service',
            'support': 'Customer Support',
            'technical': 'Technical Support'
        };
        return serviceMap[service] || 'Service';
    }

    getNumericRating(rating) {
        const numMap = {
            'rating_5': '5',
            'rating_4': '4',
            'rating_3': '3'
        };
        return numMap[rating] || '0';
    }

    getSuggestionTypeText(type) {
        const typeMap = {
            'feature': 'New Feature Suggestion',
            'improvement': 'Improvement Suggestion',
            'other': 'General Suggestion'
        };
        return typeMap[type] || 'Suggestion';
    }

    getPriorityText(priority) {
        const priorityMap = {
            'high': 'High Priority 🔥',
            'medium': 'Medium Priority 📝',
            'low': 'Nice to Have 💭'
        };
        return priorityMap[priority] || 'Unknown';
    }
}

module.exports = new FeedbackFlow();