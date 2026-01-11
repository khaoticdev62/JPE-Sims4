import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { AppNavigation } from "./AppNavigation";
import { cn } from "./ui/utils";
import {
  FolderOpen,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  FileEdit,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { useProjectStore } from "@/stores/useProjectStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { formatTimeAgo } from "@/utils/timeUtils";

interface Project {
  id: string;
  name: string;
  icon: string;
  completion: number;
  lastModified: string;
  fileCount: number;
  status: "active" | "completed" | "paused";
}

interface Activity {
  id: string;
  type: "added" | "modified" | "translated" | "completed";
  fileName: string;
  projectName: string;
  timeAgo: string;
}

interface StudioHomeDashboardProps {
  onNavigate?: (view: string) => void
}

export function StudioHomeDashboard({ onNavigate }: StudioHomeDashboardProps = {}) {
  const [activeNav, setActiveNav] = useState("home");
  const [userName] = useState("User");
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>(null);

  // Get real data from Zustand stores
  const { recentProjects } = useProjectStore();
  const { getRecentActivities } = useActivityStore();

  // Helper function to compute project metadata from store data
  const computeProjectMetadata = (proj: typeof recentProjects[0]): Project => {
    const fileCount = proj.files.length;
    const lastModified = formatTimeAgo(proj.metadata.updatedAt);

    // Compute completion based on some heuristic (e.g., files with compiledAt)
    // For now, use a simple metric based on file count or timestamp proximity
    const completion = fileCount > 0 ? Math.min(100, fileCount * 20) : 0;

    // Determine status
    const status: "active" | "completed" | "paused" =
      completion === 100 ? "completed" : "active";

    return {
      id: proj.id,
      name: proj.name,
      icon: "🎮", // Default icon (can be enhanced later)
      completion,
      lastModified,
      fileCount,
      status,
    };
  };

  // Transform real projects to display format
  const projects: Project[] = recentProjects.slice(0, 4).map(computeProjectMetadata);

  // Transform real activities to display format
  const rawActivities = getRecentActivities(5);
  const recentActivity: Activity[] = rawActivities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    fileName: activity.fileName,
    projectName: activity.projectName,
    timeAgo: formatTimeAgo(activity.timestamp),
  }));

  // Handle project card click - navigate to studio
  const handleProjectClick = (projectId: string) => {
    const selectedProject = recentProjects.find((p) => p.id === projectId);
    if (selectedProject) {
      const { setCurrentProject } = useProjectStore.getState();
      setCurrentProject(selectedProject);
      setFocusedProjectId(projectId);
      handleNavigate("studio");
    }
  };

  // Handle "New Project" card click
  const handleNewProjectClick = () => {
    handleNavigate("projects");
  };

  // Handle scroll detection
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "added":
        return <FilePlus className="w-4 h-4 text-accent-primary" />;
      case "modified":
        return <FileEdit className="w-4 h-4 text-state-warning" />;
      case "translated":
        return <FileText className="w-4 h-4 text-accent-focus" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-state-success" />;
      default:
        return <AlertCircle className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getActivityLabel = (type: Activity["type"]) => {
    switch (type) {
      case "added":
        return "Added";
      case "modified":
        return "Modified";
      case "translated":
        return "Translated";
      case "completed":
        return "Completed";
      default:
        return "Updated";
    }
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-accent-primary";
      case "completed":
        return "bg-state-success";
      case "paused":
        return "bg-state-warning";
      default:
        return "bg-text-secondary";
    }
  };

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
          {/* Greeting Section */}
          <div className="space-y-2">
            <h1 className="text-text-primary">
              {greeting}, {userName}
            </h1>
            <p className="text-text-secondary">
              You have {projects.filter((p) => p.status === "active").length} active projects
            </p>
          </div>

          {/* Active Projects Section */}
          <section className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-text-primary mb-1">
                  {projects.length === 0 ? "No Projects Yet" : "Active Projects"}
                </h2>
                <p className="text-text-secondary text-sm">
                  {projects.length === 0
                    ? "Get started by creating your first translation project"
                    : "Continue where you left off"}
                </p>
              </div>

              {/* Scroll Controls - Only show when there are projects */}
              {projects.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    className="transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll("right")}
                    disabled={!canScrollRight}
                    className="transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Horizontal Scrolling Project Cards - Always Present */}
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* Show project cards if they exist */}
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    focusable
                    data-testid={`project-card-${project.id}`}
                    className={cn(
                      "min-w-[320px] max-w-[320px] snap-start",
                      "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    )}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleProjectClick(project.id);
                      }
                    }}
                    onClick={() => handleProjectClick(project.id)}
                    style={{
                      outline: focusedProjectId === project.id ? "2px solid #4CAF50" : "none",
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-primary to-accent-focus flex items-center justify-center text-3xl shadow-lg shadow-accent-primary/20">
                          {project.icon}
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-md text-xs",
                          getStatusColor(project.status),
                          "text-text-primary"
                        )}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </div>
                      </div>
                      <CardTitle className="text-text-primary line-clamp-2">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-text-secondary">
                        {project.fileCount} files
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Section */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Progress</span>
                          <span className="text-text-primary">{project.completion}%</span>
                        </div>
                        <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              project.completion === 100
                                ? "bg-state-success"
                                : "bg-gradient-to-r from-accent-primary to-accent-focus"
                            )}
                            style={{ width: `${project.completion}%` }}
                          />
                        </div>
                      </div>

                      {/* Last Modified */}
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock className="w-4 h-4" />
                        <span>{project.lastModified}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Show empty state or new project card */}
                {projects.length === 0 ? (
                  /* Empty state card when no projects */
                  <Card
                    focusable
                    data-testid="new-project-card"
                    className="min-w-full bg-gradient-to-br from-background-secondary to-background-tertiary border-dashed cursor-pointer"
                    tabIndex={0}
                    onClick={handleNewProjectClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleNewProjectClick();
                      }
                    }}
                  >
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
                      <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                        <FolderOpen className="w-8 h-8 text-text-secondary opacity-50" />
                      </div>
                      <h3 className="text-text-primary mb-2">Start Your First Project</h3>
                      <p className="text-text-secondary text-sm mb-6 max-w-xs">
                        Create a new project to begin translating your Sims 4 mods
                      </p>
                      <Button onClick={handleNewProjectClick} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  /* New Project Card - visible when projects exist */
                  <Card
                    focusable
                    data-testid="new-project-card"
                    className="min-w-[320px] max-w-[320px] snap-start border-dashed border-2 hover:border-accent-primary/50 cursor-pointer"
                    tabIndex={0}
                    onClick={handleNewProjectClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleNewProjectClick();
                      }
                    }}
                  >
                    <CardContent className="flex flex-col items-center justify-center min-h-[280px] text-center">
                      <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4 transition-all duration-200 group-hover:bg-accent-primary/10">
                        <Plus className="w-8 h-8 text-accent-primary" />
                      </div>
                      <h3 className="text-text-primary mb-2">New Project</h3>
                      <p className="text-text-secondary text-sm">
                        Start a new translation
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Fade Gradients for Scroll Indication */}
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background-primary to-transparent pointer-events-none" />
              )}
              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background-primary to-transparent pointer-events-none" />
              )}
            </div>
          </section>

          {/* Statistics Overview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-background-secondary to-background-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent-primary/20">
                    <FolderOpen className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">Total Projects</p>
                    <p className="text-text-primary text-2xl">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background-secondary to-background-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-state-success/20">
                    <CheckCircle className="w-6 h-6 text-state-success" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">Completed</p>
                    <p className="text-text-primary text-2xl">
                      {projects.filter((p) => p.status === "completed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background-secondary to-background-tertiary">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent-focus/20">
                    <TrendingUp className="w-6 h-6 text-accent-focus" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">Avg. Progress</p>
                    <p className="text-text-primary text-2xl">
                      {Math.round(
                        projects.reduce((acc, p) => acc + p.completion, 0) / projects.length
                      )}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Recent Activity Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-text-primary mb-1">Recent Activity</h2>
              <p className="text-text-secondary text-sm">
                Latest updates from your projects
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border-subtle">
                  {recentActivity.map((activity, index) => (
                    <button
                      key={activity.id}
                      data-testid={`activity-item-${activity.id}`}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                        "hover:bg-background-tertiary/50",
                        "focus-visible:bg-background-tertiary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-focus/30",
                        "active:scale-[0.99]",
                        index === 0 && "rounded-t-xl",
                        index === recentActivity.length - 1 && "rounded-b-xl"
                      )}
                    >
                      {/* Icon */}
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-text-primary text-sm font-medium">
                            {getActivityLabel(activity.type)}
                          </span>
                          <span className="text-text-secondary text-xs">
                            {activity.fileName}
                          </span>
                        </div>
                        <p className="text-text-secondary text-xs truncate">
                          {activity.projectName}
                        </p>
                      </div>

                      {/* Time */}
                      <div className="shrink-0 text-text-secondary text-xs">
                        {activity.timeAgo}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Hide scrollbar globally for this component */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}