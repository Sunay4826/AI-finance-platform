/**
 * Currency formatting utilities for Indian Rupees
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

/**
 * Format a number as Indian Rupees
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, showSymbol = true) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_SYMBOL}0.00` : '0.00';
  }
  
  const formatted = amount.toFixed(2);
  return showSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted;
}

/**
 * Format currency for display in components
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with symbol
 */
export function formatDisplayCurrency(amount) {
  return formatCurrency(amount, true);
}

/**
 * Format currency for form inputs (without symbol)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string without symbol
 */
export function formatInputCurrency(amount) {
  return formatCurrency(amount, false);
}
