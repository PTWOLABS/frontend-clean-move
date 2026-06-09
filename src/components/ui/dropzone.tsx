"use client";

import { Primitive } from "@radix-ui/react-primitive";
import { Ban, CheckCircle2, Upload } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/utils/cn";
import * as DropzonePrimitive from "@/components/ui/dropzone-primitive";

function Dropzone(props: React.ComponentProps<typeof DropzonePrimitive.Root>) {
  return <DropzonePrimitive.Root data-slot="dropzone" {...props} />;
}

function DropzoneInput(props: React.ComponentProps<typeof DropzonePrimitive.Input>) {
  return <DropzonePrimitive.Input data-slot="dropzone-input" {...props} />;
}

function DropzoneZone({
  className,
  ...props
}: React.ComponentProps<typeof DropzonePrimitive.Zone>) {
  return (
    <DropzonePrimitive.Zone
      data-slot="dropzone-zone"
      className={cn(
        "cursor-pointer rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[drag-active]:border-primary/40 data-[drag-active]:bg-muted/50 data-[drag-reject]:cursor-no-drop data-[drag-reject]:border-destructive data-[drag-reject]:bg-destructive/10 data-[disabled]:cursor-not-allowed data-[disabled]:border-inherit data-[disabled]:bg-inherit data-[disabled]:opacity-50 data-[no-click]:cursor-default",
        className,
      )}
      {...props}
    />
  );
}

function DropzoneUploadIcon({ className, ...props }: React.ComponentProps<typeof Upload>) {
  return (
    <>
      <DropzonePrimitive.DragAccepted>
        <CheckCircle2
          data-slot="dropzone-upload-icon-accepted"
          className={cn("size-8", className)}
          {...props}
        />
      </DropzonePrimitive.DragAccepted>
      <DropzonePrimitive.DragRejected>
        <Ban
          data-slot="dropzone-upload-icon-rejected"
          className={cn("size-8", className)}
          {...props}
        />
      </DropzonePrimitive.DragRejected>
      <DropzonePrimitive.DragDefault>
        <Upload
          data-slot="dropzone-upload-icon-default"
          className={cn("size-8", className)}
          {...props}
        />
      </DropzonePrimitive.DragDefault>
    </>
  );
}

function DropzoneGroup({ className, ...props }: React.ComponentProps<typeof Primitive.div>) {
  return (
    <Primitive.div
      data-slot="dropzone-group"
      className={cn("grid place-items-center gap-1.5", className)}
      {...props}
    />
  );
}

function DropzoneTitle({ className, ...props }: React.ComponentProps<typeof Primitive.h3>) {
  return (
    <Primitive.h3
      data-slot="dropzone-title"
      className={cn("leading-none font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function DropzoneDescription({ className, ...props }: React.ComponentProps<typeof Primitive.p>) {
  return (
    <Primitive.p
      data-slot="dropzone-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function DropzoneTrigger(props: React.ComponentProps<typeof DropzonePrimitive.Trigger>) {
  return <DropzonePrimitive.Trigger data-slot="dropzone-trigger" {...props} />;
}

function DropzoneAccepted(props: React.ComponentProps<typeof DropzonePrimitive.Accepted>) {
  return <DropzonePrimitive.Accepted data-slot="dropzone-accepted" {...props} />;
}

function DropzoneRejected(props: React.ComponentProps<typeof DropzonePrimitive.Rejected>) {
  return <DropzonePrimitive.Rejected data-slot="dropzone-rejected" {...props} />;
}

export {
  Dropzone,
  DropzoneInput,
  DropzoneZone,
  DropzoneUploadIcon,
  DropzoneGroup,
  DropzoneTitle,
  DropzoneDescription,
  DropzoneTrigger,
  DropzoneAccepted,
  DropzoneRejected,
};
