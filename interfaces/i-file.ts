interface IFile {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    webkitRelativePath: string;
    content?: any;
}
