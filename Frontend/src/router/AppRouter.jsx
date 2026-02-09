import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminSubscriptionProtectedRoute from '../components/AdminSubscriptionProtectedRoute';
import useAuthStore from '@/store/authStore';

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
                    : '/employee';

    return <Navigate to={defaultRoute} replace />;
};

// Layouts
import AdminLayout from '@/shared/layouts/AdminLayout';
import EmployeeLayout from '@/shared/layouts/EmployeeLayout';
import ManagerLayout from '@/shared/layouts/ManagerLayout';

// Auth Pages
import SplashScreen from '@/modules/user/pages/SplashScreen';
import EmployeeLogin from '@/modules/user/pages/EmployeeLogin';
import EmployeeRegister from '@/modules/user/pages/EmployeeRegister';
import ForgotPassword from '@/modules/user/pages/ForgotPassword';
import AdminLogin from '@/modules/admin/pages/AdminLogin';
import AdminRegister from '@/modules/admin/pages/AdminRegister';
import SuperAdminLogin from '@/modules/superadmin/pages/SuperAdminLogin';
import SuperAdminRegister from '@/modules/superadmin/pages/SuperAdminRegister';
import SuperAdminForgotPassword from '@/modules/superadmin/pages/SuperAdminForgotPassword';

// Admin Pages
import AdminDashboard from '@/modules/admin/pages/Dashboard';
import ManagerManagement from '@/modules/admin/pages/ManagerManagement';
import EmployeeManagement from '@/modules/admin/pages/EmployeeManagement';
import TaskManagement from '@/modules/admin/pages/TaskManagement';
import TaskCompletion from '@/modules/admin/pages/TaskCompletion';
import Reports from '@/modules/admin/pages/Reports';
import AdminCalendar from '@/modules/admin/pages/Calendar';
import AdminChat from '@/modules/admin/pages/Chat';
import AdminSubscription from '@/modules/admin/pages/Subscription';
import Settings from '@/modules/admin/pages/Settings';
import JoinRequests from '@/modules/admin/pages/JoinRequests';
import SalesManagement from '@/modules/admin/pages/SalesManagement';
import ProjectApprovals from '@/modules/admin/pages/ProjectApprovals';

import ManagerLogin from '@/modules/manager/pages/ManagerLogin';
import ManagerRegister from '@/modules/manager/pages/ManagerRegister';

import ManagerDashboard from '@/modules/manager/pages/Dashboard';
import ManagerProjects from '@/modules/manager/pages/Projects';
import ManagerProjectDetails from '@/modules/manager/pages/ProjectDetails';
import AssignTask from '@/modules/manager/pages/AssignTask';

import MyTasks from '@/modules/manager/pages/MyTasks';
import TaskDelegation from '@/modules/manager/pages/TaskDelegation';
import TeamManagement from '@/modules/manager/pages/TeamManagement';
import TeamProgress from '@/modules/manager/pages/TeamProgress';
import ManagerSchedule from '@/modules/manager/pages/Schedule';
import ManagerReports from '@/modules/manager/pages/Reports';
import ManagerSettings from '@/modules/manager/pages/Settings';
import ManagerChat from '@/modules/manager/pages/Chat';

// Sales Pages
import SalesLogin from '@/modules/sales/pages/SalesLogin';
import SalesRegister from '@/modules/sales/pages/SalesRegister';
import SalesDashboard from '@/modules/sales/pages/Dashboard';
import Deals from '@/modules/sales/pages/Deals';
import Clients from '@/modules/sales/pages/Clients';
import Schedule from '@/modules/sales/pages/Schedule';
import SalesReports from '@/modules/sales/pages/Reports';
import SalesSettings from '@/modules/sales/pages/Settings';
import SalesTasks from '@/modules/sales/pages/SalesTasks';

// CRM Pages
import CRMHome from '@/modules/crm/pages/CRMHome';
import LeadsManagement from '@/modules/crm/pages/LeadsManagement';
import SalesPipeline from '@/modules/crm/pages/SalesPipeline';
import FollowUps from '@/modules/crm/pages/FollowUps';
import Contacts from '@/modules/crm/pages/Contacts';
import AdminCRM from '@/modules/crm/pages/AdminDashboard';
import EmployeeCRM from '@/modules/crm/pages/EmployeeDashboard';

// Employee Pages
import EmployeeDashboard from '@/modules/user/pages/TaskHome';
import TaskDetail from '@/modules/user/pages/TaskDetail';
import EmployeeCalendar from '@/modules/user/pages/Calendar';
import EmployeeNotes from '@/modules/user/pages/Notes';
import EmployeeProfile from '@/modules/user/pages/Profile';
import PersonalAccount from '@/modules/user/pages/PersonalAccount';
import Notifications from '@/modules/user/pages/Notifications';
import Security from '@/modules/user/pages/Security';
import Preferences from '@/modules/user/pages/Preferences';
import HelpLegal from '@/modules/user/pages/HelpLegal';
import AddTask from '@/modules/user/pages/AddTask';
import NotificationsList from '@/modules/user/pages/NotificationsList';
import HelpCenter from '@/modules/user/pages/HelpCenter';
import ChatSupport from '@/modules/user/pages/ChatSupport';
import EmployeeChat from '@/modules/user/pages/Chat';
import PrivacyPolicy from '@/modules/user/pages/PrivacyPolicy';
import TermsOfService from '@/modules/user/pages/TermsOfService';
import EmployeeSubscription from '@/modules/user/pages/Subscription';
import SuccessJoin from '@/modules/user/pages/SuccessJoin';
import JoinWorkspace from '@/modules/user/pages/JoinWorkspace';
import Checkout from '@/modules/user/pages/Checkout';
import PendingApproval from '@/modules/shared/pages/PendingApproval';

// Super Admin Pages
import SuperAdminDashboard from '@/modules/superadmin/pages/Dashboard';
import AdminAccounts from '@/modules/superadmin/pages/AdminAccounts';
import PlansManagement from '@/modules/superadmin/pages/PlansManagement';
import SuperAdminSettings from '@/modules/superadmin/pages/Settings';
import Inquiries from '@/modules/superadmin/pages/Inquiries';
import SuperAdminSupport from '@/modules/superadmin/pages/SupportTickets';
import SubscriptionHistory from '@/modules/superadmin/pages/SubscriptionHistory';
import BillingPayments from '@/modules/superadmin/pages/BillingPayments';
import GlobalUsersOverview from '@/modules/superadmin/pages/GlobalUsersOverview';
import SupportCenter from '@/modules/shared/pages/SupportCenter';
import LandingPageManager from '@/modules/superadmin/pages/LandingPageManager';
import StaffManagement from '@/modules/superadmin/pages/StaffManagement';

// Public Pages
import LandingPage from '@/modules/public/pages/LandingPage';
import ContactPage from '@/modules/public/pages/ContactPage';
import Privacy from '@/modules/public/pages/Privacy';
import Terms from '@/modules/public/pages/Terms';
import Cookies from '@/modules/public/pages/Cookies';
import Welcome from '@/modules/public/pages/Welcome';

// Layouts
import CRMLayout from '@/shared/layouts/CRMLayout';

import InitialSplash from '@/modules/public/pages/InitialSplash';

const AppRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/init" element={<InitialSplash />} />
            <Route path="/welcome" element={<Welcome />} />
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

            {/* --- ADMIN ROUTES --- */}
            {/* Main Admin Panel */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout role="admin" /></ProtectedRoute>}>
                <Route index element={<AdminSubscriptionProtectedRoute><AdminDashboard /></AdminSubscriptionProtectedRoute>} />
                <Route path="managers" element={<AdminSubscriptionProtectedRoute><ManagerManagement /></AdminSubscriptionProtectedRoute>} />
                <Route path="employees" element={<AdminSubscriptionProtectedRoute><EmployeeManagement /></AdminSubscriptionProtectedRoute>} />
                <Route path="sales" element={<AdminSubscriptionProtectedRoute><SalesManagement /></AdminSubscriptionProtectedRoute>} />
                <Route path="projects/approvals" element={<AdminSubscriptionProtectedRoute><ProjectApprovals /></AdminSubscriptionProtectedRoute>} />
                <Route path="reports" element={<AdminSubscriptionProtectedRoute><Reports /></AdminSubscriptionProtectedRoute>} />
                <Route path="chat" element={<AdminSubscriptionProtectedRoute><AdminChat /></AdminSubscriptionProtectedRoute>} />
                <Route path="calendar" element={<AdminSubscriptionProtectedRoute><AdminCalendar /></AdminSubscriptionProtectedRoute>} />
                {/* Subscription page is NOT wrapped - always accessible */}
                <Route path="subscription" element={<AdminSubscription />} />
                <Route path="settings" element={<AdminSubscriptionProtectedRoute><Settings /></AdminSubscriptionProtectedRoute>} />
                <Route path="requests" element={<AdminSubscriptionProtectedRoute><JoinRequests /></AdminSubscriptionProtectedRoute>} />
                <Route path="support" element={<AdminSubscriptionProtectedRoute><SupportCenter /></AdminSubscriptionProtectedRoute>} />
            </Route>

            {/* Admin CRM Panel */}
            <Route path="/admin/crm" element={<ProtectedRoute allowedRoles={['admin']}><CRMLayout role="admin" /></ProtectedRoute>}>
                <Route index element={<AdminSubscriptionProtectedRoute><AdminCRM /></AdminSubscriptionProtectedRoute>} />
                <Route path="leads" element={<AdminSubscriptionProtectedRoute><LeadsManagement /></AdminSubscriptionProtectedRoute>} />
                <Route path="pipeline" element={<AdminSubscriptionProtectedRoute><SalesPipeline /></AdminSubscriptionProtectedRoute>} />
                <Route path="follow-ups" element={<AdminSubscriptionProtectedRoute><FollowUps /></AdminSubscriptionProtectedRoute>} />
            </Route>

            {/* --- EMPLOYEE ROUTES --- */}
            {/* Unified Employee Panel including CRM */}
            <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLayout /></ProtectedRoute>}>
                <Route index element={<EmployeeDashboard />} />
                <Route path="tasks/:id" element={<TaskDetail />} />
                <Route path="tasks/new" element={<AddTask />} />
                <Route path="calendar" element={<EmployeeCalendar />} />
                <Route path="notes" element={<EmployeeNotes />} />
                <Route path="notifications" element={<NotificationsList />} />
                <Route path="chat" element={<EmployeeChat />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="profile/account" element={<PersonalAccount />} />
                <Route path="profile/notifications" element={<Notifications />} />
                <Route path="profile/security" element={<Security />} />
                <Route path="profile/preferences" element={<Preferences />} />

                <Route path="join" element={<JoinWorkspace />} />
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
                <Route path="staff" element={<StaffManagement />} />
                <Route path="users" element={<GlobalUsersOverview />} />
                <Route path="plans" element={<PlansManagement />} />
                <Route path="billing" element={<BillingPayments />} />
                <Route path="inquiries" element={<Inquiries />} />
                <Route path="support" element={<SupportCenter />} />
                <Route path="history" element={<SubscriptionHistory />} />
                <Route path="settings" element={<SuperAdminSettings />} />
                <Route path="landing-page" element={<LandingPageManager />} />
                <Route path="reports" element={<div>System Reports (Coming Soon)</div>} />
                <Route path="calendar" element={<div>System Calendar (Coming Soon)</div>} />
            </Route>



            {/* --- MANAGER ROUTES --- */}
            {/* Main Manager Panel */}
            <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><ManagerLayout /></ProtectedRoute>}>
                <Route index element={<ManagerDashboard />} />
                <Route path="projects" element={<ManagerProjects />} />
                <Route path="projects/:id" element={<ManagerProjectDetails />} />
                <Route path="assign-task" element={<AssignTask />} />
                <Route path="my-tasks" element={<MyTasks />} />
                <Route path="delegation" element={<TaskDelegation />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="progress" element={<TeamProgress />} />
                <Route path="chat" element={<ManagerChat />} />
                <Route path="schedule" element={<ManagerSchedule />} />
                <Route path="reports" element={<ManagerReports />} />
                <Route path="settings" element={<ManagerSettings />} />
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
                <Route path="settings" element={<SalesSettings />} />
                <Route path="support" element={<SupportCenter />} />
            </Route>

            {/* Sales CRM Panel */}
            <Route path="/sales/crm" element={<ProtectedRoute allowedRoles={['sales']}><CRMLayout role="sales" /></ProtectedRoute>}>
                <Route index element={<EmployeeCRM />} />
                <Route path="leads" element={<LeadsManagement />} />
                <Route path="pipeline" element={<SalesPipeline />} />
                <Route path="follow-ups" element={<FollowUps />} />
                <Route path="contacts" element={<Contacts />} />
            </Route>

            {/* Default Redirection */}
            <Route path="*" element={<NotFoundRedirect />} />
        </Routes >
    );
};

export default AppRouter;
