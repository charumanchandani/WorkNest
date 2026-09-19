import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckSquare,
  Calendar,
  FileText,
  TrendingUp,
  RefreshCw,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Button, Input, Select, Textarea, Alert, Spinner, Card, CardContent } from '../components/ui';
import {
  AIStatusBanner,
  AIActionCard,
  AIResultCard,
} from '../components/ai';
import aiService from '../services/aiService';
import taskService from '../services/taskService';
import documentService from '../services/documentService';

export const AIAssistantPage = () => {
  const { user } = useAuth();

  // AI Status
  const [aiStatus, setAiStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Active Tool Selection ('task' | 'leave' | 'document' | 'productivity')
  const [activeTool, setActiveTool] = useState('task');

  // Task Tool State
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [customTaskId, setCustomTaskId] = useState('');
  const [taskResult, setTaskResult] = useState(null);

  // Leave Tool State
  const [leaveType, setLeaveType] = useState('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [roughReason, setRoughReason] = useState('');
  const [leaveResult, setLeaveResult] = useState(null);

  // Document Tool State
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [docResult, setDocResult] = useState(null);

  // Productivity Tool State
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [prodResult, setProdResult] = useState(null);

  // Action Loading & Errors
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Fetch AI Status & Initial Data
  const fetchStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const res = await aiService.getAIStatus();
      if (res?.data) {
        setAiStatus(res.data.data || res.data);
      }
    } catch {
      setAiStatus({ enabled: false, provider: 'mock' });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchContextData = useCallback(async () => {
    try {
      // Load user open tasks
      const taskRes = await taskService.getMyTasks({ limit: 20 });
      if (taskRes?.data) {
        setTasks(taskRes.data.records || []);
      }

      // Load accessible documents
      const docRes = await documentService.getDocuments({ limit: 20 });
      if (docRes?.data) {
        setDocuments(docRes.data.records || []);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchContextData();
  }, [fetchStatus, fetchContextData]);

  // Handle Task Summarization
  const handleSummarizeTask = async (e) => {
    e?.preventDefault();
    const targetId = selectedTaskId || customTaskId.trim();
    if (!targetId) {
      setActionError('Please select or specify a task to summarize.');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      setTaskResult(null);
      const res = await aiService.getTaskSummary(targetId);
      if (res?.data) {
        setTaskResult(res.data.data || res.data);
      }
    } catch (err) {
      setActionError(err.formattedMessage || 'Failed to generate task summary.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Leave Draft Generation
  const handleGenerateLeaveDraft = async (e) => {
    e?.preventDefault();
    if (!roughReason.trim()) {
      setActionError('Please provide your initial rough leave notes or reason.');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      setLeaveResult(null);
      const res = await aiService.generateLeaveDraft({
        leaveType,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        endDate: endDate || startDate || new Date().toISOString().slice(0, 10),
        reason: roughReason.trim(),
      });
      if (res?.data) {
        setLeaveResult(res.data.data || res.data);
      }
    } catch (err) {
      setActionError(err.formattedMessage || 'Failed to generate professional leave draft.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Document Summarization
  const handleSummarizeDocument = async (e) => {
    e?.preventDefault();
    if (!selectedDocId) {
      setActionError('Please select a document to summarize.');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');
      setDocResult(null);
      const res = await aiService.getDocumentSummary(selectedDocId);
      if (res?.data) {
        setDocResult(res.data.data || res.data);
      }
    } catch (err) {
      setActionError(err.formattedMessage || 'Failed to summarize document.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Productivity Insight Generation
  const handleGenerateProductivityInsight = async (e) => {
    e?.preventDefault();
    try {
      setActionLoading(true);
      setActionError('');
      setProdResult(null);
      const res = await aiService.getProductivityInsight(dateRange);
      if (res?.data) {
        setProdResult(res.data.data || res.data);
      }
    } catch (err) {
      setActionError(err.formattedMessage || 'Failed to generate productivity insights.');
    } finally {
      setActionLoading(false);
    }
  };

  const actionCards = [
    {
      id: 'task',
      title: 'Summarize a Task',
      description: 'Condense requirements, deliverables, and next milestone actions into structured points.',
      icon: CheckSquare,
      badgeText: 'Task Intelligence',
      badgeVariant: 'primary',
    },
    {
      id: 'leave',
      title: 'Draft Leave Application',
      description: 'Transform rough notes and informal reasons into a professional time-off request message.',
      icon: Calendar,
      badgeText: 'HR Writing',
      badgeVariant: 'warning',
    },
    {
      id: 'document',
      title: 'Summarize a Document',
      description: 'Extract executive highlights, compliance guidelines, and core takeaways from text policies.',
      icon: FileText,
      badgeText: 'Document Analysis',
      badgeVariant: 'teal',
    },
    {
      id: 'productivity',
      title: 'Productivity Insights',
      description: 'Synthesize live task turnaround, attendance rates, and operational patterns for your role.',
      icon: TrendingUp,
      badgeText: 'Workplace Analytics',
      badgeVariant: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              WorkNest AI Assistant
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Optional Assistance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            On-demand workplace writing, task breakdown, policy summarization, and performance synthesis.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          disabled={statusLoading}
          className="text-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${statusLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* AI Availability Status Banner */}
      <AIStatusBanner status={aiStatus} loading={statusLoading} />

      {/* AI Action Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actionCards.map((card) => (
          <AIActionCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            badgeText={card.badgeText}
            badgeVariant={card.badgeVariant}
            isActive={activeTool === card.id}
            onClick={() => {
              setActiveTool(card.id);
              setActionError('');
            }}
          />
        ))}
      </div>

      {/* Error Alert */}
      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{actionError}</span>
        </Alert>
      )}

      {/* Active AI Workbench Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-subtle">
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Tool 1: Task Summarizer Form */}
              {activeTool === 'task' && (
                <form onSubmit={handleSummarizeTask} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Task Summarization
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Select an assigned task or specify an authorized task ID.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="task-select" className="block text-xs font-medium text-foreground mb-1">
                        Select from Open Tasks
                      </label>
                      <Select
                        id="task-select"
                        value={selectedTaskId}
                        onChange={(e) => {
                          setSelectedTaskId(e.target.value);
                          if (e.target.value) setCustomTaskId('');
                        }}
                        className="text-xs h-9"
                      >
                        <option value="">-- Choose a task --</option>
                        {tasks.map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.priority}] {t.title} ({t.status})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="relative flex items-center justify-center my-2">
                      <div className="border-t border-border w-full" />
                      <span className="bg-card px-2 text-[10px] text-muted-foreground uppercase font-bold absolute">
                        or enter ID
                      </span>
                    </div>

                    <div>
                      <label htmlFor="custom-task-id" className="block text-xs font-medium text-foreground mb-1">
                        Task Identifier (ObjectId)
                      </label>
                      <Input
                        id="custom-task-id"
                        placeholder="e.g. 60f7b1b3b3b3b3b3b3b3b3b3"
                        value={customTaskId}
                        onChange={(e) => {
                          setCustomTaskId(e.target.value);
                          if (e.target.value) setSelectedTaskId('');
                        }}
                        className="text-xs h-9 font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={actionLoading || (!selectedTaskId && !customTaskId.trim())}
                    className="w-full text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {actionLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Generating Task Summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Generate Task Summary
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Tool 2: Leave Application Drafting Form */}
              {activeTool === 'leave' && (
                <form onSubmit={handleGenerateLeaveDraft} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Leave Request Assistant
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Enter rough notes and let AI produce a polite, professional workplace draft.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="ai-leave-type" className="block text-xs font-medium text-foreground mb-1">
                        Leave Type
                      </label>
                      <Select
                        id="ai-leave-type"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="text-xs h-9"
                      >
                        <option value="ANNUAL">Annual Leave</option>
                        <option value="CASUAL">Casual Leave</option>
                        <option value="SICK">Sick Leave</option>
                        <option value="UNPAID">Unpaid Leave</option>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="ai-start-date" className="block text-xs font-medium text-foreground mb-1">
                          Start Date
                        </label>
                        <Input
                          id="ai-start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="text-xs h-9"
                        />
                      </div>
                      <div>
                        <label htmlFor="ai-end-date" className="block text-xs font-medium text-foreground mb-1">
                          End Date
                        </label>
                        <Input
                          id="ai-end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="text-xs h-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ai-rough-reason" className="block text-xs font-medium text-foreground mb-1">
                        Rough Notes / Key Reason
                      </label>
                      <Textarea
                        id="ai-rough-reason"
                        placeholder="e.g. meri tabiyat theek nahi hai 2 din rest chahiye or taking off for family wedding"
                        value={roughReason}
                        onChange={(e) => setRoughReason(e.target.value)}
                        rows={3}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={actionLoading || !roughReason.trim()}
                    className="w-full text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {actionLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Drafting Professional Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Generate Professional Draft
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Tool 3: Document Summarizer Form */}
              {activeTool === 'document' && (
                <form onSubmit={handleSummarizeDocument} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Document Summarization
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Extract executive highlights and actionable policies from accessible text documents.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="ai-doc-select" className="block text-xs font-medium text-foreground mb-1">
                      Choose Document
                    </label>
                    <Select
                      id="ai-doc-select"
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="text-xs h-9"
                    >
                      <option value="">-- Select a document --</option>
                      {documents.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          [{doc.category}] {doc.title} ({doc.originalFileName})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={actionLoading || !selectedDocId}
                    className="w-full text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {actionLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Analyzing Document...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Summarize Document
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Tool 4: Productivity Insight Form */}
              {activeTool === 'productivity' && (
                <form onSubmit={handleGenerateProductivityInsight} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Performance & Workload Synthesis
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      Synthesize operational metrics, task turnaround timing, and attendance patterns for{' '}
                      <span className="font-semibold text-foreground">{user?.role}</span> scope.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="ai-prod-from" className="block text-xs font-medium text-foreground mb-1">
                        From Date
                      </label>
                      <Input
                        id="ai-prod-from"
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="text-xs h-9"
                      />
                    </div>
                    <div>
                      <label htmlFor="ai-prod-to" className="block text-xs font-medium text-foreground mb-1">
                        To Date
                      </label>
                      <Input
                        id="ai-prod-to"
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={actionLoading}
                    className="w-full text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {actionLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Analyzing Operational Trends...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Generate Role Insight
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Output & Results Display (7 cols) */}
        <div className="lg:col-span-7">
          {actionLoading ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl shadow-subtle gap-3 text-center">
              <Spinner size="lg" />
              <div>
                <p className="text-sm font-semibold text-foreground">Processing with WorkNest AI</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Validating parameters and synthesizing response...
                </p>
              </div>
            </div>
          ) : (
            <div>
              {activeTool === 'task' && (
                <AIResultCard
                  title={`Task Summary: ${taskResult?.taskTitle || ''}`}
                  type="task"
                  data={taskResult}
                />
              )}

              {activeTool === 'leave' && (
                <AIResultCard
                  title="Draft Leave Application"
                  type="leave"
                  data={leaveResult}
                />
              )}

              {activeTool === 'document' && (
                <AIResultCard
                  title={`Document Synopsis: ${docResult?.documentTitle || ''}`}
                  type="document"
                  data={docResult}
                />
              )}

              {activeTool === 'productivity' && (
                <AIResultCard
                  title="Workplace Productivity & Trend Synthesis"
                  type="productivity"
                  data={prodResult}
                />
              )}

              {/* Placeholder when no result generated yet */}
              {((activeTool === 'task' && !taskResult) ||
                (activeTool === 'leave' && !leaveResult) ||
                (activeTool === 'document' && !docResult) ||
                (activeTool === 'productivity' && !prodResult)) && (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-card border border-dashed border-border rounded-xl gap-2.5 text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block">
                      Awaiting AI Prompt
                    </span>
                    <span className="text-xs text-muted-foreground max-w-sm block mt-1">
                      Configure your inputs on the left panel and click the generate button to see structured results here.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
