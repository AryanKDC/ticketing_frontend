import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, Typography, Box, FormControl } from "@mui/material";


export default function AssignModal({
    open,
    onClose,
    selectedTicket,
    assignee,
    setAssignee,
    handleAssign,
    users,
    currentUser
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    m: 2
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                pt: 3,
                px: 3,
                fontWeight: 600,
                fontSize: '1.25rem'
            }}>
                {selectedTicket?.assignee ? "Reassign Ticket" : "Assign Ticket"}
            </DialogTitle>

            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    px: 3,
                    pt: '16px !important'
                }}
            >
                <Box sx={{
                    p: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                        Ticket Subject
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                        {selectedTicket?.subject || "No subject provided"}
                    </Typography>
                </Box>

                <FormControl fullWidth size="small">
                    <Typography variant="caption" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                        Select Agent
                    </Typography>

                    <Autocomplete
                        value={users.find(u => u._id === assignee) || null}
                        onChange={(event, newValue) => setAssignee(newValue?._id || "")}
                        options={users.filter(u => u.type === 'admin' || u.type === 'support')}
                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Select Agent"
                                size="small"
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'divider'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main'
                                    }
                                }}
                            />
                        )}
                        noOptionsText="No agents available"
                    />
                </FormControl>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
                <Button
                    disableRipple
                    onClick={onClose}
                    sx={{
                        borderRadius: 2,
                        color: 'text.secondary',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    disableElevation
                    onClick={handleAssign}
                    disabled={!assignee}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    {selectedTicket?.assignee ? "Reassign" : "Assign"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}