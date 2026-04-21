declare module "@neslinesli93/qpdf-wasm" {
  interface QpdfModuleOptions {
    locateFile?: (path: string, prefix?: string) => string;
  }

  type QpdfModuleFactory = (options?: QpdfModuleOptions) => Promise<unknown>;

  const createQpdfModule: QpdfModuleFactory;
  export default createQpdfModule;
}
