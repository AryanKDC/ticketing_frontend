import { Box, TextField, Button, Alert, CircularProgress, Typography, Link as MuiLink } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { register, clearAuthError } from "../../redux/slices/authSlice";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function RegisterPage() {
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
        name: Yup.string().required("Name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    });

    const handleSubmit = async (values) => {
        const resultAction = await dispatch(register(values));
        if (register.fulfilled.match(resultAction)) {
            navigate("/tickets");
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 10 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>Create Account</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>Register to start using the ticketing system</Typography>
            {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} */}
            <Formik
                initialValues={{ name: "", email: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Field name="name" as={TextField} label="Name" fullWidth margin="normal" helperText={<ErrorMessage name="name" />} />
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
                                        <IconButton
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.2, borderRadius: '10px', fontWeight: 700 }}>
                            {loading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Register"}
                        </Button>
                    </Form>
                )}
            </Formik>
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" sx={{ fontWeight: 700 }}>Sign In</MuiLink>
            </Typography>
        </Box>
    );
}