const whatsappService = require('../../services/whatsappService');

class TravelFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        switch (step) {
            case 'start':
                return this.showTravelWelcome(phone, userSession);

            case 'main_menu':
                return this.handleMainMenu(phone, buttonId, userSession);

                // Flight Booking Flow
            case 'flight_start':
                return this.startFlightFlow(phone, userSession);
            case 'flight_form':
                return this.handleFlightForm(phone, messageText, buttonId, userSession);
            case 'flight_complete':
                return this.completeFlightFlow(phone, buttonId, userSession);

                // Hotel Booking Flow
            case 'hotel_start':
                return this.startHotelFlow(phone, userSession);
            case 'hotel_form':
                return this.handleHotelForm(phone, messageText, buttonId, userSession);
            case 'hotel_complete':
                return this.completeHotelFlow(phone, buttonId, userSession);

                // Tour Package Flow
            case 'tour_start':
                return this.startTourFlow(phone, userSession);
            case 'tour_form':
                return this.handleTourForm(phone, messageText, buttonId, userSession);
            case 'tour_complete':
                return this.completeTourFlow(phone, buttonId, userSession);

            default:
                return this.showTravelWelcome(phone, userSession);
        }
    }

    async showTravelWelcome(phone, userSession) {
        const welcomeText = `✈️ *Welcome to TravelEase*\n\n` +
            `Hello ${userSession.name || 'there'}! 🌍\n\n` +
            `Your complete travel partner for:\n` +
            `✈️ Flight bookings\n` +
            `🏨 Hotel reservations\n` +
            `🎒 Tour packages\n\n` +
            `*What would you like to book?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'flights', title: '✈️ Flights' },
                { id: 'hotels', title: '🏨 Hotels' },
                { id: 'tours', title: '🎒 Tours' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'flights':
                return this.startFlightFlow(phone, userSession);
            case 'hotels':
                return this.startHotelFlow(phone, userSession);
            case 'tours':
                return this.startTourFlow(phone, userSession);
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

    // ==================== FLIGHT BOOKING FLOW ====================
    async startFlightFlow(phone, userSession) {
        const flightText = `✈️ *Flight Booking*\n\n` +
            `Book flights at best prices! 💰\n\n` +
            `*Our Services:*\n` +
            `🎫 Domestic & International\n` +
            `💰 Best price guarantee\n` +
            `📱 Instant confirmation\n\n` +
            `*What type of trip?*`;

        await whatsappService.sendButtonMessage(
            phone,
            flightText, [
                { id: 'one_way', title: '➡️ One Way' },
                { id: 'round_trip', title: '🔄 Round Trip' },
                { id: 'multi_city', title: '🌍 Multi City' }
            ]
        );

        return { nextStep: 'flight_form' };
    }

    async handleFlightForm(phone, messageText, buttonId, userSession) {
        // Initialize form if not exists
        if (!userSession.data || !userSession.data.flightForm) {
            userSession.data = {
                ...(userSession.data || {}),
                flightForm: { step: 'trip_selected' }
            };
        }

        const form = userSession.data.flightForm;

        // Handle trip type selection
        if (['one_way', 'round_trip', 'multi_city'].includes(buttonId)) {
            form.tripType = buttonId;
            form.step = 'collect_from';

            await whatsappService.sendTextMessage(
                phone,
                `✅ *${buttonId.replace('_', ' ').toUpperCase()}*\n\n📍 Enter departure city:`
            );

            return {
                nextStep: 'flight_form',
                data: { flightForm: form }
            };
        }

        // Handle form steps
        switch (form.step) {
            case 'collect_from':
                if (!messageText || messageText.length < 2) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please enter a valid city name:"
                    );
                    return { nextStep: 'flight_form' };
                }

                form.fromCity = messageText;
                form.step = 'collect_to';

                await whatsappService.sendTextMessage(
                    phone,
                    "📍 Enter destination city:"
                );
                break;

            case 'collect_to':
                if (!messageText || messageText.length < 2) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please enter a valid city name:"
                    );
                    return { nextStep: 'flight_form' };
                }

                form.toCity = messageText;
                form.step = 'collect_date';

                await whatsappService.sendButtonMessage(
                    phone,
                    "📅 When do you want to travel?", [
                        { id: 'tomorrow', title: '📅 Tomorrow' },
                        { id: 'next_week', title: '📅 Next Week' },
                        { id: 'next_month', title: '📅 Next Month' }
                    ]
                );
                break;

            case 'collect_date':
                const dateMap = {
                    'tomorrow': 'Tomorrow',
                    'next_week': 'Next Week',
                    'next_month': 'Next Month'
                };

                form.travelDate = dateMap[buttonId] || 'Tomorrow';
                form.step = 'collect_passengers';

                await whatsappService.sendButtonMessage(
                    phone,
                    "👥 How many passengers?", [
                        { id: '1', title: '1 Person' },
                        { id: '2', title: '2 People' },
                        { id: '3', title: '3+ People' }
                    ]
                );
                break;

            case 'collect_passengers':
                form.passengers = buttonId;
                form.step = 'completed';

                return this.completeFlightFlow(phone, null, userSession);

            default:
                return { nextStep: 'flight_form' };
        }

        return {
            nextStep: 'flight_form',
            data: { flightForm: form }
        };
    }

    async completeFlightFlow(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'book_hotel':
                    return this.startHotelFlow(phone, userSession);
                case 'book_tour':
                    return this.startTourFlow(phone, userSession);
                case 'travel_menu':
                    return this.showTravelWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.flightForm;
        const bookingId = `FL${Date.now().toString().slice(-6)}`;

        const confirmationText = `✅ *Flight Booked!*\n\n` +
            `*Booking Details:*\n` +
            `📍 Route: ${form.fromCity} → ${form.toCity}\n` +
            `📅 Date: ${form.travelDate}\n` +
            `👥 Passengers: ${form.passengers}\n` +
            `🎫 Type: ${form.tripType}\n` +
            `🆔 ID: ${bookingId}\n\n` +
            `💰 Best fare: ₹8,500\n` +
            `📧 Ticket sent to your email!`;

        await whatsappService.sendTextMessage(phone, confirmationText);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'book_hotel', title: '🏨 Book Hotel' },
                { id: 'travel_menu', title: '🏠 Travel Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'flight_complete' };
    }

    // ==================== HOTEL BOOKING FLOW ====================
    async startHotelFlow(phone, userSession) {
        const hotelText = `🏨 *Hotel Booking*\n\n` +
            `Find perfect stays! 🌟\n\n` +
            `*Our Services:*\n` +
            `🏨 Budget to luxury hotels\n` +
            `⭐ Verified reviews\n` +
            `📱 Instant confirmation\n\n` +
            `*What type of stay?*`;

        await whatsappService.sendButtonMessage(
            phone,
            hotelText, [
                { id: 'budget', title: '💰 Budget' },
                { id: 'premium', title: '⭐ Premium' },
                { id: 'luxury', title: '👑 Luxury' }
            ]
        );

        return { nextStep: 'hotel_form' };
    }

    async handleHotelForm(phone, messageText, buttonId, userSession) {
        if (!userSession.data || !userSession.data.hotelForm) {
            userSession.data = {
                ...(userSession.data || {}),
                hotelForm: { step: 'type_selected' }
            };
        }

        const form = userSession.data.hotelForm;

        // Handle hotel type selection
        if (['budget', 'premium', 'luxury'].includes(buttonId)) {
            form.hotelType = buttonId;
            form.step = 'collect_city';

            await whatsappService.sendTextMessage(
                phone,
                `✅ *${buttonId.toUpperCase()} HOTELS*\n\n📍 Enter city/destination:`
            );

            return {
                nextStep: 'hotel_form',
                data: { hotelForm: form }
            };
        }

        switch (form.step) {
            case 'collect_city':
                if (!messageText || messageText.length < 2) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please enter a valid city:"
                    );
                    return { nextStep: 'hotel_form' };
                }

                form.city = messageText;
                form.step = 'collect_checkin';

                await whatsappService.sendButtonMessage(
                    phone,
                    "📅 Check-in date?", [
                        { id: 'today', title: '📅 Today' },
                        { id: 'tomorrow', title: '📅 Tomorrow' },
                        { id: 'weekend', title: '📅 Weekend' }
                    ]
                );
                break;

            case 'collect_checkin':
                form.checkinDate = buttonId;
                form.step = 'collect_nights';

                await whatsappService.sendButtonMessage(
                    phone,
                    "🌙 How many nights?", [
                        { id: '1', title: '1 Night' },
                        { id: '2', title: '2 Nights' },
                        { id: '3', title: '3+ Nights' }
                    ]
                );
                break;

            case 'collect_nights':
                form.nights = buttonId;
                form.step = 'completed';

                return this.completeHotelFlow(phone, null, userSession);

            default:
                return { nextStep: 'hotel_form' };
        }

        return {
            nextStep: 'hotel_form',
            data: { hotelForm: form }
        };
    }

    async completeHotelFlow(phone, buttonId, userSession) {
        if (buttonId) {
            switch (buttonId) {
                case 'book_flight':
                    return this.startFlightFlow(phone, userSession);
                case 'book_tour':
                    return this.startTourFlow(phone, userSession);
                case 'travel_menu':
                    return this.showTravelWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.hotelForm;
        const bookingId = `HT${Date.now().toString().slice(-6)}`;

        const confirmationText = `✅ *Hotel Booked!*\n\n` +
            `*Booking Details:*\n` +
            `🏨 Type: ${form.hotelType} hotel\n` +
            `📍 City: ${form.city}\n` +
            `📅 Check-in: ${form.checkinDate}\n` +
            `🌙 Nights: ${form.nights}\n` +
            `🆔 ID: ${bookingId}\n\n` +
            `💰 Best rate: ₹3,500/night\n` +
            `📧 Voucher sent to your email!`;

        await whatsappService.sendTextMessage(phone, confirmationText);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'book_tour', title: '🎒 Book Tour' },
                { id: 'travel_menu', title: '🏠 Travel Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'hotel_complete' };
    }

    // ==================== TOUR PACKAGE FLOW ====================
    async startTourFlow(phone, userSession) {
        const tourText = `🎒 *Tour Packages*\n\n` +
            `Amazing destinations! 🌍\n\n` +
            `*Package Types:*\n` +
            `🏖️ Beach destinations\n` +
            `🏔️ Hill stations\n` +
            `🌍 International tours\n\n` +
            `*What interests you?*`;

        await whatsappService.sendButtonMessage(
            phone,
            tourText, [
                { id: 'beach', title: '🏖️ Beach' },
                { id: 'hills', title: '🏔️ Hills' },
                { id: 'international', title: '🌍 International' }
            ]
        );

        return { nextStep: 'tour_form' };
    }

    async handleTourForm(phone, messageText, buttonId, userSession) {
        if (!userSession.data || !userSession.data.tourForm) {
            userSession.data = {
                ...(userSession.data || {}),
                tourForm: { step: 'type_selected' }
            };
        }

        const form = userSession.data.tourForm;

        // Handle tour type selection
        if (['beach', 'hills', 'international'].includes(buttonId)) {
            form.tourType = buttonId;
            form.step = 'collect_duration';

            await whatsappService.sendButtonMessage(
                phone,
                `✅ *${buttonId.toUpperCase()} TOUR*\n\n📅 How many days?`, [
                    { id: '3_4', title: '3-4 Days' },
                    { id: '5_7', title: '5-7 Days' },
                    { id: '8_plus', title: '8+ Days' }
                ]
            );

            return {
                nextStep: 'tour_form',
                data: { tourForm: form }
            };
        }

        switch (form.step) {
            case 'collect_duration':
                form.duration = buttonId;
                form.step = 'collect_people';

                await whatsappService.sendButtonMessage(
                    phone,
                    "👥 How many people?", [
                        { id: '2', title: '2 People' },
                        { id: '4', title: '3-4 People' },
                        { id: '6', title: '5+ People' }
                    ]
                );
                break;

            case 'collect_people':
                form.people = buttonId;
                form.step = 'collect_budget';

                await whatsappService.sendButtonMessage(
                    phone,
                    "💰 Budget per person?", [
                        { id: 'budget', title: '₹10K-20K' },
                        { id: 'premium', title: '₹20K-35K' },
                        { id: 'luxury', title: '₹35K+' }
                    ]
                );
                break;

            case 'collect_budget':
                form.budget = buttonId;
                form.step = 'completed';

                return this.completeTourFlow(phone, null, userSession);

            default:
                return { nextStep: 'tour_form' };
        }

        return {
            nextStep: 'tour_form',
            data: { tourForm: form }
        };
    }

    async completeTourFlow(phone, buttonId, userSession) {
        if (buttonId) {
            switch (buttonId) {
                case 'book_flight':
                    return this.startFlightFlow(phone, userSession);
                case 'book_hotel':
                    return this.startHotelFlow(phone, userSession);
                case 'travel_menu':
                    return this.showTravelWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.tourForm;
        const bookingId = `TR${Date.now().toString().slice(-6)}`;

        const confirmationText = `✅ *Tour Package Booked!*\n\n` +
            `*Package Details:*\n` +
            `🎒 Type: ${form.tourType} tour\n` +
            `📅 Duration: ${form.duration.replace('_', '-')} days\n` +
            `👥 People: ${form.people}\n` +
            `💰 Budget: ${form.budget}\n` +
            `🆔 ID: ${bookingId}\n\n` +
            `🎯 Perfect package found!\n` +
            `📧 Itinerary sent to your email!`;

        await whatsappService.sendTextMessage(phone, confirmationText);

        await whatsappService.sendButtonMessage(
            phone,
            "*Complete your trip?*", [
                { id: 'book_flight', title: '✈️ Add Flight' },
                { id: 'travel_menu', title: '🏠 Travel Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'tour_complete' };
    }
}

module.exports = new TravelFlow();