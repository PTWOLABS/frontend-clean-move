"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const appointmentsHistorySkeletonRows = ["first", "second", "third", "fourth", "fifth"];

export function AppointmentsHistoryTableSkeletonRows() {
  return (
    <>
      {appointmentsHistorySkeletonRows.map((row) => (
        <TableRow key={`appointments-history-table-${row}`} className="hover:bg-transparent">
          <TableCell className="pl-6">
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell className="pr-4">
            <Skeleton className="ml-auto size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
