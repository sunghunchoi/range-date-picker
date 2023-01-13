import React, {useRef} from 'react';
import InputMask from "react-input-mask";

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
            <div>
                <span>From Date : </span>
                <InputMask onKeyDown={handleFromDateInputEnterKeyDown} mask="9999-99-99" />
            </div>
            <div ref={toDateInputDivRef}>
                <span>To Date : </span>
                <InputMask mask="9999-99-99" />
            </div>
        </div>
    )

}

export default CustomDateInput;