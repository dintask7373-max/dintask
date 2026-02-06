# DinTask Frontend Analysis & Workflow Documentation

## 1. Project Overview
**DinTask** is a comprehensive Task Management and CRM (Customer Relationship Management) platform designed for organizations with complex hierarchies. It features role-based access control (RBAC) across five distinct user roles: Super Admin, Admin, Manager, Sales Executive, and Employee.


## 2. Platform Architecture (Role-Based Hierarchy)

### I. Super Admin (System Owner)
*The absolute authority over the entire platform instance.*
- **System Dashboard**: Global analytics showing total admins, active users, and platform revenue.
- **Admin Management**: Create, view, and manage Organization Admin accounts.
- **Plan & Subscription Management**: Create and edit pricing plans (Monthly/Yearly/Custom).
- **Billing overseen**: Full visibility into payment history and billing logs across all organizations.
- **Platform Support**: Handling high-level inquiries and support tickets from organization admins.

### II. Admin (Organization Head)
*Manages a specific workspace/organization.*
- **Organizational Dashboard**: Overview of organization tasks, employee productivity, and active managers.
- **Hierarchy Management**: Onboarding and managing Managers, Sales Executives, and Employees.
- **Task Control**: Creating system-wide tasks and monitoring completion rates.
- **CRM Supervision**: Access to the high-level Sales Pipeline and Lead analytics for the organization.
- **Subscription**: Managing the organization's plan and renewing services.
- **Audit Logs**: Viewing reports on organization-wide performance.

### III. Manager (Team Leader)
*Focused on team performance and task delegation.*
- **Team Dashboard**: Real-time progress tracking of assigned teams.
- **Task Delegation**: Assigning specific tasks to Employees/Sales Executives and monitoring status.
- **Schedule Management**: Team-wide calendar coordination.
- **Reporting**: Generating performance reports for submission to the Admin.
- **Chat & Collaboration**: Internal communication channels with the team.

### IV. Sales Executive (Revenue Generator)
*Specialized roles for Client Management and Deal closure.*
- **Sales Dashboard**: Focused on individual/team sales targets and lead conversion.
- **CRM Operations**: Managing Leads, maintaining Contacts, and overseeing the Sales Pipeline (Deals).
- **Client Management**: Maintaining relationships and scheduling follow-ups.
- **Performance Reports**: Sales conversion and activity metrics.

### V. Employee (Task Performer)
*The core workhorse of the organization.*
- **Personal Dashboard**: Daily task list, deadlines, and urgency markers.
- **Task Management**: Adding personal tasks, updating progress, and completing assigned work.
- **Collaboration Tools**: Internal notes, personal calendar, and notifications.
- **Profile & Preferences**: Managing personal security, notifications, and workplace settings.



## 3. Core Features & Functionalities

### 🚀 Task Management System
- **Creation & Assigning**: Drag-and-drop task assignment (Manager to Employee).
- **Progress Tracking**: Real-time status updates (To-Do -> In-Progress -> Completed).
- **Task Details**: Sub-tasks, descriptions, deadlines, and priority levels.
- **Completion Verification**: Manager/Admin verification for high-priority tasks.

### 💰 CRM (Customer Relationship Management)
- **Leads Management**: Capture, categorize, and track potential clients.
- **Sales Pipeline**: Visual representation of the sales journey from Lead to Closed Won.
- **Follow-ups**: Automated reminders and scheduling for client interaction.
- **Contacts Directory**: Centralized repository for all organization clients.

### 📊 Analytics & Reporting
- **Dynamic Charts**: Recharts-powered visualizations for productivity and revenue.
- **Exporting**: Capability to export reports/data (Excel/PDF integration via XLSX).
- **Real-time Stats**: Aggregated data snapshots on dashboards.

### 💬 Communication & Collaboration
- **Internal Chat**: Real-time messaging between roles.
- **Notification System**: Push and in-app notifications for task updates and mentions.
- **Shared Calendar**: Role-specific and team-wide event scheduling.



## 4. User Journey & Flow

1.  **Landing & Onboarding**:
    - Users arrive at the **Landing Page** and select their login portal (Admin/Employee/etc.).
    - New employees/managers use the **Join Workspace** link provided by their Admin.

2.  **Authentication**:
    - Role-specific login pages with secure JWT-based authentication.
    - Password recovery via **Forgot Password** flow.

3.  **Workspace Entry**:
    - Users are redirected to their specific **Role Dashboard**.
    - Navigation via a persistent **Sidebar** and **TopNav** tailored to their permissions.

4.  **Operational Cycle**:
    - **Admin** sets up the framework -> **Manager** delegates -> **Employee** executes -> **Admin/Manager** reviews.


## 5. Client Approval Checklist

| Feature Cluster | Description | Approved? |
| :--- | :--- | :--- |
| **RBAC Interface** | Distinct UI/Modules for all 5 roles. | [ ] |
| **Task Lifecycle** | Creation, Assignment, Execution, Completion. | [ ] |
| **CRM Module** | Lead tracking and Pipeline management. | [ ] |
| **Subscription System** | Pricing plans and billing management. | [ ] |
| **Analytics Engine** | Dashboards with Recharts integration. | [ ] |
| **Communication** | In-app Chat and Notification system. | [ ] |

---

