import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import useTaskStore from './taskStore';

const useCRMStore = create(
  persist(
    (set, get) => ({
      // Leads Management
      leads: [
        {
          id: 'LEAD-001',
          name: 'John Doe',
          mobile: '+1234567890',
          email: 'john.doe@example.com',
          company: 'ABC Corp',
          source: 'Website',
          owner: '103',
          status: 'New', // Pipeline Stage
          approvalStatus: 'none', // none, pending_project, approved_project
          notes: 'Interested in our services',
          amount: 5000,
          priority: 'high',
          deadline: '2026-02-15T00:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'LEAD-002',
          name: 'Jane Smith',
          mobile: '+0987654321',
          email: 'jane.smith@example.com',
          company: 'XYZ Inc',
          source: 'Call',
          owner: 'EMP-002',
          status: 'Contacted',
          approvalStatus: 'none',
          notes: 'Follow up next week',
          amount: 12000,
          priority: 'medium',
          deadline: '2026-03-01T00:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'LEAD-003',
          name: 'Robert Stark',
          mobile: '+1987654321',
          email: 'robert@starkindustries.com',
          company: 'Stark Ind',
          source: 'Referral',
          owner: '103',
          status: 'Won',
          approvalStatus: 'pending_project', // Waiting for Admin to assign Manager
          notes: 'Deal closed. Needs project setup.',
          amount: 500000,
          priority: 'urgent',
          deadline: '2026-04-10T00:00:00.000Z',
          createdAt: new Date().toISOString(),
        },
      ],

      // Sales Pipeline Stages (Configurable)
      pipelineStages: ['New', 'Contacted', 'Meeting Done', 'Proposal Sent', 'Won', 'Lost'],

      // Sales Pipeline
      pipeline: {
        New: ['LEAD-001'],
        Contacted: ['LEAD-002'],
        'Meeting Done': [],
        'Proposal Sent': [],
        Won: ['LEAD-003'],
        Lost: [],
      },

      // Follow-ups & Reminders
      followUps: [],

      // Lead Status History
      leadHistory: [],

      // Add Lead
      addLead: (leadData, autoCreateTask = false) => {
        const newLead = {
          id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date().toISOString(),
          amount: 0,
          priority: 'medium',
          deadline: null,
          approvalStatus: 'none',
          ...leadData,
        };
        set((state) => ({
          leads: [...state.leads, newLead],
          pipeline: {
            ...state.pipeline,
            New: [...state.pipeline.New, newLead.id],
          },
        }));

        // Optionally create task for new lead
        if (autoCreateTask) {
          const taskStore = useTaskStore.getState();
          taskStore.addTask({
            title: `Follow up with new lead: ${newLead.name}`,
            description: `Initial contact with ${newLead.name} from ${newLead.company}`,
            assignedTo: [newLead.owner],
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            status: 'pending',
            priority: 'high',
            crmLink: {
              type: 'lead',
              id: newLead.id,
            },
          });
        }

        return newLead;
      },

      // Edit Lead
      editLead: (leadId, leadData) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, ...leadData } : lead
          ),
        }));
      },

      // Delete Lead
      deleteLead: (leadId) => {
        set((state) => {
          // Remove from leads
          const updatedLeads = state.leads.filter((lead) => lead.id !== leadId);

          // Remove from pipeline
          const updatedPipeline = { ...state.pipeline };
          for (const stage in updatedPipeline) {
            updatedPipeline[stage] = updatedPipeline[stage].filter((id) => id !== leadId);
          }

          return {
            leads: updatedLeads,
            pipeline: updatedPipeline,
          };
        });
      },

      // Assign Lead
      assignLead: (leadId, employeeId) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId ? { ...lead, owner: employeeId } : lead
          ),
        }));
      },

      // Move Lead Between Pipeline Stages
      moveLead: (leadId, fromStage, toStage) => {
        set((state) => {
          const lead = state.leads.find((l) => l.id === leadId);
          if (!lead) return state;

          const updatedPipeline = { ...state.pipeline };

          // Safety check: ensure arrays exist
          if (!updatedPipeline[fromStage]) updatedPipeline[fromStage] = [];
          if (!updatedPipeline[toStage]) updatedPipeline[toStage] = [];

          updatedPipeline[fromStage] = updatedPipeline[fromStage].filter((id) => id !== leadId);
          updatedPipeline[toStage] = [...updatedPipeline[toStage], leadId];

          // Add to history
          const historyEntry = {
            leadId,
            stage: toStage,
            changedBy: 'current-user', // Replace with actual user ID
            changedAt: new Date().toISOString(),
          };

          // Update lead status
          let updatedApprovalStatus = lead.approvalStatus;

          // PROPOSAL: If moving to WON, automatically set to pending_project if not already
          if (toStage === 'Won' && lead.approvalStatus === 'none') {
            updatedApprovalStatus = 'pending_project';
          }

          const updatedLeads = state.leads.map((l) =>
            l.id === leadId ? { ...l, status: toStage, approvalStatus: updatedApprovalStatus } : l
          );

          return {
            pipeline: updatedPipeline,
            leadHistory: [...state.leadHistory, historyEntry],
            leads: updatedLeads,
          };
        });
      },

      requestProjectConversion: (leadId) => {
        set((state) => ({
          leads: state.leads.map(lead =>
            lead.id === leadId ? { ...lead, approvalStatus: 'pending_project' } : lead
          )
        }));
      },

      approveProject: (leadId, managerId) => {
        set((state) => ({
          leads: state.leads.map(lead =>
            lead.id === leadId ? { ...lead, approvalStatus: 'approved_project', projectManager: managerId } : lead
          )
        }));
      },

      // Add Follow-up
      addFollowUp: (followUpData) => {
        const newFollowUp = {
          id: `FUP-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date().toISOString(),
          ...followUpData,
        };
        set((state) => ({
          followUps: [...state.followUps, newFollowUp],
        }));

        // Auto-create task in task management system
        const taskStore = useTaskStore.getState();
        const lead = get().leads.find(l => l.id === followUpData.leadId);

        taskStore.addTask({
          title: `${followUpData.type} with ${lead?.name}`,
          description: followUpData.notes || `Follow up with ${lead?.name} via ${followUpData.type}`,
          assignedTo: [followUpData.leadId],
          deadline: followUpData.scheduledAt,
          status: 'pending',
          priority: 'medium',
          crmLink: {
            type: 'followUp',
            id: newFollowUp.id,
            leadId: followUpData.leadId,
          },
        });

        return newFollowUp;
      },

      // Update Follow-up
      updateFollowUp: (followUpId, followUpData) => {
        set((state) => ({
          followUps: state.followUps.map((followUp) =>
            followUp.id === followUpId ? { ...followUp, ...followUpData } : followUp
          ),
        }));
      },

      // Delete Follow-up
      deleteFollowUp: (followUpId) => {
        set((state) => ({
          followUps: state.followUps.filter((followUp) => followUp.id !== followUpId),
        }));
      },

      // Get Leads by Status
      getLeadsByStatus: (status) => {
        return get().leads.filter((lead) => lead.status === status);
      },

      // Get Leads by Owner
      getLeadsByOwner: (ownerId) => {
        return get().leads.filter((lead) => lead.owner === ownerId);
      },

      // Get Lead History
      getLeadHistory: (leadId) => {
        return get().leadHistory.filter((entry) => entry.leadId === leadId);
      },

      // Get Follow-ups for Lead
      getFollowUpsByLead: (leadId) => {
        return get().followUps.filter((followUp) => followUp.leadId === leadId);
      },

      // Get Pipeline Data
      getPipelineData: () => {
        const state = get();
        return Object.entries(state.pipeline).map(([stage, leadIds]) => ({
          stage,
          leadIds,
          leads: leadIds.map((id) => state.leads.find((lead) => lead.id === id)),
        }));
      },

      // Get Pending Projects
      getPendingProjects: () => {
        return get().leads.filter(lead => lead.status === 'Won' && lead.approvalStatus === 'pending_project');
      }
    }),
    {
      name: 'dintask-crm-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useCRMStore;