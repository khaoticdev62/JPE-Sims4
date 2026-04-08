/**
 * FormField — Form field wrapper with label and error
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Label } from "@/components/ui/label";

export interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormField({ label, error, description, required, children, className, id }: FormFieldProps) {
  const fieldId = id || React.useId();

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center gap-1">
          <Label htmlFor={fieldId}>{label}</Label>
          {required && <span className="text-rose text-[10px]">*</span>}
        </div>
      )}
      {description && <p className="text-[10px] text-text-muted">{description}</p>}
      <div id={fieldId}>{children}</div>
      {error && <p className="text-[10px] text-rose">{error}</p>}
    </div>
  );
}
