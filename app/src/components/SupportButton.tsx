// © 2025 운빨(unbbal). All rights reserved.

interface SupportButtonProps {
  className?: string;
}

export function SupportButton({ className = "" }: SupportButtonProps) {
  return (
    <a
      href="https://www.buymeacoffee.com/unbbal"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 min-w-[160px] bg-[#FFDD00] text-black font-medium rounded-lg hover:bg-[#FFCC00] transition-colors ${className}`}
    >
      <span>☕</span>
      <span>커피 한 잔 사주기</span>
    </a>
  );
}
