export type Cache = {
  /** Все текущие файлы */
  files: Map<string, FileCache>;

  /** Все папки, в которых есть хотя бы 1 файл */
  fileFolders: Map<string, Map<string, FileCache>>;
};

export type FileCache = {
  absPath: string;
  isModule: boolean;
};

declare const moduleTreeCache: Cache;
