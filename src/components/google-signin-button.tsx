"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { GoogleIcon } from "@/components/google-icon";
import { cn } from "@/shared/utils/cn";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_SCRIPT_ID = "google-identity-services";

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => void;
  label?: string;
  isLoading?: boolean;
  disabled?: boolean;
  testId?: string;
  className?: string;
};

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window is not available"));
      return;
    }

    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load GIS")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load GIS"));
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({
  onCredential,
  label = "Continuar com Google",
  isLoading = false,
  disabled = false,
  testId,
  className,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.google?.accounts?.id),
  );

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const interactive = !disabled && !isLoading;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || scriptReady) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (!cancelled) setScriptReady(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [clientId, scriptReady]);

  useEffect(() => {
    if (!scriptReady || !clientId) return;
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    const gis = window.google?.accounts?.id;
    if (!gis) return;

    gis.initialize({
      client_id: clientId,
      callback: (response) => {
        onCredentialRef.current(response.credential);
      },
    });

    const render = () => {
      const width = Math.min(Math.max(container.offsetWidth || 240, 200), 400);
      overlay.innerHTML = "";
      gis.renderButton(overlay, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width,
        locale: "pt-BR",
      });
    };

    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(container);

    return () => {
      observer.disconnect();
      overlay.innerHTML = "";
    };
  }, [scriptReady, clientId]);

  if (!clientId) {
    return (
      <div
        data-testid={testId}
        className={cn("w-full text-center text-sm text-[#94A3B8]", className)}
      >
        <p>
          Login com Google indisponível: defina{" "}
          <code className="rounded bg-[#192333] px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_GOOGLE_CLIENT_ID
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      className={cn(
        "relative h-[52px] w-full rounded-[12px] focus-within:ring-2 focus-within:ring-[#2563EB]/35",
        className,
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={!interactive}
        className={cn(
          "pointer-events-none flex h-full w-full items-center justify-center gap-3 rounded-[12px] border border-[#243244] bg-[#111B28]/65 text-base font-semibold text-[#F8FAFC] transition-colors",
          !interactive && "opacity-60",
        )}
      >
        {isLoading ? (
          <LoaderCircle aria-hidden className="size-5 animate-spin text-[#94A3B8]" />
        ) : (
          <>
            <GoogleIcon />
            <span>{label}</span>
          </>
        )}
      </button>

      <div
        ref={overlayRef}
        className={cn(
          "absolute inset-0 z-10 flex items-center justify-center opacity-0 [&>div]:w-full",
          !interactive && "pointer-events-none",
        )}
      />
    </div>
  );
}
