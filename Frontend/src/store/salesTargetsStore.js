import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useSalesTargetsStore = create(
    persist(
        (set, get) => ({
            // Individual sales targets
            individualTargets: {
                monthly: {
                    revenue: 50000,
                    deals: 10,
                    clients: 5
                },
                quarterly: {
                    revenue: 150000,
                    deals: 30,
                    clients: 15
                },
                yearly: {
                    revenue: 600000,
                    deals: 120,
                    clients: 60
                }
            },
            
            // Team sales targets
            teamTargets: {
                monthly: {
                    revenue: 200000,
                    deals: 40,
                    clients: 20
                },
                quarterly: {
                    revenue: 600000,
                    deals: 120,
                    clients: 60
                },
                yearly: {
                    revenue: 2400000,
                    deals: 480,
                    clients: 240
                }
            },
            
            // Track actual performance
            actualPerformance: {
                monthly: {
                    revenue: 35000,
                    deals: 8,
                    clients: 4
                },
                quarterly: {
                    revenue: 120000,
                    deals: 25,
                    clients: 12
                },
                yearly: {
                    revenue: 450000,
                    deals: 95,
                    clients: 48
                }
            },

            // Set individual target for a specific period
            setIndividualTarget: (period, targetType, value) => {
                set((state) => ({
                    individualTargets: {
                        ...state.individualTargets,
                        [period]: {
                            ...state.individualTargets[period],
                            [targetType]: value
                        }
                    }
                }));
            },

            // Set team target for a specific period
            setTeamTarget: (period, targetType, value) => {
                set((state) => ({
                    teamTargets: {
                        ...state.teamTargets,
                        [period]: {
                            ...state.teamTargets[period],
                            [targetType]: value
                        }
                    }
                }));
            },

            // Update actual performance
            updateActualPerformance: (period, performanceType, value) => {
                set((state) => ({
                    actualPerformance: {
                        ...state.actualPerformance,
                        [period]: {
                            ...state.actualPerformance[period],
                            [performanceType]: value
                        }
                    }
                }));
            },

            // Calculate progress towards individual target
            calculateIndividualProgress: (period, targetType) => {
                const targets = get().individualTargets;
                const actual = get().actualPerformance;
                
                if (!targets[period] || !actual[period]) return 0;
                
                const targetValue = targets[period][targetType];
                const actualValue = actual[period][targetType];
                
                if (targetValue === 0) return 0;
                
                return Math.min(100, Math.round((actualValue / targetValue) * 100));
            },

            // Calculate progress towards team target
            calculateTeamProgress: (period, targetType) => {
                const targets = get().teamTargets;
                const actual = get().actualPerformance;
                
                if (!targets[period] || !actual[period]) return 0;
                
                const targetValue = targets[period][targetType];
                const actualValue = actual[period][targetType];
                
                if (targetValue === 0) return 0;
                
                return Math.min(100, Math.round((actualValue / targetValue) * 100));
            },

            // Get all individual targets for a specific period
            getIndividualTargetsByPeriod: (period) => {
                return get().individualTargets[period] || {};
            },

            // Get all team targets for a specific period
            getTeamTargetsByPeriod: (period) => {
                return get().teamTargets[period] || {};
            },

            // Get all actual performance for a specific period
            getActualPerformanceByPeriod: (period) => {
                return get().actualPerformance[period] || {};
            }
        }),
        {
            name: 'dintask-sales-targets-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useSalesTargetsStore;