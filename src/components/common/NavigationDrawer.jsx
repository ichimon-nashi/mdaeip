import { useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, Clock, Users, Settings, MapPin, FileText, Utensils, NotebookPen  } from 'lucide-react';

const NavigationDrawer = ({ isOpen, onClose, userDetails }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const menuItems = [
        {
            id: 'duty-roster',
            title: '任務互換系統',
            description: '班表查詢&換班申請',
            icon: <Calendar size={24} />,
            path: '/mdaduty',
            color: '#2563eb'
        },
        {
            id: 'mrt-checker',
            title: '休時檢視系統',
            description: '排班模擬器&休時檢視',
            icon: <Clock size={24} />,
            path: '/mrt-checker',
            color: '#059669'
        },
        {
            id: 'vacation-planner',
            title: 'GDay劃假系統',
            description: '指定休假申請',
            icon: <MapPin size={24} />,
            path: '/vacation-planner',
            color: '#7c3aed'
        },
        {
            id: 'business-class',
            title: 'BC擺盤訓練',
            description: '商務艙擺盤練習',
            icon: <Utensils size={24} />,
            path: '/mdabusiness',
            color: '#ea580c'
        },
        {
            id: 'etr-generator',
            title: 'eTR產生器',
            description: 'e-"TAHI" Report',
            icon: <NotebookPen size={24} />,
            path: '/etr-generator',
            color: '#dc2626'
        },
        {
            id: 'patch-notes',
            title: 'Patch內容',
            description: 'APP更新項目',
            icon: <FileText size={24} />,
            path: '/patch-notes',
            color: '#9bafd9'
        }
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="drawer-backdrop"
                    onClick={onClose}
                />
            )}
            
            {/* Drawer */}
            <div className={`navigation-drawer ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="drawer-header">
                    <div className="drawer-user-info">
                        <div className="user-avatar">
                            {userDetails?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{userDetails?.name || 'User'}</div>
                            <div className="user-meta">
                                {userDetails?.rank} • {userDetails?.base}
                            </div>
                        </div>
                    </div>
                    {/* <button 
                        onClick={onClose}
                        className="drawer-close-button"
                    >
                        <X size={20} />
                    </button> */}
                </div>
                
                {/* Navigation Items */}
                <div className="drawer-content">
                    <div className="drawer-section">
                        <h3 className="drawer-section-title">應用程式</h3>
                        <div className="drawer-menu">
                            {menuItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`drawer-menu-item ${isActive ? 'active' : ''}`}
                                    >
                                        <div 
                                            className="menu-item-icon"
                                            style={{ color: item.color }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className="menu-item-content">
                                            <div className="menu-item-title">{item.title}</div>
                                            <div className="menu-item-description">{item.description}</div>
                                        </div>
                                        {isActive && <div className="menu-item-indicator" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="drawer-footer">
                    <div className="app-version">
                        豪神APP v1.0
                    </div>
                </div>
            </div>
        </>
    );
};

export default NavigationDrawer;