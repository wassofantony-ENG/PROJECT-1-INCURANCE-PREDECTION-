declare module "xlsx" {
  interface WorkSheet {
    [key: string]: unknown;
    A1?: string;
    "!ref": string;
  }

  interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }

  interface Sheet2JSONOpts {
    header?: string[] | number;
    range?: number;
    defval?: unknown;
    raw?: boolean;
    blankrows?: boolean;
  }

  export function read(data: unknown, opts?: Record<string, unknown>): WorkBook;
  export function utils: {
    sheet_to_json<T = Record<string, unknown>>(
      sheet: WorkSheet,
      opts?: Sheet2JSONOpts
    ): T[];
  };
}
