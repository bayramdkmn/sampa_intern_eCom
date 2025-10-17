"use client";
import React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoadingIndicator({
  isLoading,
}: {
  isLoading: boolean;
}) {
  return (
    <Backdrop
      className="flex flex-col gap-8 justify-center items-center"
      sx={(theme) => ({
        color: "#1976d2",
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(4px)",
      })}
      open={isLoading}
    >
      <div className="flex flex-col items-center gap-6">
        <img
          src="/sampa-logo.png"
          alt="Sampa Logo"
          width={120}
          height={120}
          className="animate-pulse"
        />
        <CircularProgress
          size={50}
          thickness={4}
          sx={{
            color: "#1976d2",
            animationDuration: "1.5s",
          }}
        />
        <p className="text-gray-600 text-sm font-medium animate-pulse">
          Yükleniyor...
        </p>
      </div>
    </Backdrop>
  );
}
