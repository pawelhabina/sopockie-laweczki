import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const ReportsContext = createContext(null);

const REPORTS_KEY = 'user-reports-v1';

function readStorage(key, fallbackValue) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function createReportId() {
  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureReport(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const targetType = String(candidate.targetType ?? '').trim();
  const targetId = String(candidate.targetId ?? '').trim();
  const reason = String(candidate.reason ?? '').trim();

  if (!targetType || !targetId || !reason) {
    return null;
  }

  return {
    id: String(candidate.id ?? createReportId()),
    targetType,
    targetId,
    targetLabel: String(candidate.targetLabel ?? targetId).trim() || targetId,
    reason,
    details: String(candidate.details ?? '').trim(),
    status: String(candidate.status ?? 'new'),
    authorId: String(candidate.authorId ?? ''),
    authorName: String(candidate.authorName ?? 'Użytkownik'),
    createdAt: String(candidate.createdAt ?? new Date().toISOString()),
  };
}

function sanitizeReports(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(ensureReport).filter(Boolean);
}

export function ReportsProvider({ children }) {
  const { currentUser, isLoggedIn } = useAuth();
  const [reports, setReports] = useState(() => sanitizeReports(readStorage(REPORTS_KEY, [])));

  useEffect(() => {
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  const value = useMemo(() => {
    const myReports = isLoggedIn ? reports.filter((report) => report.authorId === currentUser.id) : [];

    return {
      reports,
      myReports,
      createReport: (payload) => {
        if (!isLoggedIn) {
          return { ok: false, reason: 'auth' };
        }

        const report = ensureReport({
          ...payload,
          id: createReportId(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          createdAt: new Date().toISOString(),
          status: 'new',
        });

        if (!report) {
          return { ok: false, reason: 'invalid' };
        }

        setReports((prev) => [report, ...prev]);
        return { ok: true, reportId: report.id };
      },
      hasReported: (targetType, targetId) => {
        return myReports.some((report) => report.targetType === targetType && report.targetId === targetId);
      },
      clearReports: () => setReports([]),
    };
  }, [currentUser, isLoggedIn, reports]);

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const context = useContext(ReportsContext);

  if (!context) {
    throw new Error('useReports must be used inside ReportsProvider');
  }

  return context;
}
