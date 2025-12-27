import { useState } from 'react'
import { AppNavigation } from '@/components/AppNavigation'
import { useProjectStore } from '@/stores/useProjectStore'
import { FolderOpen, Plus, Clock, FileText } from 'lucide-react'

interface ProjectsPageProps {
  onNavigate?: (view: string) => void
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const [activeNav, setActiveNav] = useState('projects')
  const { recentProjects, currentProject } = useProjectStore()

  const handleNavigate = (item: string) => {
    setActiveNav(item)
    onNavigate?.(item)
  }

  return (
    <div className="flex h-screen bg-background-primary">
      {/* Sidebar Navigation */}
      <AppNavigation activeItem={activeNav} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
            <p className="text-text-secondary">
              Manage and organize your Sims 4 mod translation projects
            </p>
          </div>

          {/* Current Project Section */}
          {currentProject && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-text-primary mb-1 text-xl font-semibold">Current Project</h2>
                  <p className="text-text-secondary text-sm">
                    You are currently working on:
                  </p>
                </div>
              </div>

              <div className="bg-background-secondary border border-border-subtle rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-text-primary text-lg font-semibold">
                      {currentProject.name}
                    </h3>
                    <p className="text-text-secondary text-sm mt-2">
                      {currentProject.files?.length || 0} files
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-focus transition-colors">
                    Continue Editing
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Recent Projects Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-text-primary mb-1 text-xl font-semibold">Recent Projects</h2>
              <p className="text-text-secondary text-sm">
                Access your recently opened projects
              </p>
            </div>

            {recentProjects && recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-background-secondary border border-border-subtle rounded-lg p-6 hover:border-accent-primary transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-6 h-6 text-accent-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-semibold truncate">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{project.files?.length || 0} files</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Recently opened</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-12 text-center">
                <FolderOpen className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary mb-4">No recent projects</p>
                <p className="text-text-tertiary text-sm">Create a new project to get started</p>
              </div>
            )}
          </section>

          {/* Create Project Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-text-primary mb-1 text-xl font-semibold">New Project</h2>
              <p className="text-text-secondary text-sm">
                Start a new translation project
              </p>
            </div>

            <div className="bg-background-secondary border-2 border-dashed border-border-subtle rounded-lg p-12 text-center hover:border-accent-primary transition-colors cursor-pointer">
              <Plus className="w-12 h-12 text-accent-primary mx-auto mb-4" />
              <h3 className="text-text-primary font-semibold mb-2">Create New Project</h3>
              <p className="text-text-secondary text-sm">
                Start translating a new Sims 4 mod to JPE format
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
