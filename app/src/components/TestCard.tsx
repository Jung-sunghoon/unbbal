// © 2025 운빨(unbbal). All rights reserved.

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TestCardProps {
  href: string;
  emoji: string;
  title: string;
  description: string;
  accentColor: string;
}

export function TestCard({ href, emoji, title, description, accentColor }: TestCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="group h-full transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer border border-border">
        <CardHeader className="text-center pb-2">
          <div
            className="text-5xl mb-2 transition-transform group-hover:scale-110"
            style={{ filter: `drop-shadow(0 2px 4px ${accentColor}40)` }}
          >
            {emoji}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-sm">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
