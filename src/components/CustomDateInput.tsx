import React, {useRef} from 'react';
import InputMask from "react-input-mask";
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

function CustomDateInput() {
    const toDateInputDivRef = useRef<HTMLDivElement>(null);

    const handleFromDateInputEnterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return
        if(toDateInputDivRef) {
            toDateInputDivRef.current?.querySelector("input")?.focus();
        }
    }

    return (
        <div>
            <Paper
                component="div"
                sx={{ display: 'flex', alignItems: 'center', width: "450px" }}
            >
                <div>
                    <InputMask onKeyDown={handleFromDateInputEnterKeyDown} mask="9999-99-99">
                        <InputBase
                            sx={{ ml: 1, flex: 1, minWidth: "140px" }}
                            placeholder="FromDate"
                            inputProps={{ 'aria-label': 'from date' }}
                        />
                    </InputMask>
                </div>
                <ArrowRightAltIcon  sx={{ p: '10px' }} />
                <div ref={toDateInputDivRef}>
                    <InputMask mask="9999-99-99">
                        <InputBase
                            sx={{ ml: 1, flex: 1, minWidth: "140px" }}
                            placeholder="ToDate"
                            inputProps={{ 'aria-label': 'to date' }}
                        />
                    </InputMask>
                </div>
                <CalendarMonthIcon sx={{ p: '10px' }} />
            </Paper>
        </div>
    )

}

export default CustomDateInput;