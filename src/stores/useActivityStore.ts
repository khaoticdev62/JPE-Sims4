import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'

/**
 * Activity types for tracking user actions
 */
export type ActivityType = 'added' | 'modified' | 'translated' | 'completed' | 'created' | 'opened'

/**
 * Activity record for tracking user actions
 */
export interface Activity {
  id: string
  type: ActivityType
  fileName: string // Can be "New project created", "Compilation successful", etc.
  projectName: string
  projectId: string
  timestamp: number // Unix timestamp for sorting
}

/**
 * Activity store state and actions
 */
interface ActivityState {
  activities: Activity[]
  maxActivities: number // Limit to 50 most recent

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  getRecentActivities: (limit?: number) => Activity[]
  clearActivities: () => void
  clearProjectActivities: (projectId: string) => void
}

/**
 * Zustand store for tracking user activities
 * Persisted to localStorage for session continuity
 */
export const useActivityStore = create<ActivityState>()(
  devtools(
    persist(
      (set, get) => ({
        activities: [],
        maxActivities: 50,

        /**
         * Add a new activity to the store
         * Auto-generates ID and timestamp, auto-prunes oldest if exceeding maxActivities
         */
        addActivity: (activity) => {
          const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const timestamp = Date.now()

          set((state) => {
            const newActivities = [
              { ...activity, id, timestamp },
              ...state.activities,
            ].slice(0, state.maxActivities)

            return { activities: newActivities }
          })
        },

        /**
         * Get recent activities (sorted by timestamp descending)
         */
        getRecentActivities: (limit = 10) => {
          const activities = get().activities
          return activities.slice(0, Math.min(limit, activities.length))
        },

        /**
         * Clear all activities
         */
        clearActivities: () => {
          set({ activities: [] })
        },

        /**
         * Clear activities for a specific project
         */
        clearProjectActivities: (projectId: string) => {
          set((state) => ({
            activities: state.activities.filter((a) => a.projectId !== projectId),
          }))
        },
      }),
      {
        name: 'jpe-activity-store',
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => ({
          activities: state.activities,
        }),
      }
    )
  )
)
