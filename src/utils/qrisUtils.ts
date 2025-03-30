
/**
 * QRIS Utility functions to convert static QRIS to dynamic QRIS with embedded amount
 */

/**
 * Pads a number with leading zeros if it's less than 10
 */
function pad(number: number | string): string {
  const num = number.toString();
  return num.length < 2 ? '0' + num : num;
}

/**
 * Calculates CRC16 checksum for a QRIS string
 */
function calculateCRC16(input: string): string {
  function charCodeAt(str: string, i: number): number {
    return str.charCodeAt(i);
  }
  
  let crc = 0xFFFF;
  
  for (let i = 0; i < input.length; i++) {
    crc ^= charCodeAt(input, i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  
  let hex = (crc & 0xFFFF).toString(16).toUpperCase();
  return hex.length === 3 ? "0" + hex : hex;
}

/**
 * Gets text between two substrings
 */
function getTextBetween(str: string, start: string, end: string): string {
  const startIdx = str.indexOf(start);
  if (startIdx === -1) return "";
  
  const actualStartIdx = startIdx + start.length;
  const endIdx = str.indexOf(end, actualStartIdx);
  
  return endIdx !== -1 
    ? str.slice(actualStartIdx, endIdx) 
    : str.slice(actualStartIdx);
}

/**
 * Parse QRIS data
 */
export function parseQrisData(qris: string): {
  nmid: string;
  merchantName: string;
  id: string;
} {
  try {
    // Extract National Merchant ID
    const nmid = "ID" + getTextBetween(qris, "15ID", "0303");
    
    // Determine ID type
    const id = qris.includes("A01") ? "A01" : "01";
    
    // Extract Merchant Name
    const merchantName = getTextBetween(qris, "ID59", "60").substring(2).trim().toUpperCase();
    
    return {
      nmid,
      merchantName,
      id
    };
  } catch (error) {
    console.error("Error parsing QRIS data:", error);
    return {
      nmid: "",
      merchantName: "Unknown Merchant",
      id: "01"
    };
  }
}

/**
 * Convert static QRIS to dynamic QRIS with embedded amount
 * @param qris The static QRIS string
 * @param amount The amount to be embedded in the QRIS
 * @param taxtype The type of tax (p for percentage, r for rupiah)
 * @param fee The fee amount
 * @returns The dynamic QRIS string with embedded amount
 */
export function convertStaticToDynamicQRIS(
  qris: string, 
  amount: number | string,
  taxtype: 'p' | 'r' = 'p',
  fee: string = '0'
): string {
  try {
    if (!qris) throw new Error('The QRIS string is required');
    if (!amount) throw new Error('The amount is required');
    
    // Convert amount to string if it's a number
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;
    
    // Remove the CRC (last 4 characters)
    const qrisWithoutCRC = qris.slice(0, -4);
    
    // Change the version from "0211" to "0212" for dynamic QRIS
    let qrisModified = qrisWithoutCRC.replace("010211", "010212");
    
    // Split on "5802ID" which comes before the country info
    const qrisParts = qrisModified.split("5802ID");
    
    // Prepare amount field: "54" + (length of amount as 2 digits) + (amount)
    const amountField = "54" + pad(amountStr.length) + amountStr;
    
    // Prepare tax field if needed
    let taxField = '';
    if (fee !== '0') {
      taxField = taxtype === 'p'
        ? "55020357" + pad(fee.length) + fee
        : "55020256" + pad(fee.length) + fee;
    }
    
    // Combine fields
    const combinedField = amountField + (taxField ? taxField : "") + "5802ID";
    
    // Combine parts with the amount and tax fields
    const newQris = qrisParts[0] + combinedField + qrisParts[1];
    
    // Calculate and append CRC16 checksum
    const finalQris = newQris + calculateCRC16(newQris);
    
    return finalQris;
  } catch (error) {
    console.error("Error converting QRIS:", error);
    throw new Error("Failed to convert QRIS code");
  }
}
