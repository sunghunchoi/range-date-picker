import React from 'react';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import CustomDateInput from "./components/CustomDateInput";

const ariaLabel = { 'aria-label': 'description' };

function App() {
  return (
    <div className="App">
        <Box
            component="form"
            sx={{
                '& > :not(style)': { m: 1 },
            }}
            noValidate
            autoComplete="off"
        >
            <CustomDateInput/>
        </Box>
    </div>
  );
}

export default App;
