"use client";

import * as React from "react";
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";
import { cn } from "@/lib/utils";

type GroupProps = React.ComponentProps<typeof Group>;

function ResizablePanelGroup({
  className,
  ...props
}: GroupProps) {
  return (
    <Group
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  );
}

const ResizablePanel = Panel;

type SeparatorProps = React.ComponentProps<typeof Separator>;

function ResizableHandle({
  className,
  ...props
}: SeparatorProps) {
  return (
    <Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
