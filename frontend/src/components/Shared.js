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

/**
 * Replaces double quotes with '\\"'
 * 
 * @param {string} input
 * @returns {string}
 */
export const escapeQuotes = (input) => {
  return input.replace(/[""]/g, '\\"');
}

/**
 * Replaces new line escapes with '\\n'
 * 
 * @param {string} input
 * @returns {string}
 */
export const replaceNewLines = (input) => {
  return input.split(/\r?\n/).join('\\n');
}

/**
 * Replaces new line escapes with '<br/>'
 * 
 * @param {string} input
 * @returns {string}
 */
export const htmlReplaceNewLines = (input) => {
  return input.split(/\r?\n/).join('<br/>');
}
