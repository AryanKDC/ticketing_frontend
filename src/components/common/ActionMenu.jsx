import React, { useState } from "react";
import { TableCell, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export default function ActionMenu({ menuItems = [], onClickCallback }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleItemClick = (item) => {
        handleClose();
        if (onClickCallback) onClickCallback(item);
    };

    return (
        <TableCell>
            <IconButton
                onClick={handleClick}
                sx={{
                    color: "primary.main",
                    "&:hover": { bgcolor: "primary.light" },
                }}
            >
                <MoreHorizIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {menuItems.map((item, index) => (
                    <MenuItem key={index} onClick={() => handleItemClick(item)}>
                        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                        <ListItemText>{item.title}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </TableCell>
    );
}