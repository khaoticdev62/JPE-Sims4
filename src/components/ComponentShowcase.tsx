import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Play, Pause, Settings, Trash2, Search, FileText } from "lucide-react";

export function ComponentShowcase() {
  const [textValue, setTextValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [numberValue, setNumberValue] = useState("");
  const [errorValue, setErrorValue] = useState("");

  return (
    <div className="min-h-screen p-8 bg-background-primary">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-text-primary">JPE Mod Translator 2.0</h1>
          <p className="text-text-secondary">
            Core UI Components - Apple TV Inspired Design
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-text-primary mb-2">Buttons</h2>
            <p className="text-text-secondary mb-6">
              Interactive buttons with focus glow, scale animations, and gradient backgrounds
            </p>
          </div>

          {/* Primary Buttons */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Primary Buttons</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Gradient background with glow on focus. Try tabbing through for keyboard focus effects.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button>
                <Play className="w-4 h-4" />
                Start Translation
              </Button>
              <Button size="lg">
                <FileText className="w-5 h-5" />
                Large Button
              </Button>
              <Button size="sm">
                <Settings className="w-3 h-3" />
                Small
              </Button>
              <Button size="icon">
                <Play className="w-4 h-4" />
              </Button>
              <Button disabled>
                Disabled State
              </Button>
            </div>
          </Card>

          {/* Secondary Buttons */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Secondary Buttons</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Subtle background with border, perfect for secondary actions
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary">
                <Pause className="w-4 h-4" />
                Cancel
              </Button>
              <Button variant="secondary" size="lg">
                Secondary Large
              </Button>
              <Button variant="secondary" size="sm">
                Secondary Small
              </Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </div>
          </Card>

          {/* Outline Buttons */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Outline Buttons</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Glassmorphism effect with backdrop blur
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <Settings className="w-4 h-4" />
                Preferences
              </Button>
              <Button variant="outline" size="lg">
                Outline Large
              </Button>
              <Button variant="outline" size="sm">
                Outline Small
              </Button>
              <Button variant="outline" disabled>
                Disabled
              </Button>
            </div>
          </Card>

          {/* Ghost Buttons */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Ghost Buttons</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Minimal style, background appears on hover
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="ghost">
                Ghost Button
              </Button>
              <Button variant="ghost" size="lg">
                Ghost Large
              </Button>
              <Button variant="ghost" size="sm">
                Ghost Small
              </Button>
              <Button variant="ghost" disabled>
                Disabled
              </Button>
            </div>
          </Card>

          {/* Destructive Buttons */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Destructive Buttons</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Red gradient for dangerous actions with red glow on focus
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="destructive">
                <Trash2 className="w-4 h-4" />
                Delete Translation
              </Button>
              <Button variant="destructive" size="lg">
                Destructive Large
              </Button>
              <Button variant="destructive" size="sm">
                Destructive Small
              </Button>
              <Button variant="destructive" disabled>
                Disabled
              </Button>
            </div>
          </Card>
        </section>

        {/* Inputs Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-text-primary mb-2">Input Fields</h2>
            <p className="text-text-secondary mb-6">
              Input fields with focus glow, border animations, and backdrop blur
            </p>
          </div>

          {/* Text Input */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Text Input</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Standard text input with focus glow effect. Click or tab to focus.
            </p>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <label className="text-text-primary">Translation Name</label>
                <Input
                  type="text"
                  placeholder="Enter translation name..."
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-text-primary">Disabled Input</label>
                <Input
                  type="text"
                  placeholder="This input is disabled"
                  disabled
                />
              </div>
            </div>
          </Card>

          {/* Search Input */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Search Input</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Search with icon, brightens on focus
            </p>
            <div className="max-w-md space-y-2">
              <label className="text-text-primary">Search Translations</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>
          </Card>

          {/* Number Input */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Number Input</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Numeric input with stepper controls
            </p>
            <div className="max-w-md space-y-2">
              <label className="text-text-primary">Version Number</label>
              <Input
                type="number"
                placeholder="1.0"
                value={numberValue}
                onChange={(e) => setNumberValue(e.target.value)}
              />
            </div>
          </Card>

          {/* Error State Input */}
          <Card className="p-6 bg-background-secondary border-border-subtle">
            <h3 className="text-text-primary mb-4">Error State</h3>
            <p className="text-text-secondary mb-6 text-sm">
              Input with error styling - red border and red glow on focus
            </p>
            <div className="max-w-md space-y-2">
              <label className="text-text-primary">File Path</label>
              <Input
                type="text"
                placeholder="Enter valid file path"
                value={errorValue}
                onChange={(e) => setErrorValue(e.target.value)}
                aria-invalid="true"
              />
              <p className="text-state-error text-sm">This field contains an error</p>
            </div>
          </Card>
        </section>

        {/* Interactive Demo */}
        <section className="space-y-6">
          <div>
            <h2 className="text-text-primary mb-2">Interactive Demo</h2>
            <p className="text-text-secondary mb-6">
              Complete form example showcasing components together
            </p>
          </div>

          <Card className="p-8 bg-background-secondary border-border-subtle">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                <label className="text-text-primary">Project Name</label>
                <Input type="text" placeholder="My Translation Project" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-text-primary">Source Language</label>
                  <Input type="text" placeholder="English" />
                </div>
                <div className="space-y-2">
                  <label className="text-text-primary">Target Language</label>
                  <Input type="text" placeholder="Japanese" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-text-primary">Search Files</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                  <Input type="search" placeholder="Filter files..." className="pl-11" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button>
                  <Play className="w-4 h-4" />
                  Start Translation
                </Button>
                <Button variant="secondary">
                  <Settings className="w-4 h-4" />
                  Configure
                </Button>
                <Button variant="outline">
                  Cancel
                </Button>
                <Button variant="destructive" className="ml-auto">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Design Notes */}
        <section className="space-y-4">
          <Card className="p-6 bg-background-tertiary border-border-subtle">
            <h3 className="text-text-primary mb-3">Design Features</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5">•</span>
                <span><strong className="text-text-primary">Focus State:</strong> Scale transform (1.02x) with blue glow effect for keyboard navigation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5">•</span>
                <span><strong className="text-text-primary">Active State:</strong> Scale down (0.98x) for tactile feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5">•</span>
                <span><strong className="text-text-primary">Glassmorphism:</strong> Backdrop blur and transparency on outline buttons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5">•</span>
                <span><strong className="text-text-primary">Gradients:</strong> Subtle top-to-bottom gradients on primary and destructive buttons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5">•</span>
                <span><strong className="text-text-primary">Transitions:</strong> Smooth 200ms transitions on all interactive states</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-primary mt-0.5">•</span>
                <span><strong className="text-text-primary">Apple TV UX:</strong> Focus-first design with prominent visual feedback</span>
              </li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
