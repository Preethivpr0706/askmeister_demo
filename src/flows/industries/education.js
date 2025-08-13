const whatsappService = require('../../services/whatsappService');

class EducationFlow {
    async processStep(phone, step, messageText, buttonId, userSession) {
        console.log(`EducationFlow processing step: ${step}, buttonId: ${buttonId}`);

        switch (step) {
            case 'start':
                return await this.showEducationWelcome(phone, userSession);

            case 'main_menu':
                return await this.handleMainMenu(phone, buttonId, userSession);

            case 'faq_actions':
                return await this.handleFAQActions(phone, buttonId, userSession);

            case 'course_inquiry':
                return await this.handleCourseInquiry(phone, buttonId, messageText, userSession);

            case 'course_selection':
                return await this.handleCourseSelection(phone, buttonId, userSession);

            case 'course_action':
                return await this.handleCourseAction(phone, buttonId, userSession);

            case 'campus_tour':
                return await this.handleCampusTour(phone, buttonId, userSession);

            case 'tour_selection':
                return await this.handleTourSelection(phone, buttonId, userSession);

            case 'collect_student_info':
                return await this.collectStudentInfo(phone, messageText, userSession);

            case 'application_complete':
                return await this.handleApplicationComplete(phone, buttonId, userSession);

            default:
                return await this.showEducationWelcome(phone, userSession);
        }
    }

    async showEducationWelcome(phone, userSession) {
        const welcomeText = `🎓 *Welcome to EduBot - Smart Campus Assistant*\n\n` +
            `Hello ${userSession.name}! I'm your virtual education assistant.\n\n` +
            `I can help you with:\n` +
            `📚 Course information & admissions\n` +
            `🏫 Campus tours & facilities\n` +
            `📋 Application process\n` +
            `💰 Fee structure & scholarships\n\n` +
            `*How can I assist you today?*`;

        // Send welcome image
        await whatsappService.sendMediaMessage(
            phone,
            'image',
            `${process.env.BASE_MEDIA_URL}/images/education-welcome.jpg`,
            'Welcome to our Educational Institution!'
        );

        await whatsappService.sendButtonMessage(
            phone,
            welcomeText, [
                { id: 'admission_faq', title: '📋 Admission FAQs' },
                { id: 'course_inquiry', title: '📚 Course Inquiry' },
                { id: 'campus_tour', title: '🏫 Campus Tour' },
                // { id: 'back_to_industries', title: '🔙 Back to Industries' }
            ]
        );

        return { nextStep: 'main_menu' };
    }

    async handleMainMenu(phone, buttonId, userSession) {
        console.log(`Handling education main menu with buttonId: ${buttonId}`);

        switch (buttonId) {
            case 'admission_faq':
                return await this.showAdmissionFAQ(phone, userSession);

            case 'course_inquiry':
                return await this.handleCourseInquiry(phone, 'course_inquiry', '', userSession);

            case 'campus_tour':
                return await this.handleCampusTour(phone, 'campus_tour', userSession);

            case 'back_to_industries':
                return { nextFlow: 'main', nextStep: 'industry_selection' };

            default:
                await whatsappService.sendTextMessage(
                    phone,
                    "Please select one of the available options 👆"
                );
                return { nextStep: 'main_menu' };
        }
    }

    async showAdmissionFAQ(phone, userSession) {
        const faqText = `📋 *Admission FAQs*\n\n` +
            `Here are the most common questions about admissions:\n\n` +
            `*Q: What are the eligibility criteria?*\n` +
            `A: Minimum 60% in 12th grade for UG programs, 55% in graduation for PG programs.\n\n` +
            `*Q: When do admissions start?*\n` +
            `A: Admissions for 2024-25 are open from March 1st to June 30th.\n\n` +
            `*Q: What documents are required?*\n` +
            `A: Mark sheets, transfer certificate, passport photos, and ID proof.\n\n` +
            `*Q: Is there an entrance exam?*\n` +
            `A: Yes, we conduct our own entrance test in July.\n\n` +
            `*Need more specific information?*`;

        await whatsappService.sendMediaMessage(
            phone,
            'document',
            `${process.env.BASE_MEDIA_URL}/documents/admission-brochure.pdf`,
            'Download our complete admission brochure'
        );

        await whatsappService.sendButtonMessage(
            phone,
            faqText, [
                { id: 'apply_now', title: '✅ Apply Now' },
                { id: 'fee_structure', title: '💰 Fee Structure' },
                { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                //  { id: 'back_to_industries', title: '🏠 Main Menu' }
            ]
        );

        return { nextStep: 'faq_actions' };
    }

    async handleFAQActions(phone, buttonId, userSession) {
        console.log(`Handling FAQ actions with buttonId: ${buttonId}`);

        switch (buttonId) {
            case 'apply_now':
                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Start Your Application*\n\n` +
                    `Great! Let's begin your admission process.\n\n` +
                    `I'll need to collect some basic information from you.\n\n` +
                    `📝 *Please provide your full name:*`
                );

                // Initialize the form and start immediately
                if (!userSession.data.studentForm) {
                    userSession.data.studentForm = { step: 'waiting_name' };
                }

                return {
                    nextStep: 'collect_student_info',
                    data: { studentForm: { step: 'waiting_name' } }
                };

            case 'fee_structure':
                const feeText = `💰 *Fee Structure 2024-25*\n\n` +
                    `*Undergraduate Programs:*\n` +
                    `• B.Tech: ₹1,20,000/year\n` +
                    `• BBA: ₹80,000/year\n` +
                    `• BCA: ₹90,000/year\n\n` +
                    `*Postgraduate Programs:*\n` +
                    `• M.Tech: ₹1,50,000/year\n` +
                    `• MBA: ₹2,50,000/year\n` +
                    `• MCA: ₹1,10,000/year\n\n` +
                    `*Additional Fees:*\n` +
                    `• Registration: ₹5,000 (one-time)\n` +
                    `• Hostel: ₹60,000/year\n` +
                    `• Mess: ₹40,000/year\n\n` +
                    `💡 *Scholarships available for meritorious students!*`;

                await whatsappService.sendTextMessage(phone, feeText);

                await whatsappService.sendButtonMessage(
                    phone,
                    "What would you like to do next?", [
                        { id: 'scholarship_info', title: '🏆 Scholarship Info' },
                        { id: 'apply_now', title: '✅ Apply Now' },
                        { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                        // { id: 'back_to_industries', title: '🏠 Main Menu' }
                    ]
                );
                return { nextStep: 'faq_actions' };

            case 'scholarship_info':
                await whatsappService.sendTextMessage(
                    phone,
                    `🏆 *Scholarship Programs*\n\n` +
                    `*Merit Scholarships:*\n` +
                    `• 90%+ marks: 50% fee waiver\n` +
                    `• 85-90% marks: 25% fee waiver\n` +
                    `• 80-85% marks: 15% fee waiver\n\n` +
                    `*Need-based Scholarships:*\n` +
                    `• Family income < ₹2L: 75% waiver\n` +
                    `• Family income < ₹5L: 50% waiver\n\n` +
                    `*Sports Scholarships:*\n` +
                    `• State level: 30% waiver\n` +
                    `• National level: 60% waiver`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "Interested in applying?", [
                        { id: 'apply_now', title: '✅ Apply Now' },
                        { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                        { id: 'back_to_industries', title: '🏠 Main Menu' }
                    ]
                );
                return { nextStep: 'faq_actions' };

            case 'back_edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            case 'back_to_industries':
                return { nextFlow: 'main', nextStep: 'industry_selection' };

            default:
                return { nextStep: 'faq_actions' };
        }
    }

    async handleCourseInquiry(phone, buttonId, messageText, userSession) {
        const courseText = `📚 *Course Inquiry*\n\n` +
            `We offer various programs across different streams.\n\n` +
            `*Select your area of interest:*`;

        const sections = [{
                title: "Undergraduate Programs",
                rows: [
                    { id: "btech", title: "B.Tech", description: "Engineering programs - 4 years" },
                    { id: "bba", title: "BBA", description: "Business Administration - 3 years" },
                    { id: "bca", title: "BCA", description: "Computer Applications - 3 years" }
                ]
            },
            {
                title: "Postgraduate Programs",
                rows: [
                    { id: "mtech", title: "M.Tech", description: "Engineering specialization - 2 years" },
                    { id: "mba", title: "MBA", description: "Business Management - 2 years" },
                    { id: "mca", title: "MCA", description: "Computer Applications - 2 years" }
                ]
            }
        ];

        await whatsappService.sendListMessage(
            phone,
            courseText,
            "Select Course",
            sections
        );

        return { nextStep: 'course_selection' };
    }

    async handleCourseSelection(phone, buttonId, userSession) {
        console.log(`Handling course selection with buttonId: ${buttonId}`);

        if (['btech', 'bba', 'bca', 'mtech', 'mba', 'mca'].includes(buttonId)) {
            const courseDetails = this.getCourseDetails(buttonId);

            await whatsappService.sendTextMessage(phone, courseDetails);

            await whatsappService.sendButtonMessage(
                phone,
                "Would you like to proceed with the application?", [
                    { id: 'start_application', title: '📝 Start Application' },
                    { id: 'more_courses', title: '📚 View More Courses' },
                    { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                    //  { id: 'back_to_industries', title: '🏠 Main Menu' }
                ]
            );

            return {
                nextStep: 'course_action',
                data: { selectedCourse: buttonId }
            };
        }

        return await this.handleCourseInquiry(phone, 'course_inquiry', '', userSession);
    }

    async handleCourseAction(phone, buttonId, userSession) {
        console.log(`Handling course action with buttonId: ${buttonId}`);

        switch (buttonId) {
            case 'start_application':
                await whatsappService.sendTextMessage(
                    phone,
                    `📝 *Application Process*\n\n` +
                    `Perfect! Let's start your application for ${userSession.data.selectedCourse?.toUpperCase()}.\n\n` +
                    `I'll collect your basic information first.\n\n` +
                    `📝 *Please provide your full name:*`
                );

                return {
                    nextStep: 'collect_student_info',
                    data: {
                        selectedCourse: userSession.data.selectedCourse,
                        studentForm: { step: 'waiting_name' }
                    }
                };

            case 'more_courses':
                return await this.handleCourseInquiry(phone, 'course_inquiry', '', userSession);

            case 'back_edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            case 'back_to_industries':
                return { nextFlow: 'main', nextStep: 'industry_selection' };

            default:
                return { nextStep: 'course_action' };
        }
    }

    async handleCampusTour(phone, buttonId, userSession) {
        const tourText = `🏫 *Virtual Campus Tour*\n\n` +
            `Experience our world-class facilities!\n\n` +
            `🏢 Modern infrastructure\n` +
            `🔬 Advanced laboratories\n` +
            `📚 Digital library\n` +
            `🏃‍♂️ Sports complex\n` +
            `🍽️ Cafeteria & hostels\n\n` +
            `*Choose your tour preference:*`;

        await whatsappService.sendMediaMessage(
            phone,
            'video',
            `${process.env.BASE_MEDIA_URL}/videos/campus-tour.mp4`,
            'Take a virtual tour of our beautiful campus!'
        );

        await whatsappService.sendButtonMessage(
            phone,
            tourText, [
                { id: 'virtual_tour', title: '🎥 Virtual Tour' },
                { id: 'schedule_visit', title: '📅 Schedule Visit' },
                { id: 'download_brochure', title: '📄 Download Brochure' },
                //  { id: 'back_edu_menu', title: '🔙 Back to Menu' }
            ]
        );

        return { nextStep: 'tour_selection' };
    }

    async handleTourSelection(phone, buttonId, userSession) {
        console.log(`Handling tour selection with buttonId: ${buttonId}`);

        switch (buttonId) {
            case 'virtual_tour':
                await whatsappService.sendTextMessage(
                    phone,
                    `🎥 *Virtual Campus Tour*\n\n` +
                    `Here's our interactive virtual tour:\n` +
                    `🔗 https://virtualtour.college.edu\n\n` +
                    `*Tour Highlights:*\n` +
                    `• 360° view of all facilities\n` +
                    `• Interactive hotspots\n` +
                    `• Student testimonials\n` +
                    `• Faculty introductions\n\n` +
                    `*Duration: 15-20 minutes*`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "After the virtual tour:", [
                        { id: 'schedule_visit', title: '📅 Schedule Visit' },
                        { id: 'apply_now', title: '✅ Apply Now' },
                        { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                        //  { id: 'back_to_industries', title: '🏠 Main Menu' }
                    ]
                );
                return { nextStep: 'tour_selection' };

            case 'schedule_visit':
                await whatsappService.sendTextMessage(
                    phone,
                    `📅 *Schedule Campus Visit*\n\n` +
                    `*Available Slots:*\n` +
                    `• Monday to Friday: 10 AM - 4 PM\n` +
                    `• Saturday: 10 AM - 2 PM\n` +
                    `• Sunday: Closed\n\n` +
                    `*What's Included:*\n` +
                    `✅ Complete campus tour\n` +
                    `✅ Meet with faculty\n` +
                    `✅ Admission counseling\n` +
                    `✅ Refreshments\n\n` +
                    `📞 *Call to book:* +91-XXXXXXXXXX\n` +
                    `📧 *Email:* visits@college.edu`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "What would you like to do next?", [
                        { id: 'apply_now', title: '✅ Apply Now' },
                        { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                        { id: 'back_to_industries', title: '🏠 Main Menu' }
                    ]
                );
                return { nextStep: 'tour_selection' };

            case 'download_brochure':
                await whatsappService.sendMediaMessage(
                    phone,
                    'document',
                    `${process.env.BASE_MEDIA_URL}/documents/college-brochure.pdf`,
                    'Complete College Brochure - Download Now!'
                );

                await whatsappService.sendTextMessage(
                    phone,
                    `📄 *College Brochure Downloaded!*\n\n` +
                    `The brochure contains:\n` +
                    `📚 All course details\n` +
                    `💰 Complete fee structure\n` +
                    `🏆 Placement statistics\n` +
                    `🏫 Campus facilities\n` +
                    `📞 Contact information`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "What would you like to do next?", [
                        { id: 'apply_now', title: '✅ Apply Now' },
                        { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                        { id: 'back_to_industries', title: '🏠 Main Menu' }
                    ]
                );
                return { nextStep: 'tour_selection' };

            case 'apply_now':
                await whatsappService.sendTextMessage(
                    phone,
                    `✅ *Start Your Application*\n\n` +
                    `Great! Let's begin your admission process.\n\n` +
                    `I'll collect your basic information first.\n\n` +
                    `📝 *Please provide your full name:*`
                );

                return {
                    nextStep: 'collect_student_info',
                    data: { studentForm: { step: 'waiting_name' } }
                };

            case 'back_edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            case 'back_to_industries':
                return { nextFlow: 'main', nextStep: 'industry_selection' };

            default:
                return { nextStep: 'tour_selection' };
        }
    }

    async collectStudentInfo(phone, messageText, userSession) {
        // Initialize form if not exists
        if (!userSession.data.studentForm) {
            userSession.data.studentForm = { step: 'waiting_name' };
        }

        const form = userSession.data.studentForm;

        switch (form.step) {
            case 'waiting_name':
                if (!messageText || messageText.trim() === '') {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid name:"
                    );
                    return { nextStep: 'collect_student_info' };
                }

                form.name = messageText.trim();
                form.step = 'waiting_phone';
                await whatsappService.sendTextMessage(
                    phone,
                    `Thank you ${messageText}! 👍\n\n📱 *Please provide your phone number:*`
                );
                break;

            case 'waiting_phone':
                if (!messageText || messageText.trim() === '') {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid phone number:"
                    );
                    return { nextStep: 'collect_student_info' };
                }

                form.phone = messageText.trim();
                form.step = 'waiting_email';
                await whatsappService.sendTextMessage(
                    phone,
                    "Great! 👍\n\n📧 *Now please provide your email address:*"
                );
                break;

            case 'waiting_email':
                if (!messageText || messageText.trim() === '' || !messageText.includes('@')) {
                    await whatsappService.sendTextMessage(
                        phone,
                        "Please provide a valid email address:"
                    );
                    return { nextStep: 'collect_student_info' };
                }

                form.email = messageText.trim();
                form.step = 'completed';

                const summaryText = `✅ *Application Submitted Successfully!*\n\n` +
                    `*Your Details:*\n` +
                    `👤 Name: ${form.name}\n` +
                    `📱 Phone: ${form.phone}\n` +
                    `📧 Email: ${form.email}\n` +
                    `📚 Course: ${userSession.data.selectedCourse?.toUpperCase() || 'General Inquiry'}\n\n` +
                    `*Next Steps:*\n` +
                    `1️⃣ You'll receive a confirmation email shortly\n` +
                    `2️⃣ Our admission team will contact you within 24 hours\n` +
                    `3️⃣ Entrance exam details will be shared\n\n` +
                    `*Application ID: EDU${Date.now().toString().slice(-6)}*`;

                await whatsappService.sendTextMessage(phone, summaryText);

                await whatsappService.sendButtonMessage(
                    phone,
                    "What would you like to do next?", [
                        { id: 'track_application', title: '📊 Track Application' },
                        { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                        { id: 'back_to_industries', title: '🏠 Main Menu' }
                    ]
                );

                return { nextStep: 'application_complete' };
        }

        return {
            nextStep: 'collect_student_info',
            data: { studentForm: form }
        };
    }

    async handleApplicationComplete(phone, buttonId, userSession) {
        console.log(`Handling application complete with buttonId: ${buttonId}`);

        switch (buttonId) {
            case 'track_application':
                await whatsappService.sendTextMessage(
                    phone,
                    `📊 *Application Tracking*\n\n` +
                    `*Application Status: SUBMITTED* ✅\n\n` +
                    `*Timeline:*\n` +
                    `✅ Application Received\n` +
                    `⏳ Document Verification (1-2 days)\n` +
                    `⏳ Entrance Test Schedule (3-5 days)\n` +
                    `⏳ Interview (After test)\n` +
                    `⏳ Final Selection (7-10 days)\n\n` +
                    `📧 Updates will be sent to your email\n` +
                    `📱 SMS alerts on your phone`
                );

                await whatsappService.sendButtonMessage(
                    phone,
                    "What would you like to do next?", [
                        { id: 'back_edu_menu', title: '🔙 Back to Menu' },
                        { id: 'back_to_industries', title: '🏠 Main Menu' }
                    ]
                );
                return { nextStep: 'application_complete' };

            case 'back_edu_menu':
                return await this.showEducationWelcome(phone, userSession);

            case 'back_to_industries':
                return { nextFlow: 'main', nextStep: 'industry_selection' };

            default:
                return { nextStep: 'application_complete' };
        }
    }

    getCourseDetails(courseId) {
        const courses = {
            btech: `🔧 *B.Tech - Bachelor of Technology*\n\n` +
                `*Duration:* 4 Years\n` +
                `*Specializations:*\n` +
                `• Computer Science & Engineering\n` +
                `• Electronics & Communication\n` +
                `• Mechanical Engineering\n` +
                `• Civil Engineering\n\n` +
                `*Fee:* ₹1,20,000 per year\n` +
                `*Eligibility:* 12th with PCM (60%+)\n` +
                `*Placements:* Average package ₹6.5 LPA`,

            bba: `💼 *BBA - Bachelor of Business Administration*\n\n` +
                `*Duration:* 3 Years\n` +
                `*Specializations:*\n` +
                `• Marketing\n` +
                `• Finance\n` +
                `• Human Resources\n` +
                `• International Business\n\n` +
                `*Fee:* ₹80,000 per year\n` +
                `*Eligibility:* 12th any stream (50%+)\n` +
                `*Placements:* Average package ₹4.2 LPA`,

            bca: `💻 *BCA - Bachelor of Computer Applications*\n\n` +
                `*Duration:* 3 Years\n` +
                `*Specializations:*\n` +
                `• Software Development\n` +
                `• Web Development\n` +
                `• Database Management\n` +
                `• Mobile App Development\n\n` +
                `*Fee:* ₹90,000 per year\n` +
                `*Eligibility:* 12th with Math (55%+)\n` +
                `*Placements:* Average package ₹4.8 LPA`,

            mtech: `🎓 *M.Tech - Master of Technology*\n\n` +
                `*Duration:* 2 Years\n` +
                `*Specializations:*\n` +
                `• Computer Science\n` +
                `• Electronics & Communication\n` +
                `• Mechanical Engineering\n` +
                `• Data Science & AI\n\n` +
                `*Fee:* ₹1,50,000 per year\n` +
                `*Eligibility:* B.Tech (60%+)\n` +
                `*Placements:* Average package ₹9.5 LPA`,

            mba: `🎓 *MBA - Master of Business Administration*\n\n` +
                `*Duration:* 2 Years\n` +
                `*Specializations:*\n` +
                `• Marketing & Sales\n` +
                `• Finance & Banking\n` +
                `• Operations Management\n` +
                `• Digital Marketing\n\n` +
                `*Fee:* ₹2,50,000 per year\n` +
                `*Eligibility:* Graduation (55%+)\n` +
                `*Placements:* Average package ₹12 LPA`,

            mca: `💻 *MCA - Master of Computer Applications*\n\n` +
                `*Duration:* 2 Years\n` +
                `*Specializations:*\n` +
                `• Software Engineering\n` +
                `• Data Analytics\n` +
                `• Cyber Security\n` +
                `• Cloud Computing\n\n` +
                `*Fee:* ₹1,10,000 per year\n` +
                `*Eligibility:* BCA/B.Sc (55%+)\n` +
                `*Placements:* Average package ₹7.2 LPA`
        };

        return courses[courseId] || "Course details not available.";
    }
}

module.exports = new EducationFlow();