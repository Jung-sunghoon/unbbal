// © 2025 운빨(unbbal). All rights reserved.

import { SupportButton } from "./SupportButton";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4">
        <SupportButton />
        <p className="text-sm text-muted-foreground">
          © 2025 운빨(unbbal). All rights reserved.
        </p>
      </div>
    </footer>
  );
}
