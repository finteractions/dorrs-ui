import React, {ReactElement, useEffect, useState} from "react"
import type {NextPageWithLayout} from "./_app";
import PortalLayout from "../components/layouts/portal/portal-layout";
import BankAccountForm from "../components/bank-account-form";
import NoDataBlock from "../components/no-data-block";
import Modal from "../components/modal";
import kycService from "@/services/kyc/kyc-service";
import LoaderBlock from "@/components/loader-block";
import AlertBlock from "@/components/alert-block";
import filterService from "@/services/filter/filter";
import Select from "react-select";


const BankAccounts: NextPageWithLayout = () => {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [formAction, setFormAction] = useState('add');
    const [bankAccount, setBankAccount] = useState<IBankAccount | null>(null);
    const [bankAccounts, setBankAccounts] = useState<Array<IBankAccount> | null>(null);
    const [bankAccountsFull, setBankAccountsFull] = useState<Array<IBankAccount> | []>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Array<string> | null>(null);
    const [filterData, setFilterData] = useState<Array<any> | []>([]);

    const getBankAccounts = () => {
        kycService.getBankAccounts()
            .then((res: Array<IBankAccount>) => {
                const data = res.sort((a:IBankAccount, b:IBankAccount) => b.id - a.id )
                 setBankAccounts(data);
                 setBankAccountsFull(data);
            })
            .catch((error: IError) => {
                setErrors(error.messages);
            }).finally(() => setLoading(false));
    }

    const openModal = (mode: string, bank?: IBankAccount) => {
        setFormAction(mode);
        setBankAccount(bank || null);
        setIsOpenModal(true);
    }

    const modalTitle = () => {
        if (formAction === 'delete') {
            return 'Do you want to delete this bank account?';
        } else {
            return `${formAction === 'edit' ? 'Edit' : 'Add new'} bank account`;
        }
    }

    const submitForm = (values: any) => {
        setIsOpenModal(false);
        getBankAccounts();
    }

    const cancelForm = () => {
        setIsOpenModal(false);
    }

    useEffect(() => {
        getBankAccounts();
    }, []);


    const handleResetButtonClick = () => {
        setFilterData([]);
    }

    const handleFilterChange = (prop_name: string, item: any) => {
       setFilterData({ ...filterData, [prop_name]: item?.value || ''});
    }

    const filter = () => {
        setBankAccounts(filterService.filterData(filterData, bankAccountsFull))
    }

    useEffect(() => {
        filter();
    }, [filterData])

    return (
        <>
            <div className="bank section">
                <div className="content__top">
                    <div className="content__title">Bank Accounts</div>
                    <button className="border-btn ripple modal-link"
                            disabled={loading}
                            onClick={() => openModal('add')}>Add Bank Account
                    </button>
                </div>

                {loading ? (
                    <LoaderBlock/>
                ) : (
                    <>
                        <div className="content__filter mb-3">
                            <div className="input__wrap">
                                <Select
                                    className="select__react"
                                    classNamePrefix="select__react"
                                    isClearable={true}
                                    isSearchable={true}
                                    value={filterService.setValue('currency', filterData)}
                                    onChange={(item) => handleFilterChange('currency', item)}
                                    options={filterService.buildOptions('currency', bankAccountsFull)}
                                    placeholder="Currency"
                                />
                            </div>
                            <div className="input__wrap">
                                <Select
                                    className="select__react"
                                    classNamePrefix="select__react"
                                    isClearable={true}
                                    isSearchable={true}
                                    value={filterService.setValue('beneficiary_name', filterData)}
                                    onChange={(item) => handleFilterChange('beneficiary_name', item)}
                                    options={filterService.buildOptions('beneficiary_name', bankAccountsFull)}
                                    placeholder="Name"
                                />
                            </div>
                            <div className="input__wrap">
                                <Select
                                    className="select__react"
                                    classNamePrefix="select__react"
                                    isClearable={true}
                                    isSearchable={true}
                                    value={filterService.setValue('bank_name', filterData)}
                                    onChange={(item) => handleFilterChange('bank_name', item)}
                                    options={filterService.buildOptions('bank_name', bankAccountsFull)}
                                    placeholder="Bank Name"
                                />
                            </div>
                            <div className="input__wrap">
                                <Select
                                    className="select__react"
                                    classNamePrefix="select__react"
                                    isClearable={true}
                                    isSearchable={true}
                                    value={filterService.setValue('account_number', filterData)}
                                    onChange={(item) => handleFilterChange('account_number', item)}
                                    options={filterService.buildOptions('account_number', bankAccountsFull)}
                                    placeholder="Account Number"
                                />
                            </div>
                            <div className="input__wrap">
                                <Select
                                    className="select__react"
                                    classNamePrefix="select__react"
                                    isClearable={true}
                                    isSearchable={true}
                                    value={filterService.setValue('iban', filterData)}
                                    onChange={(item) => handleFilterChange('iban', item)}
                                    options={filterService.buildOptions('iban', bankAccountsFull)}
                                    placeholder="IBAN"
                                />
                            </div>
                            <div className="input__wrap">
                                <Select
                                    className="select__react"
                                    classNamePrefix="select__react"
                                    isClearable={true}
                                    isSearchable={true}
                                    value={filterService.setValue('swift', filterData)}
                                    onChange={(item) => handleFilterChange('swift', item)}
                                    options={filterService.buildOptions('swift', bankAccountsFull)}
                                    placeholder="SWIFT"
                                />
                            </div>
                            <button
                                className="content__filter-clear ripple"
                                onClick={handleResetButtonClick}>
                                Clear
                            </button>
                        </div>

                        {bankAccounts?.length ? (
                            <>
                                {bankAccounts?.map((bank, index) => (
                                    <div className="bank__item" key={bank.id}>
                                        <div className="bank__item-left">
                                            <div className="row">
                                                <div className="col">
                                                    <div className="bank__item-block">
                                                        <span>Currency</span>
                                                        <b>{bank.currency}</b>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="bank__item-block">
                                                        <span>Name</span>
                                                        <b>{bank.beneficiary_name}</b>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="bank__item-block">
                                                        <span>Account Number</span>
                                                        <b>{bank.account_number}</b>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="bank__item-block">
                                                        <span>IBAN</span>
                                                        <b>{bank.iban}</b>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="bank__item-block">
                                                        <span>SWIFT Code</span>
                                                        <b>{bank.swift}</b>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <div className="bank__item-block">
                                                        <span>Bank Name</span>
                                                        <b>{bank.bank_name}</b>
                                                    </div>
                                                </div>
                                                <div className="col big">
                                                    <div className="bank__item-block">
                                                        <span>Bank Address</span>
                                                        <b>{bank.bank_address}</b>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bank__item-btns">
                                            {bank.status.toLowerCase() === 'pending' && (
                                                <button className="bank__item-btn btn-edit"
                                                        onClick={() => openModal('edit', bank)}/>
                                            )}
                                            <button className="bank__item-btn modal-link btn-delete"
                                                    onClick={() => openModal('delete', bank)}/>
                                        </div>
                                        <div className={'bank__item-status-block'}>
                                           <div className={`table__status table__status-${bank.status}`}> {bank.status.charAt(0).toUpperCase() + bank.status.slice(1).toLowerCase()}</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {errors ? (
                                    <AlertBlock type={"error"} messages={errors}/>
                                ) : (
                                    <NoDataBlock
                                    primaryText="No Bank Accounts have been added yet"
                                    secondaryText="To add Bank Account use ”Add Bank Account”"/>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <Modal isOpen={isOpenModal}
                   onClose={() => setIsOpenModal(false)}
                   title={modalTitle()}
            >
                <BankAccountForm
                    action={formAction}
                    data={bankAccount}
                    onCancel={cancelForm}
                    onCallback={submitForm}/>
            </Modal>
        </>
    )
}

BankAccounts.getLayout = function getLayout(page: ReactElement) {
    return (
        <PortalLayout>
            {page}
        </PortalLayout>
    )
}

export default BankAccounts
