"use client";

export function SimpleCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border bg-gray-900 border-gray-800 text-white shadow ${className}`}>
      {children}
    </div>
  )
}
