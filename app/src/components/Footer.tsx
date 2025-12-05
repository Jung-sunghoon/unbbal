// © 2025 운빨(unbbal). All rights reserved.

// import { SupportButton } from "./SupportButton";
import { FeedbackButton } from "./FeedbackButton";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          {/* <SupportButton /> */}
          <FeedbackButton />
        </div>
        <p className="text-sm text-muted-foreground">
          © 2025 운빨(unbbal). All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground">
          Dice sprites by{" "}
          <a
            href="https://kicked-in-teeth.itch.io/dice-roll"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Kicked-in-Teeth
          </a>{" "}
          (CC-BY-SA)
        </p>
      </div>
    </footer>
  );
}
