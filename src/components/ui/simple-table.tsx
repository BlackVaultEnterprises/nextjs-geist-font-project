"use client";

export function Table({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="[&_tr]:border-b">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    {children}
  </tr>
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
    {children}
  </th>
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="p-4 align-middle">{children}</td>
}
