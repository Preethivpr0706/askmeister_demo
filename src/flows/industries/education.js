const whatsappService = require('../../services/whatsappService');

class EducationFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        console.log(`EducationFlow processing step: ${step}, buttonId: ${buttonId}, messageText: ${messageText}`);

        try {
            switch (step) {
                case 'start':
                    return await this.showEducationWelcome(phone, userSession);

                case 'main_menu':
                    return await this.handleMainMenu(phone, buttonId, userSession);

                    // FAQ Flow
                case 'faq_start':
                    return await this.showAdmissionFAQ(phone, userSession);
                case 'faq_complete':
                    return await this.completeFAQFlow(phone, buttonId, userSession);

                    // Courses Flow
                case 'courses_start':
                    return await this.showCourseOptions(phone, userSession);
                case 'courses_details':
                    return await this.showCourseDetails(phone, buttonId, userSession);
                case 'courses_complete':
                    return await this.completeCoursesFlow(phone, buttonId, userSession);

                    // Campus Tour Flow
                case 'tour_start':
                    return await this.showCampusTour(phone, userSession);
                case 'tour_options':
                    return await this.handleTourOptions(phone, buttonId, userSession);
                case 'tour_complete':
                    return await this.completeTourFlow(phone, buttonId, userSession);
                case 'schedule_visit':
                    return await this.handleScheduleVisit(phone, buttonId, userSession);

                    // Application Flow
                case 'application_start':
                    return await this.startApplicationForm(phone, userSession);
                case 'application_form':
                    return await this.handleApplicationForm(phone, messageText, buttonId, userSession);
                case 'application_complete':
                    return await this.completeApplicationFlow(phone, buttonId, userSession);

                default:
                    console.log(`Unknown step: ${step}, returning to welcome`);
                    return await this.showEducationWelcome(phone, userSession);
            }
        } catch (error) {
            console.error(`Error in EducationFlow step ${step}:`, error);
            await whatsappService.sendTextMessage(
                phone,
                "❌ Something went wrong. Let me restart the process."
            );
            return await this.showEducationWelcome(phone, userSession);
        }
    }

    // Utility function to ensure proper media/text ordering
    async sendMediaWithDelay(phone, mediaType, mediaUrl, caption, delayAfter = 2000) {
        await whatsappService.sendMediaMessage(phone, mediaType, mediaUrl, caption);
        await new Promise(resolve => setTimeout(resolve, delayAfter));
    }

    async showEducationWelcome(phone, userSession) {
        // Send welcome image with longer delay to ensure proper ordering
        await this.sendMediaWithDelay(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/education-welcome.jpg`,
            '🎓 Welcome to EduBot - Your Smart Campus Assistant!',
            2500 // Increased delay
        );

        const welcomeText = `🎓 *Welcome to EduBot*\n\n` +
            `Hello ${userSession.name || 'there'}! I'm your virtual education assistant.\n\n` +
            `I can help you with:\n` +
            `📚 Course information\n` +
            `📋 Admission process\n` +
            `🏫 Campus tour\n` +
            `💰 Fee & scholarships\n\n` +
            `*What interests you?*`;

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'courses', title: '📚 Courses' },
                { id: 'admissions', title: '📋 Admissions' },
                { id: 'campus_tour', title: '🏫 Campus Tour' }
            ]
        );

        // Add back to main menu option
        setTimeout(async() => {
            await whatsappService.sendButtonMessage(
                phone,
                "*Or go back to:*", [
                    { id: 'main_menu', title: '🔙 Main Menu' }
                ]
            );
        }, 1000);

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        console.log(`Handling education main menu with buttonId: ${buttonId}`);

        switch (buttonId) {
            case 'courses':
                return await this.showCourseOptions(phone, userSession);

            case 'admissions':
                return await this.showAdmissionFAQ(phone, userSession);

            case 'campus_tour':
                return await this.showCampusTour(phone, userSession);

            case 'apply':
                return await this.startApplicationForm(phone, userSession);

            case 'back_to_main':
            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            case 'edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "⚠️ Please select one of the available options from the buttons above 👆"
                );
                return { nextStep: 'main_menu' };
        }
    }

    // ==================== COURSES FLOW ====================
    async showCourseOptions(phone, userSession) {
        await this.sendMediaWithDelay(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/courses-banner.jpg`,
            '📚 Explore our comprehensive course offerings!',
            1500
        );

        const courseText = `📚 *Our Courses*\n\n` +
            `Choose your path to success! Our programs are designed with industry expertise.\n\n` +
            `*Select your preferred program:*`;

        const sections = [{
                title: "🎓 Undergraduate Programs",
                rows: [
                    { id: "btech", title: "🔧 B.Tech", description: "Engineering programs - 4 years" },
                    { id: "bba", title: "💼 BBA", description: "Business Administration - 3 years" },
                    { id: "bca", title: "💻 BCA", description: "Computer Applications - 3 years" }
                ]
            },
            {
                title: "🎓 Postgraduate Programs",
                rows: [
                    { id: "mtech", title: "🔬 M.Tech", description: "Engineering specialization - 2 years" },
                    { id: "mba", title: "📊 MBA", description: "Business Management - 2 years" },
                    { id: "mca", title: "🖥️ MCA", description: "Computer Applications - 2 years" }
                ]
            }
        ];

        await whatsappService.sendListMessage(
            phone,
            courseText,
            "📋 Select Course",
            sections
        );

        return { nextStep: 'courses_details' };
    }

    async showCourseDetails(phone, buttonId, userSession) {
        const courseDetails = this.getCourseDetails(buttonId);

        if (!courseDetails) {
            await whatsappService.sendTextMessage(phone, "⚠️ Please select a valid course from the list.");
            return await this.showCourseOptions(phone, userSession);
        }

        await whatsappService.sendTextMessage(phone, courseDetails);

        // Add a small delay before buttons
        await new Promise(resolve => setTimeout(resolve, 800));

        await whatsappService.sendButtonMessage(
            phone,
            "*What's your next step?*", [
                { id: 'apply_course', title: '✅ Apply Now' },
                { id: 'get_brochure', title: '📄 Get Brochure' },
                { id: 'back_courses', title: '🔙 Other Courses' }
            ]
        );

        return {
            nextStep: 'courses_complete',
            data: { selectedCourse: buttonId }
        };
    }

    async completeCoursesFlow(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'apply_course':
                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Starting Application Process...*\n\n` +
                    `Great choice! Let's get your application started for ${userSession.data?.selectedCourse || 'your selected course'}.`
                );
                return await this.startApplicationForm(phone, userSession);

            case 'get_brochure':
                await this.sendMediaWithDelay(
                    phone,
                    'document',
                    `${process.env.BASE_MEDIA_URL}/documents/course-brochure.pdf`,
                    '📄 Complete Course Brochure - All Details Inside!',
                    1500
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `📄 *Brochure Downloaded Successfully!*\n\n` +
                    `📋 Contains detailed information about:\n` +
                    `📚 Complete curriculum & subjects\n` +
                    `💰 Detailed fee structure\n` +
                    `🏆 Placement statistics & companies\n` +
                    `🎯 Career opportunities\n` +
                    `📞 Contact information\n\n` +
                    `*Ready to take the next step?*`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "*What would you like to do next?*", [
                        { id: 'apply_now_brochure', title: '✅ Apply Now' },
                        { id: 'back_courses', title: '🔙 Other Courses' },
                        { id: 'edu_menu', title: '🏠 Education Menu' }
                    ]
                );
                return { nextStep: 'courses_complete' };

            case 'apply_now_brochure':
                return await this.startApplicationForm(phone, userSession);

            case 'back_courses':
                return await this.showCourseOptions(phone, userSession);

            case 'edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                // Fallback for unrecognized buttons
                await whatsappService.sendButtonMessage(
                    phone,
                    "*Please choose one of the options:*", [
                        { id: 'apply_now_brochure', title: '✅ Apply Now' },
                        { id: 'back_courses', title: '🔙 Other Courses' },
                        { id: 'edu_menu', title: '🏠 Education Menu' }
                    ]
                );
                return { nextStep: 'courses_complete' };
        }
    }

    // ==================== FAQ FLOW ====================
    async showAdmissionFAQ(phone, userSession) {
        await this.sendMediaWithDelay(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/admission-info.jpg`,
            '📋 Complete Admission Information & FAQs',
            1500
        );

        const faqText = `📋 *Admission FAQs*\n\n` +
            `*🎯 Eligibility Criteria:*\n` +
            `• Minimum 60% in 12th grade\n` +
            `• Subject requirements vary by course\n\n` +
            `*📅 Admission Timeline:*\n` +
            `• Applications: March 1st - June 30th\n` +
            `• Entrance Exam: July (if applicable)\n` +
            `• Results: August 1st week\n\n` +
            `*📄 Required Documents:*\n` +
            `• 10th & 12th mark sheets\n` +
            `• Transfer Certificate (TC)\n` +
            `• Passport size photos\n` +
            `• ID proof (Aadhar/PAN)\n\n` +
            `*Need specific information?*`;

        await whatsappService.sendButtonMessage(
            phone,
            faqText, [
                { id: 'fee_info', title: '💰 Fee Details' },
                { id: 'scholarship', title: '🏆 Scholarships' },
                { id: 'apply_faq', title: '✅ Apply Now' }
            ]
        );

        return { nextStep: 'faq_complete' };
    }

    async completeFAQFlow(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'fee_info':
                await whatsappService.sendTextMessage(
                    phone,
                    `💰 *Comprehensive Fee Structure*\n\n` +
                    `*🎓 Undergraduate Programs:*\n` +
                    `• B.Tech: ₹1,20,000/year\n` +
                    `• BBA: ₹80,000/year\n` +
                    `• BCA: ₹90,000/year\n\n` +
                    `*🎓 Postgraduate Programs:*\n` +
                    `• M.Tech: ₹1,50,000/year\n` +
                    `• MBA: ₹2,50,000/year\n` +
                    `• MCA: ₹1,10,000/year\n\n` +
                    `*🏠 Additional Charges:*\n` +
                    `• Hostel: ₹60,000/year (optional)\n` +
                    `• Registration: ₹5,000 (one-time)\n` +
                    `• Security Deposit: ₹10,000 (refundable)\n\n` +
                    `*💳 Payment Options:*\n` +
                    `• Annual payment\n` +
                    `• Semester-wise payment\n` +
                    `• EMI options available`
                );
                break;

            case 'scholarship':
                await whatsappService.sendTextMessage(
                    phone,
                    `🏆 *Scholarship Programs*\n\n` +
                    `*🎯 Merit-Based Scholarships:*\n` +
                    `• 90%+ marks: 50% fee waiver\n` +
                    `• 85-90% marks: 25% fee waiver\n` +
                    `• 80-85% marks: 15% fee waiver\n\n` +
                    `*🤝 Need-Based Scholarships:*\n` +
                    `• Family income <₹2L: 75% waiver\n` +
                    `• Family income <₹5L: 50% waiver\n` +
                    `• Single parent families: Additional 10%\n\n` +
                    `*🏃‍♂️ Sports Scholarships:*\n` +
                    `• State level achievements: 30% waiver\n` +
                    `• National level: 60% waiver\n` +
                    `• International: 80% waiver\n\n` +
                    `*📋 How to Apply:*\n` +
                    `Submit documents during admission process.`
                );
                break;

            case 'apply_faq':
                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Ready to Apply!*\n\n` +
                    `Perfect! Let's start your admission application process.`
                );
                return await this.startApplicationForm(phone, userSession);

            case 'more_info':
                return await this.showAdmissionFAQ(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            case 'edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            default:
                break;
        }

        // Always provide navigation after information display
        await whatsappService.sendButtonMessage(
            phone,
            "*What would you like to do next?*", [
                { id: 'apply_faq', title: '✅ Apply Now' },
                { id: 'more_info', title: '❓ More Info' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'faq_complete' };
    }

    // ==================== CAMPUS TOUR FLOW ====================
    async showCampusTour(phone, userSession) {
        // First send the campus tour video with proper delay
        await this.sendMediaWithDelay(
            phone,
            'video',
            `${process.env.BASE_MEDIA_URL}/videos/campus-tour.mp4`,
            '🏫 Take a virtual tour of our beautiful, modern campus!',
            3000 // Longer delay for video
        );

        const tourText = `🏫 *Virtual Campus Tour*\n\n` +
            `Welcome to our state-of-the-art campus! 🎉\n\n` +
            `*🏢 Our Facilities Include:*\n` +
            `🏢 Modern infrastructure & smart classrooms\n` +
            `🔬 Advanced laboratories & research centers\n` +
            `📚 Digital library with 50,000+ books\n` +
            `🏃‍♂️ Sports complex & gymnasium\n` +
            `🍽️ Multi-cuisine cafeteria\n` +
            `🏠 Comfortable hostels (boys & girls)\n` +
            `🚌 Transportation facility\n` +
            `🌳 Beautiful green campus\n\n` +
            `*Choose your tour preference:*`;

        await whatsappService.sendButtonMessage(
            phone,
            tourText, [
                { id: 'virtual_tour', title: '🎥 Interactive Tour' },
                { id: 'schedule_visit', title: '📅 Schedule Visit' },
                { id: 'download_brochure', title: '📄 Campus Brochure' }
            ]
        );

        return { nextStep: 'tour_options' };
    }

    async handleTourOptions(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'virtual_tour':
                // First send the campus tour video with proper delay
                await this.sendMediaWithDelay(
                    phone,
                    'video',
                    `${process.env.BASE_MEDIA_URL}/videos/campus-tour.mp4`,
                    '🏫 Take a virtual tour of our beautiful, modern campus!',
                    3000 // Longer delay for video
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `🎥 *Interactive Virtual Tour*\n\n` +
                    `Experience our campus like never before!\n\n` +
                    `🔗 *Virtual Tour Link:*\n` +
                    `https://virtualtour.college.edu\n\n` +
                    `*🎯 Tour Features:*\n` +
                    `• 360° panoramic view of all facilities\n` +
                    `• Interactive hotspots with information\n` +
                    `• Student testimonials & experiences\n` +
                    `• Faculty introductions\n` +
                    `• Department-wise virtual visits\n` +
                    `• Live chat support during tour\n\n` +
                    `*⏱️ Duration: 15-20 minutes*\n\n` +
                    `*🎧 Pro Tip:* Use headphones for best experience!`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "*After completing the virtual tour:*", [
                        { id: 'schedule_visit', title: '📅 Schedule Visit' },
                        { id: 'apply_tour', title: '✅ Apply Now' },
                        { id: 'back_tour', title: '🔙 Tour Options' }
                    ]
                );
                return { nextStep: 'tour_complete' };

            case 'schedule_visit':
                return await this.handleScheduleVisit(phone, buttonId, userSession);

            case 'download_brochure':
                await this.sendMediaWithDelay(
                    phone,
                    'document',
                    `${process.env.BASE_MEDIA_URL}/documents/college-brochure.pdf`,
                    '📄 Complete Campus Brochure - Everything You Need to Know!',
                    2000
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `📄 *Campus Brochure Downloaded!*\n\n` +
                    `📋 *Contains comprehensive information about:*\n\n` +
                    `🏫 Campus facilities & infrastructure\n` +
                    `📚 All course details & curriculum\n` +
                    `💰 Complete fee structure\n` +
                    `🏆 Placement statistics & top recruiters\n` +
                    `🎯 Career opportunities\n` +
                    `📍 Campus location & connectivity\n` +
                    `🏠 Hostel facilities & amenities\n` +
                    `📞 Complete contact information\n\n` +
                    `*Perfect for sharing with family!*`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "*What's your next step?*", [
                        { id: 'schedule_visit', title: '📅 Schedule Visit' },
                        { id: 'apply_tour', title: '✅ Apply Now' },
                        { id: 'back_tour', title: '🔙 Tour Options' }
                    ]
                );
                return { nextStep: 'tour_complete' };

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            case 'edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            default:
                return await this.showCampusTour(phone, userSession);
        }
    }

    // Dedicated schedule visit handler
    async handleScheduleVisit(phone, buttonId, userSession) {
        // Handle button clicks if any
        if (buttonId) {
            switch (buttonId) {
                case 'apply_after_visit':
                    await whatsappService.sendTextMessage(
                        phone,
                        `✅ *Starting Application Process...*\n\n` +
                        `Excellent! Let's get your application started.`
                    );
                    return await this.startApplicationForm(phone, userSession);

                case 'virtual_tour_alt':
                    // First send the campus tour video with proper delay
                    await this.sendMediaWithDelay(
                        phone,
                        'video',
                        `${process.env.BASE_MEDIA_URL}/videos/campus-tour.mp4`,
                        '🏫 Take a virtual tour of our beautiful, modern campus!',
                        3000 // Longer delay for video
                    );

                    await whatsappService.sendTextMessage(
                        phone,
                        `🎥 *Virtual Tour Link*\n\n` +
                        `https://virtualtour.college.edu\n\n` +
                        `Enjoy your virtual campus experience!`
                    );
                    // Stay on same step to show buttons again
                    break;

                case 'edu_menu':
                    return await this.showEducationWelcome(phone, userSession);

                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };

                default:
                    break;
            }
        }

        // Show the schedule visit information (first time or after button clicks)
        await whatsappService.sendTextMessage(
            phone,
            `📅 *Schedule Your Campus Visit*\n\n` +
            `*🕒 Available Time Slots:*\n` +
            `• Monday - Friday: 10:00 AM - 4:00 PM\n` +
            `• Saturday: 10:00 AM - 2:00 PM\n` +
            `• Sunday: Closed\n\n` +
            `*✅ Your Visit Includes:*\n` +
            `🚶‍♂️ Complete campus tour (90 minutes)\n` +
            `👨‍🏫 Meet with faculty & department heads\n` +
            `💬 One-on-one admission counseling\n` +
            `📋 Document verification (if ready)\n` +
            `🍽️ Complimentary refreshments\n` +
            `🎁 Welcome kit & course materials\n\n` +
            `*📋 What to Bring:*\n` +
            `• Academic certificates\n` +
            `• ID proof\n` +
            `• List of questions\n\n` +
            `*🚗 Free parking available*`
        );

        await new Promise(resolve => setTimeout(resolve, 1000));

        await whatsappService.sendTextMessage(
            phone,
            `*📞 To Schedule Your Visit:*\n\n` +
            `*Option 1: Call Us*\n` +
            `📱 Phone: +91-98765-43210\n` +
            `🕒 Timing: 9 AM - 6 PM (Mon-Sat)\n\n` +
            `*Option 2: Email Us*\n` +
            `📧 Email: visits@college.edu\n` +
            `⚡ Response within 2 hours\n\n` +
            `*Option 3: WhatsApp*\n` +
            `📱 Save this number & send "VISIT"\n\n` +
            `*🎯 Pro Tip:* Book 2-3 days in advance for guaranteed slot!`
        );

        await whatsappService.sendButtonMessage(
            phone,
            "*What would you like to do now?*", [
                { id: 'apply_after_visit', title: '✅ Apply Now' },
                { id: 'virtual_tour_alt', title: '🎥 Virtual Tour' },
                { id: 'edu_menu', title: '🏠 Education Menu' }
            ]
        );

        return { nextStep: 'schedule_visit' };
    }

    async completeTourFlow(phone, buttonId, userSession) {
        switch (buttonId) {
            case 'apply_tour':
            case 'apply_after_visit':
                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Starting Application Process...*\n\n` +
                    `Excellent! Let's get your application started. The campus tour has given you great insights!`
                );
                return await this.startApplicationForm(phone, userSession);

            case 'virtual_tour_alt':
                await whatsappService.sendTextMessage(
                    phone,
                    `🎥 *Virtual Tour Link*\n\n` +
                    `https://virtualtour.college.edu\n\n` +
                    `Enjoy your virtual campus experience!`
                );
                return { nextStep: 'tour_complete' };

            case 'back_tour':
                return await this.showCampusTour(phone, userSession);

            case 'edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            case 'main_menu':
                return { nextFlow: 'main', nextStep: 'welcome' };

            default:
                // Fallback for unrecognized buttons
                await whatsappService.sendButtonMessage(
                    phone,
                    "*Please choose one of the options:*", [
                        { id: 'apply_after_visit', title: '✅ Apply Now' },
                        { id: 'back_tour', title: '🔙 Tour Options' },
                        { id: 'edu_menu', title: '🏠 Education Menu' }
                    ]
                );
                return { nextStep: 'tour_complete' };
        }
    }

    // ==================== APPLICATION FLOW ====================
    async startApplicationForm(phone, userSession) {
        await this.sendMediaWithDelay(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/application-form.jpg`,
            '📝 Start your journey with us - Application Form',
            2000
        );

        await whatsappService.sendTextMessage(
            phone,
            `📝 *Application Form*\n\n` +
            `🎉 Great choice! Let's get you started on your educational journey.\n\n` +
            `I'll collect some basic information to begin your application process.\n\n` +
            `*📋 Step 1 of 3: Personal Information*\n\n` +
            `Please provide your *full name* (as per official documents):`
        );

        // Initialize the form
        return {
            nextStep: 'application_form',
            data: { applicationForm: { step: 'name', currentStep: 1 } }
        };
    }

    async handleApplicationForm(phone, messageText, buttonId, userSession) {
        // Handle navigation buttons first
        if (buttonId) {
            switch (buttonId) {
                case 'edu_menu':
                    return await this.showEducationWelcome(phone, userSession);
                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };
                default:
                    break;
            }
        }

        // Initialize form if not exists
        if (!userSession.data || !userSession.data.applicationForm) {
            userSession.data = {
                ...(userSession.data || {}),
                applicationForm: { step: 'name', currentStep: 1 }
            };
        }

        const form = userSession.data.applicationForm;

        switch (form.step) {
            case 'name':
                if (!messageText || messageText.trim().length < 2) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "⚠️ Please provide a valid full name (at least 2 characters).\n\n*Example:* John Doe"
                    );
                    return { nextStep: 'application_form' };
                }

                form.name = messageText.trim();
                form.step = 'phone';
                form.currentStep = 2;

                await whatsappService.sendTextMessage(
                    phone,
                    `✅ Thank you ${messageText}!\n\n` +
                    `*📋 Step 2 of 3: Contact Information*\n\n` +
                    `Please provide your *phone number* (10 digits):\n\n` +
                    `*Example:* 9876543210`
                );
                break;

            case 'phone':
                // Clean phone number (remove spaces, hyphens, etc.)
                const cleanPhone = messageText ? messageText.replace(/[^\d]/g, '') : '';

                if (!cleanPhone || cleanPhone.length < 10) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "⚠️ Please provide a valid 10-digit phone number.\n\n*Example:* 9876543210 or +91-98765-43210"
                    );
                    return { nextStep: 'application_form' };
                }

                form.phone = cleanPhone;
                form.step = 'email';
                form.currentStep = 3;

                await whatsappService.sendTextMessage(
                    phone,
                    `✅ Phone number saved!\n\n` +
                    `*📋 Step 3 of 3: Email Address*\n\n` +
                    `Please provide your *email address*:\n\n` +
                    `*Example:* john.doe@gmail.com`
                );
                break;

            case 'email':
                const email = messageText ? messageText.trim().toLowerCase() : '';

                if (!email || !email.includes('@') || !email.includes('.') || email.length < 5) {
                    await whatsappService.sendTextMessage(
                        phone,
                        `⚠️ Please provide a valid email address.\n\n` +
                        `*Example:* john.doe@gmail.com`
                    );
                    return { nextStep: 'application_form' };
                }

                form.email = email;
                form.step = 'completed';

                return await this.completeApplicationFlow(phone, null, userSession);

            default:
                // Reset form if something goes wrong
                return await this.startApplicationForm(phone, userSession);
        }

        return {
            nextStep: 'application_form',
            data: { applicationForm: form }
        };
    }

    async completeApplicationFlow(phone, buttonId, userSession) {
        // Handle navigation buttons
        if (buttonId) {
            switch (buttonId) {
                case 'track_app':
                    const appId = userSession.data ? userSession.data.applicationId : `EDU${Date.now().toString().slice(-6)}`;
                    await whatsappService.sendTextMessage(
                        phone,
                        `📊 *Application Status Tracker*\n\n` +
                        `*Application ID:* ${appId}\n` +
                        `*Status:* SUBMITTED ✅\n` +
                        `*Submitted:* ${new Date().toLocaleDateString()}\n\n` +
                        `*📋 Progress Timeline:*\n` +
                        `✅ Application Received\n` +
                        `⏳ Document Verification (1-2 days)\n` +
                        `⏳ Entrance Test Scheduling (3-5 days)\n` +
                        `⏳ Final Selection (7-10 days)\n\n` +
                        `*📧 Updates will be sent to:*\n` +
                        `Email: ${userSession.data?.applicationForm?.email}\n` +
                        `📱 SMS: ${userSession.data?.applicationForm?.phone}\n\n` +
                        `*Need help?* Call: +91-98765-43210`
                    );
                    break;

                case 'download_receipt':
                    await this.sendMediaWithDelay(
                        phone,
                        'document',
                        `${process.env.BASE_MEDIA_URL}/documents/application-receipt.pdf`,
                        '📄 Application Receipt - Keep this for your records',
                        1500
                    );

                    await whatsappService.sendTextMessage(
                        phone,
                        `📄 *Application Receipt Downloaded!*\n\n` +
                        `✅ Keep this receipt safely for your records.\n\n` +
                        `*📋 Contains:*\n` +
                        `• Your complete application details\n` +
                        `• Application ID & reference number\n` +
                        `• Submission timestamp\n` +
                        `• Next steps information\n\n` +
                        `*💡 Tip:* Take a screenshot of your Application ID for quick reference.`
                    );
                    break;

                case 'edu_menu':
                    return await this.showEducationWelcome(phone, userSession);

                case 'main_menu':
                    return { nextFlow: 'main', nextStep: 'welcome' };

                case 'new_application':
                    await whatsappService.sendTextMessage(
                        phone,
                        `📝 *Starting New Application...*\n\n` +
                        `Let's create another application for you.`
                    );
                    return await this.startApplicationForm(phone, userSession);

                default:
                    break;
            }
        } else {
            // First time completion - show success message
            const form = userSession.data.applicationForm;
            const applicationId = `EDU${Date.now().toString().slice(-6)}`;

            // Store application ID for tracking
            userSession.data.applicationId = applicationId;

            await this.sendMediaWithDelay(
                phone,
                'image',
                `${process.env.BASE_MEDIA_URL}/images/application-success.jpg`,
                '🎉 Application submitted successfully!',
                2000
            );

            const successText = `🎉 *Application Submitted Successfully!*\n\n` +
                `*📋 Your Details:*\n` +
                `👤 *Name:* ${form.name}\n` +
                `📱 *Phone:* ${form.phone}\n` +
                `📧 *Email:* ${form.email}\n\n` +
                `*🆔 Application ID:* ${applicationId}\n` +
                `*(Save this ID for future reference)*\n\n` +
                `*🚀 Next Steps:*\n` +
                `1️⃣ Confirmation email sent to your inbox\n` +
                `2️⃣ Our team will call you within 24 hours\n` +
                `3️⃣ Entrance exam details will be shared\n` +
                `4️⃣ Document verification process\n\n` +
                `*⏰ Timeline:* Complete process within 10-15 days\n\n` +
                `*🎯 Welcome to your educational journey!*`;

            await whatsappService.sendTextMessage(phone, successText);
        }

        // Always provide navigation options at the end
        await whatsappService.sendButtonMessage(
            phone,
            "*What would you like to do next?*", [
                { id: 'track_app', title: '📊 Track Status' },
                { id: 'download_receipt', title: '📄 Get Receipt' },
                { id: 'main_menu', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'application_complete' };
    }

    getCourseDetails(courseId) {
        const courses = {
            btech: `🔧 *B.Tech - Bachelor of Technology*\n\n` +
                `*🎓 Duration:* 4 Years (8 Semesters)\n\n` +
                `*🎯 Specializations Available:*\n` +
                `• Computer Science & Engineering\n` +
                `• Electronics & Communication Engineering\n` +
                `• Mechanical Engineering\n` +
                `• Civil Engineering\n` +
                `• Information Technology\n\n` +
                `*💰 Fee:* ₹1,20,000 per year\n` +
                `*📋 Eligibility:* 12th with PCM (60% minimum)\n` +
                `*🏆 Average Placement:* ₹6.5 LPA\n` +
                `*🏢 Top Recruiters:* TCS, Infosys, Wipro, Amazon\n\n` +
                `*✨ Highlights:*\n` +
                `• AICTE approved program\n` +
                `• Industry-oriented curriculum\n` +
                `• State-of-the-art labs\n` +
                `• 90% placement record`,

            bba: `💼 *BBA - Bachelor of Business Administration*\n\n` +
                `*🎓 Duration:* 3 Years (6 Semesters)\n\n` +
                `*🎯 Specializations Available:*\n` +
                `• Marketing & Sales\n` +
                `• Finance & Banking\n` +
                `• Human Resources\n` +
                `• International Business\n` +
                `• Digital Marketing\n\n` +
                `*💰 Fee:* ₹80,000 per year\n` +
                `*📋 Eligibility:* 12th any stream (50% minimum)\n` +
                `*🏆 Average Placement:* ₹4.2 LPA\n` +
                `*🏢 Top Recruiters:* HDFC, ICICI, Flipkart, Zomato\n\n` +
                `*✨ Highlights:*\n` +
                `• Industry mentorship program\n` +
                `• Live project opportunities\n` +
                `• Soft skills development\n` +
                `• Entrepreneurship support`,

            bca: `💻 *BCA - Bachelor of Computer Applications*\n\n` +
                `*🎓 Duration:* 3 Years (6 Semesters)\n\n` +
                `*🎯 Specializations Available:*\n` +
                `• Software Development\n` +
                `• Web Development\n` +
                `• Database Management\n` +
                `• Mobile App Development\n` +
                `• Cyber Security\n\n` +
                `*💰 Fee:* ₹90,000 per year\n` +
                `*📋 Eligibility:* 12th with Math (55% minimum)\n` +
                `*🏆 Average Placement:* ₹4.8 LPA\n` +
                `*🏢 Top Recruiters:* Tech Mahindra, Capgemini, IBM, Microsoft\n\n` +
                `*✨ Highlights:*\n` +
                `• Hands-on coding experience\n` +
                `• Industry-standard tools\n` +
                `• Internship guaranteed\n` +
                `• 95% placement rate`,

            mtech: `🎓 *M.Tech - Master of Technology*\n\n` +
                `*🎓 Duration:* 2 Years (4 Semesters)\n\n` +
                `*🎯 Specializations Available:*\n` +
                `• Computer Science & Engineering\n` +
                `• Electronics & Communication\n` +
                `• Mechanical Engineering\n` +
                `• Data Science & AI\n` +
                `• Cyber Security\n\n` +
                `*💰 Fee:* ₹1,50,000 per year\n` +
                `*📋 Eligibility:* B.Tech with 60% minimum\n` +
                `*🏆 Average Placement:* ₹9.5 LPA\n` +
                `*🏢 Top Recruiters:* Google, Microsoft, Amazon, Oracle\n\n` +
                `*✨ Highlights:*\n` +
                `• Research-oriented program\n` +
                `• Industry collaboration\n` +
                `• Patent filing support\n` +
                `• PhD pathway available`,

            mba: `🎓 *MBA - Master of Business Administration*\n\n` +
                `*🎓 Duration:* 2 Years (4 Semesters)\n\n` +
                `*🎯 Specializations Available:*\n` +
                `• Marketing & Sales Management\n` +
                `• Finance & Investment Banking\n` +
                `• Operations & Supply Chain\n` +
                `• Digital Marketing & Analytics\n` +
                `• International Business\n\n` +
                `*💰 Fee:* ₹2,50,000 per year\n` +
                `*📋 Eligibility:* Graduation with 55% minimum\n` +
                `*🏆 Average Placement:* ₹12 LPA\n` +
                `*🏢 Top Recruiters:* McKinsey, Deloitte, PwC, Goldman Sachs\n\n` +
                `*✨ Highlights:*\n` +
                `• Case study methodology\n` +
                `• CEO mentorship program\n` +
                `• International exposure\n` +
                `• 100% placement guarantee`,

            mca: `💻 *MCA - Master of Computer Applications*\n\n` +
                `*🎓 Duration:* 2 Years (4 Semesters)\n\n` +
                `*🎯 Specializations Available:*\n` +
                `• Advanced Software Engineering\n` +
                `• Data Analytics & Big Data\n` +
                `• Cyber Security & Ethical Hacking\n` +
                `• Cloud Computing\n` +
                `• Artificial Intelligence\n\n` +
                `*💰 Fee:* ₹1,10,000 per year\n` +
                `*📋 Eligibility:* BCA/B.Sc/B.Com with 55% minimum\n` +
                `*🏆 Average Placement:* ₹7.2 LPA\n` +
                `*🏢 Top Recruiters:* Accenture, Cognizant, HCL, Dell\n\n` +
                `*✨ Highlights:*\n` +
                `• Industry-relevant curriculum\n` +
                `• Capstone project mandatory\n` +
                `• Certification partnerships\n` +
                `• 98% placement success`
        };

        return courses[courseId] || null;
    }
}

module.exports = new EducationFlow();