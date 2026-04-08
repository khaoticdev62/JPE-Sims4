/**
 * NavMenu — Navigation menu component
 */
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink} from "@/components/ui/navigation-menu";
import type { LucideIcon } from "lucide-react";

export interface NavMenuItem {
  label: string;
  icon?: LucideIcon;
  href?: string;
  children?: NavMenuItem[];
}

export interface NavMenuProps {
  items: NavMenuItem[];
  className?: string;
}

export function NavMenu({ items, className }: NavMenuProps) {
  return (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        {items.map((item) => (
          <NavigationMenuItem key={item.label}>
            {item.children ? (
              <>
                <NavigationMenuTrigger className="text-[11px] text-text-secondary data-[state=open]:text-cyan-bright">
                  {item.icon && <item.icon className="h-3.5 w-3.5 mr-1.5" />}
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-1 p-2">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <NavigationMenuLink
                          href={child.href}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-text-secondary hover:bg-cyan-dim/50 hover:text-cyan-bright transition-colors duration-fast outline-none"
                        >
                          {child.icon && <child.icon className="h-3 w-3" />}
                          {child.label}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                href={item.href}
                className="group inline-flex h-[32px] w-max items-center justify-center rounded-md px-3 text-[11px] text-text-secondary transition-colors duration-fast hover:bg-bg-hover hover:text-text-primary focus:bg-bg-hover focus:text-text-primary focus:outline-none"
              >
                {item.icon && <item.icon className="h-3.5 w-3.5 mr-1.5" />}
                {item.label}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
