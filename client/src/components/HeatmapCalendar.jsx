export default function HeatmapCalendar({ data }) {
  // data: array of { date: 'YYYY-MM-DD', completed: boolean }
  if (!data || data.length === 0) return <p className="empty">No history yet.</p>;

  // Group into weeks (columns)
  const cells = [...data];
  const firstDate = new Date(cells[0].date);
  const dayOffset = firstDate.getDay();
  const padded = Array.from({ length: dayOffset }, () => null).concat(cells);

  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map((cell, di) => (
              <div
                key={di}
                className={`heatmap-cell${cell?.completed ? ' active' : ''}${cell ? '' : ' empty'}`}
                title={cell ? `${cell.date}${cell.completed ? ' · Cleared' : ''}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="muted" style={{ fontSize: 11 }}>less</span>
        <div className="heatmap-cell" />
        <div className="heatmap-cell active" style={{ opacity: 0.4 }} />
        <div className="heatmap-cell active" style={{ opacity: 0.7 }} />
        <div className="heatmap-cell active" />
        <span className="muted" style={{ fontSize: 11 }}>cleared</span>
      </div>
    </div>
  );
}
