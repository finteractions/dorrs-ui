import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import {FormFieldOptionType, getFormFieldOptionTypeName} from "@/enums/form-field-option-type";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {ISocialMediaLink, socialMediaLinks} from "@/interfaces/i-social-media-link";


const allowedFileSizeMB = 1
const allowedFileSize = allowedFileSizeMB * 1024 * 1024;
const allowedExt = ['png', 'jpg', 'jpeg']

const socialMediaLinkSchema = Yup.object().test(
    'is-url-object',
    'Invalid URL format',
    (value) => {
        if (!value) {
            return true;
        }
        return Object.values(value).every((url) => {
            if (typeof url !== 'string') {
                return false;
            }
            return Yup.string().url().isValidSync(url);
        });
    }
);

const formSchema = Yup.object().shape({
    name: Yup.string().min(3).required('Required').label('Name'),
    website_link: Yup.string().url('Invalid URL').label('Website Link'),
    fees_link: Yup.string().url('Invalid URL').label('Fees Link'),
    social_media_link: Yup.object().shape({
        "linked-in": Yup.string().url('Invalid URL').label('LinkedIn'),
        "x-twitter": Yup.string().url('Invalid URL').label('Twitter'),
    }),
    logo_tmp: Yup.mixed()
        .test('logo_tmp', `File is not a valid image. Only ${allowedExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('logo_tmp', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedFileSize;
        }),
    image_tmp: Yup.mixed()
        .test('asset_type_image', `File is not a valid image. Only ${allowedExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('asset_type_image', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedFileSize;
        }),

});

interface DataFeedProviderState extends IState {
    formInitialValues: any,
    loading: boolean;
    isDeleting: boolean;
    selectedFile: File | null;
    selectedFileAssetTypeLogo: File | null;
}

interface DataFeedProviderProps extends ICallback {
    action: string;
    dataFeedProviderData: IDataFeedProvider | null;
    dataFeedProviderLinks: ISettings[];
    onCancel?: () => void;
}

class DataFeedProviderForm extends React.Component<DataFeedProviderProps, DataFeedProviderState> {

    state: DataFeedProviderState;
    host = `${window.location.protocol}//${window.location.host}`;

    constructor(props: DataFeedProviderProps) {
        super(props);

        const initialData = this.props.dataFeedProviderData || {} as IDataFeedProvider;

        let socialLinks = [...socialMediaLinks];

        const socials = JSON.parse(initialData?.social_media_link || this.props.dataFeedProviderData?.social_media_link || '{}')

        Object.keys(socials).forEach((soc: any) => {
            let social = socialLinks.find(s => s.key === soc)
            if (social) {
                social.link = socials[soc];
            }
        })


        const initialValues: {
            name: string;
            logo: string;
            website_link: string;
            social_media_link: string;
            fees_link: string;
            option: string;
            description: string;
            image: string;
            socials: any;
        } = {
            name: initialData?.name || this.props.dataFeedProviderData?.name || '',
            logo: initialData?.logo || this.props.dataFeedProviderData?.logo || '',
            website_link: initialData?.website_link || this.props.dataFeedProviderData?.website_link || '',
            fees_link: initialData?.fees_link || this.props.dataFeedProviderData?.fees_link || '',
            social_media_link: socials,
            option: initialData?.option || this.props.dataFeedProviderData?.option || '',
            description: initialData?.description || this.props.dataFeedProviderData?.description || '',
            image: initialData?.image || this.props.dataFeedProviderData?.image || '',
            socials: socialLinks
        };

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isDeleting: false,
            selectedFile: null,
            selectedFileAssetTypeLogo: null,
        };
    }

    handleSubmit = async (values: IDataFeedProvider, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {

        this.setState({errorMessages: null});
        const formData = new FormData();
        for (const [key, value] of Object.entries(values)) {
            formData.append(key, value);
        }

        formData.delete('logo');
        formData.delete('logo_tmp');
        formData.delete('image');
        formData.delete('image_tmp');
        formData.delete('social_media_link');

        const socials = values.social_media_link;

        formData.append('social_media_link', JSON.stringify(values.social_media_link));

        if (this.state.selectedFileAssetTypeLogo) {
            formData.append('image', this.state.selectedFileAssetTypeLogo);
        }


        if (this.state.selectedFile) {
            formData.append('logo', this.state.selectedFile);
        }

        const request: Promise<any> = this.props.action == 'edit' ?
            adminService.updateDataFeedProvider(this.props.dataFeedProviderData?.id || 0, formData) :
            adminService.createDataFeedProvider(formData);

        await request
            .then(((res: any) => {
                this.props.onCallback(formData);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                setSubmitting(false);
            });
    };

    handleDelete = async (values: any) => {
        this.setState({isDeleting: true});
        await adminService.deleteDataFeedProvider(values.id)
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    }

    isShow(): boolean {
        return this.props.action === 'view';
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFile: selectedFile});
    };

    handleFileAssetLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFileAssetTypeLogo: selectedFile});
    };

    render() {
        switch (this.props.action) {
            case 'add':
            case 'edit':
                return (
                    <>

                        {this.state.loading ? (
                            <LoaderBlock/>
                        ) : (
                            <>
                                <Formik<IDataFeedProvider>
                                    initialValues={this.state.formInitialValues as IDataFeedProvider}
                                    validationSchema={formSchema}
                                    onSubmit={this.handleSubmit}
                                >
                                    {({initialValues, isSubmitting, setFieldValue, isValid, dirty, values, errors}) => {
                                        return (
                                            <Form id="firm-form">

                                                <div className="input">
                                                    <div className="input__title">Name <i>*</i></div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="name"
                                                            id="name"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Name"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="name" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>


                                                {(this.isShow() && initialValues?.logo) && (
                                                    <div
                                                        className={"input d-flex justify-content-center company-profile-logo"}>
                                                        <img src={initialValues?.logo} alt="Logo"/>
                                                    </div>
                                                )}
                                                {!this.isShow() && (
                                                    <div className="input">
                                                        <div className="input__title">Logo</div>
                                                        <div className="input__wrap">
                                                            <input
                                                                id="logo_tmp"
                                                                name="logo_tmp"
                                                                type="file"
                                                                accept={'.' + allowedExt.join(',.')}
                                                                className="input__file"
                                                                disabled={isSubmitting}
                                                                onChange={(event) => {
                                                                    setFieldValue('logo_tmp', event.target?.files?.[0] || '');
                                                                    this.handleFileChange(event);
                                                                }}
                                                            />
                                                            {errors.logo_tmp && (
                                                                <div
                                                                    className="error-message">{errors.logo_tmp.toString()}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="input">
                                                    <div className="input__title">Website Link</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="website_link"
                                                            id="website_link"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Website Link"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="website_link" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Fees</div>
                                                    <div
                                                        className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                        <Field
                                                            name="fees_link"
                                                            id="fees_link"
                                                            type="text"
                                                            className="input__text"
                                                            placeholder="Type Fees Link"
                                                            disabled={isSubmitting || this.isShow()}
                                                        />
                                                        <ErrorMessage name="fees_link" component="div"
                                                                      className="error-message"/>
                                                    </div>
                                                </div>

                                                <div className="input">
                                                    <div className="input__title">Social Media Links</div>
                                                </div>

                                                {values.socials.map((social: ISocialMediaLink) => (
                                                    <div key={social.key} className="input">
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name={`social_media_link.${social.key}`}
                                                                id={`social_media_link.${social.key}`}
                                                                type="text"
                                                                className="input__text"
                                                                placeholder={`Type Link for ${social.name}`}
                                                                disabled={isSubmitting || this.isShow()}
                                                            />
                                                            <ErrorMessage name={`social_media_link.${social.key}`}
                                                                          component="div"
                                                                          className="error-message"/>
                                                            <div className={'icon-block icon-block-show'}
                                                                 dangerouslySetInnerHTML={{__html: social?.icon || ''}}/>
                                                        </div>
                                                    </div>
                                                ))}


                                                <div className="input">
                                                    <h4 className="input__group__title">Description of the
                                                        Provider:</h4>

                                                    <div className="input">
                                                        <div className="input__title">Choose either a Free Text Box
                                                            or Upload Image Option
                                                        </div>
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <Field
                                                                name="option"
                                                                id="option"
                                                                as="select"
                                                                className="b-select"
                                                                disabled={isSubmitting || this.isShow()}
                                                            >
                                                                <option value="">Select</option>
                                                                {Object.values(FormFieldOptionType).map((type) => (
                                                                    <option key={type} value={type}>
                                                                        {getFormFieldOptionTypeName(type as FormFieldOptionType)}
                                                                    </option>
                                                                ))}
                                                            </Field>
                                                        </div>
                                                    </div>

                                                    {values.option === FormFieldOptionType.TEXT && (
                                                        <div className="input">
                                                            <div className="input__wrap">
                                                                <Field
                                                                    name="description"
                                                                    id="description"
                                                                    as="textarea"
                                                                    rows="4"
                                                                    className="input__textarea"
                                                                    placeholder=""
                                                                    disabled={isSubmitting}
                                                                />
                                                                <ErrorMessage name="description"
                                                                              component="div"
                                                                              className="error-message"/>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {values.option === FormFieldOptionType.IMAGE && (
                                                        <>
                                                            {(this.isShow() && initialValues?.image) && (
                                                                <div
                                                                    className={"input d-flex justify-content-center company-profile-logo"}>
                                                                    <img src={initialValues?.image}
                                                                         alt="Logo"/>
                                                                </div>
                                                            )}
                                                            {!this.isShow() && (
                                                                <div className="input">
                                                                    <div className="input__wrap">
                                                                        <input
                                                                            id="image_tmp"
                                                                            name="image_tmp"
                                                                            type="file"
                                                                            accept={'.' + allowedExt.join(',.')}
                                                                            className="input__file"
                                                                            disabled={isSubmitting}
                                                                            onChange={(event) => {
                                                                                setFieldValue('image_tmp', event.target?.files?.[0] || '');
                                                                                this.handleFileAssetLogoChange(event);
                                                                            }}
                                                                        />
                                                                        {errors.image_tmp && (
                                                                            <div
                                                                                className="error-message">{errors.image_tmp.toString()}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                </div>

                                                <hr/>
                                                <div className="input">
                                                    <h4 className="input__group__title">Regulation Links:</h4>

                                                    {this.props.dataFeedProviderLinks.map((item: ISettings) => (
                                                        <div key={item.name} className="input__title mb-3">
                                                            <Link className={'link info-panel-title-link'}
                                                                  href={item.value}
                                                                  target={'_blank'}>
                                                                {item.name} <FontAwesomeIcon className="nav-icon"
                                                                                                 icon={faArrowUpRightFromSquare}/>
                                                            </Link>
                                                        </div>
                                                    ))}

                                                </div>


                                                {this.props.action !== 'view' && (
                                                    <button
                                                        className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                        type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                                        Save Data Feed Provider
                                                    </button>
                                                )}

                                                {this.state.errorMessages && (
                                                    <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                                )}
                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </>
                        )
                        }


                    </>
                )
            case 'view':
                return (
                    <>
                        <div className='approve-form'>
                            {this.props.dataFeedProviderData?.created_by && (
                                <div
                                    className={`approve-form-text w-100 ${this.props.dataFeedProviderData?.created_by ? 'pb-1' : ''}`}>
                                    <>
                                        Created
                                        by {this.props.dataFeedProviderData?.created_by} at {formatterService.dateTimeFormat(this.props.dataFeedProviderData?.created_date_time || '')}
                                    </>
                                </div>
                            )}
                        </div>
                        <h2 className={'view_block_main_title'}>
                            {this.props.dataFeedProviderData?.logo && (
                                <div className={"company-profile-logo"}>
                                    <img src={this.props.dataFeedProviderData?.logo} alt="Logo"/>
                                </div>
                            )}

                            {this.props.dataFeedProviderData?.name}
                        </h2>

                        <div className='view_panel'>
                            <div className="view_block">
                                <div className="view_block_body">
                                    <div className="view_block_title">Website Link</div>
                                    <div> {this.props.dataFeedProviderData?.website_link ? (
                                        <Link className={'link info-panel-title-link'}
                                              href={this.props.dataFeedProviderData?.website_link ?? ''}
                                              target={'_blank'}>
                                            {this.props.dataFeedProviderData?.website_link ?? ''} {' '}
                                            <FontAwesomeIcon className="nav-icon"
                                                             icon={faArrowUpRightFromSquare}/>
                                        </Link>
                                    ) : (
                                        <>not filled</>
                                    )}</div>
                                </div>
                            </div>
                            <div className="view_block">
                                <div className="view_block_body">
                                    <div className="view_block_title">Fees</div>
                                    <div> {this.props.dataFeedProviderData?.fees_link ? (
                                        <Link className={'link info-panel-title-link'}
                                              href={this.props.dataFeedProviderData?.fees_link ?? ''}
                                              target={'_blank'}>
                                            {this.props.dataFeedProviderData?.fees_link ?? ''} {' '}
                                            <FontAwesomeIcon className="nav-icon"
                                                             icon={faArrowUpRightFromSquare}/>
                                        </Link>
                                    ) : (
                                        <>not filled</>
                                    )}</div>
                                </div>
                            </div>
                            <div className="view_block full_block">
                                <div className="view_block_body">
                                    <div className="view_block_title">Social Media Links</div>

                                    {(this.state.formInitialValues?.socials as any).map((social: ISocialMediaLink) => (
                                        <div key={social.key} className="d-flex mb-2">
                                            <div className={'icon-block-show'}
                                                 dangerouslySetInnerHTML={{__html: social?.icon || ''}}/>

                                            <div>
                                                {social.link ? (
                                                    <Link className={'link info-panel-title-link'}
                                                          href={social.link ?? ''}
                                                          target={'_blank'}>
                                                        {social.link ?? ''} {' '}
                                                        <FontAwesomeIcon className="nav-icon"
                                                                         icon={faArrowUpRightFromSquare}/>
                                                    </Link>
                                                ) : (
                                                    <>not filled</>
                                                )}

                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                            <div className="view_block full_block">
                                <div className="view_block_body">
                                    <div
                                        className="view_block_title">Description of Provider
                                    </div>
                                    {this.props.dataFeedProviderData?.description || this.props.dataFeedProviderData?.image ? (
                                        <>
                                            {this.props.dataFeedProviderData.option === FormFieldOptionType.TEXT && (
                                                <div>{this.props.dataFeedProviderData?.description || 'not filled'}</div>
                                            )}

                                            {this.props.dataFeedProviderData.option === FormFieldOptionType.IMAGE && (
                                                <img src={this.props.dataFeedProviderData.image}/>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div>{'not filled'}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <hr/>
                            <div className="view_block full_block">
                                <div className="view_block_body">
                                    <div className="view_block_title">Regulation Links</div>
                                    {this.props.dataFeedProviderLinks.map((item: ISettings) => (
                                        <div key={item.name} className="mb-2">
                                            <Link className={'link info-panel-title-link'}
                                                  href={item.value}
                                                  target={'_blank'}>
                                                {item.name} {' '} <FontAwesomeIcon className="nav-icon"
                                                                                   icon={faArrowUpRightFromSquare}/>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>

                )
            case'delete'    :
                return (
                    <>
                        <div className="confirm-btns-panel">
                            {this.props?.onCancel && (
                                <button className="border-btn ripple"
                                        onClick={() => this.props.onCancel?.()}>Cancel</button>
                            )}
                            <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                    type="button" disabled={this.state.isDeleting}
                                    onClick={() => this.handleDelete(this.props.dataFeedProviderData)}>Confirm
                            </button>
                        </div>
                    </>
                );
        }

    }
}

export default DataFeedProviderForm;
