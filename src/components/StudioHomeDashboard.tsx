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
  const [greeting, setGreeting] = useState("Good Evening");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [focusedProjectId, setFocusedProjectId] = useState<string | null>("1");

  // Mock data - Active Projects (Atomic Assembly)
  const projects: Project[] = [
    {
      id: "1",
      name: "The Sims 4: Better Exceptions",
      icon: "🎮",
      completion: 85,
      lastModified: "2 hours ago",
      fileCount: 127,
      status: "active",
    },
    {
      id: "2",
      name: "Medieval Mod Pack",
      icon: "⚔️",
      completion: 12,
      lastModified: "1 day ago",
      fileCount: 43,
      status: "active",
    },
    {
      id: "3",
      name: "Translation Helper",
      icon: "📖",
      completion: 100,
      lastModified: "3 days ago",
      fileCount: 89,
      status: "completed",
    },
    {
      id: "4",
      name: "Puzzle Game Localization",
      icon: "🧩",
      completion: 45,
      lastModified: "5 hours ago",
      fileCount: 64,
      status: "active",
    },
  ];

  // Mock data - Recent Activity (Atomic Assembly)
  const recentActivity: Activity[] = [
    {
      id: "1",
      type: "translated",
      fileName: "strings.xml",
      projectName: "The Sims 4: Better Exceptions",
      timeAgo: "2m ago",
    },
    {
      id: "2",
      type: "added",
      fileName: "New project created",
      projectName: "Medieval Mod Pack",
      timeAgo: "1h ago",
    },
    {
      id: "3",
      type: "completed",
      fileName: "Compilation successful",
      projectName: "Translation Helper",
      timeAgo: "3h ago",
    },
    {
      id: "4",
      type: "modified",
      fileName: "ui_strings.xml",
      projectName: "The Sims 4: Better Exceptions",
      timeAgo: "5h ago",
    },
    {
      id: "5",
      type: "translated",
      fileName: "item_descriptions.json",
      projectName: "Medieval Mod Pack",
      timeAgo: "1d ago",
    },
  ];

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

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
              Welcome back, {userName}
            </h1>
            <p className="text-text-secondary">
              You have {projects.filter((p) => p.status === "active").length} active projects
            </p>
          </div>

          {/* Active Projects Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-text-primary mb-1">Active Projects</h2>
                <p className="text-text-secondary text-sm">
                  Continue where you left off
                </p>
              </div>
              
              {/* Scroll Controls */}
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
            </div>

            {/* Horizontal Scrolling Project Cards */}
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {projects.map((project, index) => (
                  <Card
                    key={project.id}
                    focusable
                    className={cn(
                      "min-w-[320px] max-w-[320px] snap-start",
                      "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    )}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        console.log(`Opening project: ${project.name}`);
                      }
                    }}
                    onClick={() => setFocusedProjectId(project.id)}
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

                {/* Add New Project Card */}
                <Card
                  focusable
                  className="min-w-[320px] max-w-[320px] snap-start border-dashed border-2 hover:border-accent-primary/50 cursor-pointer"
                  tabIndex={0}
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