import React, {useRef, useState} from 'react';
import InputMask from "react-input-mask";
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {ActiveModifiers, ClassNames, DateFormatter, DateRange, DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import ja from 'date-fns/locale/ja';
import {addDays, format, isAfter} from "date-fns";

interface CustomDateInputState {
    dateRange : DateRange;
    dateRangeString: {from: string, to: string};
    showCalendar: boolean;
}

const today = new Date();

const formatCaption: DateFormatter = (date, options) => {
    return (
        <>
            {format(date, 'yyyy年 MM月', { locale: options?.locale })}
        </>
    );
};

function CustomDateInput() {
    const [state, setState] = useState<CustomDateInputState>(
        {
            dateRange: {
                from: new Date(today.getFullYear(), today.getMonth(), 1),
                to: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
            },
            dateRangeString: {
                from: format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyyMMdd'),
                to: format(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), 'yyyyMMdd'),
            },
            showCalendar: false
        }
    );

    function handleEscKeyDown(e: any) {
        if (e.key !== 'Escape') return
        setState({...state, showCalendar: false});
    }

    React.useEffect(() => {
        document.addEventListener('keydown', handleEscKeyDown);
        return () => {
            document.removeEventListener('keydown', handleEscKeyDown);
        };
    }, []);

    const toDateInputDivRef = useRef<HTMLDivElement>(null);

    const handleFromDateInputEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return
        if(toDateInputDivRef) {
            toDateInputDivRef.current?.querySelector("input")?.focus();
        }
    }

    const handleOnClickedInputBase = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        setState((prev) => ({...prev, showCalendar: true}))
    }

    const handleOnSelectedCalender = (
        range: DateRange | undefined,
        selectedDay: Date,
        activeModifiers: ActiveModifiers, e: React.MouseEvent
    ) => {
        e.preventDefault();
        if(range) {
            setState((prev) => ({...prev, dateRange: range}))
        }
    }

    const handleChangeInputtedRangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setState((prev) => ({...prev, dateRangeString: {...prev.dateRangeString, [e.target.id]: e.target.value}}))

    }

    return (
        <div>
            <Paper
                component="div"
                sx={{ display: 'flex', alignItems: 'center', width: "450px" }}
            >
                <div>
                    <InputMask
                        id={"from"}
                        onKeyDown={handleFromDateInputEnterKeyDown}
                        mask="9999-99-99"
                        value={state.dateRangeString.from}
                        onChange={handleChangeInputtedRangeDate}
                    >
                        <InputBase
                            id="DayPickerInputFrom"
                            sx={{ ml: 1, flex: 1, minWidth: "140px" }}
                            placeholder="FromDate"
                            inputProps={{ 'aria-label': 'from date' }}
                            onClick={handleOnClickedInputBase}
                        />
                    </InputMask>
                </div>
                <ArrowRightAltIcon  sx={{ p: '10px' }} />
                <div ref={toDateInputDivRef}>
                    <InputMask
                        id={"to"}
                        mask="9999-99-99"
                        value={state.dateRangeString.to}
                        onChange={handleChangeInputtedRangeDate}
                    >
                        <InputBase
                            sx={{ ml: 1, flex: 1, minWidth: "140px" }}
                            placeholder="ToDate"
                            inputProps={{ 'aria-label': 'to date' }}
                            onClick={handleOnClickedInputBase}
                        />
                    </InputMask>
                </div>
                <CalendarMonthIcon sx={{ p: '10px' }} />
            </Paper>
            {state.showCalendar &&
                <Paper
                    component="div"
                    sx={{ marginTop: '5px', p: '10px',width: "630px" }}
                >
                    <DayPicker
                        styles={{
                            caption: { fontSize: '0.8rem' },
                            head: { fontSize: '1rem' },
                        }}
                        mode="range"
                        selected={state.dateRange}
                        onSelect={handleOnSelectedCalender}
                        locale={ja}
                        formatters={{formatCaption}}
                        numberOfMonths={2}
                        disabled={[{after: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)}]}
                        // disabled={[{after: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) && isAfter(state.dateRange.from, addDays(state.dateRange.from,60)}]}
                    />
                </Paper>
            }
        </div>
    )

}

export default CustomDateInput;