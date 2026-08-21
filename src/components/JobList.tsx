import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { JobRow } from "@/components/JobRow"
import type { JobListEntry } from "@/types"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useState } from "react"

type SortKey = "label" | "source" | "status" | "pid" | "last_run_at"
type SortDirection = "asc" | "desc"

type SortState = {
  key: SortKey
  direction: SortDirection
}

const sourceLabels: Record<JobListEntry["source"], string> = {
  UserAgent: "User",
  SystemAgent: "System",
  SystemDaemon: "Daemon",
}

function getSortValue(job: JobListEntry, key: SortKey): string | number | null {
  if (key === "source") return sourceLabels[job.source]
  if (key === "pid") return job.pid
  if (key === "last_run_at") {
    return job.last_run_at === null ? null : Number(job.last_run_at)
  }
  return job[key]
}

function compareJobs(firstJob: JobListEntry, secondJob: JobListEntry, sortState: SortState) {
  const firstValue = getSortValue(firstJob, sortState.key)
  const secondValue = getSortValue(secondJob, sortState.key)

  if (firstValue === null && secondValue === null) return 0
  if (firstValue === null) return 1
  if (secondValue === null) return -1

  const comparison =
    typeof firstValue === "number" && typeof secondValue === "number"
      ? firstValue - secondValue
      : String(firstValue).localeCompare(String(secondValue))

  return sortState.direction === "asc" ? comparison : -comparison
}

function SortIcon({ sortState, sortKey }: { sortState: SortState; sortKey: SortKey }) {
  if (sortState.key !== sortKey) return <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
  return sortState.direction === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
  )
}

function SortableHeader({
  label,
  sortKey,
  sortState,
  onSort,
}: {
  label: string
  sortKey: SortKey
  sortState: SortState
  onSort: (sortKey: SortKey) => void
}) {
  const isActive = sortState.key === sortKey
  const direction = isActive
    ? sortState.direction === "asc"
      ? "ascending"
      : "descending"
    : "none"

  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1 rounded px-1 text-left hover:bg-muted"
      onClick={() => onSort(sortKey)}
      aria-label={`Sort by ${label}`}
      aria-sort={direction}
    >
      {label}
      <SortIcon sortState={sortState} sortKey={sortKey} />
    </button>
  )
}

type JobListProps = {
  jobs: JobListEntry[]
  loading: boolean
  onStart: (job: JobListEntry) => void
  onStop: (job: JobListEntry) => void
  onRestart: (job: JobListEntry) => void
  onKickstart: (job: JobListEntry) => void
  onDelete: (job: JobListEntry) => void
  onSelect: (job: JobListEntry) => void
  onRevealInFinder: (job: JobListEntry) => void
}

export function JobList({
  jobs,
  loading,
  onStart,
  onStop,
  onRestart,
  onKickstart,
  onDelete,
  onSelect,
  onRevealInFinder,
}: JobListProps) {
  const [sortState, setSortState] = useState<SortState>({
    key: "label",
    direction: "asc",
  })

  const sortedJobs = [...jobs].sort((firstJob, secondJob) =>
    compareJobs(firstJob, secondJob, sortState)
  )

  function handleSort(sortKey: SortKey) {
    setSortState((currentSort) => ({
      key: sortKey,
      direction:
        currentSort.key === sortKey && currentSort.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Loading agents...
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No agents found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortableHeader label="Label" sortKey="label" sortState={sortState} onSort={handleSort} /></TableHead>
          <TableHead className="w-24"><SortableHeader label="Source" sortKey="source" sortState={sortState} onSort={handleSort} /></TableHead>
          <TableHead className="w-24"><SortableHeader label="Status" sortKey="status" sortState={sortState} onSort={handleSort} /></TableHead>
          <TableHead className="w-16"><SortableHeader label="PID" sortKey="pid" sortState={sortState} onSort={handleSort} /></TableHead>
          <TableHead className="w-24"><SortableHeader label="Last Run" sortKey="last_run_at" sortState={sortState} onSort={handleSort} /></TableHead>
          <TableHead className="w-28">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedJobs.map((job) => (
          <JobRow
            key={job.plist_path}
            job={job}
            onStart={onStart}
            onStop={onStop}
            onRestart={onRestart}
            onKickstart={onKickstart}
            onDelete={onDelete}
            onSelect={onSelect}
            onRevealInFinder={onRevealInFinder}
          />
        ))}
      </TableBody>
    </Table>
  )
}
