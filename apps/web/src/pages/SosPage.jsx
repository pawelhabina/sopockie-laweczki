import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faShieldHeart, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';

const CONTACT_KEY = 'sos-trusted-contact-v1';
const EVENTS_KEY = 'sos-events-v1';

const defaultContact = {
  name: 'Kontakt zaufany',
  phone: '',
};

function readStorage(key, fallbackValue) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function sanitizeContact(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return defaultContact;
  }

  return {
    name: String(candidate.name ?? '').trim() || defaultContact.name,
    phone: String(candidate.phone ?? '').trim(),
  };
}

function sanitizePhone(value) {
  return String(value ?? '').replace(/[^\d+]/g, '');
}

export function SosPage() {
  const { isLoggedIn, currentUser } = useAuth();
  const [contact, setContact] = useState(() => sanitizeContact(readStorage(CONTACT_KEY, defaultContact)));
  const [lastEvent, setLastEvent] = useState(null);

  const normalizedPhone = useMemo(() => sanitizePhone(contact.phone), [contact.phone]);
  const canSend = isLoggedIn && normalizedPhone.length >= 6;

  useEffect(() => {
    window.localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
  }, [contact]);

  const alertMessage = useMemo(() => {
    return `Alert SOS z aplikacji Sopockie Ławeczki. Użytkownik ${currentUser.name} prosi o kontakt lub pomoc.`;
  }, [currentUser.name]);

  function handleSendAlert() {
    if (!canSend) {
      return;
    }

    const event = {
      id: `sos-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      contactName: contact.name,
      contactPhone: normalizedPhone,
      message: alertMessage,
      createdAt: new Date().toISOString(),
    };

    const previousEvents = readStorage(EVENTS_KEY, []);
    const nextEvents = Array.isArray(previousEvents) ? [event, ...previousEvents].slice(0, 20) : [event];
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(nextEvents));
    setLastEvent(event);
  }

  if (!isLoggedIn) {
    return (
      <section className="grid gap-4">
        <div className="panel p-5">
          <span className="inline-flex rounded-full border border-[#d94841]/30 bg-[#fdeceb] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#8f231f]">
            SOS
          </span>
          <h1 className="mt-3 font-heading text-3xl leading-tight">Dostępne po zalogowaniu</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Przycisk SOS jest funkcją bezpieczeństwa dla zweryfikowanych mieszkańców.
          </p>
        </div>

        <Link to="/profile" className="cta-btn rounded-xl px-4 py-3 text-center text-sm font-bold">
          Przejdź do logowania
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="panel p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-xl text-white">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--text-muted)]">Bezpieczeństwo</p>
            <h1 className="mt-1 font-heading text-3xl leading-tight">SOS</h1>
          </div>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faShieldHeart} className="text-[var(--cta)]" />
          <h2 className="font-heading text-xl leading-tight">Kontakt zaufany</h2>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-2 text-sm font-bold">
            Nazwa kontaktu
            <input
              type="text"
              value={contact.name}
              onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-3 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Numer telefonu
            <input
              type="tel"
              value={contact.phone}
              onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="+48 000 000 000"
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-3 py-3 font-semibold text-[var(--text-main)] outline-none"
            />
          </label>
        </div>
      </div>

      <div className="panel p-5">
        <p className="text-sm font-bold">Treść alertu</p>
        <p className="mt-2 rounded-2xl border border-[var(--outline-soft)] bg-white p-4 text-sm text-[var(--text-muted)]">
          {alertMessage}
        </p>

        {!canSend && (
          <p className="mt-3 rounded-2xl border border-[#f59f00]/35 bg-[#fff4dd] p-3 text-sm font-semibold text-[#9a6400]">
            Uzupełnij numer kontaktu zaufanego, aby aktywować alert.
          </p>
        )}

        <button
          type="button"
          onClick={handleSendAlert}
          disabled={!canSend}
          className="cta-btn mt-4 w-full rounded-xl px-4 py-4 text-base font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
        >
          Wyślij alert SOS
        </button>
      </div>

      {lastEvent && (
        <div className="panel border-[#1f9d55]/35 p-5">
          <p className="text-sm font-bold text-[#0b5d33]">Alert zapisany</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Zdarzenie SOS zapisano lokalnie dla kontaktu: {lastEvent.contactName}.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a
              href={`tel:${lastEvent.contactPhone}`}
              className="rounded-xl border border-[var(--outline-soft)] bg-white px-4 py-3 text-center text-sm font-bold text-[var(--text-muted)]"
            >
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              Zadzwoń
            </a>
            <a
              href={`sms:${lastEvent.contactPhone}?&body=${encodeURIComponent(lastEvent.message)}`}
              className="cta-btn rounded-xl px-4 py-3 text-center text-sm font-bold"
            >
              Przygotuj SMS
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
