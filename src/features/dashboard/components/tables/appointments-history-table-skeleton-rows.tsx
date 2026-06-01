"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const appointmentsHistorySkeletonRows = ["first", "second", "third", "fourth", "fifth"];

export function AppointmentsHistoryTableSkeletonRows() {
  return (
    <>
      {appointmentsHistorySkeletonRows.map((row) => (
        <TableRow key={`appointments-history-table-${row}`} className="hover:bg-transparent">
          <TableCell className="w-36 pl-6">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell className="w-44">
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell className="w-56">
            <Skeleton className="h-4 w-44" />
          </TableCell>
          <TableCell className="w-48">
            <Skeleton className="h-4 w-44" />
          </TableCell>
          <TableCell className="w-32">
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell className="w-28">
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="w-12 pr-4">
            <Skeleton className="ml-auto size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
