import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0061FF', // More vibrant, modern blue
      light: '#E5F0FF',
      dark: '#004C99',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748B', // Slate gray
    },
    background: {
      default: '#F8FAFC', // Very light slate/blue-gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#0F172A', // Deep slate for primary text
      secondary: '#64748B', // Medium slate for secondary text
    },
    status: {
      solved: '#10B981', // Emerals
      open: '#3B82F6', // Blue
      pending: '#F59E0B', // Amber
      spam: '#94A3B8', // Slate
    },
    sidebar: {
      primary: '#0F172A', // Deep dark sidebar
      secondary: '#F1F5F9', // Light sidebar
    }
  },
  shape: {
    borderRadius: 12, // More rounded, modern look
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 97, 255, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0061FF 0%, #60EFFF 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0056E0 0%, #50DFF0 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderBottom: '1px solid #F1F5F9',
        },
        head: {
          fontWeight: 600,
          color: '#64748B',
          backgroundColor: '#F8FAFC',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          height: '24px',
        },
      },
    },
  },
});

export default theme;
