'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Settings,
  Home,
  Users,
  FileText,
  ChevronDown,
  Plus,
  Bold,
  Italic,
  Underline,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { JpeButton } from '@/components/jpe/jpe-button'
import { JpeNotification } from '@/components/jpe/jpe-notification'
import { JpeSpinner } from '@/components/jpe/jpe-spinner'
import { JpeSkeleton } from '@/components/jpe/jpe-skeleton'
import { JpeBadge } from '@/components/jpe/jpe-badge'
import { JpeProgressBar } from '@/components/jpe/jpe-progress-bar'
import { JpeStatusDot } from '@/components/jpe/jpe-status-dot'
import { JpeStatusBadge as JpeStatusBadgeComp } from '@/components/jpe/jpe-status-badge'
import { JpeDropdown } from '@/components/jpe/jpe-dropdown'
import { JpeFileTabs } from '@/components/jpe/jpe-file-tabs'
import { JpeToolPanel } from '@/components/jpe/jpe-tool-panel'
const JpeGraphViewer = dynamic(() => import('@/components/jpe/jpe-graph-viewer').then(mod => mod.JpeGraphViewer), { 
  ssr: false,
  loading: () => <div className="h-[280px] w-full bg-muted animate-pulse rounded-xl" />
})
const JpeCodeEditor = dynamic(() => import('@/components/jpe/jpe-code-editor').then(mod => mod.JpeCodeEditor), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" />
})
import { StatusIndicator } from '@/components/common/status-indicator'
import { JpeNotification as ToastNotification } from '@/components/jpe'
import { JpeProgressBar as ProgressBar } from '@/components/jpe'
import { JpeSpinner as LoadingSpinner } from '@/components/jpe'
import { JpeSkeleton as SkeletonLoader } from '@/components/jpe'

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-8" data-testid={`section-${id}`}>
      <h2 className="text-xl font-bold mb-4 text-cyan-bright uppercase tracking-wide">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function VariantRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 flex-wrap" data-testid={`variant-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="text-xs text-text-secondary min-w-[80px] font-mono">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component Showcase Page
// ---------------------------------------------------------------------------
export default function ComponentsShowcasePage() {
  const [sliderValue, setSliderValue] = useState([30])
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [tabValue, setTabValue] = useState('tab1')
  const [selectValue, setSelectValue] = useState('')
  const [radioValue, setRadioValue] = useState('option1')
  const [toggleSingle, setToggleSingle] = useState<string>('bold')
  const [toggleMultiple, setToggleMultiple] = useState<string[]>(['bold', 'italic'])
  const [inputValue, setInputValue] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [accordionValue, setAccordionValue] = useState('item1')
  const [activeNavItem, setActiveNavItem] = useState('home')
  const [progressValue, setProgressValue] = useState(65)

  return (
    <div data-testid="component-showcase" className="min-h-screen bg-[#0a0c10] text-text-primary p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-cyan-bright">JPE Studio — Component Showcase</h1>
      <p className="text-text-secondary mb-8">All design system components rendered for E2E testing.</p>

      {/* ===== BUTTON ===== */}
      <Section id="button" title="Button">
        <VariantRow label="primary">
          <Button data-testid="button-primary" variant="default">Primary</Button>
          <JpeButton data-testid="jpe-button-primary" variant="default">JPE Primary</JpeButton>
        </VariantRow>
        <VariantRow label="secondary">
          <Button data-testid="button-secondary" variant="secondary">Secondary</Button>
        </VariantRow>
        <VariantRow label="ghost">
          <Button data-testid="button-ghost" variant="ghost">Ghost</Button>
        </VariantRow>
        <VariantRow label="danger">
          <Button data-testid="button-danger" variant="destructive">Danger</Button>
          <JpeButton data-testid="jpe-button-danger" variant="destructive">JPE Danger</JpeButton>
        </VariantRow>
        <VariantRow label="success">
          <Button data-testid="button-success" variant="default" className="bg-emerald-dim border border-emerald/30 text-emerald">Success</Button>
          <JpeButton data-testid="jpe-button-success" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">JPE Success</JpeButton>
        </VariantRow>
        <VariantRow label="icon">
          <Button data-testid="button-icon" size="icon" aria-label="Add Item"><Plus className="size-4" /></Button>
          <JpeButton data-testid="jpe-button-icon" size="icon"><Settings className="size-4" /></JpeButton>
        </VariantRow>
        <VariantRow label="sizes">
          <Button data-testid="button-xs" size="sm" className="h-[24px] px-2 text-[10px]">XS</Button>
          <Button data-testid="button-sm" size="sm">SM</Button>
          <Button data-testid="button-md" size="sm" className="h-[32px] px-3.5 text-[12px]">MD</Button>
          <Button data-testid="button-lg" size="lg">LG</Button>
        </VariantRow>
        <VariantRow label="disabled">
          <Button data-testid="button-disabled" disabled>Disabled</Button>
        </VariantRow>
        <VariantRow label="loading">
          <Button data-testid="button-loading" disabled>
            <LoadingSpinner className="size-4" />
            Loading
          </Button>
          <JpeButton data-testid="jpe-button-loading" variant="default" disabled>
            <LoadingSpinner className="size-4" />
            JPE Loading
          </JpeButton>
        </VariantRow>
      </Section>

      {/* ===== INPUT ===== */}
      <Section id="input" title="Input">
        <div className="space-y-3 max-w-md">
          <div>
            <Label htmlFor="text-input">Text Input</Label>
            <Input
              data-testid="input-field"
              id="text-input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="disabled-input">Disabled Input</Label>
            <Input data-testid="input-disabled" id="disabled-input" disabled placeholder="Disabled..." />
          </div>
          <div>
            <Label htmlFor="error-input">Error Input</Label>
          <Input data-testid="input-error" id="error-input" className="border-destructive ring-destructive/20" placeholder="Invalid value..." />
            <p className="text-rose text-xs mt-1" role="alert">This field is required</p>
          </div>
        </div>
      </Section>

      {/* ===== CARD ===== */}
      <Section id="card" title="Card">
        <Card data-testid="card-default" className="max-w-md">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">Card content with glassmorphic background.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
        <Card data-testid="card-solid" className="max-w-md bg-card/80">
          <CardContent className="pt-4">
            <p className="text-sm text-text-secondary">Solid background card variant.</p>
          </CardContent>
        </Card>
      </Section>

      {/* ===== DROPDOWN ===== */}
      <Section id="dropdown" title="Dropdown">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="dropdown-trigger" variant="secondary" className="gap-1">
              Select Option <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content" align="start">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="dropdown-item-option1">
              <FileText className="mr-2 size-3.5" />
              <span>Option One</span>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="dropdown-item-option2">
              <Settings className="mr-2 size-3.5" />
              <span>Option Two</span>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="dropdown-item-disabled" disabled>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mt-4">
          <Label>JPE Dropdown</Label>
          <JpeDropdown
            items={[
              { id: 'jpe-1', label: 'JPE Item 1', icon: FileText },
              { id: 'jpe-2', label: 'JPE Item 2', icon: Settings },
              { id: 'jpe-3', label: 'Disabled', disabled: true },
            ]}
            value=""
            onChange={() => {}}
            placeholder="Select JPE item..."
          />
          <div data-testid="jpe-dropdown" className="sr-only" />
        </div>
      </Section>

      {/* ===== DIALOG ===== */}
      <Section id="dialog" title="Dialog / Modal">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="dialog-trigger">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-content">
            <DialogHeader>
              <DialogTitle data-testid="dialog-title">Dialog Title</DialogTitle>
              <DialogDescription data-testid="dialog-description">
                This is a dialog description with glassmorphic styling.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-text-secondary">Dialog body content goes here.</p>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button data-testid="dialog-confirm" onClick={() => setDialogOpen(false)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      {/* ===== BADGE ===== */}
      <Section id="badge" title="Badge">
        <VariantRow label="default">
          <Badge data-testid="badge-default">Default</Badge>
          <JpeBadge data-testid="jpe-badge-default" color="#63B3ED" bg="rgba(99,179,237,0.12)">JPE Default</JpeBadge>
        </VariantRow>
        <VariantRow label="secondary">
          <Badge data-testid="badge-secondary" variant="secondary">Secondary</Badge>
        </VariantRow>
        <VariantRow label="destructive">
          <Badge data-testid="badge-destructive" variant="destructive">Destructive</Badge>
        </VariantRow>
        <VariantRow label="outline">
          <Badge data-testid="badge-outline" variant="outline">Outline</Badge>
        </VariantRow>
        <VariantRow label="status">
          <span data-testid="common-badge" className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold" style={{ color: "#48BB78", background: "rgba(72,187,120,0.12)", border: "1px solid rgba(72,187,120,0.20)" }}>OK</span>
        </VariantRow>
      </Section>

      {/* ===== PROGRESS ===== */}
      <Section id="progress" title="Progress Bar">
        <div className="space-y-4 max-w-md">
          <div>
            <Label>Default Progress</Label>
            <Progress data-testid="progress-default" value={progressValue} className="mt-2" />
            <p className="text-xs text-text-muted mt-1">{progressValue}%</p>
          </div>
          <div>
            <Label>JPE Progress Bar</Label>
            <JpeProgressBar data-testid="jpe-progress" value={progressValue} color="#63B3ED" height={4} className="mt-2" />
          </div>
          <div>
            <Label>Common Progress</Label>
            <ProgressBar data-testid="common-progress" value={progressValue} max={100} color="#63B3ED" height={4} className="mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <Button data-testid="progress-decrease" size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>-10%</Button>
            <Button data-testid="progress-increase" size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>+10%</Button>
          </div>
        </div>
      </Section>

      {/* ===== STATUS INDICATORS ===== */}
      <Section id="status" title="Status Indicators">
        <VariantRow label="ok">
          <StatusIndicator data-testid="status-ok" status="ok" />
          <JpeStatusDot data-testid="jpe-status-dot-ok" status="ok" />
          <JpeStatusBadgeComp data-testid="jpe-status-badge-ok" status="ok" label="Operational" />
        </VariantRow>
        <VariantRow label="warning">
          <StatusIndicator data-testid="status-warning" status="warning" />
          <JpeStatusDot data-testid="jpe-status-dot-warning" status="warning" />
          <JpeStatusBadgeComp data-testid="jpe-status-badge-warning" status="warning" label="Degraded" />
        </VariantRow>
        <VariantRow label="error">
          <StatusIndicator data-testid="status-error" status="error" />
          <JpeStatusDot data-testid="jpe-status-dot-error" status="error" />
          <JpeStatusBadgeComp data-testid="jpe-status-badge-error" status="error" label="Down" />
        </VariantRow>
        <VariantRow label="info">
          <StatusIndicator data-testid="status-info" status="info" />
          <JpeStatusDot data-testid="jpe-status-dot-info" status="info" />
        </VariantRow>
        <VariantRow label="idle">
          <StatusIndicator data-testid="status-idle" status="idle" />
          <JpeStatusDot data-testid="jpe-status-dot-idle" status="idle" />
        </VariantRow>
        <VariantRow label="running">
          <StatusIndicator data-testid="status-running" status="running" />
          <JpeStatusDot data-testid="jpe-status-dot-running" status="running" pulse />
        </VariantRow>
        <VariantRow label="pulse">
          <JpeStatusDot data-testid="jpe-status-dot-pulse" status="ok" pulse size={12} />
        </VariantRow>
        <VariantRow label="compact">
          <JpeStatusBadgeComp data-testid="jpe-status-badge-compact" status="ok" label="OK" compact />
        </VariantRow>
      </Section>

      {/* ===== NOTIFICATION ===== */}
      <Section id="notification" title="Notifications">
        <JpeNotification
          data-testid="notification-info"
          type="info"
          title="Info Notification"
          message="This is an informational notification."
          timestamp="Just now"
          onDismiss={() => {}}
        />
        <JpeNotification
          data-testid="notification-success"
          type="success"
          title="Success"
          message="Operation completed successfully."
          timestamp="2 min ago"
        />
        <JpeNotification
          data-testid="notification-warning"
          type="warning"
          title="Warning"
          message="Please review your settings."
          timestamp="5 min ago"
        />
        <JpeNotification
          data-testid="notification-error"
          type="error"
          title="Error"
          message="An error occurred during processing."
          timestamp="10 min ago"
          action={{ label: 'Retry', onClick: () => {} }}
        />
        <ToastNotification
          data-testid="toast-notification"
          type="info"
          title="Toast Title"
          message="Toast notification message"
        />
      </Section>

      {/* ===== SPINNER ===== */}
      <Section id="spinner" title="Spinner">
        <VariantRow label="default">
          <LoadingSpinner data-testid="spinner-default" />
          <JpeSpinner data-testid="jpe-spinner" />
        </VariantRow>
        <VariantRow label="small">
          <JpeSpinner data-testid="jpe-spinner-sm" size={14} />
        </VariantRow>
        <VariantRow label="large">
          <JpeSpinner data-testid="jpe-spinner-lg" size={32} />
        </VariantRow>
        <VariantRow label="custom-color">
          <JpeSpinner data-testid="jpe-spinner-color" color="#8B5CF6" />
        </VariantRow>
      </Section>

      {/* ===== SKELETON ===== */}
      <Section id="skeleton" title="Skeleton Loader">
        <div className="space-y-3 max-w-md">
          <SkeletonLoader data-testid="skeleton-default" />
          <SkeletonLoader data-testid="skeleton-text" className="h-4 w-full" />
          <SkeletonLoader data-testid="skeleton-circle" className="h-12 w-12 rounded-full" />
          <SkeletonLoader data-testid="skeleton-rect" className="h-20 w-full rounded-lg" />
          <JpeSkeleton data-testid="jpe-skeleton" width="100%" height={16} />
          <JpeSkeleton data-testid="jpe-skeleton-rounded" width="80%" height={24} rounded />
        </div>
      </Section>

      {/* ===== TABS ===== */}
      <Section id="tabs" title="Tabs">
        <Tabs data-testid="tabs-default" value={tabValue} onValueChange={setTabValue} className="max-w-md">
          <TabsList>
            <TabsTrigger data-testid="tab-general" value="general">General</TabsTrigger>
            <TabsTrigger data-testid="tab-settings" value="settings">Settings</TabsTrigger>
            <TabsTrigger data-testid="tab-advanced" value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent data-testid="tabpanel-general" value="general">
            <p className="text-sm text-text-secondary p-4">General tab content.</p>
          </TabsContent>
          <TabsContent data-testid="tabpanel-settings" value="settings">
            <p className="text-sm text-text-secondary p-4">Settings tab content.</p>
          </TabsContent>
          <TabsContent data-testid="tabpanel-advanced" value="advanced">
            <p className="text-sm text-text-secondary p-4">Advanced tab content.</p>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Label>JPE File Tabs</Label>
          <JpeFileTabs
            data-testid="jpe-file-tabs"
            tabs={[
              { id: 'file1', name: 'file1.jpe', icon: FileText, iconColor: '#63B3ED' },
              { id: 'file2', name: 'file2.jpe', icon: FileText, modified: true },
              { id: 'file3', name: 'file3.jpe', icon: FileText, pinned: true },
            ]}
            activeId="file1"
            onSelect={() => {}}
            onClose={() => {}}
          />
        </div>
      </Section>

      {/* ===== PANEL ===== */}
      <Section id="panel" title="Tool Panel">
        <JpeToolPanel
          data-testid="jpe-panel"
          title="Explorer"
          icon={FileText}
          iconColor="#63B3ED"
          defaultOpen
          badge={12}
        >
          <div className="p-4 text-sm text-text-secondary">Panel content area.</div>
        </JpeToolPanel>
        <JpeToolPanel
          data-testid="jpe-panel-collapsed"
          title="Collapsed Panel"
          icon={Settings}
          defaultOpen={false}
        >
          <div className="p-4 text-sm text-text-secondary">This panel is collapsed by default.</div>
        </JpeToolPanel>
      </Section>

      {/* ===== SWITCH ===== */}
      <Section id="switch" title="Switch / Toggle">
        <div className="flex items-center gap-3" data-testid="switch-container">
          <Switch
            data-testid="switch-default"
            checked={switchChecked}
            onCheckedChange={setSwitchChecked}
          />
          <Label>{switchChecked ? 'On' : 'Off'}</Label>
        </div>
        <div className="flex items-center gap-3" data-testid="switch-disabled">
          <Switch disabled />
          <Label>Disabled</Label>
        </div>
      </Section>

      {/* ===== CHECKBOX ===== */}
      <Section id="checkbox" title="Checkbox">
        <div className="space-y-3">
          <div className="flex items-center gap-3" data-testid="checkbox-default">
            <Checkbox
              data-testid="checkbox-input"
              checked={checkboxChecked}
              onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
            />
            <Label>Accept terms</Label>
          </div>
          <div className="flex items-center gap-3" data-testid="checkbox-disabled">
            <Checkbox disabled />
            <Label>Disabled</Label>
          </div>
          <div className="flex items-center gap-3" data-testid="checkbox-indeterminate">
            <Checkbox checked="indeterminate" />
            <Label>Indeterminate</Label>
          </div>
        </div>
      </Section>

      {/* ===== SLIDER ===== */}
      <Section id="slider" title="Slider">
        <div className="max-w-md space-y-2">
          <Label>Volume: {sliderValue[0]}%</Label>
          <Slider
            data-testid="slider-default"
            value={sliderValue}
            onValueChange={setSliderValue}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div className="max-w-md space-y-2 mt-4">
          <Label>Step 10</Label>
          <Slider
            data-testid="slider-step"
            defaultValue={[50]}
            min={0}
            max={100}
            step={10}
            className="w-full"
          />
        </div>
      </Section>

      {/* ===== TABLE ===== */}
      <Section id="table" title="Data Table">
        <Table data-testid="table-default">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow data-testid="table-row-0">
              <TableCell data-testid="table-cell-0-0">Alice</TableCell>
              <TableCell data-testid="table-cell-0-1">
                <Badge variant="default">Active</Badge>
              </TableCell>
              <TableCell data-testid="table-cell-0-2">Admin</TableCell>
            </TableRow>
            <TableRow data-testid="table-row-1">
              <TableCell data-testid="table-cell-1-0">Bob</TableCell>
              <TableCell data-testid="table-cell-1-1">
                <Badge variant="secondary">Idle</Badge>
              </TableCell>
              <TableCell data-testid="table-cell-1-2">Editor</TableCell>
            </TableRow>
            <TableRow data-testid="table-row-2">
              <TableCell data-testid="table-cell-2-0">Charlie</TableCell>
              <TableCell data-testid="table-cell-2-1">
                <Badge variant="destructive">Error</Badge>
              </TableCell>
              <TableCell data-testid="table-cell-2-2">Viewer</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      {/* ===== BREADCRUMB ===== */}
      <Section id="breadcrumb" title="Breadcrumb">
        <Breadcrumb data-testid="breadcrumb-default">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                <Home className="size-3.5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight className="size-3" /></BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><ChevronRight className="size-3" /></BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="breadcrumb-active">Button</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      {/* ===== PAGINATION ===== */}
      <Section id="pagination" title="Pagination">
        <Pagination data-testid="pagination-default">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>

      {/* ===== SELECT ===== */}
      <Section id="select" title="Select">
        <div className="max-w-xs">
          <Label>Framework</Label>
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger data-testid="select-trigger">
              <SelectValue data-testid="select-value" placeholder="Select a framework..." />
            </SelectTrigger>
            <SelectContent data-testid="select-content">
              <SelectItem data-testid="select-item-react" value="react">React</SelectItem>
              <SelectItem data-testid="select-item-vue" value="vue">Vue</SelectItem>
              <SelectItem data-testid="select-item-angular" value="angular">Angular</SelectItem>
              <SelectItem data-testid="select-item-svelte" value="svelte" disabled>Svelte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* ===== TEXTAREA ===== */}
      <Section id="textarea" title="Textarea">
        <div className="max-w-md">
          <Label htmlFor="description">Description</Label>
          <Textarea
            data-testid="textarea-default"
            id="description"
            placeholder="Enter description..."
            className="mt-2"
          />
        </div>
        <div className="max-w-md mt-4">
          <Label htmlFor="disabled-textarea">Disabled</Label>
          <Textarea
            data-testid="textarea-disabled"
            id="disabled-textarea"
            disabled
            placeholder="Disabled textarea..."
            className="mt-2"
          />
        </div>
      </Section>

      {/* ===== ALERT ===== */}
      <Section id="alert" title="Alert">
        <Alert data-testid="alert-info" className="max-w-md">
          <Info className="size-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>This is an info alert message.</AlertDescription>
        </Alert>
        <Alert data-testid="alert-success" variant="default" className="max-w-md border-emerald/30 bg-emerald-dim">
          <CheckCircle2 className="size-4 text-emerald" />
          <AlertTitle className="text-emerald">Success</AlertTitle>
          <AlertDescription className="text-emerald/80">Operation completed.</AlertDescription>
        </Alert>
        <Alert data-testid="alert-warning" className="max-w-md border-amber/30 bg-amber-dim">
          <AlertTriangle className="size-4 text-amber" />
          <AlertTitle className="text-amber">Warning</AlertTitle>
          <AlertDescription className="text-amber/80">Please review.</AlertDescription>
        </Alert>
        <Alert data-testid="alert-error" variant="destructive" className="max-w-md">
          <XCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong.</AlertDescription>
        </Alert>
      </Section>

      {/* ===== ACCORDION ===== */}
      <Section id="accordion" title="Accordion">
        <Accordion
          data-testid="accordion-default"
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="max-w-md"
        >
          <AccordionItem data-testid="accordion-item-1" value="item1">
            <AccordionTrigger data-testid="accordion-trigger-1">Section One</AccordionTrigger>
            <AccordionContent data-testid="accordion-content-1">
              Content for section one.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem data-testid="accordion-item-2" value="item2">
            <AccordionTrigger data-testid="accordion-trigger-2">Section Two</AccordionTrigger>
            <AccordionContent data-testid="accordion-content-2">
              Content for section two.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem data-testid="accordion-item-3" value="item3">
            <AccordionTrigger data-testid="accordion-trigger-3">Section Three</AccordionTrigger>
            <AccordionContent data-testid="accordion-content-3">
              Content for section three.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      {/* ===== RADIO GROUP ===== */}
      <Section id="radio-group" title="Radio Group">
        <RadioGroup
          data-testid="radio-group-default"
          value={radioValue}
          onValueChange={setRadioValue}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem data-testid="radio-option-1" value="option1" id="r1" />
            <Label htmlFor="r1">Option One</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem data-testid="radio-option-2" value="option2" id="r2" />
            <Label htmlFor="r2">Option Two</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem data-testid="radio-option-3" value="option3" id="r3" />
            <Label htmlFor="r3">Option Three</Label>
          </div>
        </RadioGroup>
      </Section>

      {/* ===== TOGGLE GROUP ===== */}
      <Section id="toggle-group" title="Toggle Group">
        <div className="space-y-4">
          <div>
            <Label>Single Selection</Label>
            <ToggleGroup
              data-testid="toggle-group-single"
              type="single"
              value={toggleSingle}
              onValueChange={(v) => v && setToggleSingle(v)}
              className="mt-2"
            >
              <ToggleGroupItem data-testid="toggle-bold" value="bold" aria-label="Bold">
                <Bold className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem data-testid="toggle-italic" value="italic" aria-label="Italic">
                <Italic className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem data-testid="toggle-underline" value="underline" aria-label="Underline">
                <Underline className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <Label>Multiple Selection</Label>
            <ToggleGroup
              data-testid="toggle-group-multiple"
              type="multiple"
              value={toggleMultiple}
              onValueChange={setToggleMultiple}
              className="mt-2"
            >
              <ToggleGroupItem data-testid="toggle-multi-bold" value="bold" aria-label="Bold">
                <Bold className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem data-testid="toggle-multi-italic" value="italic" aria-label="Italic">
                <Italic className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem data-testid="toggle-multi-underline" value="underline" aria-label="Underline">
                <Underline className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </Section>

      {/* ===== POPOVER ===== */}
      <Section id="popover" title="Popover">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button data-testid="popover-trigger" variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent data-testid="popover-content" className="w-64">
            <p className="text-sm text-text-secondary">This is popover content with a small form.</p>
            <div className="mt-2">
              <Input placeholder="Search..." className="h-8" />
            </div>
          </PopoverContent>
        </Popover>
      </Section>

      {/* ===== SHEET ===== */}
      <Section id="sheet" title="Sheet">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button data-testid="sheet-trigger">Open Sheet (Right)</Button>
          </SheetTrigger>
          <SheetContent data-testid="sheet-content-right" side="right">
            <SheetHeader>
              <SheetTitle data-testid="sheet-title">Sheet Title</SheetTitle>
              <SheetDescription data-testid="sheet-description">
                This is a sheet that slides in from the right.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <p className="text-sm text-text-secondary">Sheet body content goes here.</p>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button data-testid="sheet-trigger-left" variant="secondary">Open Sheet (Left)</Button>
          </SheetTrigger>
          <SheetContent data-testid="sheet-content-left" side="left">
            <SheetHeader>
              <SheetTitle>Left Sheet</SheetTitle>
              <SheetDescription>Slides in from the left.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </Section>

      {/* ===== TOOLTIP ===== */}
      <Section id="tooltip" title="Tooltip">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button data-testid="tooltip-trigger" variant="outline">Hover for Tooltip</Button>
            </TooltipTrigger>
            <TooltipContent data-testid="tooltip-content">
              <p>This is a tooltip!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Section>

      {/* ===== HOVER CARD ===== */}
      <Section id="hover-card" title="Hover Card">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button data-testid="hover-card-trigger" variant="link">@jpe-studio</Button>
          </HoverCardTrigger>
          <HoverCardContent data-testid="hover-card-content" className="w-64">
            <div className="space-y-2">
              <p className="text-sm font-semibold">JPE Studio</p>
              <p className="text-sm text-text-secondary">Cyberpunk-themed IDE design system.</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Section>

      {/* ===== CONTEXT MENU ===== */}
      <Section id="context-menu" title="Context Menu">
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              data-testid="context-menu-trigger"
              className="w-64 h-32 border border-border rounded-lg flex items-center justify-center text-text-muted text-sm cursor-context-menu"
            >
              Right-click here
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent data-testid="context-menu-content">
            <ContextMenuItem data-testid="context-menu-item-copy">Copy</ContextMenuItem>
            <ContextMenuItem data-testid="context-menu-item-paste">Paste</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem data-testid="context-menu-item-settings">
              <Settings className="mr-2 size-3.5" />
              Settings
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>

      {/* ===== NAVIGATION MENU ===== */}
      <Section id="navigation-menu" title="Navigation Menu">
        <NavigationMenu data-testid="navigation-menu">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                data-testid="nav-trigger-products"
                onClick={() => setActiveNavItem('products')}
              >
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-4 w-48">
                  <NavigationMenuLink className="block p-2 rounded hover:bg-bg-hover text-sm" href="#">
                    Editor
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block p-2 rounded hover:bg-bg-hover text-sm" href="#">
                    Translator
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                data-testid="nav-link-docs"
                className="px-3 py-2 text-sm hover:text-cyan-bright"
                href="#"
              >
                Docs
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Section>

      {/* ===== FORM FIELD ===== */}
      <Section id="form-field" title="Form Field">
        <div className="max-w-md space-y-4">
          <div data-testid="form-field-default">
            <Label htmlFor="ff-default">Username</Label>
            <Input id="ff-default" placeholder="Enter username" className="mt-1" />
            <p className="text-xs text-text-muted mt-1">This is your display name.</p>
          </div>
          <div data-testid="form-field-error">
            <Label htmlFor="ff-error">Email</Label>
            <Input id="ff-error" className="border-destructive ring-destructive/20" placeholder="Invalid email" />
            <p className="text-xs text-rose mt-1" role="alert">Please enter a valid email.</p>
          </div>
          <div data-testid="form-field-required">
            <Label htmlFor="ff-required">Password <span className="text-rose">*</span></Label>
            <Input id="ff-required" required type="password" placeholder="Enter password" className="mt-1" />
          </div>
        </div>
      </Section>

      {/* ===== GRAPH VIEWER ===== */}
      <Section id="graph-viewer" title="Graph Viewer">
        <JpeGraphViewer
          data-testid="graph-viewer"
          nodes={[
            { id: 'n1', label: 'Node A', x: 20, y: 30, color: '#63B3ED' },
            { id: 'n2', label: 'Node B', x: 60, y: 20, color: '#8B5CF6' },
            { id: 'n3', label: 'Node C', x: 40, y: 70, color: '#48BB78' },
          ]}
          edges={[
            { from: 'n1', to: 'n2' },
            { from: 'n2', to: 'n3' },
          ]}
          height={280}
        />
      </Section>

      {/* ===== CODE EDITOR ===== */}
      <Section id="code-editor" title="Code Editor">
        <JpeCodeEditor
          data-testid="code-editor"
          title="example.jpe"
          lines={[
            { num: 1, text: 'WHEN SIM_EATS', type: 'keyword' },
            { num: 2, text: '  ONLY_IF SIM_HAS_TRAIT "Foodie"', type: 'attr' },
            { num: 3, text: '  DO ADD_BUFF "CulinaryJoy"', type: 'value' },
          ]}
          activeLine={2}
          breakpoints={[3]}
          height={160}
        />
      </Section>

      {/* ===== SIDEBAR ===== */}
      <Section id="sidebar" title="Sidebar">
        <div data-testid="sidebar-default" className="w-64 bg-bg-panel border border-border rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Navigation</p>
          </div>
          <nav className="p-2">
            <button
              data-testid="sidebar-item-home"
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeNavItem === 'home' ? 'bg-bg-active text-cyan-bright' : 'text-text-secondary hover:bg-bg-hover'
              }`}
              onClick={() => setActiveNavItem('home')}
            >
              <Home className="size-4" />
              Home
            </button>
            <button
              data-testid="sidebar-item-settings"
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeNavItem === 'settings' ? 'bg-bg-active text-cyan-bright' : 'text-text-secondary hover:bg-bg-hover'
              }`}
              onClick={() => setActiveNavItem('settings')}
            >
              <Settings className="size-4" />
              Settings
            </button>
            <button
              data-testid="sidebar-item-users"
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                activeNavItem === 'users' ? 'bg-bg-active text-cyan-bright' : 'text-text-secondary hover:bg-bg-hover'
              }`}
              onClick={() => setActiveNavItem('users')}
            >
              <Users className="size-4" />
              Users
            </button>
          </nav>
        </div>
      </Section>

      {/* ===== CALENDAR ===== */}
      <Section id="calendar" title="Calendar">
        <div data-testid="calendar-default" className="max-w-xs bg-bg-elevated border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <Button data-testid="calendar-prev" variant="ghost" size="sm"><ChevronLeft className="size-4" /></Button>
            <p className="text-sm font-semibold text-text-primary">January 2026</p>
            <Button data-testid="calendar-next" variant="ghost" size="sm"><ChevronRight className="size-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-text-muted py-1">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 3
              const isValid = day >= 1 && day <= 31
              const isToday = day === 4
              return (
                <button
                  key={i}
                  data-testid={isToday ? 'calendar-today' : isValid ? `calendar-day-${day}` : undefined}
                  disabled={!isValid}
                  className={`py-1.5 rounded-md text-xs ${
                    !isValid ? 'invisible' :
                    isToday ? 'bg-cyan-dim text-cyan-bright font-bold ring-1 ring-cyan/30' :
                    'text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  {isValid ? day : ''}
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* ===== COMMAND PALETTE ===== */}
      <Section id="command-palette" title="Command Palette">
        <p className="text-sm text-text-secondary">Press <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border rounded text-xs font-mono">Ctrl+K</kbd> to open the command palette.</p>
      </Section>
    </div>
  )
}
