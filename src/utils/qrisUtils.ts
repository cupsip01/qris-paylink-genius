/**
 * QRIS Utility functions to convert static QRIS to dynamic QRIS with embedded amount
 */

/**
 * Pads a number with leading zeros if it's less than 10
 */
function pad(number: string | number): string {
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
function getBetween(str: string, start: string, end: string): string {
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
    let nmid = "";
    if (qris.includes("ID10")) {
      nmid = "ID" + getBetween(qris, "ID10", qris.includes("0303") ? "0303" : "03");
    } else if (qris.includes("15ID")) {
      nmid = "ID" + getBetween(qris, "15ID", "03");
    } else {
      const idMatch = qris.match(/ID(\d+)/);
      nmid = idMatch ? "ID" + idMatch[1] : "";
    }
    
    // Determine ID type
    const id = qris.includes("A01") ? "A01" : "01";
    
    // Extract Merchant Name
    let merchantName = "";
    if (qris.includes("5910")) {
      merchantName = getBetween(qris, "5910", "60");
    } else if (qris.includes("59")) {
      const matches = qris.match(/59(\d{2})([^0-9]{2,})/);
      if (matches && matches.length > 2) {
        const lengthStr = matches[1];
        const length = parseInt(lengthStr, 10);
        merchantName = matches[2].substring(0, length);
      }
    }
    
    return {
      nmid,
      merchantName: merchantName.trim().toUpperCase() || "Jedo Store",
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
    if (!qris) throw new Error('QRIS string is required');
    if (!amount) throw new Error('Amount is required');
    
    // Remove CRC (last 4 characters)
    const qrisWithoutCRC = qris.slice(0, -4);
    
    // Change version from "0211" to "0212" for dynamic QRIS
    let qrisModified = qrisWithoutCRC.replace("010211", "010212");
    
    // Split on "5802ID"
    const qrisParts = qrisModified.split("5802ID");
    
    // Prepare amount field
    const amountStr = amount.toString();
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
    
    // Create final QRIS string
    const newQris = qrisParts[0] + combinedField + qrisParts[1];
    
    // Calculate and append CRC16 checksum
    return newQris + calculateCRC16(newQris);
  } catch (error) {
    console.error("Error converting QRIS:", error);
    throw new Error("Failed to convert QRIS code");
  }
}

/**
 * Generate QR image URL from a dynamic QRIS string
 */
export function generateQRImageFromQRIS(qrisData: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisData)}`;
}
