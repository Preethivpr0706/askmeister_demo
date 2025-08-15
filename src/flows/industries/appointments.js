const whatsappService = require('../../services/whatsappService');

class AppointmentsFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        switch (step) {
            case 'start':
                return this.showAppointmentsWelcome(phone, userSession);

            case 'main_menu':
                return this.handleMainMenu(phone, buttonId, userSession);

                // Book Appointment Flow
            case 'book_start':
                return this.startBookingFlow(phone, userSession);
            case 'book_department':
                return this.selectDepartment(phone, buttonId, userSession);
            case 'book_form':
                return this.handleBookingForm(phone, messageText, buttonId, userSession);
            case 'book_complete':
                return this.completeBooking(phone, buttonId, userSession);

                // Check Availability Flow
            case 'availability_start':
                return this.startAvailabilityFlow(phone, userSession);
            case 'availability_complete':
                return this.completeAvailability(phone, buttonId, userSession);

                // Manage Appointments Flow
            case 'manage_start':
                return this.startManageFlow(phone, userSession);
            case 'manage_complete':
                return this.completeManage(phone, buttonId, userSession);

            default:
                return this.showAppointmentsWelcome(phone, userSession);
        }
    }

    // Helper function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async showAppointmentsWelcome(phone, userSession) {
        // Send clinic image first
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/healthcare-clinic.jpg`,
            '🏥 Welcome to HealthCare Plus!'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const welcomeText = `📅 *Welcome to AppointBot*\n\n` +
            `Hello ${userSession.name || 'there'}! Welcome to HealthCare Plus! 🏥\n\n` +
            `I can help you with:\n` +
            `📅 Book appointments\n` +
            `🔍 Check availability\n` +
            `📝 Manage bookings\n\n` +
            `*What would you like to do?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'book_appointment', title: '📅 Book' },
                { id: 'check_availability', title: '🔍 Check' },
                { id: 'manage_appointments', title: '📝 Manage' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'book_appointment':
                return this.startBookingFlow(phone, userSession);
            case 'check_availability':
                return this.startAvailabilityFlow(phone, userSession);
            case 'manage_appointments':
                return this.startManageFlow(phone, userSession);
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

    // ==================== BOOK APPOINTMENT FLOW ====================
    async startBookingFlow(phone, userSession) {
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/doctor-appointment.jpg`,
            '📅 Book your appointment today!'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const bookingText = `📅 *Book New Appointment*\n\n` +
            `Choose your department:\n\n` +
            `👨‍⚕️ Expert doctors available\n` +
            `⏰ Same-day appointments\n` +
            `💰 Affordable consultation\n\n` +
            `*Select Department:*`;

        await whatsappService.sendButtonMessage(
            phone,
            bookingText, [
                { id: 'general', title: '👨‍⚕️ General' },
                { id: 'cardiology', title: '❤️ Cardiology' },
                { id: 'dermatology', title: '🧴 Dermatology' }
            ]
        );

        return { nextStep: 'book_department' };
    }

    async selectDepartment(phone, buttonId, userSession) {
        const departments = {
            general: {
                name: 'General Physician',
                fee: '₹500',
                doctor: 'Dr. Sharma'
            },
            cardiology: {
                name: 'Cardiology',
                fee: '₹800',
                doctor: 'Dr. Kumar'
            },
            dermatology: {
                name: 'Dermatology',
                fee: '₹600',
                doctor: 'Dr. Patel'
            }
        };

        const dept = departments[buttonId];
        if (!dept) {
            await whatsappService.sendTextMessage(phone, "Please select a valid department.");
            return { nextStep: 'book_department' };
        }

        const deptText = `👨‍⚕️ *${dept.name}*\n\n` +
            `*Doctor:* ${dept.doctor}\n` +
            `*Fee:* ${dept.fee}\n` +
            `*Available:* Today & Tomorrow\n\n` +
            `*Ready to book?*`;

        await whatsappService.sendButtonMessage(
            phone,
            deptText, [
                { id: 'book_now', title: '✅ Book Now' },
                { id: 'check_slots', title: '⏰ Check Slots' },
                { id: 'back_dept', title: '🔙 Back' }
            ]
        );

        return {
            nextStep: 'book_form',
            data: { selectedDept: buttonId, deptInfo: dept }
        };
    }

    async handleBookingForm(phone, messageText, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId === 'back_dept') {
            return this.startBookingFlow(phone, userSession);
        }

        if (buttonId === 'check_slots') {
            await whatsappService.sendTextMessage(
                phone,
                `⏰ *Available Slots*\n\n` +
                `📅 Today: 2PM, 4PM, 6PM\n` +
                `📅 Tomorrow: 10AM, 2PM, 4PM\n\n` +
                `Ready to book?`
            );

            // Small delay before showing buttons
            await this.delay(1000);

            await whatsappService.sendButtonMessage(
                phone,
                "Select your preference:", [
                    { id: 'book_now', title: '✅ Book Now' },
                    { id: 'back_dept', title: '🔙 Back' },
                    { id: 'appt_menu', title: '🏠 Menu' }
                ]
            );

            return { nextStep: 'book_form' };
        }

        // Initialize form if not exists
        if (!userSession.data || !userSession.data.bookingForm) {
            userSession.data = {
                ...(userSession.data || {}),
                bookingForm: { step: 'start_form' }
            };
        }

        const form = userSession.data.bookingForm;

        // Start form collection
        if (buttonId === 'book_now' || form.step === 'start_form') {
            form.step = 'collect_name';

            await whatsappService.sendTextMessage(
                phone,
                `📝 *Patient Details*\n\nPlease provide patient's full name:`
            );

            return {
                nextStep: 'book_form',
                data: { bookingForm: form }
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
                    return { nextStep: 'book_form' };
                }

                form.patientName = messageText;
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
                    return { nextStep: 'book_form' };
                }

                form.phone = messageText;
                form.step = 'select_time';

                await whatsappService.sendButtonMessage(
                    phone,
                    "📅 When would you prefer?", [
                        { id: 'today', title: '📅 Today' },
                        { id: 'tomorrow', title: '📅 Tomorrow' },
                        { id: 'any_time', title: '⏰ Any Time' }
                    ]
                );
                break;

            case 'select_time':
                const timeMap = {
                    'today': 'Today 2:00 PM',
                    'tomorrow': 'Tomorrow 10:00 AM',
                    'any_time': 'Next Available'
                };

                form.preferredTime = timeMap[buttonId] || 'Next Available';
                form.step = 'completed';

                return this.completeBooking(phone, null, userSession);

            default:
                return { nextStep: 'book_form' };
        }

        return {
            nextStep: 'book_form',
            data: { bookingForm: form }
        };
    }

    async completeBooking(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'book_another':
                    return this.startBookingFlow(phone, userSession);
                case 'check_availability':
                    return this.startAvailabilityFlow(phone, userSession);
                case 'appt_menu':
                    return this.showAppointmentsWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        const form = userSession.data.bookingForm;
        const deptInfo = userSession.data.deptInfo;
        const appointmentId = `APT${Date.now().toString().slice(-6)}`;

        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/appointment-confirmed.jpg`,
            '✅ Appointment confirmed!'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const confirmationText = `✅ *Appointment Booked!*\n\n` +
            `*Details:*\n` +
            `👤 Patient: ${form.patientName}\n` +
            `📱 Phone: ${form.phone}\n` +
            `🏥 Department: ${deptInfo.name}\n` +
            `👨‍⚕️ Doctor: ${deptInfo.doctor}\n` +
            `📅 Time: ${form.preferredTime}\n` +
            `💰 Fee: ${deptInfo.fee}\n` +
            `🆔 ID: ${appointmentId}\n\n` +
            `📍 HealthCare Plus, MG Road\n` +
            `📞 We'll call you to confirm!`;

        await whatsappService.sendTextMessage(phone, confirmationText);

        // Small delay before sending location
        await this.delay(1000);

        // Send location
        await whatsappService.sendLocationMessage(
            phone,
            12.9716, 77.5946,
            "HealthCare Plus",
            "MG Road, Bangalore"
        );

        // Delay before final buttons
        await this.delay(1500);

        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'book_another', title: '➕ Book Another' },
                { id: 'appt_menu', title: '🏠 Appt Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'book_complete' };
    }

    // ==================== CHECK AVAILABILITY FLOW ====================
    async startAvailabilityFlow(phone, userSession) {
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/doctor-schedule.jpg`,
            '🔍 Check doctor availability'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const availabilityText = `🔍 *Doctor Availability*\n\n` +
            `*Today's Schedule:*\n\n` +
            `👨‍⚕️ *Dr. Sharma (General)*\n` +
            `• 2:00 PM - 6:00 PM ✅\n\n` +
            `❤️ *Dr. Kumar (Cardiology)*\n` +
            `• 10:00 AM - 2:00 PM ✅\n` +
            `• 4:00 PM - 7:00 PM ✅\n\n` +
            `🧴 *Dr. Patel (Dermatology)*\n` +
            `• 11:00 AM - 3:00 PM ❌ Booked\n` +
            `• 5:00 PM - 8:00 PM ✅\n\n` +
            `*What would you like to do?*`;

        await whatsappService.sendButtonMessage(
            phone,
            availabilityText, [
                { id: 'book_now', title: '📅 Book Now' },
                { id: 'tomorrow', title: '📅 Tomorrow' },
                { id: 'set_alert', title: '🔔 Set Alert' }
            ]
        );

        return { nextStep: 'availability_complete' };
    }

    async completeAvailability(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'book_now':
                await whatsappService.sendTextMessage(
                    phone,
                    `📅 *Redirecting to Booking...*`
                );
                // Small delay before redirecting
                await this.delay(1000);
                return this.startBookingFlow(phone, userSession);

            case 'tomorrow':
                await whatsappService.sendTextMessage(
                    phone,
                    `📅 *Tomorrow's Availability*\n\n` +
                    `All doctors available!\n` +
                    `• Morning: 9AM - 1PM ✅\n` +
                    `• Evening: 4PM - 8PM ✅\n\n` +
                    `Ready to book?`
                );
                break;

            case 'set_alert':
                await whatsappService.sendTextMessage(
                    phone,
                    `🔔 *Alert Set!*\n\n` +
                    `✅ You'll be notified when slots open\n` +
                    `📱 SMS & WhatsApp alerts enabled\n\n` +
                    `Thank you!`
                );
                break;

            case 'book_appointment':
                return this.startBookingFlow(phone, userSession);

            case 'appt_menu':
                return this.showAppointmentsWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                break;
        }

        // Small delay before final navigation options
        await this.delay(1000);

        // Always provide navigation options at the end
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'book_appointment', title: '📅 Book' },
                { id: 'appt_menu', title: '🏠 Appt Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'availability_complete' };
    }

    // ==================== MANAGE APPOINTMENTS FLOW ====================
    async startManageFlow(phone, userSession) {
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/manage-appointments.jpg`,
            '📝 Manage your appointments'
        );

        // Add delay to ensure image loads before text message
        await this.delay(2000);

        const manageText = `📝 *Your Appointments*\n\n` +
            `*Upcoming:*\n\n` +
            `📅 *Tomorrow, 10:00 AM*\n` +
            `👨‍⚕️ Dr. Sharma - General\n` +
            `🆔 APT123456\n\n` +
            `📅 *Friday, 3:00 PM*\n` +
            `❤️ Dr. Kumar - Cardiology\n` +
            `🆔 APT789012\n\n` +
            `*What would you like to do?*`;

        await whatsappService.sendButtonMessage(
            phone,
            manageText, [
                { id: 'reschedule', title: '📝 Reschedule' },
                { id: 'cancel', title: '❌ Cancel' },
                { id: 'view_history', title: '📋 History' }
            ]
        );

        return { nextStep: 'manage_complete' };
    }

    async completeManage(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'reschedule':
                await whatsappService.sendTextMessage(
                    phone,
                    `📝 *Reschedule Appointment*\n\n` +
                    `*Available Slots:*\n` +
                    `• Tomorrow 2:00 PM ✅\n` +
                    `• Friday 11:00 AM ✅\n` +
                    `• Saturday 4:00 PM ✅\n\n` +
                    `📞 Call us to reschedule:\n` +
                    `+91 98765 43210`
                );
                break;

            case 'cancel':
                await whatsappService.sendTextMessage(
                    phone,
                    `❌ *Cancel Appointment*\n\n` +
                    `To cancel, please call:\n` +
                    `📞 +91 98765 43210\n\n` +
                    `*Cancellation Policy:*\n` +
                    `• Free cancellation 2+ hours before\n` +
                    `• 50% refund within 2 hours`
                );
                break;

            case 'view_history':
                await whatsappService.sendTextMessage(
                    phone,
                    `📋 *Appointment History*\n\n` +
                    `*Last 3 Visits:*\n\n` +
                    `📅 Jan 15 - Dr. Sharma ✅\n` +
                    `📅 Dec 20 - Dr. Patel ✅\n` +
                    `📅 Nov 10 - Dr. Kumar ✅\n\n` +
                    `Total visits: 12`
                );
                break;

            case 'book_appointment':
                return this.startBookingFlow(phone, userSession);

            case 'appt_menu':
                return this.showAppointmentsWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                break;
        }

        // Small delay before final navigation options
        await this.delay(1000);

        // Always provide navigation options at the end
        await whatsappService.sendButtonMessage(
            phone,
            "*What's next?*", [
                { id: 'book_appointment', title: '📅 Book' },
                { id: 'appt_menu', title: '🏠 Appt Menu' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'manage_complete' };
    }
}

module.exports = new AppointmentsFlow();