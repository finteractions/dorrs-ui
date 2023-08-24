import React, {SyntheticEvent} from 'react';
import UploadFile from "@/components/upload-file";
import Modal from "@/components/modal";
import Link from "next/link";
import fileService from "@/services/file/file-service";
import Image from "next/image";
import kycService from "@/services/kyc/kyc-service";
import AlertBlock from "@/components/alert-block";
import {AGREEMENT} from "@/constants/settings";
import downloadFile from "@/services/download-file/download-file";


interface RegistrationSignDMCCAgreementFormState extends IState, IModalState, IUploadFileState {
    isContinue: boolean;
}

let initialValues: Array<File>;

class RegistrationSignDMCCAgreementForm extends React.Component<{ onCallback: (values: any, nextStep: boolean) => void, initialValues?: Array<IFile> }, RegistrationSignDMCCAgreementFormState> {

    state: RegistrationSignDMCCAgreementFormState;

    constructor(props: ICallback) {
        super(props);

        this.state = {
            success: false,
            isOpenModal: false,
            uploadFile: [],
            isContinue: false
        };

        if (this.props.initialValues && Array.isArray(this.props.initialValues)) {
            initialValues = new Array<File>();
            // this.props.initialValues.forEach(s => initialValues.push(fileService.createFile(s)));
        }

        this.handleModal = this.handleModal.bind(this);
        this.handleFiles = this.handleFiles.bind(this);
    }

    async onCallback(nextStep: boolean) {
        let filesSave: Array<IFile> = new Array<IFile>();
        for (const s of this.state.uploadFile) {
            await fileService.readFile(s).then((content: any) => {
                filesSave.push(new class implements IFile {
                    lastModified = s.lastModified;
                    name = s.name;
                    size = s.size;
                    type = s.type;
                    webkitRelativePath = s.webkitRelativePath;
                    // content = content
                })
            });
        }

        this.props.onCallback(filesSave, nextStep);
    }

    handleFiles(files: File[]) {
        this.setState({uploadFile: files, isContinue: files.length > 0})
    };

    handleModal() {
        this.setState({isOpenModal: !this.state.isOpenModal});
    }

    handleBack(event: SyntheticEvent) {
        event.preventDefault();
        this.onCallback(false);
    }

    async handleContinue(event: SyntheticEvent) {
        event.preventDefault();
        this.setState({errorMessages: null, isContinue: false})

        const values = new FormData();
        this.getFiles().forEach(f => {
            values.append('sign_dmcc_agreement', f);
        })

        await kycService.addSignDMCCAgreement(values)
            .then((res: any) => {
                this.onCallback(true);
            })
            .catch((error: IError) => {
                this.setState({errorMessages: error.messages})
            })
            .finally(() => this.setState({isContinue: true}))
    }

    getFiles(): File[] {
        return this.state.uploadFile;
    }

    render() {
        return (
            <>
                <div className="sign-up__title mb-48">Sign DMCC Agreement</div>
                <div className="sign-up__text">Download <Link
                    className="link"
                    href=""
                    onClick={(e) => {
                        e.preventDefault();
                        downloadFile.PDF(AGREEMENT)
                    }}
                    download
                >
                    Client Agreement
                </Link>, sign and upload
                </div>
                <UploadFile
                    initialValues={initialValues}
                    onFiles={this.handleFiles}
                    accept={
                        {
                            'application/pdf': ['.pdf'],
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/png': ['.png']
                        }
                    }
                    isMultiple={false}
                />
                <div className="sign-up__terms  modal-link" onClick={this.handleModal}>
                    <Image src="/img/info.svg" width={16} height={16} alt="Info"/>
                    Terms for uploading files
                </div>

                {this.state.errorMessages && (
                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                )}

                <button
                    className={`b-btn ripple ${this.state.uploadFile.length === 0 || !this.state.isContinue ? 'disable' : ''}`}
                    type="button"
                    disabled={this.state.uploadFile.length === 0 || !this.state.isContinue}
                    onClick={(event) => this.handleContinue(event)}
                >Finish Registration
                </button>

                <div className="login__bottom d-none">
                    <p>
                        <i className="icon-chevron-left"/>
                        <Link className="login__link" href=""
                              onClick={(event) => this.handleBack(event)}>
                            Back
                        </Link>
                    </p>
                </div>

                <Modal isOpen={this.state.isOpenModal} onClose={this.handleModal}
                       title="Terms for uploading files">
                    <div className="modal-terms">
                        <p>Here are some tips and best practices for taking and uploading photos/scans of documents
                            that
                            will meet our image requirements especially for identification documents:</p>
                        <ul>
                            <li>Your files must be in jpg, jpeg or png formats.</li>
                            <li>Avoid taking pictures of your Identification (ID) documents under direct light or
                                flash
                                to
                                avoid unclear images.
                            </li>
                            <li>Take the photo directly above the document on a flat surface.
                            </li>
                            <li>Do not obstruct the ID with an object or your fingers.
                            </li>
                            <li>Use a background of a contrasting colour to the document(s).
                            </li>
                            <li>All 4 corners of the document(s) must visibly appear in the photo with allowable
                                around
                                the
                                4 corners of your document(s).
                            </li>
                            <li>Take the photo horizontally for documents and vertically for selfies.
                            </li>
                            <li>The image should not be blurred and all text on the document should be legible.
                            </li>
                            <li>Document size should be no smaller than 0.5 MB and no larger than 5 MB.
                            </li>
                            <li>Image quality settings should be set to the highest quality (Sharpness of at least
                                50
                                and
                                DPI of at least 450).
                            </li>
                        </ul>
                    </div>
                </Modal>
            </>
        );
    }
}

export default RegistrationSignDMCCAgreementForm;
