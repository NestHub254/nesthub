import OperationsApp from './OperationsApp.jsx';
import {api,logout} from '../../api/client.js';
import ThemeSelector,{useWorkspaceTheme} from '../owner/ThemeSelector.jsx';
import '../../styles/workspace-theme.css';
export default function PropertyApp({session}){const theme=useWorkspaceTheme(session.userId);return <OperationsApp session={session} api={api} logout={logout} themeStyle={theme.style} themeControl={<ThemeSelector theme={theme.theme} onChange={theme.setTheme}/>}/>;}
