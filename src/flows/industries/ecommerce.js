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
            case 'order_complete':
                return this.completeOrderFlow(phone, buttonId, userSession);

                // Product Browsing Flow
            case 'browse_products':
                return this.handleProductBrowsing(phone, buttonId, userSession);
            case 'category_selection':
                return this.handleCategorySelection(phone, buttonId, userSession);
            case 'product_details':
                return this.showProductDetails(phone, buttonId, userSession);
            case 'browse_complete':
                return this.completeBrowseFlow(phone, buttonId, userSession);

                // Cart Recovery Flow
            case 'cart_recovery':
                return this.handleCartRecovery(phone, buttonId, userSession);
            case 'cart_actions':
                return this.handleCartActions(phone, buttonId, userSession);
            case 'checkout_process':
                return this.handleCheckoutProcess(phone, buttonId, userSession);
            case 'cart_complete':
                return this.completeCartFlow(phone, buttonId, userSession);

                // Customer Support Flow
            case 'customer_support':
                return this.handleCustomerSupport(phone, buttonId, userSession);
            case 'support_category':
                return this.handleSupportCategory(phone, buttonId, userSession);
            case 'support_details':
                return this.handleSupportDetails(phone, messageText, buttonId, userSession);
            case 'support_complete':
                return this.completeSupportFlow(phone, buttonId, userSession);

            default:
                return this.showEcommerceWelcome(phone, userSession);
        }
    }

    async showEcommerceWelcome(phone, userSession) {
        // Send welcome offer image FIRST and WAIT for it to complete
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/ecommerce-offers.jpg`,
            '🎉 Special offers just for you!'
        );

        const welcomeText = `🛒 *Welcome to ShopBot*\n\n` +
            `Hi ${userSession.name || 'there'}! Welcome to MegaMart! 🛍️\n\n` +
            `I'm here to help you with:\n` +
            `📦 Order tracking & updates\n` +
            `🛍️ Product browsing\n` +
            `💳 Cart & checkout help\n` +
            `📞 Customer support\n\n` +
            `*How can I assist you today?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'track_order', title: '📦 Track Order' },
                { id: 'browse_products', title: '🛍️ Browse' },
                { id: 'cart_recovery', title: '🛒 My Cart' }
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
            case 'cart_recovery':
                return this.handleCartRecovery(phone, buttonId, userSession);
            case 'customer_support':
                return this.handleCustomerSupport(phone, buttonId, userSession);
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

    // ==================== ORDER TRACKING FLOW ====================
    async handleOrderTracking(phone, messageText, userSession) {
        // Send tracking info image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/order-tracking-info.jpg`,
            'Track your order easily!'
        );

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

        await whatsappService.sendTextMessage(
            phone,
            `📦 *Order: ${orderNumber}*\n\n` +
            `*Status:* ${orderStatus.status} ${orderStatus.emoji}\n` +
            `*Delivery:* ${orderStatus.deliveryDate}\n` +
            `*Tracking:* ${orderStatus.trackingId}\n\n` +
            `*Items:*\n${orderStatus.items}\n\n` +
            `*Address:*\n${orderStatus.address}\n\n` +
            `${orderStatus.statusMessage}`
        );

        await whatsappService.sendButtonMessage(
            phone,
            "What would you like to do next?", [
                { id: 'modify_order', title: '✏️ Modify' },
                { id: 'contact_delivery', title: '📞 Contact' },
                { id: 'track_another', title: '📦 Track More' }
            ]
        );

        return {
            nextStep: 'order_actions',
            data: { orderNumber, orderStatus }
        };
    }

    async handleOrderActions(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'modify_order':
                // Send modification options image FIRST
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/order-modification.jpg`,
                    'Order modification options'
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `✏️ *Modify Order*\n\n` +
                    `Order modification options:\n` +
                    `• Change delivery address\n` +
                    `• Update delivery time\n` +
                    `• Cancel order\n\n` +
                    `📞 Call: 1800-123-4567\n` +
                    `⏰ Available: 9 AM - 9 PM`
                );
                break;

            case 'contact_delivery':
                // Send delivery partner image FIRST
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/delivery-partner.jpg`,
                    'Your delivery partner details'
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `📞 *Contact Delivery Partner*\n\n` +
                    `Delivery Partner: FastTrack Express\n` +
                    `📱 Mobile: +91 98765 43210\n` +
                    `🚚 Vehicle: KA01AB1234\n\n` +
                    `💡 You can call directly for real-time updates!`
                );
                break;

            case 'track_another':
                return this.handleOrderTracking(phone, '', userSession);

            default:
                break;
        }

        return { nextStep: 'order_complete' };
    }

    async completeOrderFlow(phone, buttonId, userSession) {
        await whatsappService.sendButtonMessage(
            phone,
            "🎉 *Order tracking completed!*\n\nIs there anything else I can help you with?", [
                { id: 'browse_products', title: '🛍️ Shop More' },
                { id: 'customer_support', title: '🎧 Support' },
                { id: 'back_to_main', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'main_menu' };
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

        const browseText = `🛍️ *Product Categories*\n\n` +
            `Discover amazing products!\n\n` +
            `🔥 *Today's Deals:*\n` +
            `• Up to 70% OFF Electronics\n` +
            `• Buy 2 Get 1 FREE Fashion\n` +
            `• Extra 20% OFF: SAVE20\n\n` +
            `*Choose a category:*`;

        const sections = [{
                title: "Electronics",
                rows: [
                    { id: "smartphones", title: "📱 Smartphones", description: "Latest models & offers" },
                    { id: "laptops", title: "💻 Laptops", description: "Work & gaming laptops" },
                    { id: "accessories", title: "🎧 Accessories", description: "Headphones & more" }
                ]
            },
            {
                title: "Fashion",
                rows: [
                    { id: "mens_fashion", title: "👔 Men's Fashion", description: "Clothing & shoes" },
                    { id: "womens_fashion", title: "👗 Women's Fashion", description: "Trendy outfits" },
                    { id: "kids_fashion", title: "👶 Kids Fashion", description: "Cute clothes" }
                ]
            },
            {
                title: "Home & Kitchen",
                rows: [
                    { id: "home_decor", title: "🏠 Home Decor", description: "Beautiful items" },
                    { id: "kitchen", title: "🍳 Kitchen", description: "Appliances & tools" },
                    { id: "furniture", title: "🪑 Furniture", description: "Stylish furniture" }
                ]
            }
        ];

        await whatsappService.sendListMessage(
            phone,
            browseText,
            "Browse Categories",
            sections
        );

        return { nextStep: 'category_selection' };
    }

    async handleCategorySelection(phone, buttonId, userSession) {
            const categoryData = this.getCategoryData(buttonId);

            if (!categoryData) {
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select a valid category from the list above."
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
            "What would you like to do?",
            [
                { id: 'view_products', title: '👀 View Products' },
                { id: 'add_to_cart', title: '🛒 Add to Cart' },
                { id: 'browse_more', title: '🔍 Browse More' }
            ]
        );

        return { 
            nextStep: 'product_details',
            data: { selectedCategory: buttonId, categoryData }
        };
    }

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

                await whatsappService.sendTextMessage(
                    phone,
                    `👀 *Product Details*\n\n` +
                    `Here are the top products in ${categoryData?.name}:\n\n` +
                    `${categoryData?.products.map((p, i) => 
                        `${i + 1}. *${p.name}*\n   ₹${p.price} | ${p.rating}⭐\n   ${p.description}\n`
                    ).join('\n')}\n` +
                    `💡 *Tip:* Use code FIRST10 for 10% off on first order!`
                );
                break;

            case 'add_to_cart':
                // Send cart success image FIRST
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/cart-success.jpg`,
                    '🛒 Successfully added to cart!'
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `🛒 *Added to Cart!*\n\n` +
                    `✅ ${categoryData?.products[0]?.name} added successfully!\n\n` +
                    `*Cart Summary:*\n` +
                    `Items: 1\n` +
                    `Subtotal: ₹${categoryData?.products[0]?.price}\n` +
                    `Shipping: FREE\n\n` +
                    `🎉 You're eligible for free shipping!`
                );
                break;

            case 'browse_more':
                return this.handleProductBrowsing(phone, buttonId, userSession);

            default:
                break;
        }

        return { nextStep: 'browse_complete' };
    }

    async completeBrowseFlow(phone, buttonId, userSession) {
        await whatsappService.sendButtonMessage(
            phone,
            "🛍️ *Browse completed!*\n\nWhat would you like to do next?",
            [
                { id: 'cart_recovery', title: '🛒 View Cart' },
                { id: 'track_order', title: '📦 Track Order' },
                { id: 'back_to_main', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    // ==================== CART RECOVERY FLOW ====================
    async handleCartRecovery(phone, buttonId, userSession) {
        // Send shopping cart image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/shopping-cart.jpg`,
            '🛒 Your cart items are waiting!'
        );

        const cartText = `🛒 *Your Shopping Cart*\n\n` +
            `Hi ${userSession.name || 'there'}! Items in your cart:\n\n` +
            `*Cart Items:*\n` +
            `📱 iPhone 15 Pro - ₹1,34,900\n` +
            `🎧 AirPods Pro - ₹24,900\n` +
            `📱 Phone Case - ₹1,299\n\n` +
            `*Subtotal:* ₹1,61,099\n` +
            `*Discount:* -₹16,110 (10%)\n` +
            `*Total:* ₹1,44,989\n\n` +
            `💰 *Offer:* SAVE15 for extra 15% OFF!`;

        await whatsappService.sendButtonMessage(
            phone,
            cartText,
            [
                { id: 'checkout_now', title: '💳 Checkout' },
                { id: 'apply_coupon', title: '🎫 Coupon' },
                { id: 'save_later', title: '💾 Save Later' }
            ]
        );

        return { nextStep: 'cart_actions' };
    }

    async handleCartActions(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'checkout_now':
                return this.handleCheckoutProcess(phone, buttonId, userSession);

            case 'apply_coupon':
                // Send coupon offers image FIRST
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/coupon-offers.jpg`,
                    '🎫 Available coupon offers'
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `🎫 *Apply Coupon*\n\n` +
                    `Available coupons:\n` +
                    `• SAVE15 - 15% OFF (Max ₹5000)\n` +
                    `• FIRST10 - 10% OFF for new users\n` +
                    `• FREESHIP - Free shipping\n\n` +
                    `💡 Enter coupon code or select from above`
                );
                break;

            case 'save_later':
                // Send save for later image FIRST
                await whatsappService.sendMediaMessage(
                    phone,
                    'image',
                    `${process.env.BASE_MEDIA_URL}/images/save-for-later.jpg`,
                    '💾 Items saved for later'
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `💾 *Saved for Later*\n\n` +
                    `✅ Your cart has been saved!\n\n` +
                    `We'll send you reminders about:\n` +
                    `📧 Price drops\n` +
                    `🎁 Special offers\n` +
                    `⏰ Limited time deals\n\n` +
                    `Items will be saved for 30 days.`
                );
                break;

            default:
                break;
        }

        return { nextStep: 'cart_complete' };
    }

    async handleCheckoutProcess(phone, buttonId, userSession) {
        // Send checkout process image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/checkout-process.jpg`,
            '💳 Secure checkout process'
        );

        await whatsappService.sendTextMessage(
            phone,
            `💳 *Checkout Process*\n\n` +
            `*Step 1:* Delivery Address ✅\n` +
            `*Step 2:* Payment Method\n` +
            `*Step 3:* Order Confirmation\n\n` +
            `*Payment Options:*\n` +
            `💳 Credit/Debit Card\n` +
            `📱 UPI/Digital Wallet\n` +
            `💰 Cash on Delivery\n` +
            `🏦 Net Banking\n\n` +
            `*Estimated Delivery:* 2-3 days\n` +
            `*Shipping:* FREE (Above ₹500)`
        );

        await whatsappService.sendButtonMessage(
            phone,
            "Choose your payment method:",
            [
                { id: 'card_payment', title: '💳 Card' },
                { id: 'upi_payment', title: '📱 UPI' },
                { id: 'cod_payment', title: '💰 COD' }
            ]
        );

        return { nextStep: 'cart_complete' };
    }

    async completeCartFlow(phone, buttonId, userSession) {
        let paymentMethod = '';
        switch (buttonId) {
            case 'card_payment':
                paymentMethod = 'Credit/Debit Card';
                break;
            case 'upi_payment':
                paymentMethod = 'UPI Payment';
                break;
            case 'cod_payment':
                paymentMethod = 'Cash on Delivery';
                break;
        }

        if (paymentMethod) {
            // Send order success image FIRST
            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/order-success.jpg`,
                '🎉 Order placed successfully!'
            );

            await whatsappService.sendTextMessage(
                phone,
                `🎉 *Order Placed Successfully!*\n\n` +
                `*Order ID:* MM${Date.now()}\n` +
                `*Payment:* ${paymentMethod}\n` +
                `*Total:* ₹1,44,989\n` +
                `*Delivery:* 2-3 business days\n\n` +
                `📧 Order confirmation sent to your email\n` +
                `📱 Track your order anytime!`
            );
        }

        await whatsappService.sendButtonMessage(
            phone,
            "🛒 *Cart process completed!*\n\nWhat would you like to do next?",
            [
                { id: 'track_order', title: '📦 Track Order' },
                { id: 'browse_products', title: '🛍️ Shop More' },
                { id: 'back_to_main', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    // ==================== CUSTOMER SUPPORT FLOW ====================
    async handleCustomerSupport(phone, buttonId, userSession) {
        // Send customer support image FIRST
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/customer-support.jpg`,
            '🎧 24/7 Customer Support'
        );

        const supportText = `🎧 *Customer Support*\n\n` +
            `Hi ${userSession.name || 'there'}! How can we help?\n\n` +
            `*Common Issues:*\n` +
            `📦 Order & delivery\n` +
            `💳 Payment & refunds\n` +
            `🔄 Returns & exchanges\n\n` +
            `*Support Hours:*\n` +
            `⏰ 24/7 Chat Support\n` +
            `📞 Call: 9 AM - 9 PM\n\n` +
            `*How can we assist you?*`;

        await whatsappService.sendButtonMessage(
            phone,
            supportText,
            [
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
                    `• Damaged package\n` +
                    `• Missing items\n\n` +
                    `Please describe your specific issue:`;
                break;

            case 'payment_issue':
                supportType = 'Payment Issue';
                imageUrl = `${process.env.BASE_MEDIA_URL}/images/payment-issues.jpg`;
                supportMessage = `💳 *Payment Issue Support*\n\n` +
                    `Payment related help:\n` +
                    `• Payment failed but amount deducted\n` +
                    `• Refund status\n` +
                    `• Payment method issues\n` +
                    `• Invoice queries\n\n` +
                    `Please describe your payment issue:`;
                break;

            case 'return_exchange':
                supportType = 'Return/Exchange';
                imageUrl = `${process.env.BASE_MEDIA_URL}/images/return-exchange.jpg`;
                supportMessage = `🔄 *Return/Exchange Support*\n\n` +
                    `Return & Exchange policy:\n` +
                    `• 30-day return window\n` +
                    `• Free return pickup\n` +
                    `• Instant refund/exchange\n` +
                    `• Original packaging required\n\n` +
                    `Please describe what you want to return:`;
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

        await whatsappService.sendTextMessage(phone, supportMessage);

        return { 
            nextStep: 'support_details',
            data: { supportType }
        };
    }

    async handleSupportDetails(phone, messageText, buttonId, userSession) {
        const supportType = userSession.data?.supportType || 'General';
        
        if (messageText && messageText.length > 10) {
            // Send support ticket created image FIRST
            await whatsappService.sendMediaMessage(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/support-ticket.jpg`,
                '✅ Support ticket created successfully'
            );

            await whatsappService.sendTextMessage(
                phone,
                `✅ *Support Ticket Created*\n\n` +
                `*Ticket ID:* SUP${Date.now()}\n` +
                `*Type:* ${supportType}\n` +
                `*Status:* In Progress\n\n` +
                `*Your Issue:*\n"${messageText.substring(0, 100)}..."\n\n` +
                `📞 Our team will contact you within 2 hours\n` +
                `📧 Updates will be sent to your email\n\n` +
                `*Priority Support:* Call 1800-123-4567`
            );
        } else {
            await whatsappService.sendTextMessage(
                phone,
                `Please provide more details about your ${supportType.toLowerCase()} (minimum 10 characters)`
            );
            return { nextStep: 'support_details' };
        }

        return { nextStep: 'support_complete' };
    }

    async completeSupportFlow(phone, buttonId, userSession) {
        await whatsappService.sendButtonMessage(
            phone,
            "🎧 *Support request completed!*\n\nIs there anything else I can help you with?",
            [
                { id: 'track_order', title: '📦 Track Order' },
                { id: 'browse_products', title: '🛍️ Shop' },
                { id: 'back_to_main', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    // ==================== HELPER METHODS ====================
    generateOrderStatus(orderNumber) {
        const statuses = [
            {
                status: "Out for Delivery",
                emoji: "🚚",
                deliveryDate: "Today by 6 PM",
                statusMessage: "🎉 Your order is out for delivery!",
                trackingId: "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase()
            },
            {
                status: "In Transit",
                emoji: "📦",
                deliveryDate: "Tomorrow by 8 PM",
                statusMessage: "📍 Your order is on the way!",
                trackingId: "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase()
            },
            {
                status: "Delivered",
                emoji: "✅",
                deliveryDate: "Delivered on " + new Date().toLocaleDateString(),
                statusMessage: "🎉 Order delivered successfully!",
                trackingId: "TRK" + Math.random().toString(36).substr(2, 9).toUpperCase()
            }
        ];

        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return {
            ...randomStatus,
            items: "• Wireless Headphones x1\n• Phone Case (Black) x1\n• Screen Protector x2",
            address: "John Doe\n123, MG Road\nBangalore - 560034\nPhone: +91 98765 43210"
        };
    }

    getCategoryData(categoryId) {
        const categories = {
            smartphones: {
                name: "Smartphones",
                emoji: "📱",
                description: "Latest smartphones with amazing features and competitive prices.",
                products: [
                    { name: "iPhone 15 Pro", price: "1,34,900", rating: "4.8", description: "Latest Apple flagship with titanium design" },
                    { name: "Samsung Galaxy S24", price: "89,999", rating: "4.7", description: "AI-powered Android flagship" },
                    { name: "OnePlus 12", price: "64,999", rating: "4.6", description: "Flagship killer with premium features" }
                ],
                                offers: "• Up to ₹15,000 exchange bonus\n• No cost EMI available\n• Free wireless charger"
            },
            laptops: {
                name: "Laptops",
                emoji: "💻",
                description: "High-performance laptops for work, gaming, and creativity.",
                products: [
                    { name: "MacBook Air M3", price: "1,14,900", rating: "4.9", description: "Ultra-thin laptop with M3 chip" },
                    { name: "Dell XPS 13", price: "89,990", rating: "4.7", description: "Premium Windows ultrabook" },
                    { name: "HP Pavilion Gaming", price: "65,990", rating: "4.5", description: "Gaming laptop with RTX graphics" }
                ],
                offers: "• Free Microsoft Office\n• Extended warranty\n• Gaming accessories bundle"
            },
            accessories: {
                name: "Accessories",
                emoji: "🎧",
                description: "Premium accessories to enhance your tech experience.",
                products: [
                    { name: "AirPods Pro", price: "24,900", rating: "4.8", description: "Active noise cancellation" },
                    { name: "Sony WH-1000XM5", price: "29,990", rating: "4.9", description: "Industry-leading noise canceling" },
                    { name: "Anker PowerBank", price: "2,999", rating: "4.6", description: "20000mAh fast charging" }
                ],
                offers: "• Buy 2 Get 1 Free on cases\n• Free shipping\n• 1-year warranty"
            },
            mens_fashion: {
                name: "Men's Fashion",
                emoji: "👔",
                description: "Trendy clothing and accessories for modern men.",
                products: [
                    { name: "Formal Shirt", price: "1,999", rating: "4.5", description: "Premium cotton formal shirt" },
                    { name: "Casual Jeans", price: "2,499", rating: "4.6", description: "Comfortable slim-fit jeans" },
                    { name: "Leather Shoes", price: "4,999", rating: "4.7", description: "Genuine leather formal shoes" }
                ],
                offers: "• Buy 2 Get 1 Free\n• Flat 40% OFF on combo\n• Free alterations"
            },
            womens_fashion: {
                name: "Women's Fashion",
                emoji: "👗",
                description: "Stylish outfits and accessories for every occasion.",
                products: [
                    { name: "Designer Dress", price: "3,999", rating: "4.8", description: "Elegant party wear dress" },
                    { name: "Casual Top", price: "1,299", rating: "4.5", description: "Comfortable cotton top" },
                    { name: "Handbag", price: "2,999", rating: "4.6", description: "Premium leather handbag" }
                ],
                offers: "• Up to 60% OFF\n• Free jewelry with dress\n• Size exchange available"
            },
            kids_fashion: {
                name: "Kids Fashion",
                emoji: "👶",
                description: "Cute and comfortable clothing for children.",
                products: [
                    { name: "Kids T-Shirt", price: "599", rating: "4.7", description: "Soft cotton cartoon t-shirt" },
                    { name: "Kids Jeans", price: "899", rating: "4.5", description: "Comfortable kids denim" },
                    { name: "School Shoes", price: "1,499", rating: "4.6", description: "Durable school shoes" }
                ],
                offers: "• Buy 3 Get 1 Free\n• Growing size guarantee\n• Free school bag"
            },
            home_decor: {
                name: "Home Decor",
                emoji: "🏠",
                description: "Beautiful items to decorate your home.",
                products: [
                    { name: "Wall Art", price: "2,499", rating: "4.6", description: "Modern abstract wall painting" },
                    { name: "Table Lamp", price: "1,999", rating: "4.5", description: "Designer LED table lamp" },
                    { name: "Cushion Set", price: "1,299", rating: "4.7", description: "Decorative cushion covers" }
                ],
                offers: "• Flat 50% OFF\n• Free installation\n• Mix & match deals"
            },
            kitchen: {
                name: "Kitchen",
                emoji: "🍳",
                description: "Essential appliances and cookware for your kitchen.",
                products: [
                    { name: "Non-stick Pan", price: "1,499", rating: "4.6", description: "Premium non-stick cookware" },
                    { name: "Mixer Grinder", price: "4,999", rating: "4.7", description: "3-jar mixer grinder" },
                    { name: "Knife Set", price: "2,999", rating: "4.5", description: "Professional knife set" }
                ],
                offers: "• Free recipe book\n• Extended warranty\n• Cooking class voucher"
            },
            furniture: {
                name: "Furniture",
                emoji: "🪑",
                description: "Stylish and comfortable furniture for your home.",
                products: [
                    { name: "Office Chair", price: "8,999", rating: "4.7", description: "Ergonomic office chair" },
                    { name: "Dining Table", price: "15,999", rating: "4.8", description: "4-seater wooden dining table" },
                    { name: "Bookshelf", price: "6,999", rating: "4.6", description: "5-tier wooden bookshelf" }
                ],
                offers: "• Free assembly\n• 0% EMI available\n• Home trial for 7 days"
            }
        };

        return categories[categoryId] || null;
    }
}

module.exports = new EcommerceFlow();