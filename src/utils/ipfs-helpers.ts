// Helper functions for working with IPFS

// Convert a file to a base64 string
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

// Convert a base64 string to a Blob
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

// Split a file into chunks
export async function splitFileIntoChunks(file: File, chunkSize: number = 1024 * 1024): Promise<Blob[]> {
  const chunks: Blob[] = [];
  let offset = 0;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }
  
  return chunks;
}

// Convert IPFS URL to HTTP gateway URL
export function ipfsToHttpUrl(ipfsUrl: string): string {
  if (!ipfsUrl) return '';
  
  // If already an HTTP URL, return as is
  if (ipfsUrl.startsWith('http')) {
    return ipfsUrl;
  }
  
  // Convert ipfs:// URL to HTTP gateway URL
  if (ipfsUrl.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${ipfsUrl.replace('ipfs://', '')}`;
  }
  
  // If just a CID, add gateway prefix
  if (/^[a-zA-Z0-9]{46}$/.test(ipfsUrl)) {
    return `https://ipfs.io/ipfs/${ipfsUrl}`;
  }
  
  return ipfsUrl;
}

// Check if a URL is an IPFS URL
export function isIpfsUrl(url: string): boolean {
  return url.startsWith('ipfs://') || url.includes('ipfs.io/ipfs/');
}

// Extract CID from an IPFS URL
export function extractCidFromIpfsUrl(url: string): string | null {
  if (!url) return null;
  
  // Match ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }
  
  // Match HTTP gateway URL
  const gatewayMatch = url.match(/ipfs\.io\/ipfs\/([a-zA-Z0-9]+)/);
  if (gatewayMatch && gatewayMatch[1]) {
    return gatewayMatch[1];
  }
  
  return null;
}
