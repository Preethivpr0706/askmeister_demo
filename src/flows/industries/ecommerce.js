const whatsappService = require('../../services/whatsappService');

class EcommerceFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        switch (step) {
            case 'start':
                return this.showEcommerceWelcome(phone, userSession);

            case 'main_menu':
                return this.handleMainMenu(phone, buttonId, userSession);

                // Order Tracking Flow
            case 'track_order':
                return this.handleOrderTracking(phone, messageText, userSession);
            case 'waiting_order_number':
                return this.processOrderNumber(phone, messageText, userSession);
            case 'order_actions':
                return this.handleOrderActions(phone, buttonId, userSession);

                // Product Browsing Flow
            case 'browse_products':
                return this.handleProductBrowsing(phone, buttonId, userSession);
            case 'category_selection':
                return this.handleCategorySelection(phone, buttonId, userSession);
            case 'product_details':
                return this.showProductDetails(phone, buttonId, userSession);
            case 'order_process':
                return this.handleOrderProcess(phone, messageText, buttonId, userSession);

                // Customer Support Flow
            case 'customer_support':
                return this.handleCustomerSupport(phone, buttonId, userSession);
            case 'support_category':
                return this.handleSupportCategory(phone, buttonId, userSession);
            case 'support_details':
                return this.handleSupportDetails(phone, messageText, buttonId, userSession);

            default:
                return this.showEcommerceWelcome(phone, userSession);
        }
    }

    // Helper function to add delay
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async showEcommerceWelcome(phone, userSession) {
        // Send welcome offer image FIRST and WAIT
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/ecommerce-offers.jpg`,
            '🎉 Special offers just for you!'
        );

        // Add delay to ensure image is sent first
        await this.delay(1000);

        const welcomeText = `🛒 *Welcome to ShopBot*\n\n` +
            `Hi ${userSession.name || 'there'}! Welcome to MegaMart! 🛍️\n\n` +
            `I'm here to help you with:\n` +
            `📦 Order tracking\n` +
            `🛍️ Product browsing\n` +
            `📞 Customer support\n\n` +
            `*How can I assist you today?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'track_order', title: '📦 Track Order' },
                { id: 'browse_products', title: '🛍️ Browse' },
                { id: 'customer_support', title: '🎧 Support' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'track_order':
                return this.handleOrderTracking(phone, '', userSession);
            case 'browse_products':
                return this.handleProductBrowsing(phone, buttonId, userSession);
            case 'customer_support':
                return this.handleCustomerSupport(phone, buttonId, userSession);
            case 'back_to_main':
            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };
            case 'ecom_menu':
                return this.showEcommerceWelcome(phone, userSession);
            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the available options 👆"
                );
                return { nextStep: 'main_menu' };
        }
    }

    // ==================== ORDER TRACKING FLOW ====================
    async handleOrderTracking(phone, messageText, userSession) {
        // Send tracking info image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/order-tracking-info.jpg`,
            'Track your order easily!'
        );

        await this.delay(1000);

        await whatsappService.sendTextMessage(
            phone,
            `📦 *Order Tracking*\n\n` +
            `Please enter your order number to track your shipment:\n\n` +
            `💡 *Example:* MM123456789\n` +
            `💡 *Format:* Letters + Numbers`
        );

        return { nextStep: 'waiting_order_number' };
    }

    async processOrderNumber(phone, messageText, userSession) {
        if (!messageText || messageText.length < 6) {
            await whatsappService.sendTextMessage(
                phone,
                "❌ Invalid order number format.\n\nPlease enter a valid order number (minimum 6 characters)"
            );
            return { nextStep: 'waiting_order_number' };
        }

        const orderNumber = messageText.toUpperCase();
        const orderStatus = this.generateOrderStatus(orderNumber);

        // Send tracking timeline image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/order-tracking-timeline.jpg`,
            'Your order tracking timeline'
        );

        await this.delay(1000);

        await whatsappService.sendTextMessage(
            phone,
            `📦 *Order: ${orderNumber}*\n\n` +
            `*Status:* ${orderStatus.status} ${orderStatus.emoji}\n` +
            `*Delivery:* ${orderStatus.deliveryDate}\n` +
            `*Items:* ${orderStatus.items}\n\n` +
            `${orderStatus.statusMessage}`
        );

        await whatsappService.sendButtonMessage(
            phone,
            "What would you like to do next?", [
                { id: 'track_another', title: '📦 Track More' },
                { id: 'browse_products', title: '🛍️ Shop' },
                { id: 'ecom_menu', title: '🏠 Menu' }
            ]
        );

        return { nextStep: 'order_actions' };
    }

    async handleOrderActions(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'track_another':
                return this.handleOrderTracking(phone, '', userSession);
            case 'browse_products':
                return this.handleProductBrowsing(phone, buttonId, userSession);
            case 'ecom_menu':
                return this.showEcommerceWelcome(phone, userSession);
            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };
            default:
                return this.showEcommerceWelcome(phone, userSession);
        }
    }

    // ==================== PRODUCT BROWSING FLOW ====================
    async handleProductBrowsing(phone, buttonId, userSession) {
        // Send product categories image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/product-categories.jpg`,
            '🛍️ Explore our product categories'
        );

        await this.delay(1000);

        const browseText = `🛍️ *Product Categories*\n\n` +
            `Discover amazing products!\n\n` +
            `🔥 *Today's Deals:*\n` +
            `• Up to 70% OFF Electronics\n` +
            `• Buy 2 Get 1 FREE Fashion\n` +
            `• Extra 20% OFF: SAVE20\n\n` +
            `*Choose a category:*`;

        await whatsappService.sendButtonMessage(
            phone,
            browseText, [
                { id: 'electronics', title: '📱 Electronics' },
                { id: 'fashion', title: '👔 Fashion' },
                { id: 'home', title: '🏠 Home' }
            ]
        );

        return { nextStep: 'category_selection' };
    }

    async handleCategorySelection(phone, buttonId, userSession) {
            const categoryData = this.getCategoryData(buttonId);

            if (!categoryData) {
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select a valid category from the options above."
                );
                return { nextStep: 'category_selection' };
            }

            // Send category-specific image FIRST
            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/category-${buttonId}.jpg`,
                `${categoryData.emoji} ${categoryData.name} collection`
            );

            await this.delay(1000);

            await whatsappService.sendTextMessage(
                    phone,
                    `${categoryData.emoji} *${categoryData.name}*\n\n` +
                    `${categoryData.description}\n\n` +
                    `*Featured Products:*\n` +
                    `${categoryData.products.map(p => `• ${p.name} - ₹${p.price}`).join('\n')}\n\n` +
            `*Special Offers:*\n${categoryData.offers}`
        );

        await whatsappService.sendButtonMessage(
            phone,
            "What would you like to do?", [
                { id: 'view_products', title: '👀 View Details' },
                { id: 'order_now', title: '🛒 Order Now' },
                { id: 'browse_more', title: '🔍 Browse More' }
            ]
        );

        return { 
            nextStep: 'product_details',
            data: { selectedCategory: buttonId, categoryData }
        };
    }

    // ==================== PRODUCT DETAILS & ORDERING FLOW ====================
    async showProductDetails(phone, buttonId, userSession) {
        const categoryData = userSession.data?.categoryData;
        
        switch (buttonId) {
            case 'view_products':
                // Send product showcase image FIRST
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/product-showcase.jpg`,
                    '✨ Featured products in this category'
                );
                
                await this.delay(1000);

                await whatsappService.sendTextMessage(
                    phone,
                    `👀 *Product Details*\n\n` +
                    `Here are the top products in ${categoryData?.name}:\n\n` +
                    `${categoryData?.products.map((p, i) => 
                        `${i + 1}. *${p.name}*\n   ₹${p.price} | ⭐⭐⭐⭐⭐\n`
                    ).join('\n')}\n` +
                    `💡 *Tip:* Use code FIRST10 for 10% off!`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "What would you like to do next?", [
                        { id: 'order_now', title: '🛒 Order Now' },
                        { id: 'ecom_menu', title: '🏠 Ecom Menu' },
                        { id: 'main_menu', title: '🏠 Main Menu' }
                    ]
                );

                return { nextStep: 'product_details' };

            case 'order_now':
                return this.handleOrderProcess(phone, '', buttonId, userSession);

            case 'browse_more':
                return this.handleProductBrowsing(phone, buttonId, userSession);

            case 'ecom_menu':
                return this.showEcommerceWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                // If no specific button, show the product details options
                await whatsappService.sendButtonMessage(
                    phone,
                    "What would you like to do next?", [
                        { id: 'order_now', title: '🛒 Order Now' },
                        { id: 'ecom_menu', title: '🏠 Ecom Menu' },
                        { id: 'main_menu', title: '🏠 Main Menu' }
                    ]
                );
                return { nextStep: 'product_details' };
        }
    }

    async handleOrderProcess(phone, messageText, buttonId, userSession) {
        // Initialize order form if not exists
        if (!userSession.data || !userSession.data.orderForm) {
            userSession.data = {
                ...(userSession.data || {}),
                orderForm: { step: 'start_order' }
            };
        }

        const form = userSession.data.orderForm;
        const categoryData = userSession.data.categoryData;

        // Handle order initiation
        if (buttonId === 'order_now' || form.step === 'start_order') {
            form.step = 'collect_name';
            form.selectedProduct = categoryData?.products[0]; // Default to first product

            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/order-form.jpg`,
                '📝 Quick order form'
            );
            
            await this.delay(1000);

            await whatsappService.sendTextMessage(
                phone,
                `🛒 *Order: ${form.selectedProduct?.name}*\n` +
                `💰 *Price: ₹${form.selectedProduct?.price}*\n\n` +
                `📝 Please provide your full name:`
            );

            return {
                nextStep: 'order_process',
                data: { orderForm: form, categoryData }
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
                    return { nextStep: 'order_process' };
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
                    return { nextStep: 'order_process' };
                }

                form.phone = messageText;
                form.step = 'collect_address';

                await whatsappService.sendTextMessage(
                    phone,
                    "📍 Please provide your delivery address:"
                );
                break;

            case 'collect_address':
                if (!messageText || messageText.length < 10) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a complete address:"
                    );
                    return { nextStep: 'order_process' };
                }

                form.address = messageText;
                form.step = 'payment_method';

                await whatsappService.sendButtonMessage(
                    phone,
                    "💳 Choose your payment method:", [
                        { id: 'cod', title: '💰 COD' },
                        { id: 'online', title: '💳 Online' },
                        { id: 'upi', title: '📱 UPI' }
                    ]
                );
                break;

            case 'payment_method':
                const paymentMethods = {
                    'cod': 'Cash on Delivery',
                    'online': 'Online Payment',
                    'upi': 'UPI Payment'
                };

                form.paymentMethod = paymentMethods[buttonId] || 'Cash on Delivery';
                form.step = 'completed';

                const orderId = `ORD${Date.now().toString().slice(-6)}`;

                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/order-success.jpg`,
                    '🎉 Order placed successfully!'
                );
                
                await this.delay(1000);

                await whatsappService.sendTextMessage(
                    phone,
                    `🎉 *Order Placed Successfully!*\n\n` +
                    `*Order Details:*\n` +
                    `🆔 Order ID: ${orderId}\n` +
                    `👤 Name: ${form.name}\n` +
                    `📱 Phone: ${form.phone}\n` +
                    `🛍️ Product: ${form.selectedProduct?.name}\n` +
                    `💰 Amount: ₹${form.selectedProduct?.price}\n` +
                    `💳 Payment: ${form.paymentMethod}\n` +
                    `📍 Address: ${form.address.substring(0, 30)}...\n\n` +
                    `📧 Order confirmation sent to your phone!\n` +
                    `🚚 Delivery in 2-3 business days`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "🛒 *Order completed!*\n\nWhat would you like to do next?", [
                        { id: 'track_order', title: '📦 Track Order' },
                        { id: 'ecom_menu', title: '🏠 Ecom Menu' },
                        { id: 'main_menu', title: '🏠 Main Menu' }
                    ]
                );

                return { nextStep: 'main_menu' };

            default:
                return { nextStep: 'order_process' };
        }

        return {
            nextStep: 'order_process',
            data: { orderForm: form, categoryData }
        };
    }
    async handleCustomerSupport(phone, buttonId, userSession) {
        // Send customer support image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/customer-support.jpg`,
            '🎧 24/7 Customer Support'
        );
        
        await this.delay(1000);

        const supportText = `🎧 *Customer Support*\n\n` +
            `Hi ${userSession.name || 'there'}! How can we help?\n\n` +
            `*Common Issues:*\n` +
            `📦 Order & delivery\n` +
            `💳 Payment & refunds\n` +
            `🔄 Returns & exchanges\n\n` +
            `*Support Hours:* 24/7 Chat\n` +
            `*How can we assist you?*`;

        await whatsappService.sendButtonMessage(
            phone,
            supportText, [
                { id: 'order_issue', title: '📦 Order Issue' },
                { id: 'payment_issue', title: '💳 Payment' },
                { id: 'return_exchange', title: '🔄 Return' }
            ]
        );

        return { nextStep: 'support_category' };
    }

    async handleSupportCategory(phone, buttonId, userSession) {
        let supportType = '';
        let supportMessage = '';
        let imageUrl = '';

        switch (buttonId) {
            case 'order_issue':
                supportType = 'Order Issue';
                imageUrl = `${process.env.BASE_MEDIA_URL}/images/order-issues.jpg`;
                supportMessage = `📦 *Order Issue Support*\n\n` +
                    `Common order issues:\n` +
                    `• Delayed delivery\n` +
                    `• Wrong item received\n` +
                    `• Missing items\n\n` +
                    `Please describe your issue:`;
                break;

            case 'payment_issue':
                supportType = 'Payment Issue';
                imageUrl = `${process.env.BASE_MEDIA_URL}/images/payment-issues.jpg`;
                supportMessage = `💳 *Payment Issue Support*\n\n` +
                    `Payment related help:\n` +
                    `• Payment failed\n` +
                    `• Refund status\n` +
                    `• Invoice queries\n\n` +
                    `Please describe your issue:`;
                break;

            case 'return_exchange':
                supportType = 'Return/Exchange';
                imageUrl = `${process.env.BASE_MEDIA_URL}/images/return-exchange.jpg`;
                supportMessage = `🔄 *Return/Exchange Support*\n\n` +
                    `Return policy:\n` +
                    `• 30-day return window\n` +
                    `• Free return pickup\n` +
                    `• Instant refund\n\n` +
                    `Please describe what to return:`;
                break;

            default:
                return { nextStep: 'support_category' };
        }

        // Send support category image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            imageUrl,
            `${supportType} assistance`
        );
        
        await this.delay(1000);

        await whatsappService.sendTextMessage(phone, supportMessage);

        return { 
            nextStep: 'support_details',
            data: { supportType }
        };
    }

    async handleSupportDetails(phone, messageText, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'track_order':
                    return this.handleOrderTracking(phone, '', userSession);
                case 'browse_products':
                    return this.handleProductBrowsing(phone, buttonId, userSession);
                case 'ecom_menu':
                    return this.showEcommerceWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const supportType = userSession.data?.supportType || 'General';
        
        if (messageText && messageText.length > 5) {
            // Send support ticket created image FIRST
            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/support-ticket.jpg`,
                '✅ Support ticket created successfully'
            );
            
            await this.delay(1000);

            await whatsappService.sendTextMessage(
                phone,
                `✅ *Support Ticket Created*\n\n` +
                `*Ticket ID:* SUP${Date.now().toString().slice(-6)}\n` +
                `*Type:* ${supportType}\n` +
                `*Status:* In Progress\n\n` +
                `*Your Issue:*\n"${messageText.substring(0, 50)}..."\n\n` +
                `📞 Team will contact you within 2 hours\n` +
                `📧 Updates sent to your email`
            );

            await whatsappService.sendButtonMessage(
                phone,
                "🎧 *Support request completed!*\n\nWhat would you like to do next?", [
                    { id: 'track_order', title: '📦 Track Order' },
                    { id: 'ecom_menu', title: '🏠 Ecom Menu' },
                    { id: 'main_menu', title: '🏠 Main Menu' }
                ]
            );

            return { nextStep: 'main_menu' };
        } else {
            await whatsappService.sendTextMessage(
                phone,
                `Please provide more details about your ${supportType.toLowerCase()} (minimum 5 characters)`
            );
            return { nextStep: 'support_details' };
        }
    }

    // ==================== HELPER METHODS ====================
    generateOrderStatus(orderNumber) {
        const statuses = [
            {
                status: "Out for Delivery",
                emoji: "🚚",
                deliveryDate: "Today by 6 PM",
                statusMessage: "🎉 Your order is out for delivery!",
                items: "• Wireless Headphones x1\n• Phone Case x1"
            },
            {
                status: "In Transit",
                emoji: "📦",
                deliveryDate: "Tomorrow by 8 PM",
                statusMessage: "📍 Your order is on the way!",
                items: "• Smartphone x1\n• Screen Protector x1"
            },
            {
                status: "Delivered",
                emoji: "✅",
                deliveryDate: "Delivered on " + new Date().toLocaleDateString(),
                statusMessage: "🎉 Order delivered successfully!",
                items: "• Laptop x1\n• Mouse x1"
            }
        ];

        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    getCategoryData(categoryId) {
        const categories = {
            electronics: {
                name: "Electronics",
                emoji: "📱",
                description: "Latest gadgets with amazing features and competitive prices.",
                products: [
                    { name: "iPhone 15 Pro", price: "1,34,900" },
                    { name: "Samsung Galaxy S24", price: "89,999" },
                    { name: "MacBook Air M3", price: "1,14,900" }
                ],
                offers: "• Up to ₹15,000 exchange bonus\n• No cost EMI available\n• Free accessories"
            },
            fashion: {
                name: "Fashion",
                emoji: "👔",
                description: "Trendy clothing and accessories for every occasion.",
                products: [
                    { name: "Designer Dress", price: "3,999" },
                    { name: "Formal Shirt", price: "1,999" },
                    { name: "Casual Jeans", price: "2,499" }
                ],
                offers: "• Buy 2 Get 1 Free\n• Flat 40% OFF on combo\n• Free alterations"
            },
            home: {
                name: "Home & Kitchen",
                emoji: "🏠",
                description: "Essential items to make your home beautiful and functional.",
                products: [
                    { name: "Mixer Grinder", price: "4,999" },
                    { name: "Office Chair", price: "8,999" },
                    { name: "Wall Art", price: "2,499" }
                ],
                offers: "• Free installation\n• Extended warranty\n• Home trial for 7 days"
            }
        };

        return categories[categoryId] || null;
    }
}

module.exports = new EcommerceFlow();