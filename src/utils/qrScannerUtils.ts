
import jsQR from 'jsqr';

/**
 * Extract QRIS code from an image
 * @param imageDataUrl The base64 data URL of the image
 * @returns The extracted QRIS code or null if not found
 */
export const extractQRCodeFromImage = (imageDataUrl: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Create a canvas element to draw the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);

        // Get the image data from canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use jsQR to detect QR code in the image
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          // Return the decoded QR code data
          resolve(code.data);
        } else {
          // No QR code found
          resolve(null);
        }
      };

      img.onerror = (error) => {
        reject(new Error(`Failed to load image: ${error}`));
      };

      // Set the source of the image to the data URL
      img.src = imageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Validate if a string is a valid QRIS code
 * Basic validation: checks if it starts with '00020101' which is the QRIS header
 */
export const isValidQRISCode = (qrisCode: string): boolean => {
  return qrisCode.startsWith('00020101');
};
