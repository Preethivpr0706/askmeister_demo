const whatsappService = require('../../services/whatsappService');
const HelperUtils = require('../../utils/helpers');
const ValidationUtils = require('../../middleware/validation');
const CONSTANTS = require('../../utils/constants');

class ConstructionFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        switch (step) {
            case 'start':
                return this.showMainMenu(phone, userSession);

            case 'main_menu':
                return this.handleMainMenu(phone, buttonId, userSession);

                // Project Inquiry Flow
            case 'inquiry_start':
                return this.startProjectInquiry(phone, userSession);
            case 'inquiry_type':
                return this.handleInquiryType(phone, buttonId, userSession);
            case 'inquiry_form':
                return this.handleInquiryForm(phone, messageText, buttonId, userSession);
            case 'inquiry_complete':
                return this.completeInquiry(phone, buttonId, userSession);

                // Cost Estimation Flow
            case 'estimate_start':
                return this.startCostEstimation(phone, userSession);
            case 'estimate_form':
                return this.handleEstimationForm(phone, messageText, buttonId, userSession);
            case 'estimate_complete':
                return this.completeEstimation(phone, buttonId, userSession);

                // Site Visit Flow
            case 'visit_start':
                return this.startSiteVisit(phone, userSession);
            case 'visit_form':
                return this.handleVisitForm(phone, messageText, buttonId, userSession);
            case 'visit_complete':
                return this.completeVisit(phone, buttonId, userSession);

            default:
                return this.showMainMenu(phone, userSession);
        }
    }

    async showMainMenu(phone, userSession) {
        const menuText = `🏗️ *Welcome to ConstructBot*\n\n` +
            `Hello ${userSession.name || 'there'}! We provide comprehensive construction solutions.\n\n` +
            `*Our Services:*\n` +
            `🏠 Residential Projects\n` +
            `🏢 Commercial Buildings\n` +
            `🔧 Renovation & Repairs\n\n` +
            `*How can we help you today?*`;

        await whatsappService.sendButtonMessage(
            phone,
            menuText, [
                { id: 'new_inquiry', title: '🏗️ New Project' },
                { id: 'cost_estimate', title: '💰 Cost Estimate' },
                { id: 'site_visit', title: '📍 Site Visit' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'new_inquiry':
                return this.startProjectInquiry(phone, userSession);
            case 'cost_estimate':
                return this.startCostEstimation(phone, userSession);
            case 'site_visit':
                return this.startSiteVisit(phone, userSession);
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

    // ==================== PROJECT INQUIRY FLOW ====================
    async startProjectInquiry(phone, userSession) {
        const inquiryText = `🏗️ *New Project Inquiry*\n\n` +
            `Let's gather details about your construction project.\n\n` +
            `*What type of project are you planning?*`;

        await whatsappService.sendButtonMessage(
            phone,
            inquiryText, [
                { id: 'residential', title: '🏠 Residential' },
                { id: 'commercial', title: '🏢 Commercial' },
                { id: 'renovation', title: '🔨 Renovation' }
            ]
        );

        return { nextStep: 'inquiry_type' };
    }

    async handleInquiryType(phone, buttonId, userSession) {
        const projectTypes = {
            residential: 'Residential Construction',
            commercial: 'Commercial Building',
            renovation: 'Renovation Work'
        };

        const selectedType = projectTypes[buttonId];
        if (!selectedType) {
            await whatsappService.sendTextMessage(phone, "Please select a valid project type.");
            return { nextStep: 'inquiry_type' };
        }

        await whatsappService.sendTextMessage(
            phone,
            `✅ *${selectedType} Selected*\n\n📝 Please provide your full name:`
        );

        return {
            nextStep: 'inquiry_form',
            data: {
                inquiryForm: {
                    projectType: selectedType,
                    step: 'collect_name'
                }
            }
        };
    }

    async handleInquiryForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.inquiryForm) {
            return { nextStep: 'inquiry_start' };
        }

        const form = userSession.data.inquiryForm;

        switch (form.step) {
            case 'collect_name':
                if (!ValidationUtils.isValidName(messageText)) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "❌ Please provide a valid name (2-50 characters):"
                    );
                    return { nextStep: 'inquiry_form' };
                }

                form.customerName = messageText;
                form.step = 'collect_location';

                await whatsappService.sendTextMessage(
                    phone,
                    "📍 Please provide project location:\n\n*Format:* City, State"
                );
                break;

            case 'collect_location':
                if (!messageText || messageText.length < 5) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "❌ Please provide a valid location:"
                    );
                    return { nextStep: 'inquiry_form' };
                }

                form.location = messageText;
                form.step = 'select_budget';

                await whatsappService.sendButtonMessage(
                    phone,
                    "💰 What's your budget range?", [
                        { id: 'budget_5_15', title: '💰 ₹5-15 Lakhs' },
                        { id: 'budget_15_30', title: '💰 ₹15-30 Lakhs' },
                        { id: 'budget_30_plus', title: '💰 ₹30+ Lakhs' }
                    ]
                );
                break;

            case 'select_budget':
                const budgetMap = {
                    'budget_5_15': '₹5-15 Lakhs',
                    'budget_15_30': '₹15-30 Lakhs',
                    'budget_30_plus': '₹30+ Lakhs'
                };

                form.budget = budgetMap[buttonId] || 'Not specified';
                form.step = 'completed';

                return this.completeInquiry(phone, null, userSession);

            default:
                return { nextStep: 'inquiry_form' };
        }

        return {
            nextStep: 'inquiry_form',
            data: { inquiryForm: form }
        };
    }

    async completeInquiry(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'cost_estimate':
                    return this.startCostEstimation(phone, userSession);
                case 'site_visit':
                    return this.startSiteVisit(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.inquiryForm;
        const inquiryId = `CONST${Date.now().toString().slice(-6)}`;

        const summaryText = `✅ *Project Inquiry Submitted!*\n\n` +
            `*Inquiry ID:* ${inquiryId}\n\n` +
            `*Details:*\n` +
            `👤 Name: ${form.customerName}\n` +
            `🏗️ Type: ${form.projectType}\n` +
            `📍 Location: ${form.location}\n` +
            `💰 Budget: ${form.budget}\n\n` +
            `*Next Steps:*\n` +
            `• Team will review inquiry\n` +
            `• Site visit will be scheduled\n` +
            `• You'll get a call within 24hrs\n\n` +
            `*Thank you for choosing us!*`;

        await whatsappService.sendTextMessage(phone, summaryText);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'cost_estimate', title: '💰 Get Estimate' },
                { id: 'site_visit', title: '📍 Site Visit' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'inquiry_complete' };
    }

    // ==================== COST ESTIMATION FLOW ====================
    async startCostEstimation(phone, userSession) {
        const estimationText = `💰 *Construction Cost Estimation*\n\n` +
            `Get approximate cost for your project.\n\n` +
            `*Select project type:*`;

        await whatsappService.sendButtonMessage(
            phone,
            estimationText, [
                { id: 'new_construction', title: '🏗️ New Build' },
                { id: 'renovation_work', title: '🔨 Renovation' },
                { id: 'interior_work', title: '🎨 Interior' }
            ]
        );

        return { nextStep: 'estimate_form', data: { estimateForm: { step: 'select_type' } } };
    }

    async handleEstimationForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.estimateForm) {
            userSession.data = { estimateForm: { step: 'select_type' } };
        }

        const form = userSession.data.estimateForm;

        switch (form.step) {
            case 'select_type':
                const typeMap = {
                    'new_construction': 'New Construction',
                    'renovation_work': 'Renovation Work',
                    'interior_work': 'Interior Work'
                };

                form.projectType = typeMap[buttonId] || 'New Construction';
                form.step = 'collect_area';

                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *${form.projectType} Selected*\n\n📏 Enter area in square feet:\n\n*Example:* 1200`
                );
                break;

            case 'collect_area':
                const area = parseInt(messageText);
                if (isNaN(area) || area <= 0 || area > 10000) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "❌ Please enter valid area (1-10,000 sq ft):"
                    );
                    return { nextStep: 'estimate_form' };
                }

                form.area = area;
                form.step = 'select_quality';

                await whatsappService.sendButtonMessage(
                    phone,
                    "⭐ Select construction quality:", [
                        { id: 'basic', title: '🔧 Basic' },
                        { id: 'standard', title: '🏠 Standard' },
                        { id: 'premium', title: '⭐ Premium' }
                    ]
                );
                break;

            case 'select_quality':
                const qualityMap = {
                    'basic': 'Basic Quality',
                    'standard': 'Standard Quality',
                    'premium': 'Premium Quality'
                };

                form.quality = qualityMap[buttonId] || 'Standard Quality';
                form.step = 'completed';

                return this.completeEstimation(phone, null, userSession);

            default:
                return { nextStep: 'estimate_form' };
        }

        return {
            nextStep: 'estimate_form',
            data: { estimateForm: form }
        };
    }

    async completeEstimation(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'new_inquiry':
                    return this.startProjectInquiry(phone, userSession);
                case 'site_visit':
                    return this.startSiteVisit(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.estimateForm;
        const costBreakdown = this.calculateCost(form);

        const estimationText = `💰 *Cost Estimation Report*\n\n` +
            `*Project Details:*\n` +
            `🏗️ Type: ${form.projectType}\n` +
            `📏 Area: ${form.area} sq ft\n` +
            `⭐ Quality: ${form.quality}\n\n` +
            `*Cost Breakdown:*\n` +
            `🧱 Materials: ${HelperUtils.formatCurrency(costBreakdown.materials)}\n` +
            `👷 Labor: ${HelperUtils.formatCurrency(costBreakdown.labor)}\n` +
            `🔧 Other: ${HelperUtils.formatCurrency(costBreakdown.others)}\n` +
            `────────────────\n` +
            `💰 *Total: ${HelperUtils.formatCurrency(costBreakdown.total)}*\n\n` +
            `*Per sq ft: ${HelperUtils.formatCurrency(costBreakdown.perSqFt)}*\n\n` +
            `⚠️ *Note:* Approximate estimate. Final cost may vary.\n\n` +
            `*Estimate ID:* EST${Date.now().toString().slice(-6)}`;

        await whatsappService.sendTextMessage(phone, estimationText);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'new_inquiry', title: '🏗️ Start Project' },
                { id: 'site_visit', title: '📍 Site Visit' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'estimate_complete' };
    }

    // ==================== SITE VISIT FLOW ====================
    async startSiteVisit(phone, userSession) {
        const visitText = `📍 *Schedule Site Visit*\n\n` +
            `Our expert will visit for:\n\n` +
            `• Project assessment\n` +
            `• Measurements\n` +
            `• Technical consultation\n` +
            `• Quotation preparation\n\n` +
            `*What type of visit?*`;

        await whatsappService.sendButtonMessage(
            phone,
            visitText, [
                { id: 'new_project', title: '🏗️ New Project' },
                { id: 'renovation', title: '🔨 Renovation' },
                { id: 'consultation', title: '💭 Consultation' }
            ]
        );

        return { nextStep: 'visit_form', data: { visitForm: { step: 'select_type' } } };
    }

    async handleVisitForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.visitForm) {
            userSession.data = { visitForm: { step: 'select_type' } };
        }

        const form = userSession.data.visitForm;

        switch (form.step) {
            case 'select_type':
                const typeMap = {
                    'new_project': 'New Project Assessment',
                    'renovation': 'Renovation Planning',
                    'consultation': 'Technical Consultation'
                };

                form.visitType = typeMap[buttonId] || 'New Project Assessment';
                form.step = 'collect_address';

                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *${form.visitType} Selected*\n\n📍 Provide complete site address:\n\n*Include landmarks and PIN code*`
                );
                break;

            case 'collect_address':
                if (!messageText || messageText.length < 10) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "❌ Please provide complete address with PIN code:"
                    );
                    return { nextStep: 'visit_form' };
                }

                form.address = messageText;
                form.step = 'select_date';

                await whatsappService.sendButtonMessage(
                    phone,
                    "📅 Preferred date for visit:", [
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

                form.preferredDate = dateMap[buttonId] || 'Tomorrow';
                form.step = 'collect_contact';

                await whatsappService.sendTextMessage(
                    phone,
                    "👤 Contact person name who will be at site:"
                );
                break;

            case 'collect_contact':
                if (!ValidationUtils.isValidName(messageText)) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "❌ Please provide valid contact person name:"
                    );
                    return { nextStep: 'visit_form' };
                }

                form.contactPerson = messageText;
                form.step = 'completed';

                return this.completeVisit(phone, null, userSession);

            default:
                return { nextStep: 'visit_form' };
        }

        return {
            nextStep: 'visit_form',
            data: { visitForm: form }
        };
    }

    async completeVisit(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'new_inquiry':
                    return this.startProjectInquiry(phone, userSession);
                case 'cost_estimate':
                    return this.startCostEstimation(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.visitForm;
        const visitId = `VISIT${Date.now().toString().slice(-6)}`;

        const confirmationText = `📍 *Site Visit Scheduled!*\n\n` +
            `*Visit ID:* ${visitId}\n\n` +
            `*Details:*\n` +
            `🔧 Type: ${form.visitType}\n` +
            `📍 Address: ${form.address}\n` +
            `📅 Date: ${form.preferredDate}\n` +
            `👤 Contact: ${form.contactPerson}\n\n` +
            `*What to expect:*\n` +
            `• Expert will arrive on time\n` +
            `• Assessment takes 1-2 hours\n` +
            `• Detailed report provided\n` +
            `• Quotation within 24 hours\n\n` +
            `*Confirmation call 1 day before visit*`;

        await whatsappService.sendTextMessage(phone, confirmationText);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'new_inquiry', title: '🏗️ New Project' },
                { id: 'cost_estimate', title: '💰 Get Estimate' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'visit_complete' };
    }

    // ==================== HELPER METHODS ====================
    calculateCost(form) {
        // Base rates per sq ft
        const baseRates = {
            'Basic Quality': 800,
            'Standard Quality': 1200,
            'Premium Quality': 1800
        };

        // Type multipliers
        const typeMultipliers = {
            'New Construction': 1.0,
            'Renovation Work': 0.8,
            'Interior Work': 0.6
        };

        const baseRate = baseRates[form.quality] || 1200;
        const typeMultiplier = typeMultipliers[form.projectType] || 1.0;
        const totalRate = baseRate * typeMultiplier;
        const totalCost = totalRate * form.area;

        // Cost breakdown (approximate percentages)
        const materials = Math.round(totalCost * 0.60); // 60% materials
        const labor = Math.round(totalCost * 0.30); // 30% labor
        const others = totalCost - materials - labor; // 10% others

        return {
            materials,
            labor,
            others,
            total: totalCost,
            perSqFt: Math.round(totalRate)
        };
    }
}

module.exports = new ConstructionFlow();