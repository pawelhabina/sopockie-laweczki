import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { useReports } from '@/context/ReportsContext';

const reportReasons = [
  { value: 'inappropriate', label: 'Nieodpowiednia treść' },
  { value: 'wrong_place', label: 'Błędna lokalizacja' },
  { value: 'safety', label: 'Problem bezpieczeństwa' },
  { value: 'other', label: 'Inne' },
];

export function ReportButton({ targetType, targetId, targetLabel }) {
  const { isLoggedIn } = useAuth();
  const { createReport, hasReported } = useReports();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('inappropriate');
  const [details, setDetails] = useState('');
  const alreadyReported = hasReported(targetType, targetId);

  if (!isLoggedIn) {
    return null;
  }

  const onSubmit = (event) => {
    event.preventDefault();
    const result = createReport({
      targetType,
      targetId,
      targetLabel,
      reason,
      details,
    });

    if (result.ok) {
      setOpen(false);
      setDetails('');
    }
  };

  if (alreadyReported) {
    return (
      <span className="rounded-xl border border-[#1f9d55]/35 bg-[#e8f8ef] px-3 py-2 text-sm font-bold text-[#0b5d33]">
        Zgłoszono
      </span>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
      >
        <FontAwesomeIcon icon={faFlag} />
        Zgłoś
      </button>

      {open && (
        <form onSubmit={onSubmit} className="mt-2 grid gap-2 rounded-2xl border border-[var(--outline-soft)] bg-[#f8fbfa] p-3">
          <label className="grid gap-1 text-sm font-bold">
            Powód
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold outline-none"
            >
              {reportReasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-bold">
            Opis
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={3}
              placeholder="Doprecyzuj zgłoszenie"
              className="resize-none rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-2 font-semibold outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="cta-btn rounded-xl px-4 py-2 text-sm font-bold">
              Wyślij zgłoszenie
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-2 text-sm font-bold text-[var(--text-muted)]"
            >
              Anuluj
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
