
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
  let crc = 0xFFFF;
  
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
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
} {
  try {
    // Extract National Merchant ID
    const nmid = "ID" + getTextBetween(qris, "15ID", "0303");
    
    // Extract Merchant Name
    const merchantName = getTextBetween(qris, "ID59", "60").substring(2).trim();
    
    return {
      nmid,
      merchantName
    };
  } catch (error) {
    console.error("Error parsing QRIS data:", error);
    return {
      nmid: "",
      merchantName: ""
    };
  }
}

/**
 * Convert static QRIS to dynamic QRIS with embedded amount
 */
export function convertStaticToDynamicQRIS(qris: string, amount: number): string {
  try {
    // Remove the CRC (last 4 characters)
    const qrisWithoutCRC = qris.slice(0, -4);
    
    // Change the version from "0211" to "0212" for dynamic QRIS
    let qrisModified = qrisWithoutCRC.replace("010211", "010212");
    
    // Split on "5802ID" which comes before the country info
    const qrisParts = qrisModified.split("5802ID");
    
    // Prepare amount field
    // Format: "54" + (length of amount as 2 digits) + (amount)
    const amountStr = amount.toString();
    const amountField = "54" + pad(amountStr.length) + amountStr;
    
    // Combine parts with the amount field
    const newQris = qrisParts[0] + amountField + "5802ID" + qrisParts[1];
    
    // Calculate and append CRC16 checksum
    const finalQris = newQris + calculateCRC16(newQris);
    
    return finalQris;
  } catch (error) {
    console.error("Error converting QRIS:", error);
    throw new Error("Failed to convert QRIS code");
  }
}
