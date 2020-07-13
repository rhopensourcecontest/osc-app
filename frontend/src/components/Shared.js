/**
 * Formats date to DateString or "TBD"
 * 
 * @param {string} date
 * @returns {string}
 */
export const formatDateOutput = (date) => {
  return new Date(date) < new Date()
    ? "TBD"
    : new Date(date).toDateString();
};
