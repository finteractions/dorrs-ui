export enum FormStatus {
    SUBMITTED = 'submitted',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CHANGED = 'changed',
    DELETED = 'deleted'
}

export enum PublicDirectoryFormStatus {
    UNCLAIMED = 'Unclaimed',
    CLAIMED = 'Claimed',
}

export const PublicDirectoryFormStatusNames = {
    [FormStatus.SUBMITTED]: 'In Process',
    [FormStatus.APPROVED]: 'Live',
    [FormStatus.REJECTED]: 'Rejected',
    [FormStatus.CHANGED]: 'Changed',
    [FormStatus.DELETED]: 'Deleted',
};

export const getApprovedFormStatus = (): FormStatus[] => {
    return [FormStatus.APPROVED, FormStatus.CHANGED];
};

export const getBuildableFormStatuses = (): FormStatus[] => {
    return [FormStatus.APPROVED, FormStatus.CHANGED, FormStatus.DELETED];
};

export const getPublicDirectoryFormStatusNames = <T extends FormStatus>(status: T): string => {
    return PublicDirectoryFormStatusNames[status] || '';
};
