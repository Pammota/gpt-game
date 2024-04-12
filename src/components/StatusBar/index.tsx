import React from "react";

type Props = {
  value: number; //0-100
  className?: string;
  barColor?: string;
};

export const StatusBar = ({ className, value, barColor }: Props) => {
  return (
    <div
      className={`h-4 bg-slate-800 w-20 rounded-md overflow-hidden ${className}`}
    >
      <div className={`h-full w-[${value}%] ${barColor || "bg-sky-500"}`} />
    </div>
  );
};
