import type { AuthState, User } from "../types";
import { createContext, useReducer, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiService } from '../services/api';


export interface AuthContextType {
    state: AuthState;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

type AuthAction = 
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'LOGIN_FAILURE' }
    | { type: 'LOGOUT' }
    | { type: 'CHECK_AUTH_SUCCESS'; payload: {user: User; token: string} }
    | { type: 'CHECK_AUTH_FAILURE' };

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
            }
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
            }
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
            }
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
            }
        case 'CHECK_AUTH_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
            }
        case 'CHECK_AUTH_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
            }
        default:
            return state;
    }
}



// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (username: string, password: string): Promise<void> => {
        try {
            dispatch({ type: 'LOGIN_START' });

            const response = await apiService.login(username, password);

            // Store token and user in localStorage
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                user: response.user,
                token: response.token,
                },
            });

            console.log('Login successful:', response.user.username);
        } catch (error) {
            console.error('Login failed:', error);
            dispatch({ type: 'LOGIN_FAILURE' });
            throw error;
        }
    };

    const logout = (): void => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        // Call logout endpoint (optional, for server-side cleanup)
        apiService.logout().catch((error) => {
            console.warn('Logout API call failed:', error);
        });

        dispatch({ type: 'LOGOUT' });
        console.log('Logged out successfully');
    };

    const checkAuth = (): void => {
        try {
            const token = localStorage.getItem('auth_token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                dispatch({ type: 'CHECK_AUTH_FAILURE' });
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                console.log('Token expired, logging out');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                dispatch({ type: 'CHECK_AUTH_FAILURE' });
                return;
            }

            const user: User = JSON.parse(userStr);

            dispatch({
                type: 'CHECK_AUTH_SUCCESS',
                payload: { user, token },
            });
            console.log('Authentication restored for:', user.username);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            dispatch({ type: 'CHECK_AUTH_FAILURE' });
        }
    };

    const value: AuthContextType = {
        state,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
    );
}