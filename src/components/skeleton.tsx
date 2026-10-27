import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-200/70 rounded-xl ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-zinc-100 last:border-b-0 animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="py-4 px-4">
              <div
                className="h-4 bg-zinc-200/80 rounded-lg"
                style={{
                  width: `${60 + ((rIdx * 17 + cIdx * 23) % 35)}%`,
                  maxWidth: cIdx === 0 ? "200px" : "130px",
                }}
              />
              {cIdx === 0 && (
                <div className="h-2.5 bg-zinc-100 rounded-md w-24 mt-2" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-2xs space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 w-3/4">
          <div className="h-3 bg-zinc-200/80 rounded-md w-1/4" />
          <div className="h-5 bg-zinc-200/80 rounded-md w-4/5" />
        </div>
        <div className="w-16 h-6 bg-zinc-200/80 rounded-full shrink-0" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-zinc-200/70 rounded-md w-full" />
        <div className="h-3 bg-zinc-200/70 rounded-md w-3/4" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        <div className="h-4 bg-zinc-200/80 rounded-md w-24" />
        <div className="h-8 bg-zinc-200/80 rounded-xl w-28" />
      </div>
    </div>
  );
}
