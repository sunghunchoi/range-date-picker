import React, {useRef} from 'react';
import InputMask, {ReactInputMask} from "react-input-mask";

function CustomDateInput() {
    const fromDateInputRef = useRef<HTMLInputElement>(null);
    const toDateInputDivRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.nativeEvent.isComposing || e.key !== 'Enter') return
        console.log("Enter!")
        if(toDateInputDivRef) {
            toDateInputDivRef.current?.querySelector("input")?.focus();
        }
    }

    return (
        <div>
            <div>
                <span>From Date : </span>
                <InputMask onKeyDown={handleKeyDown} mask="9999-99-99" />
            </div>
            <div ref={toDateInputDivRef}>
                <span>To Date : </span>
                <InputMask mask="9999-99-99" />
            </div>
        </div>
    )

}

export default CustomDateInput;