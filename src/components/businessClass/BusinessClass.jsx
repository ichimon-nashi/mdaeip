import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../common/Navbar';
import styles from '../../styles/business-class.module.css';
import rotateDevice from "./assets/rotateDevice.gif";
import breadPlaceholder from "./assets/bread-placeholder.png";
import fruitPlaceholder from "./assets/fruit-placeholder.png";
import saladPlaceholder from "./assets/salad-placeholder.png";
import mainPlaceholder from "./assets/main-placeholder.png";
import butterPlaceholder from "./assets/butter-placeholder.png";
import saltpepperPlaceholder from "./assets/saltpepper-placeholder.png";
import waterPlaceholder from "./assets/water-placeholder.png";
import winePlaceholder from "./assets/wine-placeholder.png";
import utensilPlacholder from "./assets/utensil-placeholder.png";

const BusinessClass = ({ userDetails, onLogout }) => {
    // Device-specific configurations
    const getDeviceConfig = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Use the smaller dimension (height in landscape) for more accurate device detection
        const deviceSize = Math.min(width, height);
        
        // Also check for touch capability to distinguish between desktop and mobile devices
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (deviceSize >= 900 && !isTouchDevice) {
            // Desktop - large screens without touch
            return {
                'main-plate': {
                    name: 'Main Plate',
                    color: '#e5e7eb',
                    size: { width: '20rem', height: '14rem' },
                    traySize: { width: '4rem', height: '2.8rem' },
                    correctPosition: { x: '38.25rem', y: '14.06rem' }, // 612px / 16 = 38.25rem, 225px / 16 = 14.06rem
                    image: mainPlaceholder
                },
                'salad-plate': {
                    name: 'Salad Plate',
                    color: '#fecaca',
                    size: { width: '12.5rem', height: '12.5rem' },
                    traySize: { width: '2.5rem', height: '2.5rem' },
                    correctPosition: { x: '23.75rem', y: '1.56rem' }, // 380px / 16 = 23.75rem, 25px / 16 = 1.56rem
                    image: saladPlaceholder
                },
                'fruit-bowl': {
                    name: 'Fruit Bowl',
                    color: '#fecaca',
                    size: { width: '12.5rem', height: '12.5rem' },
                    traySize: { width: '2.5rem', height: '2.5rem' },
                    correctPosition: { x: '42.81rem', y: '1.56rem' }, // 685px / 16 = 42.81rem, 25px / 16 = 1.56rem
                    image: fruitPlaceholder
                },
                'bread-plate': {
                    name: 'Bread Plate',
                    color: '#fef3c7',
                    size: { width: '14rem', height: '14rem' },
                    traySize: { width: '2.8rem', height: '2.8rem' },
                    correctPosition: { x: '23.75rem', y: '14.06rem' }, // 380px / 16 = 23.75rem, 225px / 16 = 14.06rem
                    image: breadPlaceholder
                },
                'utensils': {
                    name: 'Utensils',
                    color: '#d1d5db',
                    size: { width: '6rem', height: '16rem' },
                    traySize: { width: '1.2rem', height: '3.2rem' },
                    correctPosition: { x: '58.75rem', y: '12rem' }, // 940px / 16 = 58.75rem, 192px / 16 = 12rem
                    image: utensilPlacholder
                },
                'water-glass': {
                    name: 'Water Glass',
                    color: '#dbeafe',
                    size: { width: '4rem', height: '10rem' },
                    traySize: { width: '0.8rem', height: '2rem' },
                    correctPosition: { x: '55.94rem', y: '1.56rem' }, // 895px / 16 = 55.94rem, 25px / 16 = 1.56rem
                    image: waterPlaceholder
                },
                'wine-glass': {
                    name: 'Wine Glass',
                    color: '#e9d5ff',
                    size: { width: '4rem', height: '10rem' },
                    traySize: { width: '0.8rem', height: '2rem' },
                    correctPosition: { x: '60.63rem', y: '1.56rem' }, // 970px / 16 = 60.63rem, 25px / 16 = 1.56rem
                    image: winePlaceholder
                },
                'salt-pepper': {
                    name: 'Salt & Pepper',
                    color: '#9ca3af',
                    size: { width: '5rem', height: '5rem' },
                    traySize: { width: '1rem', height: '1rem' },
                    correctPosition: { x: '37.19rem', y: '3.13rem' }, // 595px / 16 = 37.19rem, 50px / 16 = 3.13rem
                    image: saltpepperPlaceholder
                },
                'butter-dish': {
                    name: 'Butter Dish',
                    color: '#fecaca',
                    size: { width: '6rem', height: '4rem' },
                    traySize: { width: '1.2rem', height: '0.8rem' },
                    correctPosition: { x: '36.56rem', y: '9.06rem' }, // 585px / 16 = 36.56rem, 145px / 16 = 9.06rem
                    image: butterPlaceholder
                },
            };
        } else if (width >= 768) {
            // Tablet - scale positions proportionally (75% of desktop)
            return {
                'main-plate': {
                    name: 'Main Plate',
                    color: '#e5e7eb',
                    size: { width: '15rem', height: '10.5rem' },
                    traySize: { width: '3rem', height: '2.1rem' },
                    correctPosition: { x: '28.75rem', y: '10.63rem' }, // 75% of desktop positions
                    image: mainPlaceholder
                },
                'salad-plate': {
                    name: 'Salad Plate',
                    color: '#fecaca',
                    size: { width: '9.4rem', height: '9.4rem' },
                    traySize: { width: '1.9rem', height: '1.9rem' },
                    correctPosition: { x: '17.81rem', y: '1.25rem' },
                    image: saladPlaceholder
                },
                'fruit-bowl': {
                    name: 'Fruit Bowl',
                    color: '#fecaca',
                    size: { width: '9.4rem', height: '9.4rem' },
                    traySize: { width: '1.9rem', height: '1.9rem' },
                    correctPosition: { x: '32.19rem', y: '1.25rem' },
                    image: fruitPlaceholder
                },
                'bread-plate': {
                    name: 'Bread Plate',
                    color: '#fef3c7',
                    size: { width: '10.5rem', height: '10.5rem' },
                    traySize: { width: '2.1rem', height: '2.1rem' },
                    correctPosition: { x: '17.81rem', y: '10.63rem' },
                    image: breadPlaceholder
                },
                'utensils': {
                    name: 'Utensils',
                    color: '#d1d5db',
                    size: { width: '4.5rem', height: '12rem' },
                    traySize: { width: '0.9rem', height: '2.4rem' },
                    correctPosition: { x: '44.06rem', y: '9rem' },
                    image: utensilPlacholder
                },
                'water-glass': {
                    name: 'Water Glass',
                    color: '#dbeafe',
                    size: { width: '3rem', height: '7.5rem' },
                    traySize: { width: '0.6rem', height: '1.5rem' },
                    correctPosition: { x: '41.94rem', y: '1.25rem' },
                    image: waterPlaceholder
                },
                'wine-glass': {
                    name: 'Wine Glass',
                    color: '#e9d5ff',
                    size: { width: '3rem', height: '7.5rem' },
                    traySize: { width: '0.6rem', height: '1.5rem' },
                    correctPosition: { x: '45.5rem', y: '1.25rem' },
                    image: winePlaceholder
                },
                'salt-pepper': {
                    name: 'Salt & Pepper',
                    color: '#9ca3af',
                    size: { width: '3.8rem', height: '3.8rem' },
                    traySize: { width: '0.8rem', height: '0.8rem' },
                    correctPosition: { x: '27.88rem', y: '2.38rem' },
                    image: saltpepperPlaceholder
                },
                'butter-dish': {
                    name: 'Butter Dish',
                    color: '#fecaca',
                    size: { width: '4.5rem', height: '3rem' },
                    traySize: { width: '0.9rem', height: '0.6rem' },
                    correctPosition: { x: '27.44rem', y: '6.81rem' },
                    image: butterPlaceholder
                },
            };
        } else {
            // Mobile - scale positions proportionally (50% of desktop)
            return {
                'main-plate': {
                    name: 'Main Plate',
                    color: '#e5e7eb',
                    size: { width: '10rem', height: '7rem' },
                    traySize: { width: '2rem', height: '1.4rem' },
                    correctPosition: { x: '19.13rem', y: '7.06rem' }, // 50% of desktop positions
                    image: mainPlaceholder
                },
                'salad-plate': {
                    name: 'Salad Plate',
                    color: '#fecaca',
                    size: { width: '6.3rem', height: '6.3rem' },
                    traySize: { width: '1.3rem', height: '1.3rem' },
                    correctPosition: { x: '11.88rem', y: '0.81rem' },
                    image: saladPlaceholder
                },
                'fruit-bowl': {
                    name: 'Fruit Bowl',
                    color: '#fecaca',
                    size: { width: '6.3rem', height: '6.3rem' },
                    traySize: { width: '1.3rem', height: '1.3rem' },
                    correctPosition: { x: '21.44rem', y: '0.81rem' },
                    image: fruitPlaceholder
                },
                'bread-plate': {
                    name: 'Bread Plate',
                    color: '#fef3c7',
                    size: { width: '7rem', height: '7rem' },
                    traySize: { width: '1.4rem', height: '1.4rem' },
                    correctPosition: { x: '11.88rem', y: '7.06rem' },
                    image: breadPlaceholder
                },
                'utensils': {
                    name: 'Utensils',
                    color: '#d1d5db',
                    size: { width: '3rem', height: '8rem' },
                    traySize: { width: '0.6rem', height: '1.6rem' },
                    correctPosition: { x: '29.38rem', y: '6rem' },
                    image: utensilPlacholder
                },
                'water-glass': {
                    name: 'Water Glass',
                    color: '#dbeafe',
                    size: { width: '2rem', height: '5rem' },
                    traySize: { width: '0.4rem', height: '1rem' },
                    correctPosition: { x: '28rem', y: '0.81rem' },
                    image: waterPlaceholder
                },
                'wine-glass': {
                    name: 'Wine Glass',
                    color: '#e9d5ff',
                    size: { width: '2rem', height: '5rem' },
                    traySize: { width: '0.4rem', height: '1rem' },
                    correctPosition: { x: '30.31rem', y: '0.81rem' },
                    image: winePlaceholder
                },
                'salt-pepper': {
                    name: 'Salt & Pepper',
                    color: '#9ca3af',
                    size: { width: '2.5rem', height: '2.5rem' },
                    traySize: { width: '0.5rem', height: '0.5rem' },
                    correctPosition: { x: '18.63rem', y: '1.56rem' },
                    image: saltpepperPlaceholder
                },
                'butter-dish': {
                    name: 'Butter Dish',
                    color: '#fecaca',
                    size: { width: '3rem', height: '2rem' },
                    traySize: { width: '0.6rem', height: '0.4rem' },
                    correctPosition: { x: '18.31rem', y: '4.56rem' },
                    image: butterPlaceholder
                },
            };
        }
    };

    const [ITEMS_CONFIG, setItemsConfig] = useState(getDeviceConfig());
    const [placedItems, setPlacedItems] = useState({});
    const [draggedItem, setDraggedItem] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [showCorrectPositions, setShowCorrectPositions] = useState(false);
    const [isLandscape, setIsLandscape] = useState(true);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
    const dropZoneRef = useRef(null);
    const tableSurfaceRef = useRef(null);

    // Check orientation on mount and resize
    useEffect(() => {
        const checkOrientation = () => {
            const isLandscapeMode = window.innerWidth > window.innerHeight;
            setIsLandscape(isLandscapeMode);
            
            // Update config when window resizes
            setItemsConfig(getDeviceConfig());
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    const handleDragStart = (e, itemId) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleTouchStart = (e, itemId) => {
        setDraggedItem(itemId);
        e.preventDefault();
        
        // Store initial touch position for drag calculation
        const touch = e.touches[0];
        setTouchOffset({
            x: touch.clientX,
            y: touch.clientY
        });
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        
        if (!draggedItem) return;
        
        const touch = e.touches[0];
        const config = ITEMS_CONFIG[draggedItem];
        
        if (!dropZoneRef.current) return;
        
        const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
        const widthPx = parseFloat(config.size.width) * 16;
        const heightPx = parseFloat(config.size.height) * 16;
        
        // Calculate new position
        let x = touch.clientX - dropZoneRect.left - (widthPx / 2);
        let y = touch.clientY - dropZoneRect.top - (heightPx / 2);
        
        // Constrain to drop zone boundaries
        const maxX = dropZoneRect.width - widthPx;
        const minX = 0;
        x = Math.max(minX, Math.min(maxX, x));
        
        const maxY = dropZoneRect.height - heightPx;
        const minY = 0;
        y = Math.max(minY, Math.min(maxY, y));
        
        // Update position in real-time during drag
        setPlacedItems(prev => ({
            ...prev,
            [draggedItem]: { x, y }
        }));
    };

    const handleTouchEnd = (e) => {
        if (!draggedItem || !tableSurfaceRef.current) return;
        
        const touch = e.changedTouches[0];
        const tableSurfaceRect = tableSurfaceRef.current.getBoundingClientRect();
        
        // Check if final position is within table surface
        const isWithinTableSurface = touch.clientX >= tableSurfaceRect.left &&
            touch.clientX <= tableSurfaceRect.right &&
            touch.clientY >= tableSurfaceRect.top &&
            touch.clientY <= tableSurfaceRect.bottom;
        
        if (!isWithinTableSurface) {
            // Remove from placed items if dropped outside table surface
            setPlacedItems(prev => {
                const newItems = { ...prev };
                delete newItems[draggedItem];
                return newItems;
            });
        }
        
        setDraggedItem(null);
        setFeedback('');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (!draggedItem || !dropZoneRef.current || !tableSurfaceRef.current) return;

        const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
        const tableSurfaceRect = tableSurfaceRef.current.getBoundingClientRect();
        const config = ITEMS_CONFIG[draggedItem];

        // Convert rem to pixels for positioning (assuming 1rem = 16px)
        const widthPx = parseFloat(config.size.width) * 16;
        const heightPx = parseFloat(config.size.height) * 16;

        // Check if the drop happened within the table surface boundaries
        const isWithinTableSurface = e.clientX >= tableSurfaceRect.left &&
            e.clientX <= tableSurfaceRect.right &&
            e.clientY >= tableSurfaceRect.top &&
            e.clientY <= tableSurfaceRect.bottom;

        if (isWithinTableSurface) {
            // Calculate position relative to the drop zone (for positioning)
            let x = e.clientX - dropZoneRect.left - (widthPx / 2);
            let y = e.clientY - dropZoneRect.top - (heightPx / 2);

            // Prevent horizontal overflow - constrain x position
            const maxX = dropZoneRect.width - widthPx;
            const minX = 0;
            x = Math.max(minX, Math.min(maxX, x));

            // Prevent vertical overflow - constrain y position
            const maxY = dropZoneRect.height - heightPx;
            const minY = 0;
            y = Math.max(minY, Math.min(maxY, y));

            // Place item at constrained position relative to drop zone
            setPlacedItems(prev => ({
                ...prev,
                [draggedItem]: { x, y }
            }));
        } else {
            // If outside table surface, remove from placed items (return to tray)
            setPlacedItems(prev => {
                const newItems = { ...prev };
                delete newItems[draggedItem];
                return newItems;
            });
        }

        setDraggedItem(null);
        setFeedback('');
    };

    const handleDragEnd = (e) => {
        // Clean up drag state
        if (draggedItem) {
            setDraggedItem(null);
        }
    };

    const calculateDistance = (pos1, pos2) => {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    };

    const checkPlacement = () => {
        const results = [];
        const tolerance = 30; // pixels tolerance for more lenient checking

        Object.keys(ITEMS_CONFIG).forEach(itemId => {
            const placedPos = placedItems[itemId];
            const correctPos = ITEMS_CONFIG[itemId].correctPosition;

            if (!placedPos) {
                results.push(`❌ ${ITEMS_CONFIG[itemId].name}: Not placed`);
            } else {
                // Convert rem positions to pixels for comparison
                const correctPosPixels = {
                    x: parseFloat(correctPos.x) * 16,
                    y: parseFloat(correctPos.y) * 16
                };

                const distance = calculateDistance(placedPos, correctPosPixels);
                const xDiff = Math.round(placedPos.x - correctPosPixels.x);
                const yDiff = Math.round(placedPos.y - correctPosPixels.y);

                if (distance <= tolerance) {
                    results.push(`✅ ${ITEMS_CONFIG[itemId].name}: Correct!`);
                } else {
                    const xDirection = xDiff > 0 ? 'right' : 'left';
                    const yDirection = yDiff > 0 ? 'down' : 'up';
                    results.push(`❌ ${ITEMS_CONFIG[itemId].name}: Off by ${Math.abs(xDiff)}px ${xDirection}, ${Math.abs(yDiff)}px ${yDirection}`);
                }
            }
        });

        const correctCount = results.filter(r => r.includes('✅')).length;
        const totalItems = Object.keys(ITEMS_CONFIG).length;
        const score = Math.round((correctCount / totalItems) * 100);

        setFeedback(`Score: ${score}% (${correctCount}/${totalItems} correct)\n\n${results.join('\n')}`);
    };

    const resetPlacement = () => {
        setPlacedItems({});
        setFeedback('');
        setShowCorrectPositions(false);
    };

    const toggleCorrectPositions = () => {
        setShowCorrectPositions(!showCorrectPositions);
    };

    // Show rotation prompt for portrait mode
    if (!isLandscape) {
        return (
            <div className={styles.businessClassContainer}>
                {userDetails && (
                    <Navbar 
                        userDetails={userDetails} 
                        title="BC擺盤訓練APP" 
                        onLogout={onLogout}
                    />
                )}
                <div className={styles.rotationPrompt}>
                    <img 
                        src={rotateDevice} 
                        alt="Rotate Device" 
                        className={styles.rotationGif}
                    />
                    <p>請旋轉至橫向模式</p>
                    <p>Please rotate to landscape mode</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.businessClassContainer}>
            {userDetails && (
                <Navbar 
                    userDetails={userDetails} 
                    title="BC擺盤訓練APP" 
                    onLogout={onLogout}
                />
            )}
            
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>豪神BC擺盤APP</h1>
                    <p className={styles.headerSubtitle}>Drag items from items tray to Table Surface</p>
                </div>

                {/* Main Content Area */}
                <div className={styles.mainContent}>
                    {/* Drop Zone */}
                    <div className={styles.dropZoneContainer}>
                        <div
                            ref={dropZoneRef}
                            className={styles.dropZone}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {/* Table representation */}
                            <div
                                className={styles.tableSurface}
                                ref={tableSurfaceRef}
                            >
                                <div className={styles.tableSurfaceText}>Table Surface</div>
                            </div>

                            {/* Show correct positions when toggled */}
                            {showCorrectPositions && Object.entries(ITEMS_CONFIG).map(([itemId, config]) => (
                                <div
                                    key={`correct-${itemId}`}
                                    className={styles.correctPosition}
                                    style={{
                                        left: config.correctPosition.x,
                                        top: config.correctPosition.y,
                                        width: config.size.width,
                                        height: config.size.height,
                                    }}
                                >
                                    {config.name}
                                </div>
                            ))}

                            {/* Placed Items */}
                            {Object.entries(placedItems).map(([itemId, position]) => {
                                const config = ITEMS_CONFIG[itemId];
                                return (
                                    <div
                                        key={`placed-${itemId}`}
                                        className={styles.placedItem}
                                        style={{
                                            left: position.x,
                                            top: position.y,
                                            width: config.size.width,
                                            height: config.size.height,
                                        }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, itemId)}
                                        onDragEnd={handleDragEnd}
                                        onTouchStart={(e) => handleTouchStart(e, itemId)}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        title={config.name}
                                    >
                                        <img 
                                            src={config.image} 
                                            alt={config.name}
                                            className={styles.itemImage}
                                            draggable={false}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className={styles.controlButtons}>
                        <button
                            onClick={checkPlacement}
                            className={`${styles.button} ${styles.submitButton}`}
                        >
                            Submit & Check
                        </button>
                        <button
                            onClick={resetPlacement}
                            className={`${styles.button} ${styles.resetButton}`}
                        >
                            Reset
                        </button>
                        <button
                            onClick={toggleCorrectPositions}
                            className={`${styles.button} ${styles.toggleButton}`}
                        >
                            {showCorrectPositions ? 'Hide' : 'Show'} Correct Positions
                        </button>
                    </div>

                    {/* Feedback Area */}
                    {feedback && (
                        <div className={styles.feedback}>
                            <h3 className={styles.feedbackTitle}>Results:</h3>
                            <pre className={styles.feedbackText}>{feedback}</pre>
                        </div>
                    )}

                    {/* Items Tray */}
                    <div className={styles.itemsTray}>
                        <h3 className={styles.trayTitle}>Items Tray 托盤物品</h3>
                        <div className={styles.trayItems}>
                            {Object.entries(ITEMS_CONFIG).map(([itemId, config]) => {
                                const isPlaced = placedItems[itemId];
                                return (
                                    <div
                                        key={itemId}
                                        className={`${styles.trayItem} ${isPlaced ? styles.placed : ''}`}
                                        style={{
                                            width: config.traySize.width,
                                            height: config.traySize.height,
                                        }}
                                        draggable={!isPlaced}
                                        onDragStart={(e) => !isPlaced && handleDragStart(e, itemId)}
                                        onDragEnd={handleDragEnd}
                                        onTouchStart={(e) => !isPlaced && handleTouchStart(e, itemId)}
                                        onTouchMove={!isPlaced ? handleTouchMove : undefined}
                                        onTouchEnd={!isPlaced ? handleTouchEnd : undefined}
                                        onMouseEnter={() => setHoveredItem(itemId)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        title={config.name}
                                    >
                                        <img 
                                            src={config.image} 
                                            alt={config.name}
                                            className={styles.itemImage}
                                            draggable={false}
                                        />
                                        {hoveredItem === itemId && !isPlaced && (
                                            <div className={styles.itemTooltip}>
                                                {config.name}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessClass;