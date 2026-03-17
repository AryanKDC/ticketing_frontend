import UserList from "../components/UserList";
import { Box, Typography } from "@mui/material";

export default function UserPage() {
    return (
        <Box sx={{ p: 4, overflow: 'auto', height: '100%' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#172b4d' }}>
                    User Management
                </Typography>
            </Box>
            <UserList />
        </Box>
    );
}
