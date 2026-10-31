const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { app } = require('./server');
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const Notice = require('./models/Notice');
const EventRegistration = require('./models/EventRegistration');
const Notification = require('./models/Notification');

let server;
let baseUrl;

const makeRequest = async (urlPath, options = {}) => {
  const url = `${baseUrl}${urlPath}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
};

const runTests = async () => {
  console.log('🧪 Starting CampusConnect Comprehensive Verification Suite...\n');

  try {
    await connectDB();
    const PORT = 5500;
    server = app.listen(PORT);
    baseUrl = `http://localhost:${PORT}/api`;
    console.log(`📡 Test server listening on ${baseUrl}\n`);

    let passed = 0;
    let failed = 0;

    const assert = (condition, title) => {
      if (condition) {
        console.log(`  ✅ PASS: ${title}`);
        passed++;
      } else {
        console.error(`  ❌ FAIL: ${title}`);
        failed++;
      }
    };

    // 0. Seed Demo Accounts
    console.log('--- Step 0: Ensuring Seed Accounts Exist ---');
    await User.deleteMany({ email: { $in: ['test.student@campusconnect.com', 'admin@campusconnect.com', 'faculty@campusconnect.com', 'student@campusconnect.com'] } });

    await User.create({
      name: 'Campus Administrator',
      email: 'admin@campusconnect.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration'
    });

    await User.create({
      name: 'Prof. Rajesh Sharma',
      email: 'faculty@campusconnect.com',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    });

    await User.create({
      name: 'Rohan Verma',
      email: 'student@campusconnect.com',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      studentId: 'CS2026-042'
    });

    // 1. Health check
    console.log('\n--- Step 1: Health Check ---');
    const health = await makeRequest('/health');
    assert(health.status === 200 && health.data.status === 'OK', 'GET /api/health returns 200 OK');

    // 2. Authentication Tests
    console.log('\n--- Step 2: Authentication & Authorization Controls ---');
    
    // Public student registration
    const regStudent = await makeRequest('/auth/register', {
      method: 'POST',
      body: {
        name: 'New Test Scholar',
        email: 'test.student@campusconnect.com',
        password: 'Password@123',
        role: 'student',
        department: 'Information Technology',
        studentId: 'IT2026-999'
      }
    });
    assert(regStudent.status === 201 && regStudent.data.token, 'Student registration succeeds with JWT token');

    // Security Test: Block admin registration via public endpoint
    const regAdminAttempt = await makeRequest('/auth/register', {
      method: 'POST',
      body: {
        name: 'Hacker Admin',
        email: 'hacker@campusconnect.com',
        password: 'Password@123',
        role: 'admin'
      }
    });
    assert(regAdminAttempt.status === 403, 'Security: Public Admin registration is blocked with 403 Forbidden');

    // Login as Admin
    const adminLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'admin@campusconnect.com', password: 'Admin@123' }
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login successful with admin role');
    const adminToken = adminLogin.data.token;

    // Login as Faculty
    const facultyLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'faculty@campusconnect.com', password: 'Faculty@123' }
    });
    assert(facultyLogin.status === 200 && facultyLogin.data.user.role === 'faculty', 'Faculty login successful with faculty role');
    const facultyToken = facultyLogin.data.token;

    // Login as Student
    const studentLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'student@campusconnect.com', password: 'Student@123' }
    });
    assert(studentLogin.status === 200 && studentLogin.data.user.role === 'student', 'Student login successful with student role');
    const studentToken = studentLogin.data.token;

    // 3. Event Creation & Moderation Pipeline
    console.log('\n--- Step 3: Event Management & Approval Workflow ---');
    
    // Faculty creates an event (Must be 'Pending' by default)
    const eventCreate = await makeRequest('/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: {
        title: 'Automated Test Hackathon 2026',
        description: 'Verification hackathon testing full event lifecycle.',
        category: 'Technical',
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        venue: 'CS Main Computing Lab',
        organizer: 'Computer Science Department',
        maxParticipants: 50,
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    assert(eventCreate.status === 201 && eventCreate.data.event.approvalStatus === 'Pending', 'Faculty event created with Pending approval status');
    const eventId = eventCreate.data.event._id;

    // Public should NOT see pending event
    const publicEvents = await makeRequest('/events');
    const isPendingPublic = publicEvents.data.events.some((e) => e._id === eventId);
    assert(!isPendingPublic, 'Public events feed excludes pending unapproved events');

    // Admin approves event
    const approveRes = await makeRequest(`/events/${eventId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(approveRes.status === 200 && approveRes.data.event.approvalStatus === 'Approved', 'Admin successfully approves event');

    // Public should now see approved event
    const publicEventsAfter = await makeRequest('/events');
    const isApprovedPublic = publicEventsAfter.data.events.some((e) => e._id === eventId);
    assert(isApprovedPublic, 'Public events feed includes newly approved event');

    // 4. Notice Creation & Priority Test
    console.log('\n--- Step 4: Institutional Notice Board ---');
    const noticeCreate = await makeRequest('/notices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Automated Examination Clearance Circular',
        description: 'Mandatory clearance notice for mid-semester evaluations.',
        category: 'Examination',
        priority: 'Urgent'
      }
    });
    assert(noticeCreate.status === 201 && noticeCreate.data.notice.priority === 'Urgent', 'Admin publishes urgent notice directly to notice board');
    const noticeId = noticeCreate.data.notice._id;

    const noticesList = await makeRequest('/notices');
    assert(noticesList.status === 200 && noticesList.data.notices.length > 0, 'GET /api/notices returns active circulars');

    // 5. Student Event Registration Lifecycle
    console.log('\n--- Step 5: Event Registration, Capacity & Cancellation ---');
    
    // Register student
    const regEvent = await makeRequest(`/registrations/${eventId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { notes: 'Verification test registration' }
    });
    assert(regEvent.status === 201 && regEvent.data.success, 'Student registers for approved event');
    const regId = regEvent.data.registration._id;

    // Prevent duplicate registration
    const regDup = await makeRequest(`/registrations/${eventId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(regDup.status === 400, 'Duplicate registration attempt is rejected with 400 Bad Request');

    // Verify student's registration list
    const myRegs = await makeRequest('/registrations/my', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(myRegs.status === 200 && myRegs.data.registrations.some((r) => r.event._id === eventId), 'GET /api/registrations/my reflects registered event');

    // Cancel registration
    const cancelRes = await makeRequest(`/registrations/${regId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(cancelRes.status === 200, 'Student cancels event registration and frees capacity');

    // 6. Role-Aware Dashboard Statistics
    console.log('\n--- Step 6: Real Database Dashboard Statistics ---');
    const adminStats = await makeRequest('/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      adminStats.status === 200 &&
      adminStats.data.role === 'admin' &&
      typeof adminStats.data.stats.totalStudents === 'number' &&
      typeof adminStats.data.stats.totalEvents === 'number',
      'Admin dashboard returns live statistics from MongoDB collections'
    );

    const studentStats = await makeRequest('/dashboard/stats', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(
      studentStats.status === 200 &&
      studentStats.data.role === 'student' &&
      typeof studentStats.data.stats.upcomingEventsCount === 'number',
      'Student dashboard returns personalized student statistics'
    );

    // 7. In-App Notifications
    console.log('\n--- Step 7: In-App Notification Delivery ---');
    const notifs = await makeRequest('/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(notifs.status === 200 && Array.isArray(notifs.data.notifications), 'GET /api/notifications returns user notification queue');

    console.log('\n=============================================================');
    console.log(`📊 TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================\n');

    server.close();
    await disconnectDB();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Verification Suite Exception:', error);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
