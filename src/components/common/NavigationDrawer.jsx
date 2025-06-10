import { useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, Clock, Users, Settings, MapPin, FileText, Utensils, NotebookPen, Crown, Shield, User, Star } from 'lucide-react';
//freepik.com "Kawaii Flat" icons
import boyIcon from "../../assets/boy.png"
import elfIcon from "../../assets/elf.png"
import knightIcon from "../../assets/knight.png"
import ninjaIcon from "../../assets/ninja.png"
import wizardIcon from "../../assets/wizard.png"
import valkyrieIcon from "../../assets/valkyrie.png"
import jesusIcon from "../../assets/jesus.png"

const NavigationDrawer = ({ isOpen, onClose, userDetails }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get user level from userDetails, default to 1 if not set
    const userLevel = parseInt(userDetails?.accessLevel) || 1;
    
    // Debug log to check access level
    console.log('User Level Debug:', {
        originalAccessLevel: userDetails?.accessLevel,
        parsedUserLevel: userLevel,
        userDetails: userDetails
    });

    // Define access levels and their properties
    const accessLevels = {
        1: { 
            icon: boyIcon, 
            color: '#6b7280',
            bgColor: '#f3f4f6'
        },
        2: { 
            icon: knightIcon, 
            color: '#059669',
            bgColor: '#ecfdf5'
        },
        3: { 
            icon: elfIcon, 
            color: '#ac7339',
            bgColor: '#dfbf9f'
        },
        50: { 
            icon: wizardIcon, 
            color: '#ff884d',
            bgColor: '#ffddcc'
        },
        80: { 
            icon: valkyrieIcon, 
            color: '#a64dff',
            bgColor: '#d9b3ff'
        },
        99: { 
            icon: jesusIcon,
            color: '#dc2626',
            bgColor: '#fbd0d0'
        }
    };

    const handleNavigation = (path, requiredLevel) => {
        // Check if user has sufficient access level
        if (userLevel < requiredLevel) {
            return; // Don't navigate if access denied
        }
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
            color: '#2563eb',
            requiredLevel: 1
        },
        {
            id: 'mrt-checker',
            title: '休時檢視系統',
            description: '排班模擬器&休時檢視',
            icon: <Clock size={24} />,
            path: '/mrt-checker',
            color: '#059669',
            requiredLevel: 1
        },
        {
            id: 'vacation-planner',
            title: 'GDay劃假系統',
            description: '指定休假申請',
            icon: <MapPin size={24} />,
            path: '/vacation-planner',
            color: '#7c3aed',
            requiredLevel: 1
        },
        {
            id: 'business-class',
            title: 'BC擺盤訓練',
            description: '商務艙擺盤練習',
            icon: <Utensils size={24} />,
            path: '/mdabusiness',
            color: '#ea580c',
            requiredLevel: 1
        },
        {
            id: 'etr-generator',
            title: 'eTR產生器',
            description: 'e-"TAHI" Report',
            icon: <NotebookPen size={24} />,
            path: '/etr-generator',
            color: '#dc2626',
            requiredLevel: 2
        },
        {
            id: 'patch-notes',
            title: 'Patch內容',
            description: 'APP更新項目',
            icon: <FileText size={24} />,
            path: '/patch-notes',
            color: '#9bafd9',
            requiredLevel: 1
        }
    ];

    // Get current level info
    const currentLevelInfo = accessLevels[userLevel] || accessLevels[1];

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
                        <div className="user-avatar-container">
                            <div 
                                className="user-avatar"
                                style={{ 
                                    backgroundColor: currentLevelInfo.bgColor,
                                    color: currentLevelInfo.color,
                                    border: `2px solid ${currentLevelInfo.color}`
                                }}
                            >
                                {/* Render image or fallback text based on icon type */}
                                {typeof currentLevelInfo.icon === 'string' ? (
                                    <img 
                                        src={currentLevelInfo.icon} 
                                        alt={`Level ${userLevel}`}
                                        style={{ width: '90%', height: '90%' }}
                                        onError={(e) => {
                                            // Fallback to text if image fails to load
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : (
                                    // If icon is not a string (like for level 99 with imported image)
                                    <img 
                                        src={currentLevelInfo.icon} 
                                        alt={`Level ${userLevel}`}
                                        style={{ width: '20px', height: '20px' }}
                                        onError={(e) => {
                                            // Fallback to text if image fails to load
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                )}
                                <span style={{ display: 'none' }}>{userLevel}</span>
                            </div>
                            <div 
                                className="user-level-badge"
                                style={{ 
                                    backgroundColor: currentLevelInfo.color,
                                    color: 'white'
                                }}
                            >
                                {userLevel}
                            </div>
                        </div>
                        <div className="user-details">
                            <div className="user-name">{userDetails?.name || 'User'}</div>
                            <div className="user-meta">
                                {userDetails?.rank} • {userDetails?.base}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Navigation Items */}
                <div className="drawer-content">
                    <div className="drawer-section">
                        <h3 className="drawer-section-title">應用程式</h3>
                        <div className="drawer-menu">
                            {menuItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                const hasAccess = userLevel >= item.requiredLevel;
                                
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigation(item.path, item.requiredLevel)}
                                        className={`drawer-menu-item ${isActive ? 'active' : ''} ${!hasAccess ? 'disabled' : ''}`}
                                        disabled={!hasAccess}
                                    >
                                        <div 
                                            className="menu-item-icon"
                                            style={{ 
                                                color: hasAccess ? item.color : '#9ca3af',
                                                opacity: hasAccess ? 1 : 0.5 
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className="menu-item-content">
                                            <div className="menu-item-title-container">
                                                <div 
                                                    className="menu-item-title"
                                                    style={{ 
                                                        color: hasAccess ? 'inherit' : '#9ca3af',
                                                        opacity: hasAccess ? 1 : 0.6 
                                                    }}
                                                >
                                                    {item.title}
                                                </div>
                                                {!hasAccess && (
                                                    <div className="access-level-required">
                                                        需要等級 {item.requiredLevel}+
                                                    </div>
                                                )}
                                            </div>
                                            <div 
                                                className="menu-item-description"
                                                style={{ 
                                                    color: hasAccess ? 'inherit' : '#9ca3af',
                                                    opacity: hasAccess ? 1 : 0.5 
                                                }}
                                            >
                                                {item.description}
                                            </div>
                                        </div>
                                        {isActive && hasAccess && <div className="menu-item-indicator" />}
                                        {!hasAccess && (
                                            <div className="access-denied-icon">
                                                <Shield size={16} color="#9ca3af" />
                                            </div>
                                        )}
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