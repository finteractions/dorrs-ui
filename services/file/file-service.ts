function readFile(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(blob);
        fileReader.onload = () => {
            const fileContent = fileReader.result;
            if (typeof fileContent === "string") {
                resolve(fileContent);
            } else {
                reject('');
            }
        };
        fileReader.onerror = (e) => {
            reject('');
        };
    });
}

function createFile(file: IFile): File {
    const arr = file.content.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const uint8Array = new Uint8Array(n);
    while (n--) {
        uint8Array[n] = bstr.charCodeAt(n);
    }
    return new File([uint8Array], file.name, { type: mime });
}

// function createFileFromExternal(path:string): File {
//     // const arr = file.content.split(",");
//     // const mime = path.match(/:(.*?);/)[1];
//     // const bstr = atob(arr[1]);
//     // let n = bstr.length;
//     // const uint8Array = new Uint8Array(n);
//     // while (n--) {
//     //     uint8Array[n] = bstr.charCodeAt(n);
//     // }
//     // return new File([uint8Array], file.name, { type: mime });
//     return new File(null, {})
// }

const fileService = {
    readFile,
    createFile
}

export default fileService;
