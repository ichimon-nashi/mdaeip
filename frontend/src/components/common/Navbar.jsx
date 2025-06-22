import { useState } from 'react';
import { Menu } from 'lucide-react';
import NavigationDrawer from './NavigationDrawer';

const Navbar = ({ userDetails, title = "豪神組員任務互換APP", onLogout }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Handler for logout
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            window.location.reload();
        }
    };

    const navbarNickname = () => {
        switch(userDetails?.name) {
            case "韓建豪": return "GOD";
            case "楊子翎": return "北瓜";
            case "牛仁鼎": return "🐄🐄";
            case "許惠芳": return "芳芳";
            case "陳中榆": return "陳施主";
            default: return userDetails?.name?.slice(1) || "User";
        }
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-left">
                        <button 
                            onClick={() => setIsDrawerOpen(true)}
                            className="navbar-menu-button"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="navbar-title">{title}</div>
                    </div>
                    <div className="navbar-right">
                        <div>
                            <p className="navbar-welcomeMsg">Hi, {navbarNickname()}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="logoutButton"
                        >
                            登出
                        </button>
                    </div>
                </div>
            </nav>
            
            <NavigationDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                userDetails={userDetails}
            />
        </>
    );
};

export default Navbar;