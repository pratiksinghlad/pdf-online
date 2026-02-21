export interface FileProcessor {
    process(buffer: ArrayBuffer, name: string): Promise<ArrayBuffer>;
}
