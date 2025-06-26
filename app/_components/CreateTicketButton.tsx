// app/_components/CreateTicketButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "./forms/Button";
import { ArrowRight } from "lucide-react";

export function CreateTicketButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/select-flight");
  };

  return (
    <Button
      size="lg"
      onClick={handleClick}
      className="text-base md:text-lg px-6 md:px-8"
    >
      Create Your Ticket <ArrowRight className="ml-2" size={18} />
    </Button>
  );
}