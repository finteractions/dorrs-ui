import moment from "moment/moment";
import {} from "@fortawesome/free-solid-svg-icons";
import {faFilterCircleXmark} from "@fortawesome/free-solid-svg-icons/faFilterCircleXmark";

function buildOptions(prop_name: string, data: any[]) {
    const values = data.flatMap(item => {
        const value = getObjectValue(prop_name, item);
        const arrayValues = value instanceof Set ? Array.from(value) : [value];
        return arrayValues.filter(v => v !== null && v !== undefined && v !== '');
    });

    return Array.from(new Set(values))
        .filter(i => i !== undefined && i !== null)
        .map(i => ({ value: i, label: i.toString() }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

function setValue(prop_name: string, data: any) {
    return data[prop_name] ? {value: data[prop_name], label: data[prop_name]} : null;
}

function getObjectValue(prop_name: string, data: any) {
    const value = prop_name.split('.').reduce((acc, key) => {
        if (acc && typeof acc === 'object') {
            if (Array.isArray(acc[key])) {
                return new Set(acc[key]);
            }
            return acc[key];
        }
        return undefined;
    }, data);

    if (Array.isArray(value)) {
        return new Set(value);
    }
    return value;
}

function filterData(filter_data: any, data: any) {

    return data.filter((item: any) => {

        for (const [key] of Object.entries(filter_data)) {
            if (typeof filter_data[key] === 'object') {
                const date = moment(item[key]);
                const startDate = filter_data[key]['startDate'];
                const endDate = filter_data[key]['endDate'];

                if ((startDate && date.isBefore(startDate, 'date')) || (endDate && date.isAfter(endDate, 'date'))) return false

            } else {
                const itemValue = key.split('.').reduce((acc, key) => {
                    return acc && acc[key];
                }, item);

                if (filter_data[key] && itemValue !== filter_data[key]) return false;
            }

        }

        return true;
    });
}

function getFilterResetIcon() {
    return faFilterCircleXmark
}

const filterService = {
    buildOptions,
    setValue,
    filterData,
    getFilterResetIcon
}

export default filterService
