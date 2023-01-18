import React, {useRef, useState} from 'react';
import InputMask from "react-input-mask";
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {ActiveModifiers, ClassNames, DateFormatter, DateRange, DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import ja from 'date-fns/locale/ja';
import {addDays, format, isAfter, isBefore, isEqual} from "date-fns";

interface CustomDateInputState {
    dateRange : DateRange;
    dateRangeString: {from: string, to: string};
    showCalendar: boolean;
    inputFocus: string | null;
}

const today = new Date();
const firstDayOnMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const maxEndDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
const getMaxEndDay = (startDate: Date):Date => {
    const diffFromMaxEndDays = (maxEndDay.getTime() - startDate.getTime()) / (1000*60*60*24);
    if(diffFromMaxEndDays < 60) {
        return maxEndDay;
    }
    return addDays(startDate, 59);
}

const isOverMaxEndDay = (targetDate: Date): boolean => {
    return isAfter(targetDate.setHours(0,0,0), maxEndDay);
}


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
                to: format(maxEndDay, 'yyyyMMdd'),
            },
            showCalendar: false,
            inputFocus: null,
        }
    );

    const toDateInputDivRef = useRef<HTMLDivElement>(null);


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

    const handleFromDateInputEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return
        if(toDateInputDivRef) {
            toDateInputDivRef.current?.querySelector("input")?.focus();
            setState((prev) => ({...prev, inputFocus: "to"}))
        }
    }

    const handleFromToInputEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return;
        setState((prev) => ({...prev, showCalendar: false}));
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
        if(state.inputFocus === "to" && isEqual(selectedDay , state.dateRange.to ?? new Date())) {
            setState((prev) => ({...prev, showCalendar: false, inputFocus: null}));
        }
        if(range && range.from && range.to) {
            if(state.inputFocus === "to" && isBefore(selectedDay.setHours(0,0,0), state.dateRange.from?.setHours(0,0,0) ?? new Date())) {
                return;
            }
            if(state.inputFocus === "from") {
                 setState((prev) => (
                     {
                        ...prev,
                        dateRangeString: {
                            from: format(selectedDay, 'yyyyMMdd'),
                            to: format(
                                isAfter(state.dateRange.to ?? selectedDay, getMaxEndDay(selectedDay))
                                    ? getMaxEndDay(selectedDay) : state.dateRange.to ?? selectedDay,'yyyyMMdd')
                        },
                        dateRange: {from: selectedDay, to: isAfter(state.dateRange.to ?? selectedDay, getMaxEndDay(selectedDay)) ? getMaxEndDay(selectedDay) : state.dateRange.to},
                        inputFocus: "to",
                     }))
                 return;
            }
            setState((prev) => (
                {
                    ...prev,
                    dateRangeString: {
                        ...prev.dateRangeString,
                        to: isAfter(selectedDay,getMaxEndDay(state.dateRange.from!)) ? format(getMaxEndDay(prev.dateRange.from!),'yyyyMMdd') : format(getMaxEndDay(prev.dateRange.from!),'yyyyMMdd')
                    },
                    dateRange: {
                        ...prev.dateRange,
                        to: isAfter(selectedDay,getMaxEndDay(state.dateRange.from!)) ? getMaxEndDay(prev.dateRange.from!) : selectedDay
                    },
                    showCalendar: false,
                    inputFocus: null,
                }))
            return;
        }
    }

    const handleChangeInputtedRangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if(Date.parse(e.target.value)) {
            const targetDate = new Date(e.target.value);
            if(isOverMaxEndDay(targetDate)) {
                const id = e.target.id;
                if (id === "from") {
                    setState(
                        (prev) => (
                            {
                                ...prev,
                                dateRange: {from: maxEndDay, end: maxEndDay},
                                dateRangeString: {from: format(maxEndDay, 'yyyyMMdd'), to: format(maxEndDay, 'yyyyMMdd'),},
                                inputFocus: "from",
                            }
                        )
                    )
                    return;
                } else {
                    console.log("ind")
                    setState(
                        (prev) => (
                            {
                                ...prev,
                                dateRange: {from: prev.dateRange.from, end: isAfter(targetDate, getMaxEndDay(prev.dateRange.from!)) ? getMaxEndDay(prev.dateRange.from!): targetDate},
                                dateRangeString: {from: prev.dateRangeString.from, to: isAfter(targetDate, getMaxEndDay(prev.dateRange.from!)) ? format(getMaxEndDay(prev.dateRange.to!),'yyyyMMdd') : format(getMaxEndDay(targetDate),'yyyyMMdd')},
                                inputFocus: "to",
                            }
                        )
                    )
                    return;
                }
            }
        }
        setState(
            (prev) => (
                {
                    ...prev,
                    dateRange:
                        Date.parse(e.target.value) ?
                            {
                                ...prev.dateRange, [e.target.id]: new Date(e.target.value)
                            } : {...prev.dateRange},
                    dateRangeString: {...prev.dateRangeString, [e.target.id]: e.target.value},
                    inputFocus: e.target.id
                })
        )
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
                            sx={{ ...state.inputFocus === "from" && {borderBottom: "2px solid green"},ml: 1, flex: 1, minWidth: "140px" }}
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
                            sx={{ ...state.inputFocus === "to" && {borderBottom: "2px solid green"},ml: 1, flex: 1, minWidth: "140px" }}
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