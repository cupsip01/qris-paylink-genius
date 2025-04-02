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
    // Extract National Merchant ID - Improved parsing to work with various formats
    let nmid = "";
    if (qris.includes("ID10")) {
      nmid = "ID" + getBetween(qris, "ID10", qris.includes("0303") ? "0303" : "03");
    } else if (qris.includes("15ID")) {
      nmid = "ID" + getBetween(qris, "15ID", "03");
    } else {
      // Generic fallback
      const idMatch = qris.match(/ID(\d+)/);
      nmid = idMatch ? "ID" + idMatch[1] : "";
    }
    
    // Determine ID type
    const id = qris.includes("A01") ? "A01" : "01";
    
    // Extract Merchant Name - Updated to better handle merchant name extraction
    let merchantName = "";
    
    // Try to find using 59 tag which is merchant name
    if (qris.includes("5910")) {
      merchantName = getBetween(qris, "5910", "60");
    } else if (qris.includes("59")) {
      // This is a more generic approach for other formats
      const matches = qris.match(/59(\d{2})([^0-9]{2,})/);
      if (matches && matches.length > 2) {
        const lengthStr = matches[1];
        const length = parseInt(lengthStr, 10);
        merchantName = matches[2].substring(0, length);
      }
    }
    
    // Clean the merchant name
    merchantName = merchantName.trim().toUpperCase();
    
    return {
      nmid,
      merchantName: merchantName || "Jedo Store", // Default if not found
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
    
    // If the format has not been changed, it might be already dynamic or using a different format
    if (qrisModified === qrisWithoutCRC && qrisWithoutCRC.includes("0101")) {
      // Try other known formats
      qrisModified = qrisWithoutCRC.replace("0101", "0102");
    }
    
    // Split on "5802ID" which comes before the country info
    const qrisParts = qrisModified.split("5802ID");
    
    // If the split didn't work, try another approach
    if (qrisParts.length < 2) {
      // Try to find a position to insert amount field
      const countryIndex = qrisModified.indexOf("02ID");
      if (countryIndex !== -1) {
        // Insert amount before country code
        const amountField = "54" + pad(amountStr.length) + amountStr;
        const taxField = fee !== '0' ? 
          (taxtype === 'p' ? "55020357" + pad(fee.length) + fee : "55020256" + pad(fee.length) + fee) : 
          "";
          
        const newQris = qrisModified.substring(0, countryIndex) + 
                         amountField + taxField + 
                         qrisModified.substring(countryIndex);
                         
        return newQris + calculateCRC16(newQris);
      }
    }
    
    // Prepare amount field: "54" + (length of amount as 2 digits) + (amount)
    const amountField = "54" + pad(amountStr.length) + amountStr;
    
    // Prepare tax field if needed
    let taxField = '';
    if (fee !== '0') {
      taxField = taxtype === 'p'
        ? "55020357" + pad(fee.length) + fee
        : "55020256" + pad(fee.length) + fee;
    }
    
    if (qrisParts.length >= 2) {
      // Standard case - combine fields
      const combinedField = amountField + (taxField ? taxField : "") + "5802ID";
      
      // Combine parts with the amount and tax fields
      const newQris = qrisParts[0] + combinedField + qrisParts[1];
      
      // Calculate and append CRC16 checksum
      const finalQris = newQris + calculateCRC16(newQris);
      
      return finalQris;
    } else {
      // Fallback for different QRIS formats
      console.warn("Using fallback QRIS conversion strategy");
      
      // Try to identify where to insert amount
      const merchantIndex = qrisModified.indexOf("59");
      if (merchantIndex !== -1) {
        // Insert amount before merchant info
        const beforeMerchant = qrisModified.substring(0, merchantIndex);
        const afterMerchant = qrisModified.substring(merchantIndex);
        
        const newQris = beforeMerchant + amountField + (taxField ? taxField : "") + afterMerchant;
        return newQris + calculateCRC16(newQris);
      }
      
      // Last resort - append to end before calculating CRC
      const newQris = qrisModified + amountField + (taxField ? taxField : "");
      return newQris + calculateCRC16(newQris);
    }
  } catch (error) {
    console.error("Error converting QRIS:", error);
    throw new Error("Failed to convert QRIS code");
  }
}

/**
 * Generate QR code image from QRIS string
 */
export async function generateQRImageFromQRIS(qris: string): Promise<string> {
  try {
    const response = await fetch('https://api.qrserver.com/v1/create-qr-code/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(qris)}&size=300x300&margin=1&format=png`
    });

    if (!response.ok) {
      throw new Error("Failed to generate QR code");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating QR image:", error);
    throw error;
  }
}
