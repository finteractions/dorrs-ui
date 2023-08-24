import React, {forwardRef, useImperativeHandle, useState} from 'react';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import {DateRangePicker as DateRange} from 'react-dates';
import moment from "moment";

interface DateRangePickerProps extends IFilter {
    onChange: (startDate: any, endDate: any) => void;
}

const DateRangePicker = forwardRef<IFilter, DateRangePickerProps>(
    ({onChange, onReset}, ref) => {
        const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null);
        const [startDate, setStartDate] = useState<moment.Moment | null>(null);
        const [endDate, setEndDate] = useState<moment.Moment | null>(null);

        useImperativeHandle(
            ref,
            () => ({
                onReset: () => {
                    setStartDate(null);
                    setEndDate(null);
                    onReset();
                },
                getSelectedDates: () => {
                    return {
                        startDate,
                        endDate
                    };
                }
            }),
            [onReset, startDate, endDate]
        );

        const handleDatesChange = ({
                                       startDate,
                                       endDate
                                   }: { startDate: moment.Moment | null, endDate: moment.Moment | null }) => {
            setStartDate(startDate);
            setEndDate(endDate);
            onChange(startDate, endDate);
        };

        return (
            <DateRange
                startDate={startDate}
                startDateId="start_date"
                endDate={endDate}
                endDateId="end_date"
                onDatesChange={handleDatesChange}
                focusedInput={focusedInput}
                onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
                isOutsideRange={() => false}
                readOnly={true}
                anchorDirection="right"
                hideKeyboardShortcutsPanel={true}
                numberOfMonths={1}
                // showDefaultInputIcon
                // inputIconPosition="after"
                // customInputIcon={<TestCustomInputIcon />}
                // small
            />
        );
    }
);

DateRangePicker.displayName = 'DateRangePicker';

export default DateRangePicker;
