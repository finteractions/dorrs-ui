function PDF(fileName: string) {
    window.location.href = `/api/download-pdf?filename=${encodeURIComponent(fileName)}`;
}

function download(fileName: string, content: string, fileType: string) {
    fetch(`/api/download-${fileType}?filename=${encodeURIComponent(fileName)}`, {
        method: 'POST',
        headers: {
            'Content-Type': fileType,
        },
        body: content,
    })
        .then((response) => response.blob())
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.${fileType}`;
            link.click();

            URL.revokeObjectURL(url);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function CSV(fileName: string, content: string) {
    download(fileName, content, 'csv');
}

function XLSX(fileName: string, content: string) {
    download(fileName, content, 'xlsx');
}


const downloadFile = {
    PDF,
    CSV,
    XLSX
}

export default downloadFile
