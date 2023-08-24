import React from "react";
import {DropzoneOptions, ErrorCode, useDropzone} from "react-dropzone";
import Image from "next/image";

interface UploadFilesProps extends DropzoneOptions {
    initialValues: File[];
    onFiles: (files: File[]) => void;
    accept: {};
    isMultiple?: boolean
}

const UploadFile: React.FC<UploadFilesProps> = ({
                                                    initialValues,
                                                    onFiles,
                                                    accept,
                                                    maxSize = 5242880,
                                                    minSize = 512000,
                                                    isMultiple = true,
                                                    ...dropzoneOptions
                                                }) => {
    const [files, setFiles] = React.useState<File[]>(initialValues || []);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        acceptedFiles,
        fileRejections,
    } = useDropzone({
        accept: accept,
        maxSize: maxSize,
        minSize: minSize,
        multiple: isMultiple,
        ...dropzoneOptions,
        disabled: (!isMultiple && files.length > 0)

    });

    React.useEffect(() => {
        if (acceptedFiles.length > 0 && ((!isMultiple && files.length === 0) || isMultiple)) {
            setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
        }
    }, [acceptedFiles, onFiles]);

    React.useEffect(() => {
        onFiles(files);
    }, [files, onFiles]);


    const handleRemoveFile = (fileToRemove: File) => {
        setFiles((prevFiles) =>
            prevFiles.filter((file) => file !== fileToRemove)
        );
    };

    const handleDownloadFile = (file: File) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const errorMessage = (error: { code: string, message: string | null }) => {
        let errorMessage = '';
        switch (error.code) {
            case ErrorCode.FileInvalidType:
                const extensions = error.message?.split(',').map((item) => {
                    return item.split('.')[1];
                }).filter(s => s !== undefined) || [];
                errorMessage = 'File type must be .' + extensions.join(', .');
                break;
            case ErrorCode.FileTooLarge:
            case ErrorCode.FileTooSmall:
                const bytesRegex = /\d+/;
                const bytes = parseInt(error.message?.match(bytesRegex)?.[0] || '0');
                const megabytes = (bytes / (1024 * 1024)).toFixed(1);
                errorMessage = error.message?.replace(bytesRegex, megabytes + " MB").replace('bytes', '') || '';
                break;
            case ErrorCode.TooManyFiles:
                errorMessage = error.message || '';
                break;
        }

        return errorMessage;
    }


    return (
        <>
            <div {...getRootProps()} className={`input__wrapper`}>
                <input {...getInputProps()} disabled={!isMultiple && files.length > 0}/>
                {isDragActive && <p>Drop files here...</p>}
                {!isDragActive && (
                    <label htmlFor="input__file"
                           className={`input__file-button ${!isMultiple && files.length ? 'disabled' : ''}`}>
                        {!isMultiple && files.length ? (
                            <>
                                {files.map((file) => (
                                    <span key={file.name} className="input__file-name selected">
                                        <span title={file.name}>{file.name}</span>
                                    </span>
                                ))}
                            </>
                        ) : (
                            <>
                                <span className="input__file-icon">
                                    <Image className="input__file-icon"
                                           src="img/upload.svg"
                                           width={24}
                                           height={25}
                                           alt="Upload"/>
                                </span>
                                <span className="input__file-text">Click to Upload</span>
                            </>
                        )}

                    </label>
                )}
            </div>


            {fileRejections.map((item, i) => {
                return (
                    <>
                        {item.errors.map((error, j) => (
                            <div key={`${i}-${j}`} className="error-message-dropzone">{errorMessage(error)}</div>
                        ))}
                    </>
                )
            })}


            <div className="file-list files-wrapper active">
                {files.map((file) => (
                    <div key={file.name} className="file-item">
                        <span className="file-item__name" title={file.name}>{file.name}</span>
                        <div className="file-actions">
                            <button className="file-item__download"
                                    onClick={() => handleDownloadFile(file)}>
                            </button>
                            <button
                                onClick={() => handleRemoveFile(file)}>
                                <i className="icon-x"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default UploadFile;
