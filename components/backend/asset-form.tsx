import React from 'react';
import {Formik, Form, Field, ErrorMessage} from "formik";
import * as Yup from "yup";
import adminService from "@/services/admin/admin-service";
import AlertBlock from "@/components/alert-block";
import formatterService from "@/services/formatter/formatter-service";
import AssetTransactionsBlock from "@/components/backend/asset-transactions-block";
import AssetImage from "@/components/asset-image";

const allowedExt = ['png', 'jpg', 'jpeg'];
const allowedFileSizeMB = 1
const allowedFileSize = allowedFileSizeMB * 1024 * 1024;

const formSchema = Yup.object().shape({
    name: Yup.string().min(3).max(255).required('Required').label('Name'),
    label: Yup.string().min(3).max(255).required('Required').label('Label'),
    network: Yup.string().min(3).max(255).required('Required').label('Network'),
    protocol: Yup.string().min(3).max(255).required('Required').label('Protocol'),
    code: Yup.string().min(3).max(255).required('Required').label('Code'),
    qr_wallet_name: Yup.string().min(3).max(255).required('Required').label('QR Wallet Name'),
    currency_type: Yup.string().min(3).max(255).required('Required').label('Currency Type'),
    transaction_fee: Yup.number().required('Required').label('Fee'),
    dollar_pegged: Yup.string().required('Required').label('Dollar Pegged'),
    dollar_pegged_rate: Yup.number().required('Required').label('Dollar Pegged Rate'),
    inverted_rate: Yup.string().required('Required').label('Inverted Rate'),
    last_price: Yup.number().required('Required').label('Last Price'),
    active: Yup.string().required('Required').label('Active'),
    image_tmp: Yup.mixed()
        .test('image_tmp', `File is not a valid image. Only ${allowedExt.join(', ').toUpperCase()} files are allowed`, (value: any) => {
            if (!value) return true;
            return allowedExt.includes(value.name.split('.').pop().toLowerCase());
        })
        .test('image_tmp', `File is too large. Maximum size: ${allowedFileSizeMB} MB`, (value: any) => {
            if (!value) return true;
            return value.size <= allowedFileSize;
        }),
});

let initialValues = {
    name: "",
    label: "",
    network: "",
    protocol: "",
    code: "",
    qr_wallet_name: "",
    currency_type: "",
    transaction_fee: "",
    dollar_pegged: "",
    dollar_pegged_rate: "",
    inverted_rate: "",
    last_price: "",
    active: "",
    image_tmp: ""
};

interface AssetFormState extends IState {
    isDeleting: boolean;
    mode: string;
    selectedFile: File | null;
}

interface AssetFormProps extends ICallback {
    action: string;
    data: IAdminAsset | null;
    onCancel?: () => void;
    updateModalTitle: (title:string) => void;
}

class AssetForm extends React.Component<AssetFormProps, AssetFormState> {

    state: AssetFormState;

    constructor(props: AssetFormProps) {
        super(props);

        this.state = {
            success: false,
            isDeleting: false,
            mode: this.props.action,
            selectedFile: null,
        };
    }

    handleSubmit = async (values: Record<string, any>, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({errorMessages: null});

        const {id, transaction_fee_updated, last_price_updated, image, image_tmp, sequence, ...data} = values;

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });

        if (this.state.selectedFile) {
            formData.append('image', this.state.selectedFile);
        }

        // const request: Promise<any> = this.state.mode == 'edit' ?
        //     adminService.updateAsset(formData, this.props.data?.id || 0) :
        //     adminService.createAsset(formData);
        //
        // await request
        //     .then(((res: any) => {
        //         this.props.onCallback(formData);
        //     }))
        //     .catch((errors: IError) => {
        //         this.setState({errorMessages: errors.messages});
        //     }).finally(() => {
        //         setSubmitting(false);
        //     });
    };

    handleDelete = async (values: any) => {
        this.setState({isDeleting: true});
        await adminService.deleteAsset(values.id)
            .then(((res: any) => {
                this.props.onCallback(values);
            }))
            .catch((errors: IError) => {
                this.setState({errorMessages: errors.messages});
            }).finally(() => {
                this.setState({isDeleting: false});
            });
    };

    handleEdit = (title: string) => {
        this.props.updateModalTitle(title);
        this.setState({mode: 'edit'})
    }

    handleFile = (event: any) => {
        const selectedFile = event.target?.files?.[0] || null;
        this.setState({selectedFile: selectedFile});
    }

    render() {

        switch (this.state.mode) {
            case "add":
            case "edit":
                return (
                    <>
                        <Formik
                            initialValues={this.props?.data || initialValues}
                            validationSchema={formSchema}
                            onSubmit={this.handleSubmit}
                        >
                            {({isSubmitting, isValid, dirty, setFieldValue, errors}) => {
                                return (
                                    <Form id="asset-form">
                                        <div className="input">
                                            <div className="input__title">Image</div>
                                            <div className="input__wrap">
                                                <input
                                                    name="image_tmp"
                                                    id="image_tmp"
                                                    type="file"
                                                    className="input__file"
                                                    accept={'.' + allowedExt.join(',.')}
                                                    disabled={isSubmitting}
                                                    onChange={(event) => {
                                                        setFieldValue(event.target.name, event.target?.files?.[0] || '');
                                                        this.handleFile(event);
                                                    }}
                                                />
                                                {errors.image_tmp && (
                                                    <div className="error-message">{errors.image_tmp.toString()}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Name <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="name"
                                                    id="name"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Name"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="name" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Label <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="label"
                                                    id="label"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Label"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="label" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Network <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="network"
                                                    id="network"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Network"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="network" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Protocol <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="protocol"
                                                    id="protocol"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Protocol"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="protocol" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Code <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="code"
                                                    id="code"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Code"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="code" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">QR Wallet Name <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="qr_wallet_name"
                                                    id="qr_wallet_name"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type QR Wallet Name"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="qr_wallet_name" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Currency Type <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="currency_type"
                                                    id="currency_type"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value=''>Select Currency Type</option>
                                                    <option value='FIAT'>FIAT</option>
                                                    <option value='CRYPTO'>CRYPTO</option>
                                                </Field>
                                                <ErrorMessage name="currency_type" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Fee <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="transaction_fee"
                                                    id="transaction_fee"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Fee"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="transaction_fee" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Dollar Pegged <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="dollar_pegged"
                                                    id="dollar_pegged"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value=''>Select Dollar Pegged</option>
                                                    <option value='true'>Yes</option>
                                                    <option value='false'>No</option>
                                                </Field>
                                                <ErrorMessage name="dollar_pegged" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Dollar Pegged Rate <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="dollar_pegged_rate"
                                                    id="dollar_pegged_rate"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Dollar Pegged Rate"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="dollar_pegged_rate" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Inverted Rate <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="inverted_rate"
                                                    id="inverted_rate"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value=''>Select Inverted Rate</option>
                                                    <option value='true'>Yes</option>
                                                    <option value='false'>No</option>
                                                </Field>
                                                <ErrorMessage name="inverted_rate" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Last Price <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="last_price"
                                                    id="last_price"
                                                    type="text"
                                                    className="input__text"
                                                    placeholder="Type Last Price"
                                                    disabled={isSubmitting}
                                                />
                                                <ErrorMessage name="last_price" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>
                                        <div className="input">
                                            <div className="input__title">Active <i>*</i></div>
                                            <div className="input__wrap">
                                                <Field
                                                    name="active"
                                                    id="active"
                                                    as="select"
                                                    className="b-select"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value=''>Select Active</option>
                                                    <option value='true'>Yes</option>
                                                    <option value='false'>No</option>
                                                </Field>
                                                <ErrorMessage name="active" component="div"
                                                              className="error-message"/>
                                            </div>
                                        </div>

                                        <button id="add-asset-acc"
                                                className={`w-100 b-btn ripple ${(isSubmitting || !isValid || !dirty) ? 'disable' : ''}`}
                                                type="submit" disabled={isSubmitting || !isValid || !dirty}>
                                            {`${this.state.mode === 'edit' ? 'Save' : 'Add'}`}
                                        </button>

                                        {this.state.errorMessages && (
                                            <AlertBlock type={"error"} messages={this.state.errorMessages}/>
                                        )}
                                    </Form>
                                );
                            }}
                        </Formik>
                    </>
                );
            case "view":
                return (
                    <>
                        <div className='view-form asset-view-form'>
                            {this.props.data?.image && (
                                <div className="view-form-box">
                                    {/*<div className="box__title">Image</div>*/}
                                    <div className="box__wrap"><AssetImage alt='' src={this.props.data?.image || ''} width={36} height={36}/></div>
                                </div>
                            )}
                            <div className="view-form-box">
                                <div className="box__title">Name</div>
                                <div className="box__wrap">{this.props.data?.name || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Label</div>
                                <div className="box__wrap">{this.props.data?.label || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Network</div>
                                <div className="box__wrap">{this.props.data?.network || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Protocol</div>
                                <div className="box__wrap">{this.props.data?.protocol || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Code</div>
                                <div className="box__wrap">{this.props.data?.code || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">QR Wallet Name</div>
                                <div className="box__wrap">{this.props.data?.qr_wallet_name || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Fee</div>
                                <div className="box__wrap">{formatterService.numberFormat(this.props.data?.transaction_fee || 0)}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Fee Updated</div>
                                <div className="box__wrap">{formatterService.dateTimeFormat(this.props.data?.transaction_fee_updated || '')}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Dollar Pegged</div>
                                <div className="box__wrap">{this.props.data?.dollar_pegged ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Dollar Pegged Rate</div>
                                <div className="box__wrap">{formatterService.numberFormat(this.props.data?.dollar_pegged_rate || 0)}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Currency Type</div>
                                <div className="box__wrap">{this.props.data?.currency_type || ''}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Inverted Rate</div>
                                <div className="box__wrap">{this.props.data?.inverted_rate ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Last Price</div>
                                <div className="box__wrap">{formatterService.numberFormat(this.props.data?.last_price || 0)}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Last Price Updated</div>
                                <div className="box__wrap">{formatterService.dateTimeFormat(this.props.data?.last_price_updated || '')}</div>
                            </div>
                            <div className="view-form-box">
                                <div className="box__title">Active</div>
                                <div className="box__wrap">{this.props.data?.active ? 'Yes' : 'No' }</div>
                            </div>
                            <button className="w-100 b-btn ripple" onClick={() => this.handleEdit('Edit Symbol') }>
                                Edit
                            </button>
                        </div>
                        <div className="info-panel-block mt-5">
                            <AssetTransactionsBlock label={this.props.data?.label || ''}/>
                        </div>
                    </>
                );
            case "delete":
                return (
                    <>
                        <div className="confirm-btns-panel">
                            {this.props?.onCancel && (
                                <button className="border-btn ripple"
                                        onClick={() => this.props.onCancel?.()}>Cancel</button>
                            )}
                            <button className={`b-btn ripple ${(this.state.isDeleting) ? 'disable' : ''}`}
                                    type="button" disabled={this.state.isDeleting}
                                    onClick={() => this.handleDelete(this.props.data)}>Confirm
                            </button>
                        </div>
                    </>
                );
        }
    }
}

export default AssetForm;
