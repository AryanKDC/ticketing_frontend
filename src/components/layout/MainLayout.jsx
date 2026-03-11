import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import Sidebar from './Sidebar';
import theme from '../../theme';

const MainLayout = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: 'background.default' }}>
                <CssBaseline />
                <Sidebar />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.default',
                        position: 'relative'
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default MainLayout;
