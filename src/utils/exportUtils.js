function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function escapeCSV(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url, download: filename,
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsCSV(checkIns) {
  const headers = [
    'Date', 'Mood', 'Energy', 'Stress', 'Sleep (hrs)',
    'Study Hours', 'Emotion', 'Exam', 'Journal',
    'Burnout Risk', 'Burnout Score',
  ];

  const rows = checkIns.map(ci => [
    formatDate(ci.date),
    ci.mood,
    ci.energy,
    ci.stress,
    ci.sleep,
    ci.studyHours,
    ci.emotion ?? '',
    ci.exam ?? '',
    escapeCSV(ci.journal ?? ''),
    ci.burnout?.risk ?? '',
    ci.burnout?.score ?? '',
  ]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  downloadFile(csv, 'examMind-journal.csv', 'text/csv;charset=utf-8;');
}

export function exportAsText(checkIns) {
  const sections = checkIns.map(ci => {
    const lines = [
      `=== ${formatDate(ci.date)} ===`,
      `Mood: ${ci.mood}/10  |  Energy: ${ci.energy}/10  |  Stress: ${ci.stress}/10`,
      `Sleep: ${ci.sleep}h  |  Study: ${ci.studyHours}h  |  Emotion: ${ci.emotion ?? '—'}`,
    ];
    if (ci.exam) lines.push(`Exam: ${ci.exam}`);
    if (ci.burnout) lines.push(`Burnout Risk: ${ci.burnout.risk} (score: ${ci.burnout.score}/100)`);
    if (ci.journal?.trim()) lines.push(`\nJournal:\n${ci.journal.trim()}`);
    return lines.join('\n');
  });

  downloadFile(sections.join('\n\n'), 'examMind-journal.txt', 'text/plain;charset=utf-8;');
}
