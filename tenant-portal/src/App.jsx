import {Routes,Route,Navigate} from 'react-router-dom';
import {getSession,api,logout} from './api/client.js';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import OperationsApp from './pages/operations/OperationsApp.jsx';
function Dashboard(){const session=getSession();return session?.role==='tenant'?<OperationsApp session={session} api={api} logout={logout}/>:<Navigate to="/login" replace/>;}
export default function App(){return <Routes><Route path="/" element={<Navigate to="/login" replace/>}/><Route path="/login" element={<Login/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route path="/app/*" element={<Dashboard/>}/><Route path="*" element={<Navigate to="/login" replace/>}/></Routes>;}
