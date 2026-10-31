const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Notice = require('../models/Notice');
const EventRegistration = require('../models/EventRegistration');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    console.log('🌱 Starting CampusConnect Database Seeder...');
    await connectDB();

    // Clear existing data to ensure clean, duplicate-free state
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Notice.deleteMany({}),
      EventRegistration.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // 1. Create Users
    console.log('👤 Seeding Users (Admin, Faculty, Students)...');
    
    // Note: The User model pre-save hook handles bcrypt password hashing automatically.
    const admin = await User.create({
      name: 'Campus Administrator',
      email: 'admin@campusconnect.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
      phone: '+1 (555) 019-2831'
    });

    const faculty1 = await User.create({
      name: 'Prof. Rajesh Sharma',
      email: 'faculty@campusconnect.com',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 018-4920'
    });

    const faculty2 = await User.create({
      name: 'Dr. Priya Patel',
      email: 'priya.patel@campusconnect.com',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Electronics & Communication',
      phone: '+1 (555) 017-7321'
    });

    const student1 = await User.create({
      name: 'Rohan Verma',
      email: 'student@campusconnect.com',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'CS2026-042',
      phone: '+1 (555) 014-9988'
    });

    const student2 = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya.iyer@campusconnect.com',
      password: 'Student@123',
      role: 'student',
      department: 'Information Technology',
      studentId: 'IT2026-015',
      phone: '+1 (555) 014-3321'
    });

    const student3 = await User.create({
      name: 'Aarav Mehta',
      email: 'aarav.mehta@campusconnect.com',
      password: 'Student@123',
      role: 'student',
      department: 'Mechanical Engineering',
      studentId: 'ME2026-088',
      phone: '+1 (555) 013-7765'
    });

    console.log(`✅ Created 1 Admin, 2 Faculty, and 3 Student accounts.`);

    // 2. Create Events (Realistic college events)
    console.log('📅 Seeding Events...');
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    const eventsData = [
      {
        title: 'HackCampus 2026: 36-Hour National Hackathon',
        description: 'Join over 300 innovators, builders, and developers for our flagship 36-hour annual hackathon. Solve real-world institutional, environmental, and financial challenges with generous sponsor prizes, mentorship from top tech leads, and free food & swag.',
        category: 'Technical',
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
        date: new Date(now.getTime() + 14 * day),
        startTime: '09:00 AM',
        endTime: '09:00 PM',
        venue: 'Main Auditorium & Innovation Lab (Block C)',
        organizer: 'CSE Department & ACM Student Chapter',
        maxParticipants: 120,
        registeredCount: 0,
        registrationDeadline: new Date(now.getTime() + 12 * day),
        status: 'Upcoming',
        approvalStatus: 'Approved',
        createdBy: faculty1._id
      },
      {
        title: 'Tarang 2026 – Annual Inter-College Cultural Festival',
        description: 'Experience three days of energetic music, dance competitions, theatrical performances, stand-up comedy, and celebrity guest performances. Open to all departments and affiliated institutes.',
        category: 'Cultural',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60',
        date: new Date(now.getTime() + 25 * day),
        startTime: '04:00 PM',
        endTime: '10:00 PM',
        venue: 'Open Air Amphitheatre',
        organizer: 'Campus Cultural Society',
        maxParticipants: 500,
        registeredCount: 0,
        registrationDeadline: new Date(now.getTime() + 22 * day),
        status: 'Upcoming',
        approvalStatus: 'Approved',
        createdBy: admin._id
      },
      {
        title: 'Hands-on Autonomous Robotics & IoT Workshop',
        description: 'An intensive two-day practical workshop on building smart micro-controllers, sensor integration with ESP32, and ROS2 fundamentals. Hardware kits provided during the sessions.',
        category: 'Workshop',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
        date: new Date(now.getTime() + 8 * day),
        startTime: '10:00 AM',
        endTime: '04:30 PM',
        venue: 'Robotics & Automation Center, Room 204',
        organizer: 'ECE & Robotics Club',
        maxParticipants: 45,
        registeredCount: 0,
        registrationDeadline: new Date(now.getTime() + 6 * day),
        status: 'Upcoming',
        approvalStatus: 'Approved',
        createdBy: faculty2._id
      },
      {
        title: 'Generative AI & LLM Systems: Industry Seminar',
        description: 'Guest lecture and panel discussion featuring Principal AI Researchers from leading cloud providers exploring fine-tuning, RAG architectures, and AI safety in production environments.',
        category: 'Seminar',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
        date: new Date(now.getTime() + 5 * day),
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'Senate Conference Hall',
        organizer: 'Center for Artificial Intelligence',
        maxParticipants: 80,
        registeredCount: 0,
        registrationDeadline: new Date(now.getTime() + 4 * day),
        status: 'Upcoming',
        approvalStatus: 'Approved',
        createdBy: faculty1._id
      },
      {
        title: 'Inter-Department Football & Basketball Championship',
        description: 'Annual sports tournament bringing teams from every engineering and science branch. Trophies, medals, and certificates for the championship winners and runners-up.',
        category: 'Sports',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
        date: new Date(now.getTime() + 18 * day),
        startTime: '08:00 AM',
        endTime: '06:00 PM',
        venue: 'University Sports Complex Ground',
        organizer: 'Department of Physical Education',
        maxParticipants: 160,
        registeredCount: 0,
        registrationDeadline: new Date(now.getTime() + 15 * day),
        status: 'Upcoming',
        approvalStatus: 'Approved',
        createdBy: admin._id
      },
      {
        title: 'AlgoSprint: Codeforces-Style Competitive Programming Battle',
        description: 'Test your algorithmic agility across dynamic programming, graph theory, and number theory challenges. Individual participation with live rank leaderboard.',
        category: 'Competition',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
        date: new Date(now.getTime() + 10 * day),
        startTime: '03:00 PM',
        endTime: '06:00 PM',
        venue: 'Central Computing Center (Lab 1 & 2)',
        organizer: 'Coding & Algorithmic League',
        maxParticipants: 75,
        registeredCount: 0,
        registrationDeadline: new Date(now.getTime() + 9 * day),
        status: 'Upcoming',
        approvalStatus: 'Approved',
        createdBy: faculty1._id
      },
      {
        title: 'Campus Founder Pitch Day & Startup Showcase',
        description: 'Student-led early-stage ventures pitch before angel investors, alumni founders, and campus incubation heads with seed grant opportunities up to $10,000.',
        category: 'Other',
        imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60',
        date: new Date(now.getTime() + 20 * day),
        startTime: '11:00 AM',
        endTime: '03:30 PM',
        venue: 'Entrepreneurship Incubation Cell',
        organizer: 'E-Cell & Institutional Innovation Council',
        maxParticipants: 60,
        registeredCount: 0,
        registrationDeadline: new Date(now.getTime() + 16 * day),
        status: 'Upcoming',
        approvalStatus: 'Pending', // Demo pending approval for Admin review!
        createdBy: faculty2._id
      }
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`✅ Seeded ${createdEvents.length} realistic events (including 1 Pending approval).`);

    // 3. Create Sample Registrations
    console.log('📝 Seeding Sample Registrations...');
    const registration1 = await EventRegistration.create({
      event: createdEvents[0]._id, // HackCampus
      student: student1._id,
      notes: 'Looking forward to building on full-stack AI track'
    });
    createdEvents[0].registeredCount += 1;
    await createdEvents[0].save();

    const registration2 = await EventRegistration.create({
      event: createdEvents[3]._id, // AI Seminar
      student: student1._id,
      notes: 'Interested in RAG systems'
    });
    createdEvents[3].registeredCount += 1;
    await createdEvents[3].save();

    const registration3 = await EventRegistration.create({
      event: createdEvents[0]._id, // HackCampus
      student: student2._id,
      notes: 'Frontend developer participant'
    });
    createdEvents[0].registeredCount += 1;
    await createdEvents[0].save();

    console.log(`✅ Seeded student event registrations.`);

    // 4. Create Notices (Realistic college notices)
    console.log('📢 Seeding Institutional Notices...');
    const noticesData = [
      {
        title: 'Urgent: Mid-Semester Examination Schedule & Room Allocations Released',
        description: 'The Office of the Controller of Examinations has published the final schedule for Spring 2026 Mid-Semester examinations. All students are directed to check their seating charts and admit cards via their respective department notice boards. Hall tickets are mandatory.',
        category: 'Examination',
        priority: 'Urgent',
        publishedDate: new Date(now.getTime() - 1 * day),
        expiryDate: new Date(now.getTime() + 30 * day),
        createdBy: admin._id
      },
      {
        title: 'Campus Placement Drive 2026 – Phase II Registrations Open',
        description: 'Leading technology firms and consulting enterprises will be conducting on-campus recruitment tests starting next month. Eligible final-year students (CSE, IT, ECE) must update their resumes and verify their cumulative GPA on the placement portal by Friday.',
        category: 'Placement',
        priority: 'Important',
        publishedDate: new Date(now.getTime() - 2 * day),
        expiryDate: new Date(now.getTime() + 20 * day),
        createdBy: faculty1._id
      },
      {
        title: 'Central Library Extended Hours During Examination Fortnight',
        description: 'To facilitate uninterrupted exam preparation, the Central University Library will remain open 24x7 with full digital catalog access and air-conditioned reading halls starting next Monday. Night cafeteria facilities will also be active.',
        category: 'Academic',
        priority: 'Normal',
        publishedDate: new Date(now.getTime() - 3 * day),
        expiryDate: new Date(now.getTime() + 25 * day),
        createdBy: admin._id
      },
      {
        title: 'Admissions Open for Summer Research Fellowship Program 2026',
        description: 'Applications are formally invited from second and third-year undergraduate scholars for sponsored summer research fellowships across IoT, Quantum Computing, and Advanced Robotics laboratories. Stipends provided.',
        category: 'Admissions',
        priority: 'Important',
        publishedDate: new Date(now.getTime() - 4 * day),
        expiryDate: new Date(now.getTime() + 15 * day),
        createdBy: faculty2._id
      },
      {
        title: 'Mandatory Notice: Semester Fee Payment Deadline & Clearance',
        description: 'Students who have outstanding tuition or laboratory dues are requested to clear them before the 15th of the current month to avoid late fee penalties or portal holds.',
        category: 'General',
        priority: 'Urgent',
        publishedDate: new Date(now.getTime() - 5 * day),
        expiryDate: new Date(now.getTime() + 10 * day),
        createdBy: admin._id
      },
      {
        title: 'Sports Facility Renovation & Weekend Tournament Registration',
        description: 'The indoor badminton court and gymnasium have undergone wooden resurfacing and are now fully operational. Registration for the intra-college tournament is open until this Thursday.',
        category: 'Sports',
        priority: 'Normal',
        publishedDate: new Date(now.getTime() - 6 * day),
        expiryDate: new Date(now.getTime() + 18 * day),
        createdBy: faculty1._id
      }
    ];

    const createdNotices = await Notice.insertMany(noticesData);
    console.log(`✅ Seeded ${createdNotices.length} realistic notices.`);

    // 5. Create In-App Notifications
    console.log('🔔 Seeding Sample In-App Notifications...');
    await Notification.insertMany([
      {
        recipient: student1._id,
        title: 'Registration Confirmed! 🎉',
        message: 'You have successfully registered for "HackCampus 2026: 36-Hour National Hackathon".',
        type: 'registration_success',
        relatedId: createdEvents[0]._id,
        link: '/student/my-registrations',
        isRead: false
      },
      {
        recipient: student1._id,
        title: '🚨 URGENT NOTICE: Mid-Semester Examination Schedule',
        message: 'The Mid-Semester exam schedule and hall allocations have been published.',
        type: 'notice_created',
        relatedId: createdNotices[0]._id,
        link: `/notices/${createdNotices[0]._id}`,
        isRead: false
      },
      {
        recipient: admin._id,
        title: 'New Event Approval Request',
        message: 'Faculty Dr. Priya Patel submitted "Campus Founder Pitch Day" for review.',
        type: 'event_created',
        relatedId: createdEvents[6]._id,
        link: '/admin/approvals',
        isRead: false
      },
      {
        recipient: faculty1._id,
        title: 'Event Approved 🎉',
        message: 'Your event "HackCampus 2026" has been approved and published to students.',
        type: 'event_approved',
        relatedId: createdEvents[0]._id,
        link: `/events/${createdEvents[0]._id}`,
        isRead: true
      }
    ]);

    console.log('✅ Seeded demo in-app notifications.');
    console.log('\n=============================================================');
    console.log('🎉 CAMPUSCONNECT DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('   Admin:   admin@campusconnect.com   / Password: Admin@123');
    console.log('   Faculty: faculty@campusconnect.com / Password: Faculty@123');
    console.log('   Student: student@campusconnect.com / Password: Student@123');
    console.log('=============================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedData();
