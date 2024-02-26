import React, {RefObject} from "react";
import * as Yup from "yup";
import {Field, Form, Formik, FormikProps} from "formik";
import reportsService from "@/services/reports/reports-service";
import {IReportDate} from "@/interfaces/i-report-date";
import LoaderBlock from "@/components/loader-block";
import {getReportTypeName, ReportType} from "@/enums/report-type";
import {IWeeklyMonthlyReport} from "@/interfaces/i-weekly-monthly-report";
import Select from "react-select";
import {IReportLastSaleTotalForEachSymbol} from "@/interfaces/i-report-last-sale-total-for-each-symbol";
import LastSaleTotalsByAlternativeTradingSystemBlock
    from "@/components/report/last-sale-totals-by-alternative-trading-system-block";
import LastSaleTotalsForEachSymbolBlock from "@/components/report/last-sale-totals-for-each-symbol-block";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import filterService from "@/services/filter/filter";
import {ReportPeriod} from "@/enums/report-period";
import NumberOfSymbolAdditionAndDeletionsBlock from "@/components/report/number-of-symbol-addition-and-deletions-block";
import {
    IReportLastSaleTotalByAlternativeTradingSystem
} from "@/interfaces/i-report-last-sale-total-by-alternative-trading-system";
import {
    IReportNumberOfSymbolAdditionsAndDeletions
} from "@/interfaces/i-report-number-of-symbol-additions-and-deletions";
import portalAccessWrapper from "@/wrappers/portal-access-wrapper";
import downloadFile from "@/services/download-file/download-file";

interface WeeklyAndMonthlyReportsBlockState extends IState {
    isLoading: boolean;
    isReportLoading: boolean;
    report: string;
    data: Array<any>;
    reportProps: IWeeklyMonthlyReport | null;
}

const formSchema = Yup.object().shape({
    report: Yup.string().required('Required'),
    type: Yup.string(),
    date: Yup.string(),
    weekly_date: Yup.string(),
    monthly_date: Yup.string(),
})

const initialValues = {
    report: '',
    type: '',
    date: '',
    weekly_date: '',
    monthly_date: ''
}


class WeeklyAndMonthlyReportsBlock extends React.Component<{}, WeeklyAndMonthlyReportsBlockState> {

    state: WeeklyAndMonthlyReportsBlockState;

    weeklyDates: Array<string>;
    monthlyDates: Array<string>;

    formRef: RefObject<FormikProps<IWeeklyMonthlyReport>>;

    constructor(props: {}) {
        super(props);

        this.state = {
            success: false,
            isLoading: true,
            isReportLoading: false,
            report: '',
            data: [],
            reportProps: null
        };

        this.weeklyDates = [];
        this.monthlyDates = [];

        this.formRef = React.createRef();
    }

    onCallback(values: any) {

    }

    getRenderReport() {
        switch (this.state.report) {
            case ReportType.LAST_SALE_TOTALS_BY_ATS:
                return <LastSaleTotalsByAlternativeTradingSystemBlock report={this.state.reportProps}
                                                                      data={this.state.data}
                                                                      onCallback={this.onCallback}/>;
            case ReportType.LAST_SALE_TOTALS_FOR_EACH_SYMBOL:
                return <LastSaleTotalsForEachSymbolBlock report={this.state.reportProps}
                                                         data={this.state.data}
                                                         onCallback={this.onCallback}/>;
            case ReportType.NUMBER_OF_SYMBOLS_ADDITIONS_AND_DELETIONS:
                return <NumberOfSymbolAdditionAndDeletionsBlock
                    data={this.state.data}
                    report={this.state.reportProps}
                    onCallback={this.onCallback}/>
            default:
                return '';
        }
    }

    componentDidMount() {
        this.getReportDates();
    }

    getReportDates() {
        reportsService.getDates().then((res: IReportDate) => {
            this.weeklyDates = res.weekly;
            this.monthlyDates = res.monthly;
        })
            .then(() => {
                initialValues.report = ReportType.LAST_SALE_TOTALS_BY_ATS;
                initialValues.weekly_date = this.weeklyDates[0] || ''
                initialValues.date = this.weeklyDates[0] || ''
                initialValues.type = ReportPeriod.WEEKLY
            })
            .finally(() => {
                this.setState({isLoading: false}, () => {
                    this.submitForm();
                });
            })
    }

    submitForm = () => {
        if (this.formRef.current) {
            this.formRef.current.submitForm();
        }
    }

    handleSubmit = async (values: IWeeklyMonthlyReport, {setSubmitting}: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        this.setState({
            isReportLoading: true,
            report: values.report,
            data: [],
            reportProps: values
        });

        reportsService.getSummary(values)
            .then((res: Array<IReportLastSaleTotalByAlternativeTradingSystem | IReportLastSaleTotalForEachSymbol | IReportNumberOfSymbolAdditionsAndDeletions>) => {
                this.setState({data: res});
            }).then(() => {
            this.setState({isReportLoading: false});
        })
    };

    downloadReportCSV = () => {
        if (this.formRef.current) {
            reportsService.downloadSummaryReport(this.formRef.current.values).then((res) => {
                downloadFile.CSV(`${this.formRef.current?.values.report}_${this.formRef.current?.values.date}` || 'report', res);
            })
        }
    }

    downloadReportXLSX = () => {
        if (this.formRef.current) {
            reportsService.downloadSummaryReport(this.formRef.current.values).then((res) => {
                downloadFile.XLSX(`${this.formRef.current?.values.report}_${this.formRef.current?.values.date}` || 'report', res);
            })
        }
    }


    render() {
        return (
            <>
                <div className="panel">
                    <div className="content__top">
                        <div className="content__title">Weekly and Monthly Reports</div>
                        <div
                            className={`content__title_btns content__filter download-buttons justify-content-end`}>
                            <button
                                className={`border-grey-btn ripple d-flex ${this.state.isReportLoading || !this.state.reportProps?.date ? 'disable' : ''}`}
                                disabled={this.state.isReportLoading || !this.state.reportProps?.date}
                                onClick={this.downloadReportCSV}>
                                <span className="file-item__download"></span>
                                <span>CSV</span>
                            </button>
                            <button
                                className={`border-grey-btn ripple d-flex ${this.state.isReportLoading || !this.state.reportProps?.date ? 'disable' : ''}`}
                                disabled={this.state.isReportLoading || !this.state.reportProps?.date}
                                onClick={this.downloadReportXLSX}>
                                <span className="file-item__download"></span>
                                <span>XLSX</span>
                            </button>
                        </div>
                    </div>
                    {this.state.isLoading ? (
                        <LoaderBlock/>
                    ) : (
                        <div className="content__bottom">


                            <Formik<IWeeklyMonthlyReport>
                                innerRef={this.formRef}
                                initialValues={initialValues}
                                validationSchema={formSchema}
                                onSubmit={this.handleSubmit}
                            >
                                {({isSubmitting, isValid, dirty, setFieldValue, setFieldTouched, values, errors}) => {
                                    return (
                                        <>
                                            <Form className={'content__filter mb-3'}>

                                                <div
                                                    className={`input__wrap ${(isSubmitting || this.state.isReportLoading) ? 'disable' : ''}`}>
                                                    <Field
                                                        name="report"
                                                        id="report"
                                                        as={Select}
                                                        className="select__react"
                                                        classNamePrefix="select__react"
                                                        isClearable={false}
                                                        isSearchable={true}
                                                        placeholder="Report"
                                                        isDisabled={isSubmitting || this.state.isReportLoading}
                                                        onChange={(selectedOption: any) => {
                                                            setFieldValue('report', selectedOption ? selectedOption.value : '');
                                                            this.submitForm();
                                                        }}
                                                        options={Object.keys(ReportType).map((item) => ({
                                                            value: ReportType[item as keyof typeof ReportType],
                                                            label: getReportTypeName(ReportType[item as keyof typeof ReportType]),
                                                        }))}
                                                        value={
                                                            Object.values(ReportType).filter((s) => s === values.report).map((item) => ({
                                                                value: ReportType[item.toUpperCase() as keyof typeof ReportType],
                                                                label: getReportTypeName(ReportType[item.toUpperCase() as keyof typeof ReportType]),
                                                            }))
                                                        }
                                                    >
                                                    </Field>
                                                </div>
                                                <div
                                                    className={`input__wrap ${(isSubmitting || this.state.isReportLoading || values.report === '') ? 'disable' : ''}`}>
                                                    <Field
                                                        name="weekly_date"
                                                        id="weekly_date"
                                                        as={Select}
                                                        className="select__react"
                                                        classNamePrefix="select__react"
                                                        isClearable={false}
                                                        isSearchable={true}
                                                        placeholder="Weekly Report"
                                                        isDisabled={isSubmitting || this.state.isReportLoading || values.report === ''}
                                                        onChange={(selectedOption: any) => {
                                                            setFieldValue('weekly_date', selectedOption ? selectedOption.value : '');
                                                            setFieldValue('date', selectedOption ? selectedOption.value : '');
                                                            setFieldValue('type', ReportPeriod.WEEKLY);
                                                            setFieldValue('monthly_date', '');

                                                            this.submitForm();
                                                        }}
                                                        options={Object.values(this.weeklyDates).map((item) => ({
                                                            value: item,
                                                            label: item,
                                                        }))}
                                                        value={
                                                            Object.values(this.weeklyDates).filter(s => s === values.date && values.type === ReportPeriod.WEEKLY).map((item) => ({
                                                                value: item,
                                                                label: item,
                                                            }))
                                                        }
                                                    >
                                                    </Field>
                                                </div>
                                                <div
                                                    className={`input__wrap ${(isSubmitting || this.state.isReportLoading || values.report === '') ? 'disable' : ''}`}>
                                                    <Field
                                                        name="monthly_date"
                                                        id="monthly_date"
                                                        as={Select}
                                                        className="select__react"
                                                        classNamePrefix="select__react"
                                                        isClearable={false}
                                                        isSearchable={true}
                                                        placeholder="Monthly Report"
                                                        isDisabled={isSubmitting || this.state.isReportLoading || values.report === ''}
                                                        onChange={(selectedOption: any) => {
                                                            setFieldValue('monthly_date', selectedOption ? selectedOption.value : '');
                                                            setFieldValue('date', selectedOption ? selectedOption.value : '');
                                                            setFieldValue('type', ReportPeriod.MONTHLY);
                                                            setFieldValue('weekly_date', '');

                                                            this.submitForm();
                                                        }}
                                                        options={Object.values(this.monthlyDates).map((item) => ({
                                                            value: item,
                                                            label: item,
                                                        }))}
                                                        value={
                                                            Object.values(this.monthlyDates).filter(s => s === values.date && values.type === ReportPeriod.MONTHLY).map((item) => ({
                                                                value: item,
                                                                label: item,
                                                            }))
                                                        }

                                                    >
                                                    </Field>
                                                </div>
                                                <button type="submit"
                                                        className={`content__filter-clear ripple ${(isSubmitting || this.state.isReportLoading || values.date === '' || values.report === '') ? 'disable' : ''}`}
                                                        disabled={isSubmitting || this.state.isReportLoading || values.date === '' || values.report === ''}>
                                                    <FontAwesomeIcon className="nav-icon"
                                                                     icon={filterService.getFilterResetIcon()}/>
                                                </button>
                                            </Form>
                                        </>
                                    );
                                }}
                            </Formik>

                            {this.state.isReportLoading ? (
                                <LoaderBlock/>
                            ) : (
                                <>
                                    {this.getRenderReport()}
                                </>
                            )}


                        </div>
                    )}
                </div>
            </>
        );
    }
}

export default WeeklyAndMonthlyReportsBlock;
