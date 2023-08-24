import moment from "moment/moment";
import {faRefresh} from "@fortawesome/free-solid-svg-icons";

function buildOptions(prop_name: string, data: any[]){
    return Array.from(new Set(data.map(item => getObjectValue(prop_name, item))))
        .filter(i => i)
        .map(i => ({value: i, label: i}))
        .sort((a, b) => a.label.localeCompare(b.label));
}

function setValue(prop_name: string, data: any){
    return data[prop_name] ? {value: data[prop_name], label: data[prop_name]} : null;
}

function getObjectValue(prop_name: string, data: any){
    return prop_name.split('.').reduce((acc, key) => {
        return acc && acc[key];
    }, data);
}

function filterData(filter_data: any, data: any){
    return data.filter((item: any) => {

        for (const [key] of Object.entries(filter_data)) {
            if (typeof filter_data[key] === 'object'){
                const date = moment(item[key]);
                const startDate = filter_data[key]['startDate'];
                const endDate = filter_data[key]['endDate'];

                if ((startDate && date.isBefore(startDate, 'date')) || (endDate && date.isAfter(endDate, 'date'))) return false

            } else {
                const itemValue = key.split('.').reduce((acc, key) => {
                    return acc && acc[key];
                }, item);

                if (filter_data[key] && itemValue !== filter_data[key])  return false;
            }

        }

        return true;
    });
}

function getFilterResetIcon() {
    return faRefresh
}

const filterService = {
    buildOptions,
    setValue,
    filterData,
    getFilterResetIcon
}

export default filterService
