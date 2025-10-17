"use client";
import React, { createContext, useContext, useState, Suspense } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import LoadingIndicator from "@/components/LoadingIndicator";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// useSearchParams kullanan component'i Suspense ile sarmalayalım
function LoadingProviderInner({ children }: { children: React.ReactNode }) {
  const [isManualLoading, setIsManualLoading] = useState(false);
  const isTransitioning = usePageTransition();

  const isLoading = isTransitioning || isManualLoading;

  const setLoading = (loading: boolean) => {
    setIsManualLoading(loading);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      <LoadingIndicator isLoading={isLoading} />
    </LoadingContext.Provider>
  );
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingIndicator isLoading={true} />}>
      <LoadingProviderInner>{children}</LoadingProviderInner>
    </Suspense>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
