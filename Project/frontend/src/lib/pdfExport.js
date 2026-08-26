/**
 * Utility to trigger print/PDF export for Passports, Comparisons, and Profiles.
 */
export function exportToPdf(title = 'PathSeeker Document') {
  const originalTitle = document.title
  try {
    document.title = title
    window.print()
  } finally {
    document.title = originalTitle
  }
}

export default exportToPdf
