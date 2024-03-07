import * as fsx from 'fs-extra';
import * as path from 'path';

export type PathDetails = fsx.Stats & {
    baseName: string;
    baseNameWithoutExtension: string;
    dirPath: string;
    dirName: string;
    extension: string;
    basePath: string;
    relativePath: string;
};

export type WithParsedPathDetails = PathDetails & {
    parsedBasePath: string;
    parsedRelativePath: string;
};

const getStats = (basePath: string, relativeTo?: string): PathDetails | undefined => {
    if (!fsx.existsSync(basePath)) return;
    const stats = fsx.statSync(basePath);
    return {
        ...stats,
        isFile: () => stats.isFile(),
        isDirectory: () => stats.isDirectory(),
        extension: path.extname(basePath),
        basePath: basePath.replaceAll("\\", "/"),
        baseName: path.basename(basePath),
        baseNameWithoutExtension: path.basename(basePath, path.extname(basePath)),
        dirPath: path.dirname(basePath).replaceAll("\\", "/"),
        dirName: path.basename(path.dirname(basePath)),
        relativePath: relativeTo ? path.relative(relativeTo, basePath).replaceAll("\\", "/") : basePath
    };
};

type Options = { relativeTo?: string; excludeFile?: string[]; excludeFolder?: string[]; level?: number; withFolders?: boolean; withFiles?: boolean };

const getPathsList = (basePath: string, options: Options = {} as Options): PathDetails[] => {
    const { relativeTo, excludeFile = [], excludeFolder = [], level = -1, withFolders = true, withFiles = true } = options;
    const stats = getStats(basePath, relativeTo);
    if (!stats) return [];
    if (stats.isFile() && withFiles && excludeFile.indexOf(stats.basePath) < 0) return [stats];
    if (stats.isDirectory() && excludeFolder.indexOf(stats.basePath) < 0) {
        let filesList: PathDetails[] = withFolders ? [stats] : [];
        if (level !== 0) {
            const files = fsx.readdirSync(stats.basePath).filter((file) => excludeFolder.indexOf(file) < 0);
            filesList = files.reduce((res: PathDetails[], file: string) => {
                return res.concat(getPathsList(path.join(stats.basePath, file).replaceAll("\\", "/"), { ...options, level: level - 1 }));
            }, filesList);
        }
        return filesList;
    }
    return [];
};

export { getPathsList, getStats };

