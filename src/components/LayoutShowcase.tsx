import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { AppNavigation } from "./AppNavigation";
import { FileText, Calendar, Clock, Plus, Settings, Trash2, Edit, FolderOpen } from "lucide-react";

export function LayoutShowcase() {
  const [activeNav, setActiveNav] = useState("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const projects = [
    {
      id: 1,
      name: "Fantasy RPG Translation",
      files: 127,
      lastModified: "2 hours ago",
      progress: 85,
    },
    {
      id: 2,
      name: "Visual Novel - Chapter 3",
      files: 43,
      lastModified: "1 day ago",
      progress: 60,
    },
    {
      id: 3,
      name: "Action Game Menus",
      files: 89,
      lastModified: "3 days ago",
      progress: 100,
    },
  ];

  return (
    <div className="flex h-screen bg-background-primary">
      {/* Sidebar Navigation */}
      <AppNavigation activeItem={activeNav} onNavigate={setActiveNav} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-text-primary">Layout Components</h1>
            <p className="text-text-secondary">
              Apple TV-inspired Cards, Modals, and Sidebar Navigation
            </p>
          </div>

          {/* Cards Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-text-primary mb-2">Interactive Cards</h2>
              <p className="text-text-secondary mb-6">
                Cards with focus states, glow effects, and scale animations. Click or tab through them.
              </p>
            </div>

            {/* Focusable Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} focusable>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <FileText className="w-8 h-8 text-accent-primary" />
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-text-primary">{project.name}</CardTitle>
                    <CardDescription className="text-text-secondary">
                      {project.files} files translated
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock className="w-4 h-4" />
                        <span>{project.lastModified}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Progress</span>
                          <span className="text-text-primary">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent-primary to-accent-focus rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <FolderOpen className="w-4 h-4" />
                      Open
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {/* Add New Card */}
              <Card
                focusable
                className="border-dashed border-2 hover:border-accent-primary/50 cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center min-h-[280px] text-center">
                  <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-accent-primary" />
                  </div>
                  <h3 className="text-text-primary mb-2">Create New Project</h3>
                  <p className="text-text-secondary text-sm">
                    Start a new translation project
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Static Cards Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-text-primary mb-2">Static Cards</h2>
              <p className="text-text-secondary mb-6">
                Non-interactive cards for displaying content
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-background-tertiary">
                <CardHeader>
                  <CardTitle className="text-text-primary">Recent Activity</CardTitle>
                  <CardDescription className="text-text-secondary">
                    Latest updates from your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Translated file", file: "menu_items.txt", time: "5 min ago" },
                      { action: "Created project", file: "Fantasy RPG", time: "2 hours ago" },
                      { action: "Exported translation", file: "chapter_03.json", time: "1 day ago" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg">
                        <Calendar className="w-4 h-4 text-accent-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-text-primary text-sm">{item.action}</p>
                          <p className="text-text-secondary text-xs truncate">{item.file}</p>
                        </div>
                        <span className="text-text-secondary text-xs shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-text-primary">Statistics</CardTitle>
                  <CardDescription className="text-text-secondary">
                    Your translation metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Total Projects", value: "12" },
                      { label: "Files Translated", value: "259" },
                      { label: "Active Today", value: "3" },
                      { label: "Completion Rate", value: "94%" },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-background-tertiary rounded-lg">
                        <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
                        <p className="text-text-primary">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Modals Section */}
          <section className="space-y-6">
            <div>
              <h2 className="text-text-primary mb-2">Modal Dialogs</h2>
              <p className="text-text-secondary mb-6">
                Glassmorphic modals with backdrop blur and smooth animations
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4" />
                    New Project Modal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-text-primary">Create New Project</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                      Enter the details for your new translation project.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-text-primary text-sm">Project Name</label>
                      <Input
                        placeholder="My Translation Project"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-text-primary text-sm">Source Language</label>
                        <Input placeholder="English" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-text-primary text-sm">Target Language</label>
                        <Input placeholder="Japanese" />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setModalOpen(false)}>
                      Create Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4" />
                    Settings Modal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-text-primary">Application Settings</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                      Configure your preferences and options.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-text-primary text-sm">Default Export Path</label>
                      <Input placeholder="/path/to/exports" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-text-primary text-sm">Auto-save Interval (seconds)</label>
                      <Input type="number" placeholder="30" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                      <div>
                        <p className="text-text-primary text-sm">Enable Notifications</p>
                        <p className="text-text-secondary text-xs">Get alerts for translation updates</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="secondary" onClick={() => setConfirmModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setConfirmModalOpen(false)}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4" />
                    Destructive Modal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-text-primary">Delete Project?</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                      This action cannot be undone. This will permanently delete the project and all associated files.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <div className="p-4 bg-state-error/10 border border-state-error/30 rounded-lg">
                      <p className="text-state-error text-sm">
                        <strong>Warning:</strong> All translation data will be lost.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </section>

          {/* Design Notes */}
          <section>
            <Card className="bg-background-tertiary border-border-subtle">
              <CardHeader>
                <CardTitle className="text-text-primary">Layout Design Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5">•</span>
                    <span><strong className="text-text-primary">Focusable Cards:</strong> Scale to 1.03x with blue glow on focus, perfect for keyboard navigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5">•</span>
                    <span><strong className="text-text-primary">Hover States:</strong> Brightness increase and subtle border color change</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5">•</span>
                    <span><strong className="text-text-primary">Modal Glassmorphism:</strong> Backdrop blur with 95% opacity background for depth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5">•</span>
                    <span><strong className="text-text-primary">Smooth Animations:</strong> 300ms modal transitions with scale and fade effects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5">•</span>
                    <span><strong className="text-text-primary">Navigation Pills:</strong> Active items show gradient background with glow, inactive items reveal on hover</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5">•</span>
                    <span><strong className="text-text-primary">Z-index Elevation:</strong> Focused cards rise above siblings for clear visual hierarchy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-primary mt-0.5">•</span>
                    <span><strong className="text-text-primary">Consistent Spacing:</strong> All layouts use design token spacing scale (4, 6, 8, etc.)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
