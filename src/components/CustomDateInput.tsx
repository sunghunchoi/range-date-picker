import React, {useRef, useState} from 'react';
import InputMask from "react-input-mask";
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {ActiveModifiers, ClassNames, DateFormatter, DateRange, DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import ja from 'date-fns/locale/ja';
import {addDays, format, isAfter, isBefore, isEqual, subDays} from "date-fns";

interface CustomDateInputState {
    dateRange : DateRange;
    dateRangeString: {from: string, fromError: boolean, to: string, toError: boolean};
    showCalendar: boolean;
    inputFocus: string | null;
}

type dateRangeSelectedTarget = "FROM" | "TO"

const today = new Date();
const firstDayOnMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const maxEndDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

const getDiffDays = (startDate: Date, endDate: Date): number => {
    return (startDate.getTime() - endDate.getTime()) / (1000*60*60*24);
}


const getMaxEndDay = (startDate: Date):Date => {
    const diffFromMaxEndDays = getDiffDays(maxEndDay, startDate);
    if(diffFromMaxEndDays < 60) {
        return maxEndDay;
    }
    return addDays(startDate, 59);
}


const isOverMaxEndDay = (targetDate: Date): boolean => {
    return isAfter(targetDate.setHours(0,0,0), maxEndDay);
}

const adjustFromToDate = (
    selectedDate: Date,
    prevFromTo: {from: Date, to: Date},
    selectedTarget: dateRangeSelectedTarget): { from: Date, to: Date } | null =>
{    const overMaxEndDay = isOverMaxEndDay(selectedDate);
    if(overMaxEndDay) return null;
    if (selectedTarget === "FROM") {
        if(isAfter(selectedDate, prevFromTo.to)) {
            return {from: selectedDate, to: getMaxEndDay(selectedDate)}
        }
        const diff = getDiffDays(prevFromTo.to, selectedDate);
        return diff > 59 ?
            {from: selectedDate, to: addDays(selectedDate, 59)}
            :
            {from: selectedDate, to: prevFromTo.to}
    } else if(selectedTarget === "TO") {
        if(isBefore(selectedDate, prevFromTo.from)) {
            return {from: subDays(selectedDate, 59), to: selectedDate}
        }
        const diff = getDiffDays(selectedDate, prevFromTo.from);
        return diff > 59 ?
            {from: subDays(selectedDate, 59), to: selectedDate}
            :
            {from:prevFromTo.from, to:selectedDate }
    }
    return prevFromTo;
}

const css = `
  .custom-selected:not([disabled]) {
    font-size: 1rem;  
    background-color: #32a88f;
    border: 2px solid #32a88f;
}
  .custom-selected:hover:not([disabled]) { 
    border-color: red;
    border: 2px solid green;
    color: green;
  }
`;
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
                from: firstDayOnMonth,
                to: maxEndDay
            },
            dateRangeString: {
                from: format(firstDayOnMonth, 'yyyyMMdd'),
                fromError: false,
                to: format(maxEndDay, 'yyyyMMdd'),
                toError: false,
            },
            showCalendar: false,
            inputFocus: null,
        }
    );

    const toDateInputDivRef = useRef<HTMLDivElement>(null);


    function handleEscKeyDown(e: any) {
        if (e.key !== 'Escape') return
        setState((prev) => ({...prev, showCalendar: false, inputFocus: null}));
    }

    React.useEffect(() => {
        document.addEventListener('keydown', handleEscKeyDown);
        return () => {
            document.removeEventListener('keydown', handleEscKeyDown);
        };
    }, []);

    const handleFromDateInputEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return
        if( state.dateRangeString.fromError ) {
            return;
        }
        if(toDateInputDivRef) {
            toDateInputDivRef.current?.querySelector("input")?.focus();
            setState((prev) => ({...prev, inputFocus: "to"}))
        }
    }

    const handleFromToInputEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return;
        if( state.dateRangeString.toError ) {
            return;
        }
        setState((prev) => ({...prev, showCalendar: false, inputFocus: null}));
    }

    const handleOnClickedInputBase = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        setState((prev) => ({...prev, showCalendar: true, inputFocus: target.id}))
    }

    const handleOnSelectedCalender = (
        range: DateRange | undefined,
        selectedDay: Date,
        activeModifiers: ActiveModifiers, e: React.MouseEvent
    ) => {
        e.preventDefault();
        if(state.inputFocus === "to" && isEqual(selectedDay , state.dateRange.to!)) {
            setState((prev) => ({...prev, inputFocus: null}));
        }
        if(range && range.from && range.to) {
            if(state.inputFocus === "from" || state.inputFocus === null) {
                const targetRange = adjustFromToDate(
                    selectedDay,
                    {from: state.dateRange.from!, to: state.dateRange.to!},
                    "FROM"
                );
                if(targetRange) {
                    setState((prev) => (
                        {
                            ...prev,
                            dateRangeString: {
                                ...prev.dateRangeString,
                                from: format(targetRange.from, 'yyyyMMdd'),
                                fromError: false,
                                to: format(targetRange.to, 'yyyyMMdd'),
                            },
                            dateRange: {
                                from: targetRange.from, to: targetRange.to
                            },
                            inputFocus: "to",
                        }))
                    return;
                }
            }
            if(state.inputFocus === "to") {
                const targetRange = adjustFromToDate(
                    selectedDay,
                    {from: state.dateRange.from!, to: state.dateRange.to!},
                    "TO"
                );
                if(targetRange) {
                    setState((prev) => (
                        {
                            ...prev,
                            dateRangeString: {
                                ...prev.dateRangeString,
                                from: format(targetRange.from, 'yyyyMMdd'),
                                toError: false,
                                to: format(targetRange.to, 'yyyyMMdd'),
                            },
                            dateRange: {
                                from: targetRange.from, to: targetRange.to
                            },
                            inputFocus: null,
                        }))
                    return;
                }
            }
        }
    }

    const handleChangeInputtedRangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const id = e.target.id;
        if(Date.parse(e.target.value)) {
            const targetRange = adjustFromToDate(
                new Date(e.target.value),
                {from: state.dateRange.from!, to: state.dateRange.to!},
                id === "from" ? "FROM" : "TO"
            );
            if(targetRange) {
                setState(
                    (prev) => (
                        {
                            ...prev,
                            dateRange: {...targetRange},
                            dateRangeString: {
                                ...prev.dateRangeString,
                                fromError: id === "from" ? false : prev.dateRangeString.fromError,
                                toError: id === "to" ? false : prev.dateRangeString.toError,
                                from: format(targetRange.from, 'yyyyMMdd'),
                                to: format(targetRange.to, 'yyyyMMdd')
                            },
                        })
                )
            } else {
                setState(
                    (prev) => (
                        {
                            ...prev,
                            dateRangeString: {
                                ...prev.dateRangeString,
                                [e.target.id]: e.target.value,
                                fromError: id === "from",
                                toError: id === "to",
                            },
                            inputFocus: e.target.id
                        })
                )
            }
        } else {
            setState(
                (prev) => (
                    {
                        ...prev,
                        dateRangeString: {
                            ...prev.dateRangeString,
                            [e.target.id]: e.target.value,
                            fromError: id === "from",
                            toError: id === "to",
                        },
                        inputFocus: e.target.id
                    })
            )
        }
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
                            id="from"
                            sx={{ ...state.inputFocus === "from" && {borderBottom: `2px solid ${state.dateRangeString.fromError ? 'red' : 'green'}`},ml: 1, flex: 1, minWidth: "140px" }}
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
                        onKeyDown={handleFromToInputEnterKeyDown}
                        mask="9999-99-99"
                        value={state.dateRangeString.to}
                        onChange={handleChangeInputtedRangeDate}
                    >
                        <InputBase
                            id="to"
                            sx={{ ...state.inputFocus === "to" && {borderBottom: `2px solid ${state.dateRangeString.toError ? 'red' : 'green'}`}, ml: 1, flex: 1, minWidth: "140px" }}
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
                    <style>{css}</style>
                    <DayPicker
                        modifiersClassNames={{
                            selected: 'custom-selected',
                            today: 'today'
                        }}
                        modifiersStyles={{
                            disabled: { fontSize: '90%' }
                        }}
                        mode="range"
                        defaultMonth={state.dateRange.from}
                        selected={state.dateRange}
                        onSelect={handleOnSelectedCalender}
                        locale={ja}
                        formatters={{formatCaption}}
                        numberOfMonths={2}
                        disabled={[{after: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)}]}
                    />
                </Paper>
            }
        </div>
    )
}

export default CustomDateInput;