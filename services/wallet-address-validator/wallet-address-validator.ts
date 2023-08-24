import WAValidator from 'multicoin-address-validator';

const networkType = 'both';
const validate = (address: string, protocol: string): boolean => {

    try {
        address = address.replace('bchtest:', '').replace('bitcoincash:', '');
        const currency = WAValidator.findCurrency(protocol);

        if (currency) {
            const standardValidator = WAValidator.validate(address, protocol, networkType);
            const legacyValidator = WAValidator.validate(address, protocol, networkType);
            return (standardValidator || legacyValidator);
        } else {
            return true;
        }

    } catch (e) {
        return false;
    }
}

const walletAddressValidator = {
    validate
}

export default walletAddressValidator
