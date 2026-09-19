import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Button, Input, Badge, EmptyState } from '../ui';

export const ReportTable = ({
  title,
  subtitle,
  records = [],
  loading = false,
  onDownloadCsv,
  downloading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract columns dynamically from records (excluding 'id')
  const columns = useMemo(() => {
    if (!records || records.length === 0) return [];
    return Object.keys(records[0]).filter((k) => k !== 'id');
  }, [records]);

  // Format header title (camelCase or snake_case to Title Case)
  const formatHeader = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Filter records by search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((val) =>
        String(val || '').toLowerCase().includes(term)
      )
    );
  }, [records, searchTerm]);

  // Sort records
  const sortedRecords = useMemo(() => {
    if (!sortField) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredRecords, sortField, sortDirection]);

  // Paginate records
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (col) => {
    if (sortField === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(col);
      setSortDirection('asc');
    }
  };

  // Render cell content with badge styling for status fields
  const renderCell = (col, val) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-muted-foreground">&mdash;</span>;
    }

    const str = String(val);

    if (col === 'status') {
      let variant = 'secondary';
      if (['ACTIVE', 'PRESENT', 'APPROVED', 'COMPLETED'].includes(str)) variant = 'success';
      else if (['PENDING', 'IN_PROGRESS', 'LATE', 'MEDIUM'].includes(str)) variant = 'warning';
      else if (['REJECTED', 'CANCELLED', 'ABSENT', 'URGENT', 'HIGH'].includes(str)) variant = 'destructive';
      else if (['HALF_DAY', 'ON_LEAVE', 'TODO'].includes(str)) variant = 'primary';
      return <Badge variant={variant} size="sm">{str}</Badge>;
    }

    if (col === 'priority') {
      let variant = 'secondary';
      if (str === 'URGENT' || str === 'HIGH') variant = 'destructive';
      else if (str === 'MEDIUM') variant = 'warning';
      else variant = 'primary';
      return <Badge variant={variant} size="sm">{str}</Badge>;
    }

    if (col === 'isOverdue') {
      return str === 'YES' ? (
        <Badge variant="destructive" size="sm">Overdue</Badge>
      ) : (
        <Badge variant="secondary" size="sm">On Track</Badge>
      );
    }

    return <span>{str}</span>;
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-subtle overflow-hidden">
      {/* Table Header and Toolbar */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 text-xs h-9"
            />
          </div>

          {onDownloadCsv && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadCsv}
              disabled={loading || downloading || records.length === 0}
              className="text-xs shrink-0"
            >
              <Download className={`w-3.5 h-3.5 mr-1.5 ${downloading ? 'animate-bounce' : ''}`} />
              {downloading ? 'Exporting...' : 'Export CSV'}
            </Button>
          )}
        </div>
      </div>

      {/* Table Body */}
      {paginatedRecords.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={FileSpreadsheet}
            title="No Report Records"
            description={
              searchTerm
                ? 'No rows matched your search filter.'
                : 'No data exists for the selected report filters and date range.'
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 cursor-pointer select-none hover:text-foreground transition-colors"
                      onClick={() => handleSort(col)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{formatHeader(col)}</span>
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedRecords.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 font-medium text-foreground">
                        {renderCell(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< md) */}
          <div className="md:hidden divide-y divide-border/60 p-3 space-y-3">
            {paginatedRecords.map((row, idx) => (
              <div
                key={row.id || idx}
                className="bg-secondary/20 p-3.5 rounded-lg space-y-2 text-xs"
              >
                {columns.map((col) => (
                  <div key={col} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {formatHeader(col)}:
                    </span>
                    <span className="font-medium text-foreground text-right truncate max-w-[60%]">
                      {renderCell(col, row[col])}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing{' '}
              <span className="font-semibold text-foreground">
                {records.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * pageSize, sortedRecords.length)}
              </span>{' '}
              of <span className="font-semibold text-foreground">{sortedRecords.length}</span> records
              {searchTerm && ` (filtered from ${records.length})`}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-medium px-1">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 text-xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportTable;
