"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { 
  Palette, 
  Type, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Sparkles 
} from "lucide-react";

export function DesignSystemShowcase() {
  const [inputValue, setInputValue] = useState("");

  const colorTokens = [
    { name: "Background Primary", var: "--background-primary", color: "#000000" },
    { name: "Background Secondary", var: "--background-secondary", color: "#121212" },
    { name: "Background Tertiary", var: "--background-tertiary", color: "#1C1C1E" },
    { name: "Text Primary", var: "--text-primary", color: "#FFFFFF" },
    { name: "Text Secondary", var: "--text-secondary", color: "#8E8E93" },
    { name: "Accent Primary", var: "--accent-primary", color: "#0A84FF" },
    { name: "Accent Focus", var: "--accent-focus", color: "#007AFF" },
    { name: "Border Subtle", var: "--border-subtle", color: "#38383A" },
    { name: "State Error", var: "--state-error", color: "#FF453A" },
    { name: "State Success", var: "--state-success", color: "#32D74B" },
    { name: "State Warning", var: "--state-warning", color: "#FF9F0A" },
  ];

  const typographyTokens = [
    { name: "3XL", var: "--font-size-3xl", size: "1.875rem", weight: "bold" },
    { name: "2XL", var: "--font-size-2xl", size: "1.5rem", weight: "semibold" },
    { name: "XL", var: "--font-size-xl", size: "1.25rem", weight: "semibold" },
    { name: "LG", var: "--font-size-lg", size: "1.125rem", weight: "medium" },
    { name: "Base", var: "--font-size-base", size: "1rem", weight: "regular" },
    { name: "SM", var: "--font-size-sm", size: "0.875rem", weight: "regular" },
    { name: "XS", var: "--font-size-xs", size: "0.75rem", weight: "regular" },
  ];

  const spacingTokens = [
    { name: "0", value: "0px" },
    { name: "0.5", value: "2px" },
    { name: "1", value: "4px" },
    { name: "2", value: "8px" },
    { name: "3", value: "12px" },
    { name: "4", value: "16px" },
    { name: "5", value: "20px" },
    { name: "6", value: "24px" },
    { name: "8", value: "32px" },
    { name: "10", value: "40px" },
    { name: "12", value: "48px" },
    { name: "16", value: "64px" },
  ];

  return (
    <div className="min-h-screen p-8 bg-background-primary">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-primary/10 rounded-lg">
              <Sparkles className="w-8 h-8 text-accent-primary" />
            </div>
            <div>
              <h1 className="text-text-primary">Design System</h1>
              <p className="text-text-secondary">A comprehensive showcase of design tokens and components</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="bg-background-secondary border border-border-subtle">
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2">
              <Type className="w-4 h-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="gap-2">
              <Layers className="w-4 h-4" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Components
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card className="p-6 bg-background-secondary border-border-subtle">
              <h3 className="mb-6 text-text-primary">Color Tokens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colorTokens.map((token) => (
                  <div
                    key={token.name}
                    className="p-4 bg-background-tertiary rounded-lg border border-border-subtle hover:border-accent-primary transition-colors"
                  >
                    <div
                      className="w-full h-16 rounded-md mb-3 border border-border-subtle"
                      style={{ backgroundColor: token.color }}
                    />
                    <div className="space-y-1">
                      <p className="text-text-primary">{token.name}</p>
                      <code className="text-xs text-text-secondary">{token.var}</code>
                      <p className="text-xs text-text-secondary">{token.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card className="p-6 bg-background-secondary border-border-subtle">
              <h3 className="mb-6 text-text-primary">Typography Scale</h3>
              <div className="space-y-6">
                {typographyTokens.map((token) => (
                  <div
                    key={token.name}
                    className="p-4 bg-background-tertiary rounded-lg border border-border-subtle"
                  >
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="text-text-secondary w-16">{token.name}</span>
                      <span
                        className="text-text-primary"
                        style={{
                          fontSize: token.size,
                          fontWeight: token.weight === "bold" ? 700 : token.weight === "semibold" ? 600 : token.weight === "medium" ? 500 : 400
                        }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-text-secondary pl-20">
                      <span>{token.size}</span>
                      <span>•</span>
                      <span>{token.weight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-background-secondary border-border-subtle">
              <h3 className="mb-6 text-text-primary">Heading Examples</h3>
              <div className="space-y-4">
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h1 className="text-text-primary">Heading 1</h1>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h2 className="text-text-primary">Heading 2</h2>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h3 className="text-text-primary">Heading 3</h3>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <h4 className="text-text-primary">Heading 4</h4>
                </div>
                <div className="p-4 bg-background-tertiary rounded-lg">
                  <p className="text-text-primary">
                    This is a paragraph with regular text. The typography system provides consistent sizing and spacing across all text elements.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-6">
            <Card className="p-6 bg-background-secondary border-border-subtle">
              <h3 className="mb-6 text-text-primary">Spacing Scale</h3>
              <div className="space-y-4">
                {spacingTokens.map((token) => (
                  <div
                    key={token.name}
                    className="flex items-center gap-4 p-4 bg-background-tertiary rounded-lg border border-border-subtle"
                  >
                    <div className="w-24 text-text-secondary">
                      <code>spacing-{token.name}</code>
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="h-8 bg-accent-primary rounded"
                        style={{ width: token.value }}
                      />
                      <span className="text-text-primary">{token.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <Card className="p-6 bg-background-secondary border-border-subtle">
              <h3 className="mb-6 text-text-primary">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </Card>

            <Card className="p-6 bg-background-secondary border-border-subtle">
              <h3 className="mb-6 text-text-primary">Inputs</h3>
              <div className="space-y-4 max-w-md">
                <Input
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input placeholder="Disabled input" disabled />
              </div>
            </Card>

            <Card className="p-6 bg-background-secondary border-border-subtle">
              <h3 className="mb-6 text-text-primary">Badges</h3>
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </Card>

            <div className="space-y-4">
              <Alert className="bg-background-secondary border-state-success">
                <CheckCircle2 className="h-4 w-4 text-state-success" />
                <AlertTitle className="text-text-primary">Success</AlertTitle>
                <AlertDescription className="text-text-secondary">
                  Your changes have been saved successfully.
                </AlertDescription>
              </Alert>

              <Alert className="bg-background-secondary border-state-warning">
                <AlertTriangle className="h-4 w-4 text-state-warning" />
                <AlertTitle className="text-text-primary">Warning</AlertTitle>
                <AlertDescription className="text-text-secondary">
                  Please review your changes before proceeding.
                </AlertDescription>
              </Alert>

              <Alert className="bg-background-secondary border-state-error">
                <AlertCircle className="h-4 w-4 text-state-error" />
                <AlertTitle className="text-text-primary">Error</AlertTitle>
                <AlertDescription className="text-text-secondary">
                  An error occurred while processing your request.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
