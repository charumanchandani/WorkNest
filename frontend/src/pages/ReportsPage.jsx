import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  CheckSquare,
  Users,
  Building2,
  AlertCircle,
  Download,
  Filter,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Badge, Alert, Spinner, Select } from '../components/ui';
import { AnalyticsFilterBar } from '../components/analytics';
import { ReportTable } from '../components/reports';
import analyticsService from '../services/analyticsService';

export const ReportsPage = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Report type state
  const [selectedReport, setSelectedReport] = useState('attendance');

  // Filter state
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    department: '',
    status: '',
  });

  // Report data state
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Daily clock-ins, check-outs, worked hours, and status breakdown.',
      icon: Clock,
      roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
    },
    {
      id: 'leave',
      title: 'Leave & Absences',
      description: 'Approved leave records, duration days, reasons, and review comments.',
      icon: Calendar,
      roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
    },
    {
      id: 'tasks',
      title: 'Tasks & Deliverables',
      description: 'Task assignments, priorities, deadlines, overdue indicators, and closures.',
      icon: CheckSquare,
      roles: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
    },
    ...(isManagerOrAdmin
      ? [
          {
            id: 'employees',
            title: 'Employee Directory',
            description: 'Staff profiles, job titles, department assignments, and hire dates.',
            icon: Users,
            roles: ['MANAGER', 'ADMIN'],
          },
          {
            id: 'departments',
            title: 'Department Overview',
            description: 'Departmental headcounts, leads, attendance rates, and workloads.',
            icon: Building2,
            roles: ['MANAGER', 'ADMIN'],
          },
        ]
      : []),
  ];

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await analyticsService.getReport(selectedReport, filters);
      if (res?.data) {
        setReportData(res.data.data || res.data);
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to generate operational report.');
    } finally {
      setLoading(false);
    }
  }, [selectedReport, filters]);

  useEffect(() => {
    fetchReport();
  }, [selectedReport, filters, fetchReport]);

  const handleDownloadCsv = async () => {
    try {
      setExporting(true);
      setError('');
      await analyticsService.downloadReportCsv(selectedReport, filters);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const currentReportMeta = reportTypes.find((r) => r.id === selectedReport) || reportTypes[0];
  const summary = reportData?.summary || {};
  const records = reportData?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Operational Reports
            </h1>
            <Badge variant="primary" size="md">
              {user?.role} Scope
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate and export verified workplace audit logs, attendance sheets, and task rosters.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={handleDownloadCsv}
          disabled={loading || exporting || records.length === 0}
          className="text-xs shrink-0 self-start sm:self-auto bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Download className={`w-3.5 h-3.5 mr-1.5 ${exporting ? 'animate-bounce' : ''}`} />
          {exporting ? 'Exporting...' : 'Export Full CSV'}
        </Button>
      </div>

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedReport === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedReport(type.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'bg-teal-50/70 dark:bg-teal-950/60 border-teal-500 shadow-xs'
                  : 'bg-card border-border hover:border-teal-500/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-teal-600 text-white'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  {type.title}
                </span>
                <span className="text-[11px] text-muted-foreground line-clamp-1 block mt-0.5">
                  {type.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <AnalyticsFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={fetchReport}
        loading={loading}
        showDepartmentFilter={isManagerOrAdmin && selectedReport !== 'departments'}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Summary KPI Strip for Active Report */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="bg-secondary/30 border border-border/80 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Report Summary Metrics
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {Object.entries(summary).map(([key, val]) => {
              if (typeof val === 'object' && val !== null) return null;
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (s) => s.toUpperCase());
              return (
                <div key={key} className="bg-card p-3 rounded-lg border border-border/60">
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {label}
                  </span>
                  <span className="text-lg font-bold text-foreground block mt-0.5">
                    {String(val)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Data Table */}
      {loading && !reportData ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground">Generating report data...</p>
        </div>
      ) : (
        <ReportTable
          title={currentReportMeta.title}
          subtitle={`Displaying records from ${reportData?.dateRange?.from || 'start'} to ${
            reportData?.dateRange?.to || 'end'
          }`}
          records={records}
          loading={loading}
          onDownloadCsv={handleDownloadCsv}
          downloading={exporting}
        />
      )}
    </div>
  );
};

export default ReportsPage;
