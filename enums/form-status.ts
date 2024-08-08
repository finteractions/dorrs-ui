export enum FormStatus {
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CHANGED = 'changed',
    DELETED = 'deleted'
}

export enum PublicDirectoryFormStatus {
    IN_PROCESS = 'In Process',
    LIVE = 'Live',
    UNCLAIMED = 'Unclaimed',
    CLAIMED = 'Claimed',
    PENDING = 'Pending'
}

export const getApprovedFormStatus = (): FormStatus[] => {
    return [FormStatus.APPROVED, FormStatus.CHANGED];
};

export const getBuildableFormStatuses = (): FormStatus[] => {
    return [FormStatus.APPROVED, FormStatus.CHANGED, FormStatus.DELETED];
};
