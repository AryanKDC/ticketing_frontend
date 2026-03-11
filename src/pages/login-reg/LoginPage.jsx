import { Box, TextField, Button, Alert, CircularProgress, Typography, Link as MuiLink } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { login, clearAuthError } from "../../redux/slices/authSlice";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { InputAdornment, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, token } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (token) navigate("/tickets");
    }, [token, navigate]);

    useEffect(() => {
        return () => dispatch(clearAuthError());
    }, [dispatch]);

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().required("Password is required"),
    });

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (values) => {
        const resultAction = await dispatch(login(values));
        if (login.fulfilled.match(resultAction)) {
            navigate("/tickets");
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 10 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>Sign In</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>Enter your credentials to access the ticketing system</Typography>
            {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} */}
            <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Field name="email" as={TextField} label="Email" fullWidth margin="normal" helperText={<ErrorMessage name="email" />} />
                        <Field
                            name="password"
                            as={TextField}
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            margin="normal"
                            helperText={<ErrorMessage name="password" />}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.2, borderRadius: '10px', fontWeight: 700 }}>
                            {loading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Login"}
                        </Button>
                    </Form>
                )}
            </Formik>
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                Don't have an account?{' '}
                <MuiLink component={Link} to="/register" sx={{ fontWeight: 700 }}>Register</MuiLink>
            </Typography>
        </Box>
    );
}