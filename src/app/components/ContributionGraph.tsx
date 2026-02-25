import React, { useMemo, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

export const ContributionGraph = ({ sessions }: { sessions: any[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to end (today) on mount
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const { grids, totalSessions } = useMemo(() => {
    // We want roughly 52 weeks (1 year) ending today
    const weeks = [];
    const today = new Date();
    const totalSessions = sessions.length;

    // Calculate start date: Today - 52 weeks (approx 364 days)
    // Adjust start date to be a Monday so the grid aligns correctly
    const daysToShow = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToShow);

    // Adjust startDate back to the nearest Monday
    const dayOfWeek = startDate.getDay(); // 0 is Sunday
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDate.setDate(diff);

    const sessionsByDate = sessions.reduce(
      (acc, s) => {
        const dateStr = new Date(s.date).toDateString();
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toDateString();
        const count = sessionsByDate[dateStr] || 0;

        week.push({ date: new Date(currentDate), count });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    return { grids: weeks, totalSessions };
  }, [sessions]);

  return (
    <div
      className="p-5 rounded-2xl shadow-xs"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Calendar size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Рік Чаю</span>
        </div>
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {totalSessions} сесій за рік
        </span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-[3px] min-w-max pl-2">
          {grids.map((week, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {week.map((day, j) => (
                <div
                  key={j}
                  className="w-2.5 h-2.5 rounded-xs transition-colors"
                  style={{
                    background:
                      day.count === 0
                        ? 'var(--bg-tertiary)'
                        : day.count === 1
                          ? 'var(--accent-subtle)'
                          : day.count <= 3
                            ? 'var(--accent-border)'
                            : 'var(--accent)',
                    opacity: day.count === 0 ? 0.4 : day.count === 1 ? 0.8 : 1,
                  }}
                  title={`${day.date.toLocaleDateString()}: ${day.count} sessions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div
        className="flex items-center gap-2 mt-3 text-[10px] justify-end"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>Less</span>
        <div
          className="w-2 h-2 rounded-xs"
          style={{ background: 'var(--bg-tertiary)', opacity: 0.4 }}
        />
        <div className="w-2 h-2 rounded-xs" style={{ background: 'var(--accent)', opacity: 0.3 }} />
        <div className="w-2 h-2 rounded-xs" style={{ background: 'var(--accent)', opacity: 0.6 }} />
        <div className="w-2 h-2 rounded-xs" style={{ background: 'var(--accent)' }} />
        <span>More</span>
      </div>
    </div>
  );
};
