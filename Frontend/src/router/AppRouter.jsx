import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '@/store/authStore';
import LoadingScreen from '@/shared/components/LoadingScreen';


const NotFoundRedirect = () => {
    const { isAuthenticated, role } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/" replace />;

    const defaultRoute = role === 'superadmin'
        ? '/superadmin'
        : role === 'admin'
            ? '/admin'
            : role === 'manager'
                ? '/manager'
                : role === 'sales'
                    ? '/sales'
                    : role === 'partner'
                        ? '/partner'
                        : '/employee';

    return <Navigate to={defaultRoute} replace />;
};

// Layouts
const AdminLayout = lazy(() => import('@/shared/layouts/AdminLayout'));
const EmployeeLayout = lazy(() => import('@/shared/layouts/EmployeeLayout'));
const ManagerLayout = lazy(() => import('@/shared/layouts/ManagerLayout'));

// Auth Pages
const SplashScreen = lazy(() => import('@/modules/user/pages/SplashScreen'));
const EmployeeLogin = lazy(() => import('@/modules/user/pages/EmployeeLogin'));
const EmployeeRegister = lazy(() => import('@/modules/user/pages/EmployeeRegister'));
const ForgotPassword = lazy(() => import('@/modules/user/pages/ForgotPassword'));
const AdminLogin = lazy(() => import('@/modules/admin/pages/AdminLogin'));
const AdminRegister = lazy(() => import('@/modules/admin/pages/AdminRegister'));
const SuperAdminLogin = lazy(() => import('@/modules/superadmin/pages/SuperAdminLogin'));
const SuperAdminRegister = lazy(() => import('@/modules/superadmin/pages/SuperAdminRegister'));
const SuperAdminForgotPassword = lazy(() => import('@/modules/superadmin/pages/SuperAdminForgotPassword'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/modules/admin/pages/Dashboard'));
const ManagerManagement = lazy(() => import('@/modules/admin/pages/ManagerManagement'));
const EmployeeManagement = lazy(() => import('@/modules/admin/pages/EmployeeManagement'));
const TaskManagement = lazy(() => import('@/modules/admin/pages/TaskManagement'));
const TaskCompletion = lazy(() => import('@/modules/admin/pages/TaskCompletion'));
const Reports = lazy(() => import('@/modules/admin/pages/Reports'));
const AdminCalendar = lazy(() => import('@/modules/admin/pages/Calendar'));
const AdminChat = lazy(() => import('@/modules/admin/pages/Chat'));
const AdminSubscription = lazy(() => import('@/modules/admin/pages/Subscription'));
const Settings = lazy(() => import('@/modules/admin/pages/Settings'));
const JoinRequests = lazy(() => import('@/modules/admin/pages/JoinRequests'));
const SalesManagement = lazy(() => import('@/modules/admin/pages/SalesManagement'));
const ProjectApprovals = lazy(() => import('@/modules/admin/pages/ProjectApprovals'));
const AdminProjects = lazy(() => import('@/modules/admin/pages/Projects'));
const AdminNotifications = lazy(() => import('@/modules/admin/pages/Notifications'));

const ManagerLogin = lazy(() => import('@/modules/manager/pages/ManagerLogin'));
const ManagerRegister = lazy(() => import('@/modules/manager/pages/ManagerRegister'));

const ManagerDashboard = lazy(() => import('@/modules/manager/pages/Dashboard'));
const ManagerProjects = lazy(() => import('@/modules/manager/pages/Projects'));
const ManagerProjectDetails = lazy(() => import('@/modules/manager/pages/ProjectDetails'));
const AssignTask = lazy(() => import('@/modules/manager/pages/AssignTask'));

const MyTasks = lazy(() => import('@/modules/manager/pages/MyTasks'));

const TeamManagement = lazy(() => import('@/modules/manager/pages/TeamManagement'));
const TeamProgress = lazy(() => import('@/modules/manager/pages/TeamProgress'));
const ManagerSchedule = lazy(() => import('@/modules/manager/pages/Schedule'));
const ManagerReports = lazy(() => import('@/modules/manager/pages/Reports'));
const ManagerSettings = lazy(() => import('@/modules/manager/pages/Settings'));
const ManagerChat = lazy(() => import('@/modules/manager/pages/Chat'));
const ManagerNotifications = lazy(() => import('@/modules/manager/pages/Notifications'));

// Sales Pages
const SalesLogin = lazy(() => import('@/modules/sales/pages/SalesLogin'));
const SalesRegister = lazy(() => import('@/modules/sales/pages/SalesRegister'));
const SalesDashboard = lazy(() => import('@/modules/sales/pages/Dashboard'));
const Deals = lazy(() => import('@/modules/sales/pages/Deals'));
const Clients = lazy(() => import('@/modules/sales/pages/Clients'));
const SalesChat = lazy(() => import('@/modules/sales/pages/Chat'));
const Schedule = lazy(() => import('@/modules/sales/pages/Schedule'));
const SalesReports = lazy(() => import('@/modules/sales/pages/Reports'));
const SalesSettings = lazy(() => import('@/modules/sales/pages/Settings'));
const SalesNotifications = lazy(() => import('@/modules/sales/pages/Notifications'));

// CRM Pages
const CRMHome = lazy(() => import('@/modules/crm/pages/CRMHome'));
const LeadsManagement = lazy(() => import('@/modules/crm/pages/LeadsManagement'));
const SalesPipeline = lazy(() => import('@/modules/crm/pages/SalesPipeline'));
const FollowUps = lazy(() => import('@/modules/crm/pages/FollowUps'));
const Contacts = lazy(() => import('@/modules/crm/pages/Contacts'));
const AdminCRM = lazy(() => import('@/modules/crm/pages/AdminDashboard'));
const EmployeeCRM = lazy(() => import('@/modules/crm/pages/EmployeeDashboard'));

// Employee Pages
const EmployeeDashboard = lazy(() => import('@/modules/user/pages/TaskHome'));
const TaskDetail = lazy(() => import('@/modules/user/pages/TaskDetail'));
const EmployeeCalendar = lazy(() => import('@/modules/user/pages/Calendar'));
const EmployeeNotes = lazy(() => import('@/modules/user/pages/Notes'));
const EmployeeProfile = lazy(() => import('@/modules/user/pages/Profile'));
const PersonalAccount = lazy(() => import('@/modules/user/pages/PersonalAccount'));
const Notifications = lazy(() => import('@/modules/user/pages/Notifications'));
const Security = lazy(() => import('@/modules/user/pages/Security'));
const Preferences = lazy(() => import('@/modules/user/pages/Preferences'));
const HelpLegal = lazy(() => import('@/modules/user/pages/HelpLegal'));
const NotificationsList = lazy(() => import('@/modules/user/pages/NotificationsList'));
const HelpCenter = lazy(() => import('@/modules/user/pages/HelpCenter'));
const ChatSupport = lazy(() => import('@/modules/user/pages/ChatSupport'));
const EmployeeChat = lazy(() => import('@/modules/user/pages/Chat'));
const PrivacyPolicy = lazy(() => import('@/modules/user/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/modules/user/pages/TermsOfService'));
const EmployeeSubscription = lazy(() => import('@/modules/user/pages/Subscription'));
const SuccessJoin = lazy(() => import('@/modules/user/pages/SuccessJoin'));
const Checkout = lazy(() => import('@/modules/user/pages/Checkout'));
const AddNote = lazy(() => import('@/modules/user/pages/AddNote'));
const PendingApproval = lazy(() => import('@/modules/shared/pages/PendingApproval'));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import('@/modules/superadmin/pages/Dashboard'));
const AdminAccounts = lazy(() => import('@/modules/superadmin/pages/AdminAccounts'));
const PlansManagement = lazy(() => import('@/modules/superadmin/pages/PlansManagement'));
const SuperAdminSettings = lazy(() => import('@/modules/superadmin/pages/Settings'));
const Inquiries = lazy(() => import('@/modules/superadmin/pages/Inquiries'));
const SuperAdminSupport = lazy(() => import('@/modules/superadmin/pages/SupportTickets'));
const SubscriptionHistory = lazy(() => import('@/modules/superadmin/pages/SubscriptionHistory'));
const BillingPayments = lazy(() => import('@/modules/superadmin/pages/BillingPayments'));
const GlobalUsersOverview = lazy(() => import('@/modules/superadmin/pages/GlobalUsersOverview'));
const SupportCenter = lazy(() => import('@/modules/shared/pages/SupportCenter'));


const StaffManagement = lazy(() => import('@/modules/superadmin/pages/StaffManagement'));
const IntelManager = lazy(() => import('@/modules/superadmin/pages/IntelManager'));
const SuperAdminNotifications = lazy(() => import('@/modules/superadmin/pages/Notifications'));
const LandingPageManager = lazy(() => import('@/modules/superadmin/pages/LandingPageManager'));
const TestimonialsManager = lazy(() => import('@/modules/superadmin/pages/TestimonialsManager'));

// Public Pages
const LandingPage = lazy(() => import('@/modules/public/pages/LandingPage'));
const ContactPage = lazy(() => import('@/modules/public/pages/ContactPage'));
const Privacy = lazy(() => import('@/modules/public/pages/Privacy'));
const Terms = lazy(() => import('@/modules/public/pages/Terms'));
const Cookies = lazy(() => import('@/modules/public/pages/Cookies'));
const Welcome = lazy(() => import('@/modules/public/pages/Welcome'));
const ClientTestimonial = lazy(() => import('@/modules/public/pages/ClientTestimonial'));

// Partner Pages
const PartnerLogin = lazy(() => import('@/modules/partner/pages/PartnerLogin'));
const PartnerRegister = lazy(() => import('@/modules/partner/pages/PartnerRegister'));
const PartnerDashboard = lazy(() => import('@/modules/partner/pages/Dashboard'));
const PartnerReferral = lazy(() => import('@/modules/partner/pages/ReferralLink'));
const PartnerCommissions = lazy(() => import('@/modules/partner/pages/Commissions'));
const PartnerPayouts = lazy(() => import('@/modules/partner/pages/PayoutHistory'));
const PartnerSettings = lazy(() => import('@/modules/partner/pages/Settings'));
const PartnerNotifications = lazy(() => import('@/modules/partner/pages/Notifications'));

// SuperAdmin Partner Management
const PartnerManagement = lazy(() => import('@/modules/superadmin/pages/PartnerManagement'));

// Layouts
const CRMLayout = lazy(() => import('@/shared/layouts/CRMLayout'));

const InitialSplash = lazy(() => import('@/modules/public/pages/InitialSplash'));
const ResetPassword = lazy(() => import('@/modules/user/pages/ResetPassword'));

const AppRouter = () => {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/init" element={<InitialSplash />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/client" element={<ClientTestimonial />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/employee/splash" element={<SplashScreen />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/employee/success-join" element={<SuccessJoin />} />
                <Route path="/employee/login" element={<EmployeeLogin />} />
                <Route path="/employee/register" element={<EmployeeRegister />} />
                <Route path="/employee/forgot-password" element={<ForgotPassword returnPath="/employee/login" />} />
                <Route path="/manager/login" element={<ManagerLogin />} />
                <Route path="/manager/register" element={<ManagerRegister />} />
                <Route path="/manager/forgot-password" element={<ForgotPassword returnPath="/manager/login" />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route path="/admin/forgot-password" element={<ForgotPassword returnPath="/admin/login" />} />
                <Route path="/superadmin/login" element={<SuperAdminLogin />} />
                <Route path="/superadmin/register" element={<SuperAdminRegister />} />
                <Route path="/superadmin/forgot-password" element={<SuperAdminForgotPassword />} />
                <Route path="/sales/login" element={<SalesLogin />} />
                <Route path="/sales/register" element={<SalesRegister />} />
                <Route path="/sales/forgot-password" element={<ForgotPassword returnPath="/sales/login" />} />

                {/* Partner Auth Routes */}
                <Route path="/partner/login" element={<PartnerLogin />} />
                <Route path="/partner/register" element={<PartnerRegister />} />
                <Route path="/partner/forgot-password" element={<ForgotPassword returnPath="/partner/login" />} />

                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* --- ADMIN ROUTES --- */}
                {/* Main Admin Panel */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout role="admin" /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="managers" element={<ManagerManagement />} />
                    <Route path="employees" element={<EmployeeManagement />} />
                    <Route path="sales" element={<SalesManagement />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="projects/approvals" element={<ProjectApprovals />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="chat" element={<AdminChat />} />
                    <Route path="calendar" element={<AdminCalendar />} />
                    <Route path="subscription" element={<AdminSubscription />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="requests" element={<JoinRequests />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="support" element={<SupportCenter />} />
                </Route>

                {/* Admin CRM Panel */}
                <Route path="/admin/crm" element={<ProtectedRoute allowedRoles={['admin']}><CRMLayout role="admin" /></ProtectedRoute>}>
                    <Route index element={<AdminCRM />} />
                    <Route path="leads" element={<LeadsManagement />} />
                    <Route path="pipeline" element={<SalesPipeline />} />
                    <Route path="follow-ups" element={<FollowUps />} />
                </Route>

                {/* --- EMPLOYEE ROUTES --- */}
                {/* Unified Employee Panel including CRM */}
                <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLayout /></ProtectedRoute>}>
                    <Route index element={<EmployeeDashboard />} />
                    <Route path="tasks/:id" element={<TaskDetail />} />
                    <Route path="calendar" element={<EmployeeCalendar />} />
                    <Route path="notes" element={<EmployeeNotes />} />
                    <Route path="notes/new" element={<AddNote />} />
                    <Route path="notes/edit/:id" element={<AddNote />} />
                    <Route path="notifications" element={<NotificationsList />} />
                    <Route path="chat" element={<EmployeeChat />} />
                    <Route path="profile" element={<EmployeeProfile />} />
                    <Route path="profile/account" element={<PersonalAccount />} />
                    <Route path="profile/notifications" element={<Notifications />} />
                    <Route path="profile/security" element={<Security />} />
                    <Route path="profile/preferences" element={<Preferences />} />

                    <Route path="checkout" element={<Checkout />} />
                    <Route path="profile/help" element={<HelpLegal />} />
                    <Route path="profile/help/privacy" element={<PrivacyPolicy />} />
                    <Route path="profile/help/terms" element={<TermsOfService />} />
                    <Route path="profile/help/center" element={<HelpCenter />} />
                    <Route path="profile/help/chat" element={<ChatSupport />} />
                    <Route path="support" element={<SupportCenter />} />

                    {/* Embedded CRM Routes for Employee */}
                    <Route path="crm">
                        <Route index element={<EmployeeCRM />} />
                        <Route path="leads" element={<LeadsManagement />} />
                        <Route path="pipeline" element={<SalesPipeline />} />
                        <Route path="follow-ups" element={<FollowUps />} />
                        <Route path="contacts" element={<Contacts />} />
                    </Route>
                </Route>


                {/* --- SUPER ADMIN ROUTES --- */}
                {/* Main Super Admin Panel */}
                <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin', 'superadmin_staff', 'superadmin_employee']}><AdminLayout role="superadmin" /></ProtectedRoute>}>
                    <Route index element={<SuperAdminDashboard />} />
                    <Route path="admins" element={<AdminAccounts />} />
                    <Route path="users" element={<GlobalUsersOverview />} />
                    <Route path="inquiries" element={<Inquiries />} />
                    <Route path="support" element={<SupportCenter />} />
                    <Route path="history" element={<SubscriptionHistory />} />
                    <Route path="settings" element={<SuperAdminSettings />} />
                    <Route path="notifications" element={<SuperAdminNotifications />} />
                    <Route path="system-intel" element={<IntelManager />} />
                    <Route path="landing-page" element={<LandingPageManager />} />
                    <Route path="testimonials" element={<TestimonialsManager />} />
                    <Route path="partners" element={<PartnerManagement />} />

                    {/* Restricted Routes for Root SuperAdmin Only */}
                    <Route element={<ProtectedRoute allowedRoles={['superadmin']}><Outlet /></ProtectedRoute>}>
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="plans" element={<PlansManagement />} />
                        <Route path="billing" element={<BillingPayments />} />
                        <Route path="history" element={<SubscriptionHistory />} />
                    </Route>
                </Route>

                {/* --- MANAGER ROUTES --- */}
                {/* Main Manager Panel */}
                <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerLayout /></ProtectedRoute>}>
                    <Route index element={<ManagerDashboard />} />
                    <Route path="projects" element={<ManagerProjects />} />
                    <Route path="projects/:id" element={<ManagerProjectDetails />} />
                    <Route path="assign-task" element={<AssignTask />} />
                    <Route path="my-tasks" element={<MyTasks />} />
                    <Route path="tasks/:id" element={<TaskDetail />} />
                    <Route path="team" element={<TeamManagement />} />
                    <Route path="progress" element={<TeamProgress />} />
                    <Route path="chat" element={<ManagerChat />} />
                    <Route path="schedule" element={<ManagerSchedule />} />
                    <Route path="reports" element={<ManagerReports />} />
                    <Route path="settings" element={<ManagerSettings />} />
                    <Route path="notifications" element={<ManagerNotifications />} />
                    <Route path="support" element={<SupportCenter />} />
                </Route>

                {/* --- SALES ROUTES --- */}
                {/* Main Sales Panel */}
                <Route path="/sales" element={<ProtectedRoute allowedRoles={['sales']}><ManagerLayout role="sales" /></ProtectedRoute>}>
                    <Route index element={<SalesDashboard />} />
                    <Route path="deals" element={<Deals />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="reports" element={<SalesReports />} />
                    <Route path="chat" element={<SalesChat />} />
                    <Route path="settings" element={<SalesSettings />} />
                    <Route path="notifications" element={<SalesNotifications />} />
                    <Route path="support" element={<SupportCenter />} />
                </Route>

                {/* Sales CRM Panel */}
                <Route path="/sales/crm" element={<ProtectedRoute allowedRoles={['sales']}><CRMLayout role="sales" /></ProtectedRoute>}>
                    <Route index element={<EmployeeCRM />} />
                    <Route path="leads" element={<LeadsManagement />} />
                    <Route path="pipeline" element={<SalesPipeline />} />
                    <Route path="follow-ups" element={<FollowUps />} />
                </Route>

                {/* --- PARTNER ROUTES --- */}
                <Route path="/partner" element={<ProtectedRoute allowedRoles={['partner']}><AdminLayout role="partner" /></ProtectedRoute>}>
                    <Route index element={<PartnerDashboard />} />
                    <Route path="referral" element={<PartnerReferral />} />
                    <Route path="commissions" element={<PartnerCommissions />} />
                    <Route path="payouts" element={<PartnerPayouts />} />
                    <Route path="settings" element={<PartnerSettings />} />
                    <Route path="notifications" element={<PartnerNotifications />} />
                    <Route path="support" element={<SupportCenter />} />
                </Route>

                {/* Default Redirection */}
                <Route path="*" element={<NotFoundRedirect />} />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;
