"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [qureyClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={qureyClient}>{children}</QueryClientProvider>
  );
}
