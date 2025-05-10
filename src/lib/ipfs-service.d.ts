// Type definitions for IPFS service
declare module 'ipfs-http-client' {
  export function create(options: any): any;
}

declare module 'multiformats/cid' {
  export class CID {
    static parse(cid: string): any;
  }
}
