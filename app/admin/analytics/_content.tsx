'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  IconEye,
  IconSearch,
  IconUser,
  IconBrandWhatsapp,
  IconChartLine,
} from '@tabler/icons-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type DayRange = 7 | 14 | 30;

interface EventRow {
  id: string;
  event_type: string;
  profile_id: string | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  contact_name: string | null;
  company_name: string | null;
}

const EVENT_TYPES = ['landing_view', 'search_view', 'profile_view', 'whatsapp_click'] as const;

const COLORS: Record<string, string> = {
  landing_view: '#B03A1A',
  search_view: '#C8860A',
  profile_view: '#2563EB',
  whatsapp_click: '#16A34A',
};

const LABELS: Record<string, string> = {
  landing_view: 'Accueil',
  search_view: 'Recherche',
  profile_view: 'Profil',
  whatsapp_click: 'WhatsApp',
};

export default function AnalyticsContent() {
  const [days, setDays] = useState<DayRange>(7);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setProfiles(data.profiles ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);

  const filtered = events.filter((e) => new Date(e.created_at) >= cutoff);

  const count = (type: string) => filtered.filter((e) => e.event_type === type).length;

  // Build ISO date keys for the selected range
  const dateKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateKeys.push(d.toISOString().slice(0, 10));
  }

  const dateLabels = dateKeys.map((k) => {
    const [, m, dd] = k.split('-');
    return `${dd}/${m}`;
  });

  // Aggregate daily counts per event type
  const daily: Record<string, Record<string, number>> = {};
  for (const key of dateKeys) {
    daily[key] = {};
    for (const t of EVENT_TYPES) daily[key][t] = 0;
  }
  for (const e of filtered) {
    const day = e.created_at.slice(0, 10);
    if (daily[day] && EVENT_TYPES.includes(e.event_type as (typeof EVENT_TYPES)[number])) {
      daily[day][e.event_type]++;
    }
  }

  const chartData = {
    labels: dateLabels,
    datasets: EVENT_TYPES.map((t) => ({
      label: LABELS[t],
      data: dateKeys.map((k) => daily[k]?.[t] ?? 0),
      borderColor: COLORS[t],
      backgroundColor: COLORS[t] + '18',
      tension: 0.35,
      fill: false,
      pointRadius: days <= 7 ? 4 : 2,
      pointHoverRadius: 6,
      borderWidth: 2,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 16,
          font: { size: 12 },
        },
      },
      tooltip: { padding: 10 },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { precision: 0, font: { size: 11 } },
      },
    },
  };

  // Top-5 by profile
  const topProfiles = (type: string) => {
    const acc: Record<string, number> = {};
    for (const e of filtered) {
      if (e.event_type === type && e.profile_id) {
        acc[e.profile_id] = (acc[e.profile_id] ?? 0) + 1;
      }
    }
    return Object.entries(acc)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const top5Views = topProfiles('profile_view');
  const top5WA = topProfiles('whatsapp_click');

  const profileName = (id: string) => {
    const p = profiles.find((p) => p.id === id);
    return p?.company_name || p?.contact_name || id.slice(0, 8) + '…';
  };

  const metrics = [
    { type: 'landing_view', label: 'Pages accueil', Icon: IconEye },
    { type: 'search_view', label: 'Recherches', Icon: IconSearch },
    { type: 'profile_view', label: 'Vues profil', Icon: IconUser },
    { type: 'whatsapp_click', label: 'Clics WhatsApp', Icon: IconBrandWhatsapp },
  ];

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <IconChartLine size={26} stroke={1.5} style={{ color: 'var(--brand)' }} />
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--ink)' }}>Analytics</h1>
        </div>

        {/* Day range toggle */}
        <div
          className="mb-6 inline-flex overflow-hidden rounded-xl border"
          style={{ borderColor: 'var(--border)' }}
        >
          {([7, 14, 30] as DayRange[]).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-5 py-2 text-sm font-medium transition-colors"
              style={{
                background: days === d ? 'var(--brand)' : 'white',
                color: days === d ? 'white' : 'var(--ink)',
              }}
            >
              {d}j
            </button>
          ))}
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p style={{ color: 'var(--muted)' }}>Chargement des données…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Metric cards */}
            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {metrics.map(({ type, label, Icon }) => (
                <div key={type} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="mb-2" style={{ color: COLORS[type] }}>
                    <Icon size={22} stroke={1.5} />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--ink)' }}>
                    {count(type)}
                  </p>
                  <p className="mt-0.5 text-sm" style={{ color: 'var(--muted)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div className="mb-5 rounded-xl bg-white p-4 shadow-sm md:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Évolution quotidienne
              </h2>
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Top-5 lists */}
            <div className="grid gap-4 md:grid-cols-2">
              <TopList
                title="Top 5 profils vus"
                icon={<IconUser size={18} stroke={1.5} style={{ color: 'var(--brand)' }} />}
                items={top5Views}
                rankColor="var(--brand)"
                countColor="var(--brand)"
                nameOf={profileName}
              />
              <TopList
                title="Top 5 clics WhatsApp"
                icon={<IconBrandWhatsapp size={18} stroke={1.5} style={{ color: '#16A34A' }} />}
                items={top5WA}
                rankColor="#16A34A"
                countColor="#16A34A"
                nameOf={profileName}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function TopList({
  title,
  icon,
  items,
  rankColor,
  countColor,
  nameOf,
}: {
  title: string;
  icon: React.ReactNode;
  items: [string, number][];
  rankColor: string;
  countColor: string;
  nameOf: (id: string) => string;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          {title}
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucune donnée sur cette période</p>
      ) : (
        <ol className="space-y-3">
          {items.map(([id, n], i) => (
            <li key={id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: rankColor }}
                >
                  {i + 1}
                </span>
                <span className="truncate text-sm" style={{ color: 'var(--ink)' }}>
                  {nameOf(id)}
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: countColor }}>
                {n}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
