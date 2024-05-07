import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import AlertBlock from "@/components/alert-block";
import LoaderBlock from "@/components/loader-block";
import adminService from "@/services/admin/admin-service";
import formatterService from "@/services/formatter/formatter-service";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare, faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import {ISocialMediaLink, socialMediaLinks} from "@/interfaces/i-social-media-link";


const allowedFileSizeMB = 1
const allowedFileCount = 5
const allowedFileSize = allowedFileSizeMB * 1024 * 1024;
const allowedExt = ['png', 'jpg', 'jpeg']

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
    image_tmp: Yup.array().of(
        Yup.mixed()
            .test('asset_type_image', `File is not a valid image. Only ${allowedExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
                if (!value) return true;
                return allowedExt.includes(value.name.split('.').pop().toLowerCase());
            })
            .test('asset_type_image_size', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
                if (!value) return true;
                return value.size <= allowedFileSize;
            })
    ),
    custom_link_name: Yup.array().of(
        Yup.string().min(3).label('Name')
    ),
    custom_link_link: Yup.array().of(
        Yup.string().url('Invalid URL').label('Fees Link')
    ),

});

interface DataFeedProviderState extends IState {
    formInitialValues: any,
    loading: boolean;
    isDeleting: boolean;
    selectedFile: File | null;
    selectedFileForDescription: File[];
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
        const customs = JSON.parse(initialData?.custom_link || this.props.dataFeedProviderData?.custom_link || '[{"key":"", "value":""}]')

        Object.keys(socials).forEach((soc: any) => {
            let social = socialLinks.find(s => s.key === soc)
            if (social) {
                social.link = socials[soc];
            }
        })

        const names: any[] = []
        const links: any[] = []
        customs.forEach((item: { key: string, value: string }) => {
            names.push(item.key);
            links.push(item.value)
        })

        try {
            const descriptions = JSON.parse(initialData.description.toString());
            initialData.description = descriptions;
            if (this.props.dataFeedProviderData) this.props.dataFeedProviderData.description = descriptions;
        } catch (error) {
            initialData.description = [""];

        }

        try {
            const images = JSON.parse(initialData.images.toString().replace(/'/g, '"'));
            initialData.images = images;
            if (this.props.dataFeedProviderData) this.props.dataFeedProviderData.images = images;
        } catch (error) {
            initialData.images = [];
        }


        const initialValues: {
            name: string;
            logo: string;
            website_link: string;
            social_media_link: string;
            fees_link: string;
            option: string;
            description: string[];
            images: string[];
            socials: any;
            customs: any;
            custom_link_name: any[];
            custom_link_link: any[];
        } = {
            name: initialData?.name || '',
            logo: initialData?.logo || '',
            website_link: initialData?.website_link || '',
            fees_link: initialData?.fees_link || '',
            social_media_link: socials,
            option: initialData?.option || '',
            description: initialData?.description || [""],
            images: initialData?.images || [],
            socials: socialLinks,
            customs: customs,
            custom_link_name: names,
            custom_link_link: links
        };

        const selectedFileForDescription = initialData.images as any

        this.state = {
            success: false,
            formInitialValues: initialValues,
            loading: false,
            isDeleting: false,
            selectedFile: null,
            selectedFileForDescription: selectedFileForDescription,
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

        formData.delete('description');
        const descriptions = values.description;
        formData.append('description', JSON.stringify(descriptions));

        formData.delete('logo');
        formData.delete('logo_tmp');
        formData.delete('images');
        formData.delete('image_tmp');
        formData.delete('social_media_link');
        formData.delete('custom_link');
        formData.delete('custom_link');

        formData.append('social_media_link', JSON.stringify(values.social_media_link));

        if (values.custom_link_link?.length) {
            let data: { key: string; value: string }[] = [];

            values.custom_link_name?.forEach((s: string, idx: number) => {
                const key = s;
                const value = values.custom_link_link?.[idx] ?? '';
                data.push({key: key.trim(), value: value.trim()});
            });

            formData.append('custom_link', JSON.stringify(data));
        }


        if (this.state.selectedFileForDescription && this.state.selectedFileForDescription.length > 0) {
            for (const file of Array.from(this.state.selectedFileForDescription)) {
                formData.append('images[]', file);
            }
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

    handleFileAssetLogoChange = (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const selectedFile = event?.target?.files ? event.target.files[0] : null;
        this.setState((prevState) => {
            const updatedFiles: (File | null)[] = [...(prevState.selectedFileForDescription || [])];
            updatedFiles[index] = selectedFile;
            return {selectedFileForDescription: updatedFiles} as DataFeedProviderState;
        });
    };


    handleRemoveFile = (index: number) => {
        this.setState((prevState) => {
            const updatedFiles = (prevState.selectedFileForDescription || []).filter((_, idx) => {
                return idx !== index;
            });
            return {selectedFileForDescription: updatedFiles};
        });
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

                                                <div className="input compact-form">
                                                    <div
                                                        className={'justify-content-between d-flex flex-wrap align-items-center mb-3'}>
                                                        <div className="input__title">Custom Links:</div>

                                                        <button
                                                            type="button"
                                                            className='border-grey-btn ripple'
                                                            onClick={() => {
                                                                const updatedCustoms = [...values.customs];
                                                                updatedCustoms.push({key: '', value: ''})
                                                                const updatedCustomsNames = [...values.custom_link_name || [], ""];
                                                                const updatedCustomsLinks = [...values.custom_link_link || [], ""];
                                                                setFieldValue('customs', updatedCustoms);
                                                                setFieldValue('custom_link_name', updatedCustomsNames);
                                                                setFieldValue('custom_link_link', updatedCustomsLinks);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                                        </button>
                                                    </div>

                                                    <div className="input">
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <div className="officer-input">
                                                                {values.customs.map((item: {
                                                                    key: string,
                                                                    value: string
                                                                }, index: number) => {
                                                                    return (
                                                                        <>
                                                                            <div key={index} className="input">
                                                                                <div
                                                                                    className={'input__btns gap-20 align-items-baseline'}>
                                                                                    <div
                                                                                        className={'input__wrap w-100'}>
                                                                                        <Field
                                                                                            name={`custom_link_name.${index}`}
                                                                                            id={`custom_link_name.${index}`}
                                                                                            type="text"
                                                                                            className="input__text"
                                                                                            placeholder={`Type Name`}
                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                        />
                                                                                        {errors.custom_link_name && errors.custom_link_name[index] && (
                                                                                            <div
                                                                                                className="error-message input__btns">{errors.custom_link_name[index].toString()}</div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div
                                                                                        className={'input__wrap w-100'}>
                                                                                        <Field
                                                                                            name={`custom_link_link.${index}`}
                                                                                            id={`custom_link_link.${index}`}
                                                                                            type="text"
                                                                                            className="input__text"
                                                                                            placeholder={`Type Link`}
                                                                                            disabled={isSubmitting || this.isShow()}
                                                                                        />
                                                                                        {errors.custom_link_link && errors.custom_link_link[index] && (
                                                                                            <div
                                                                                                className="error-message input__btns">{errors.custom_link_link[index].toString()}</div>
                                                                                        )}
                                                                                    </div>

                                                                                    <button
                                                                                        disabled={isSubmitting || values.customs.length < 2}
                                                                                        type="button"
                                                                                        className={`border-grey-btn ripple ${values.customs.length < 2 ? 'disable' : ''}`}
                                                                                        onClick={() => {
                                                                                            const updatedCustoms = values.customs.filter((s: {
                                                                                                key: string,
                                                                                                value: string
                                                                                            }, idx: number) => idx !== index);
                                                                                            const updatedCustomsNames = values.custom_link_name?.filter((_, idx) => idx !== index);
                                                                                            const updatedCustomsLinks = values.custom_link_link?.filter((_, idx) => idx !== index);
                                                                                            setFieldValue('customs', updatedCustoms);
                                                                                            setFieldValue('custom_link_name', updatedCustomsNames);
                                                                                            setFieldValue('updatedCustomsLinks', updatedCustomsLinks);

                                                                                        }}
                                                                                    >
                                                                                        <FontAwesomeIcon
                                                                                            className="nav-icon"
                                                                                            icon={faMinus}/>
                                                                                    </button>
                                                                                </div>

                                                                            </div>
                                                                        </>

                                                                    );
                                                                })}

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="input compact-form">
                                                    <div
                                                        className={'justify-content-between d-flex flex-wrap align-items-center'}>
                                                        <h4 className="input__group__title">Description of the
                                                            Provider:</h4>

                                                        <button
                                                            type="button"
                                                            className='border-grey-btn ripple'
                                                            onClick={() => {
                                                                const updatedDescriptions = [...values.description, ''];
                                                                const index = updatedDescriptions.length - 1 || 0
                                                                setFieldValue('description', updatedDescriptions);
                                                                this.handleFileAssetLogoChange(null, index);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon className="nav-icon" icon={faPlus}/>
                                                        </button>
                                                    </div>
                                                    <div className="input">
                                                        <div
                                                            className={`input__wrap ${(isSubmitting || this.isShow()) ? 'disable' : ''}`}>
                                                            <div className="officer-input">
                                                                {values.description.map((description, index) => (
                                                                    <>
                                                                        <div
                                                                            className={'input__btns gap-20'}
                                                                            key={index}>
                                                                            <div className={'input__wrap'}>
                                                                                {!this.isShow() && values.images[index] && (
                                                                                    <div key={index}
                                                                                         className="mb-2 d-flex">
                                                                                        <Link
                                                                                            className={'link info-panel-title-link'}
                                                                                            href={`${this.host}${values.images[index]}`}
                                                                                            target={'_blank'}>
                                                                                            Image #{index + 1} {' '}
                                                                                            <FontAwesomeIcon
                                                                                                className="nav-icon"
                                                                                                icon={faArrowUpRightFromSquare}/>
                                                                                        </Link>
                                                                                    </div>
                                                                                )}
                                                                                <input
                                                                                    id={`image_tmp.${index}`}
                                                                                    name={`image_tmp.${index}`}
                                                                                    type="file"
                                                                                    accept={'.' + allowedExt.join(',.')}
                                                                                    className="input__file"
                                                                                    disabled={isSubmitting}
                                                                                    onChange={(event) => {
                                                                                        setFieldValue(`image_tmp.${index}`, event.target?.files?.[0] || '');
                                                                                        this.handleFileAssetLogoChange(event, index);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <Field
                                                                                name={`description.${index}`}
                                                                                as="textarea"
                                                                                rows={4}
                                                                                className="input__textarea"
                                                                                placeholder={''}
                                                                                disabled={isSubmitting || this.isShow()}
                                                                            />

                                                                            <button
                                                                                disabled={isSubmitting || values.description.length < 2}
                                                                                type="button"
                                                                                className={`border-grey-btn ripple ${values.description.length < 2 ? 'disable' : ''}`}
                                                                                onClick={() => {
                                                                                    const updatedDescriptions = [...values.description];
                                                                                    updatedDescriptions.splice(index, 1);
                                                                                    setFieldValue('description', updatedDescriptions);
                                                                                    this.handleRemoveFile(index)
                                                                                }}
                                                                            >
                                                                                <FontAwesomeIcon className="nav-icon"
                                                                                                 icon={faMinus}/>
                                                                            </button>
                                                                        </div>
                                                                        {errors.image_tmp && errors.image_tmp[index] && (
                                                                            <div
                                                                                className="error-message input__btns">{errors.image_tmp[index].toString()}</div>
                                                                        )}
                                                                    </>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
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
                        )}
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
                                    <div className="view_block_title">Custom Links</div>
                                    {(this.state.formInitialValues?.customs as any).map((item: {
                                        key: string,
                                        value: string
                                    }, idx: number) => (
                                        <div key={idx} className="d-flex mb-2">
                                            <div>
                                                {item.value.length ? (
                                                    <Link className={'link info-panel-title-link'}
                                                          href={item.value ?? ''}
                                                          target={'_blank'}>
                                                        {item.key ?? ''} {' '}
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

                                    <>
                                        {this.props.dataFeedProviderData?.description.map((description, index) => (
                                            <div className={'d-flex gap-20 flex-wrap flex-md-nowrap'} key={index}>
                                                {this.props.dataFeedProviderData?.images[index] && (
                                                    <div
                                                        className={'profile__left bg-transparent flex-panel-box pt-0 content-box'}>
                                                        <div className={'logo p-0 align-items-baseline '}>
                                                            <img src={this.props.dataFeedProviderData?.images[index]}/>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className={'d-flex mb-2'}>{description}</div>
                                            </div>
                                        ))}
                                    </>
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
