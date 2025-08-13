const whatsappService = require('../../services/whatsappService');
const HelperUtils = require('../../utils/helpers');
const ValidationUtils = require('../../middleware/validation');
const CONSTANTS = require('../../utils/constants');

class JewelleryFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        switch (step) {
            case 'start':
                return this.showJewelleryWelcome(phone, userSession);

            case 'main_menu':
                return this.handleMainMenu(phone, buttonId, userSession);

                // Browse Catalog Flow
            case 'catalog_start':
                return this.startCatalogFlow(phone, userSession);
            case 'catalog_category':
                return this.selectCatalogCategory(phone, buttonId, userSession);
            case 'catalog_complete':
                return this.completeCatalogFlow(phone, buttonId, userSession);

                // Custom Design Flow
            case 'design_start':
                return this.startDesignFlow(phone, userSession);
            case 'design_type':
                return this.selectDesignType(phone, buttonId, userSession);
            case 'design_form':
                return this.handleDesignForm(phone, messageText, buttonId, userSession);
            case 'design_complete':
                return this.completeDesignFlow(phone, buttonId, userSession);

                // Price Inquiry Flow
            case 'price_start':
                return this.startPriceFlow(phone, userSession);
            case 'price_method':
                return this.selectPriceMethod(phone, buttonId, messageText, userSession);
            case 'price_complete':
                return this.completePriceFlow(phone, buttonId, userSession);

            default:
                return this.showJewelleryWelcome(phone, userSession);
        }
    }

    // Helper method to add delay between messages
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async showJewelleryWelcome(phone, userSession) {
        // Send welcome image first
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/jewellery-welcome.jpg`,
            '💎 Welcome to Premium Jewellery!'
        );

        // Add delay to ensure proper message order
        await this.delay(1000);

        const welcomeText = `💎 *Welcome to Premium Jewellery*\n\n` +
            `Hello ${userSession.name || 'there'}! ✨\n\n` +
            `*We offer:*\n` +
            `🏆 Gold & Diamond Jewellery\n` +
            `🎨 Custom Design Service\n` +
            `💰 Best Price Guarantee\n\n` +
            `*How can we help you?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'browse_catalog', title: '📱 Browse Catalog' },
                { id: 'custom_design', title: '🎨 Custom Design' },
                { id: 'price_inquiry', title: '💰 Price Inquiry' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'browse_catalog':
                return this.startCatalogFlow(phone, userSession);
            case 'custom_design':
                return this.startDesignFlow(phone, userSession);
            case 'price_inquiry':
                return this.startPriceFlow(phone, userSession);
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

    // ==================== CATALOG FLOW ====================
    async startCatalogFlow(phone, userSession) {
        // Send catalog showcase image
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/jewellery-catalog.jpg`,
            '📱 Explore our premium collection!'
        );

        await this.delay(1000);

        const catalogText = `📱 *Browse Our Catalog*\n\n` +
            `Discover our premium collection!\n\n` +
            `*Categories:*\n` +
            `💍 Rings - Wedding & Fashion\n` +
            `📿 Necklaces - Chains & Sets\n` +
            `👂 Earrings - All Styles\n\n` +
            `*Choose a category:*`;

        await whatsappService.sendButtonMessage(
            phone,
            catalogText, [
                { id: 'rings', title: '💍 Rings' },
                { id: 'necklaces', title: '📿 Necklaces' },
                { id: 'earrings', title: '👂 Earrings' }
            ]
        );

        return { nextStep: 'catalog_category' };
    }

    async selectCatalogCategory(phone, buttonId, userSession) {
        const categories = {
            rings: {
                title: 'Rings Collection',
                emoji: '💍',
                image: 'rings-collection.jpg',
                items: [
                    'Gold Wedding Bands - ₹25,000',
                    'Diamond Solitaires - ₹85,000',
                    'Fashion Rings - ₹15,000'
                ]
            },
            necklaces: {
                title: 'Necklaces Collection',
                emoji: '📿',
                image: 'necklaces-collection.jpg',
                items: [
                    'Gold Chains - ₹35,000',
                    'Diamond Necklaces - ₹1,20,000',
                    'Temple Jewelry - ₹45,000'
                ]
            },
            earrings: {
                title: 'Earrings Collection',
                emoji: '👂',
                image: 'earrings-collection.jpg',
                items: [
                    'Gold Studs - ₹12,000',
                    'Diamond Drops - ₹65,000',
                    'Traditional Hoops - ₹18,000'
                ]
            }
        };

        const category = categories[buttonId];
        if (!category) {
            await whatsappService.sendTextMessage(phone, "Please select a valid category.");
            return { nextStep: 'catalog_category' };
        }

        // Send category image first
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/${category.image}`,
            `${category.emoji} ${category.title}`
        );

        await this.delay(1000);

        const categoryText = `${category.emoji} *${category.title}*\n\n` +
            `*Featured Items:*\n` +
            category.items.map((item, i) => `${i + 1}. ${item}`).join('\n') +
            `\n\n*What would you like?*`;

        await whatsappService.sendButtonMessage(
            phone,
            categoryText, [
                { id: 'get_details', title: '📋 Get Details' },
                { id: 'book_visit', title: '🏪 Book Visit' },
                { id: 'price_quote', title: '💰 Price Quote' }
            ]
        );

        return {
            nextStep: 'catalog_complete',
            data: { selectedCategory: buttonId, categoryData: category }
        };
    }

    async completeCatalogFlow(phone, buttonId, userSession) {
        const categoryData = userSession.data ? userSession.data.categoryData : null;

        switch (buttonId) {
            case 'get_details':
                // Send product detail images
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/product-details.jpg`,
                    '📋 Detailed product information'
                );

                await this.delay(1000);

                await whatsappService.sendTextMessage(
                    phone,
                    `📋 *Product Details*\n\n` +
                    `✅ Detailed specifications sent\n` +
                    `✅ High-quality images\n` +
                    `✅ Certificate information\n\n` +
                    `📧 Also sent to your email!`
                );
                break;

            case 'book_visit':
                const visitId = `VIS${Date.now().toString().slice(-6)}`;

                // Send store image
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/store-interior.jpg`,
                    '🏪 Our premium showroom awaits you!'
                );

                await this.delay(1000);

                await whatsappService.sendTextMessage(
                    phone,
                    `🏪 *Store Visit Booked*\n\n` +
                    `*Visit ID:* ${visitId}\n` +
                    `*Category:* ${categoryData?.title || 'Jewelry'}\n` +
                    `*Store:* MG Road, Bangalore\n\n` +
                    `📞 We'll call you within 1 hour!`
                );

                // Send location after confirmation
                await this.delay(1000);
                await whatsappService.sendLocationMessage(
                    phone,
                    12.9716, // Bangalore coordinates
                    77.5946,
                    'Premium Jewellery Showroom',
                    'MG Road, Bangalore - 5100001'
                );
                break;

            case 'price_quote':
                await whatsappService.sendTextMessage(
                    phone,
                    `💰 *Price Quote*\n\n` +
                    `*Category:* ${categoryData?.title || 'Jewelry'}\n` +
                    `*Pricing:* Competitive rates\n` +
                    `*Offers:* Up to 20% off\n\n` +
                    `📞 Sales team will call you!`
                );
                break;

            case 'custom_design':
                return this.startDesignFlow(phone, userSession);

            case 'price_inquiry':
                return this.startPriceFlow(phone, userSession);

            case 'jewel_menu':
                return this.showJewelleryWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                break;
        }

        // Always provide navigation options
        await this.delay(1000);
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'custom_design', title: '🎨 Custom Design' },
                { id: 'jewel_menu', title: '🏠 Jewel Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'catalog_complete' };
    }

    // ==================== CUSTOM DESIGN FLOW ====================
    async startDesignFlow(phone, userSession) {
        // Send design showcase image
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/custom-design-showcase.jpg`,
            '🎨 Create your dream jewelry!'
        );

        await this.delay(1000);

        const designText = `🎨 *Custom Design Service*\n\n` +
            `Create your dream jewelry!\n\n` +
            `*Our Services:*\n` +
            `✨ Personalized designs\n` +
            `📐 3D preview available\n` +
            `🔄 Unlimited revisions\n\n` +
            `*What would you like?*`;

        await whatsappService.sendButtonMessage(
            phone,
            designText, [
                { id: 'custom_ring', title: '💍 Ring' },
                { id: 'custom_necklace', title: '📿 Necklace' },
                { id: 'custom_earrings', title: '👂 Earrings' }
            ]
        );

        return { nextStep: 'design_type' };
    }

    async selectDesignType(phone, buttonId, userSession) {
        const designs = {
            custom_ring: {
                name: 'Custom Ring',
                emoji: '💍',
                image: 'custom-ring-samples.jpg'
            },
            custom_necklace: {
                name: 'Custom Necklace',
                emoji: '📿',
                image: 'custom-necklace-samples.jpg'
            },
            custom_earrings: {
                name: 'Custom Earrings',
                emoji: '👂',
                image: 'custom-earrings-samples.jpg'
            }
        };

        const design = designs[buttonId];
        if (!design) {
            await whatsappService.sendTextMessage(phone, "Please select a valid design type.");
            return { nextStep: 'design_type' };
        }

        // Send design samples image
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/${design.image}`,
            `${design.emoji} ${design.name} design inspiration`
        );

        await this.delay(1000);

        await whatsappService.sendTextMessage(
            phone,
            `${design.emoji} *${design.name}*\n\n` +
            `Please provide your design details:\n\n` +
            `*Include:*\n` +
            `• Metal preference (Gold/Silver)\n` +
            `• Size requirements\n` +
            `• Special features\n` +
            `• Budget range\n\n` +
            `*Example:* "22K gold ring, size 16, simple band, budget ₹25,000"`
        );

        return {
            nextStep: 'design_form',
            data: { selectedDesign: buttonId, designData: design }
        };
    }

    async handleDesignForm(phone, messageText, buttonId, userSession) {
        if (!messageText || messageText.length < 10) {
            await whatsappService.sendTextMessage(
                phone,
                "Please provide more detailed design requirements (minimum 10 characters):"
            );
            return { nextStep: 'design_form' };
        }

        const designData = userSession.data ? userSession.data.designData : null;
        const designId = `DES${Date.now().toString().slice(-6)}`;

        // Send design confirmation image
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/design-confirmation.jpg`,
            '✅ Design request received!'
        );

        await this.delay(1000);

        await whatsappService.sendTextMessage(
            phone,
            `🎨 *Design Request Submitted*\n\n` +
            `*Design ID:* ${designId}\n` +
            `*Type:* ${designData?.name || 'Custom Jewelry'}\n` +
            `*Requirements:* ${messageText}\n\n` +
            `*Next Steps:*\n` +
            `• Designer will review (2 hours)\n` +
            `• 3D preview creation\n` +
            `• Price quotation\n\n` +
            `📞 We'll call you soon!`
        );

        return this.completeDesignFlow(phone, null, userSession);
    }

    async completeDesignFlow(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'browse_catalog':
                return this.startCatalogFlow(phone, userSession);

            case 'price_inquiry':
                return this.startPriceFlow(phone, userSession);

            case 'jewel_menu':
                return this.showJewelleryWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                break;
        }

        // Always provide navigation options
        await this.delay(1000);
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'browse_catalog', title: '📱 Browse Catalog' },
                { id: 'jewel_menu', title: '🏠 Jewel Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'design_complete' };
    }

    // ==================== PRICE INQUIRY FLOW ====================
    async startPriceFlow(phone, userSession) {
        // Send gold rates chart image
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/gold-rates-chart.jpg`,
            '📊 Today\'s live gold rates!'
        );

        await this.delay(1000);

        const priceText = `💰 *Price Inquiry*\n\n` +
            `Get instant price information!\n\n` +
            `*Today's Rates:*\n` +
            `🥇 22K Gold: ₹5,885/gram\n` +
            `🏆 18K Gold: ₹4,815/gram\n` +
            `💎 Diamonds: From ₹25,000/ct\n\n` +
            `*How can we help?*`;

        await whatsappService.sendButtonMessage(
            phone,
            priceText, [
                { id: 'gold_rates', title: '📊 Gold Rates' },
                { id: 'product_price', title: '💍 Product Price' },
                { id: 'estimate', title: '📝 Get Estimate' }
            ]
        );

        return { nextStep: 'price_method' };
    }

    async selectPriceMethod(phone, buttonId, messageText, userSession) {
        switch (buttonId) {
            case 'gold_rates':
                // Send detailed gold rates image
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/detailed-gold-rates.jpg`,
                    '📊 Comprehensive gold rate analysis'
                );

                await this.delay(1000);

                await whatsappService.sendTextMessage(
                    phone,
                    `📊 *Today's Gold Rates*\n\n` +
                    `🥇 24K Gold: ₹6,420/gram\n` +
                    `🏆 22K Gold: ₹5,885/gram\n` +
                    `⚪ 18K Gold: ₹4,815/gram\n` +
                    `🥈 Silver: ₹78/gram\n\n` +
                    `*Changes:* +₹25 from yesterday\n` +
                    `*Updated:* ${new Date().toLocaleTimeString('en-IN')}`
                );
                break;

            case 'product_price':
                // Send product pricing chart
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/product-pricing-chart.jpg`,
                    '💍 Product price ranges'
                );

                await this.delay(1000);

                await whatsappService.sendTextMessage(
                    phone,
                    `💍 *Product Pricing*\n\n` +
                    `*Popular Items:*\n` +
                    `💍 Gold Rings: ₹15,000 - ₹60,000\n` +
                    `📿 Necklaces: ₹25,000 - ₹1,50,000\n` +
                    `👂 Earrings: ₹8,000 - ₹80,000\n\n` +
                    `*Factors:* Weight, design, stones\n` +
                    `📞 Call for exact pricing!`
                );
                break;

            case 'estimate':
                await whatsappService.sendTextMessage(
                    phone,
                    `📝 *Price Estimate*\n\n` +
                    `Please describe what you need:\n\n` +
                    `*Example:* "Gold chain, 20 grams, rope design"\n` +
                    `Include weight, metal, and style for accurate estimate.`
                );

                return { nextStep: 'price_method' };

            default:
                // Handle text input for estimate
                if (messageText && messageText.length > 5) {
                    const estimate = this.calculateEstimate(messageText);

                    // Send estimate visualization
                    await whatsappService.sendMediaMessage(
                        phone,
                        'image',
                        `${process.env.BASE_MEDIA_URL}/images/price-estimate.jpg`,
                        '📊 Your personalized price estimate'
                    );

                    await this.delay(1000);

                    await whatsappService.sendTextMessage(
                        phone,
                        `📊 *Price Estimate*\n\n` +
                        `*Your Request:* ${messageText}\n\n` +
                        `*Estimated Price:* ${estimate.price}\n` +
                        `*Weight Range:* ${estimate.weight}\n` +
                        `*Making Charges:* ${estimate.making}\n\n` +
                        `*Note:* Actual price may vary ±20%\n` +
                        `📞 Call for accurate quote!`
                    );
                } else {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide more details for estimate."
                    );
                    return { nextStep: 'price_method' };
                }
                break;
        }

        return this.completePriceFlow(phone, null, userSession);
    }

    async completePriceFlow(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'browse_catalog':
                return this.startCatalogFlow(phone, userSession);

            case 'custom_design':
                return this.startDesignFlow(phone, userSession);

            case 'jewel_menu':
                return this.showJewelleryWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                break;
        }

        // Always provide navigation options
        await this.delay(1000);
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'browse_catalog', title: '📱 Browse Catalog' },
                { id: 'jewel_menu', title: '🏠 Jewel Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'price_complete' };
    }

    // ==================== HELPER METHODS ====================
    calculateEstimate(description) {
        const desc = description.toLowerCase();
        let basePrice = 25000;
        let weight = '5-8 grams';
        let making = '₹2,000-₹5,000';

        if (desc.includes('chain') || desc.includes('necklace')) {
            basePrice = 35000;
            weight = '10-15 grams';
            making = '₹3,000-₹7,000';
        } else if (desc.includes('ring')) {
            basePrice = 20000;
            weight = '3-6 grams';
            making = '₹1,500-₹4,000';
        } else if (desc.includes('earring')) {
            basePrice = 15000;
            weight = '4-7 grams';
            making = '₹2,000-₹4,500';
        }

        if (desc.includes('diamond')) basePrice *= 3;
        if (desc.includes('22k')) basePrice *= 1.2;

        return {
            price: `₹${basePrice.toLocaleString('en-IN')} - ₹${(basePrice * 1.5).toLocaleString('en-IN')}`,
            weight: weight,
            making: making
        };
    }
}

module.exports = new JewelleryFlow();