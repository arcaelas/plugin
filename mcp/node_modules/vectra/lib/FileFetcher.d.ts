import { TextFetcher } from './types';
export declare class FileFetcher implements TextFetcher {
    fetch(uri: string, onDocument: (uri: string, text: string, docType?: string | undefined) => Promise<boolean>): Promise<boolean>;
}
//# sourceMappingURL=FileFetcher.d.ts.map