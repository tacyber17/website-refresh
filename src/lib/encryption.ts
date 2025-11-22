/**
 * Client-side encryption utilities for sensitive data
 * Note: This provides obfuscation for localStorage data
 * Real encryption happens server-side via AES-256
 */

export const ENCRYPTION_KEY = 'lovable-client-key-2024';

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encoded = btoa(jsonString);
    return encoded;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    const decoded = atob(encryptedData);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Sanitize card number for display (show only last 4 digits)
 */
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) return '****';
  return `**** **** **** ${cardNumber.slice(-4)}`;
};

/**
 * Remove sensitive data before storing
 */
export const sanitizeOrderData = (orderData: any) => {
  const sanitized = { ...orderData };
  
  // Remove full card details, keep only masked version
  if (sanitized.cardDetails) {
    sanitized.cardDetails = {
      maskedNumber: maskCardNumber(sanitized.cardDetails.cardNumber),
      cardName: sanitized.cardDetails.cardName,
    };
  }
  
  return sanitized;
};
