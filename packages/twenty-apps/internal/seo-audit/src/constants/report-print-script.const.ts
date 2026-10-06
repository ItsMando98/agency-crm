// Kept as a constant so the report route can allow exactly this script in its
// Content-Security-Policy.
export const REPORT_PRINT_SCRIPT =
  "document.getElementById('print-report')?.addEventListener('click', function () { window.print(); });";
