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
    <div>
      <Backdrop
        className="flex flex-col gap-20 justify-center items-center"
        sx={(theme) => ({ color: "blue", zIndex: theme.zIndex.drawer + 1 })}
        open={isLoading}
      >
        <img src="/sampa-logo.png" alt="logo" width={150} height={150} />
        <CircularProgress sx={{ color: "blue" }} />
      </Backdrop>
    </div>
  );
}
