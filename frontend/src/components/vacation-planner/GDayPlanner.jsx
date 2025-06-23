import React, { useState, useRef, useEffect } from 'react'
import { Calendar, Camera, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../common/Navbar'
import formTemplateImage from './gday-form-template.png'
import styles from '../../styles/gday-planner.module.css'

const GDayPlanner = ({ userDetails, onLogout }) => {
    const [draggedItem, setDraggedItem] = useState(null)
    const [droppedItems, setDroppedItems] = useState({})
    const [draggedFromDate, setDraggedFromDate] = useState(null)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [showYearPicker, setShowYearPicker] = useState(false)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [selectedLeaveType, setSelectedLeaveType] = useState(null)
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const plannerRef = useRef(null)

    // Enhanced device detection for iPads and tablets
    useEffect(() => {
        const detectTouchDevice = () => {
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
            const isTabletSize = window.innerWidth <= 1024 && window.innerHeight <= 1366
            const userAgent = navigator.userAgent.toLowerCase()
            const isTabletUA = /ipad|android|tablet/.test(userAgent) || (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1)
            
            setIsTouchDevice(hasTouch && (isTabletSize || isTabletUA))
        }
        
        detectTouchDevice()
        window.addEventListener('resize', detectTouchDevice)
        return () => window.removeEventListener('resize', detectTouchDevice)
    }, [])

    // Vacation types - logic moved to CSS classes
    const leaveTypes = [
        { id: 'example', label: '例', description: '例假' },
        { id: 'rest', label: '休', description: '休假' },
        { id: 'annual', label: 'A/L', description: '年假' },
        { id: 'welfare', label: '福補', description: '福利補休' },
        { id: 'medical', label: '體檢', description: '體檢' },
        { id: 'sick', label: 'S/L', description: '病假' },
        { id: 'personal', label: 'P/L', description: '事假' }
    ]

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']

    // Calendar data generation
    const getCalendarData = () => {
        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayOfWeek = firstDay.getDay()

        const calendarDays = []
        
        for (let i = 0; i < startDayOfWeek; i++) {
            calendarDays.push(null)
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(day)
        }

        while (calendarDays.length < 42) {
            calendarDays.push(null)
        }

        return { calendarDays, startDayOfWeek, daysInMonth }
    }

    const { calendarDays, startDayOfWeek } = getCalendarData()

    // Year/Month selection handlers
    const handleYearClick = () => {
        setShowYearPicker(!showYearPicker)
        setShowMonthPicker(false)
    }

    const selectYear = (year) => {
        setCurrentYear(year)
        setShowYearPicker(false)
    }

    const handleMonthClick = () => {
        setShowMonthPicker(!showMonthPicker)
        setShowYearPicker(false)
    }

    const selectMonth = (monthIndex) => {
        setCurrentMonth(monthIndex)
        setShowMonthPicker(false)
    }

    const getYearOptions = () => {
        const currentYearDefault = new Date().getFullYear()
        const years = []
        for (let i = currentYearDefault; i <= currentYearDefault + 2; i++) {
            years.push(i)
        }
        return years
    }

    // Touch device interaction handlers
    const handleLeaveTypeClick = (leaveType) => {
        if (isTouchDevice) {
            if (selectedLeaveType?.id === leaveType.id) {
                setSelectedLeaveType(null)
            } else {
                setSelectedLeaveType(leaveType)
                toast.success(`已選擇 ${leaveType.description}，請點選日期進行安排`, {
                    duration: 2000,
                    position: 'top-center'
                })
            }
        }
    }

    const handleCalendarCellClick = (day) => {
        if (isTouchDevice && day) {
            const key = `${currentYear}-${currentMonth}-${day}`
            
            if (droppedItems[key]) {
                const isConfirmed = window.confirm(`確定要移除 ${droppedItems[key].description} 嗎？`)
                if (isConfirmed) {
                    setDroppedItems(prev => {
                        const newItems = { ...prev }
                        delete newItems[key]
                        return newItems
                    })
                    toast.success('已移除假期安排', { duration: 1500, position: 'top-center' })
                }
            } else if (selectedLeaveType) {
                setDroppedItems(prev => ({ ...prev, [key]: selectedLeaveType }))
                toast.success(`已安排 ${selectedLeaveType.description}`, { duration: 1500, position: 'top-center' })
            }
        }
    }

    const clearSelection = () => {
        setSelectedLeaveType(null)
        toast.success('已取消選擇', { duration: 1500, position: 'top-center' })
    }

    // Desktop drag handlers
    const handleDragStart = (e, leaveType) => {
        if (isTouchDevice) return
        setDraggedItem(leaveType)
        setDraggedFromDate(null)
        e.dataTransfer.effectAllowed = 'copy'
    }

    const handleLeaveDragStart = (e, leaveType, dateKey) => {
        if (isTouchDevice) return
        setDraggedItem(leaveType)
        setDraggedFromDate(dateKey)
        e.dataTransfer.effectAllowed = 'move'
        e.stopPropagation()
    }

    const handleDragOver = (e) => {
        if (isTouchDevice) return
        e.preventDefault()
        e.dataTransfer.dropEffect = draggedFromDate ? 'move' : 'copy'
    }

    const handleDrop = (e, day) => {
        if (isTouchDevice) return
        e.preventDefault()
        handleDropAction(day)
    }

    const handleDropAction = (day) => {
        if (draggedItem && day) {
            const key = `${currentYear}-${currentMonth}-${day}`
            
            if (draggedFromDate) {
                setDroppedItems(prev => {
                    const newItems = { ...prev }
                    delete newItems[draggedFromDate]
                    newItems[key] = draggedItem
                    return newItems
                })
            } else {
                setDroppedItems(prev => ({ ...prev, [key]: draggedItem }))
            }
        }
        setDraggedItem(null)
        setDraggedFromDate(null)
    }

    const handleEmptyAreaDrop = (e) => {
        if (isTouchDevice) return
        e.preventDefault()
        if (draggedFromDate) {
            setDroppedItems(prev => {
                const newItems = { ...prev }
                delete newItems[draggedFromDate]
                return newItems
            })
        }
        setDraggedItem(null)
        setDraggedFromDate(null)
    }

    // Validation
    const validateLeaveRules = () => {
        const currentYearKey = currentYear.toString()
        const errors = []
        let medicalCount = 0
        let welfareCount = 0
        
        Object.entries(droppedItems).forEach(([dateKey, leaveType]) => {
            if (dateKey.startsWith(currentYearKey)) {
                if (leaveType.id === 'medical') medicalCount++
                if (leaveType.id === 'welfare') welfareCount++
            }
        })

        if (medicalCount > 1) {
            errors.push(`體檢每年最多只能請一天，目前已安排 ${medicalCount} 天`)
        }
        if (welfareCount > 7) {
            errors.push(`福補每年最多只能請七天，目前已安排 ${welfareCount} 天`)
        }

        return errors
    }

    // Screenshot generation
    const generateScreenshot = async () => {
        if (!plannerRef.current) return

        const errors = validateLeaveRules()
        if (errors.length > 0) {
            errors.forEach(error => {
                toast.error(error, { duration: 5000, position: 'top-center' })
            })
            return
        }

        try {
            if (!window.html2canvas) {
                const script = document.createElement('script')
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
                document.head.appendChild(script)
                await new Promise((resolve) => { script.onload = resolve })
            }

            const canvas = await window.html2canvas(plannerRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: true
            })
            
            const monthName = monthNames[currentMonth].replace('月', '')
            const userName = userDetails?.name || 'user'
            const screenshotFilename = `${currentYear}年${monthName}月指定休假一覽-${userName}.png`
            
            const link = document.createElement('a')
            link.download = screenshotFilename
            link.href = canvas.toDataURL('image/png')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            await generatePDFForm()
            toast.success('截圖及表單已成功儲存！', { duration: 3000, position: 'top-center' })
        } catch (error) {
            console.error('Error generating screenshot:', error)
            toast.error('截圖產生失敗，請重試', { duration: 3000, position: 'top-center' })
        }
    }

    // PDF form generation (simplified)
    const generatePDFForm = async () => {
        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            canvas.width = 3508
            canvas.height = 2480
            
            const templateImg = new Image()
            templateImg.crossOrigin = 'anonymous'
            
            await new Promise((resolve, reject) => {
                templateImg.onload = resolve
                templateImg.onerror = reject
                templateImg.src = formTemplateImage
            })
            
            ctx.drawImage(templateImg, 0, 0, 3508, 2480)

            const renderTextOnCanvas = (text, x, y, fontSize = 40) => {
                if (!text || typeof text !== 'string') return
                
                const cleanText = String(text).trim()
                if (!cleanText) return
                
                ctx.font = `${fontSize}px "Noto Sans TC", "Microsoft JhengHei", sans-serif`
                ctx.fillStyle = 'black'
                ctx.textAlign = 'left'
                ctx.textBaseline = 'middle'
                ctx.fillText(cleanText, x, y)
            }

            const convertToCanvasCoords = (x, y) => {
                const scaleX = 2.5
                const scaleY = 3.0
                const pixelX = (x / 72) * 800 / scaleX
                const pixelY = 2480 - ((y / 72) * 900 / scaleY)
                return { x: pixelX, y: pixelY }
            }

            if (userDetails) {
                const today = new Date()
                const applicationDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`
                
                let coords = convertToCanvasCoords(133, 475)
                renderTextOnCanvas(applicationDate, coords.x, coords.y, 40)
                coords = convertToCanvasCoords(467, 475)
                renderTextOnCanvas(applicationDate, coords.x, coords.y, 40)
                
                coords = convertToCanvasCoords(260, 475)
                renderTextOnCanvas(userDetails.employeeID || '', coords.x, coords.y, 40)
                coords = convertToCanvasCoords(600, 475)
                renderTextOnCanvas(userDetails.employeeID || '', coords.x, coords.y, 40)
                
                coords = convertToCanvasCoords(340, 475)
                renderTextOnCanvas(userDetails.name || '', coords.x, coords.y, 40)
                coords = convertToCanvasCoords(675, 475)
                renderTextOnCanvas(userDetails.name || '', coords.x, coords.y, 40)
            }
            
            // Process vacation entries (simplified logic)
            const vacationEntries = Object.entries(droppedItems)
                .filter(([dateKey]) => {
                    const [year, month] = dateKey.split('-').map(Number)
                    return year === currentYear && month === currentMonth
                })
                .sort(([dateKeyA], [dateKeyB]) => {
                    const dayA = parseInt(dateKeyA.split('-')[2])
                    const dayB = parseInt(dateKeyB.split('-')[2])
                    return dayA - dayB
                })

            const rowCoordinates = [
                { leftDate: 90, leftVacation: 175, rightDate: 425, rightVacation: 510, y: 417 },
                { leftDate: 90, leftVacation: 175, rightDate: 425, rightVacation: 510, y: 395 },
                { leftDate: 90, leftVacation: 175, rightDate: 425, rightVacation: 510, y: 374 },
                { leftDate: 250, leftVacation: 340, rightDate: 590, rightVacation: 677, y: 417 },
                { leftDate: 250, leftVacation: 340, rightDate: 590, rightVacation: 677, y: 395 },
                { leftDate: 250, leftVacation: 340, rightDate: 590, rightVacation: 677, y: 374 }
            ]
            
            vacationEntries.forEach(([dateKey, leaveType], index) => {
                if (index >= 6) return
                
                const [year, month, day] = dateKey.split('-').map(Number)
                const formattedDate = `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`
                
                if (index < rowCoordinates.length) {
                    const row = rowCoordinates[index]
                    
                    let coords = convertToCanvasCoords(row.leftDate, row.y)
                    renderTextOnCanvas(formattedDate, coords.x, coords.y, 40)
                    coords = convertToCanvasCoords(row.leftVacation, row.y)
                    renderTextOnCanvas(leaveType.label, coords.x, coords.y, 40)
                    
                    coords = convertToCanvasCoords(row.rightDate, row.y)
                    renderTextOnCanvas(formattedDate, coords.x, coords.y, 40)
                    coords = convertToCanvasCoords(row.rightVacation, row.y)
                    renderTextOnCanvas(leaveType.label, coords.x, coords.y, 40)
                }
            })
            
            const monthName = monthNames[currentMonth].replace('月', '')
            const userName = userDetails?.name || 'user'
            const formFilename = `FMEF-06-03空服組員指定任務休假日申請單-${userName}${currentYear}年${monthName}月.png`
            
            const formLink = document.createElement('a')
            formLink.download = formFilename
            formLink.href = canvas.toDataURL('image/png')
            document.body.appendChild(formLink)
            formLink.click()
            document.body.removeChild(formLink)
            
        } catch (error) {
            console.error('Error generating PDF form:', error)
            toast.error('表單產生失敗', { duration: 3000, position: 'top-center' })
        }
    }

    return (
        <div 
            className={styles.plannerContainer}
            onDragOver={handleDragOver}
            onDrop={handleEmptyAreaDrop}
        >
            {userDetails && (
                <Navbar 
                    userDetails={userDetails} 
                    title="GDay劃假系統" 
                    onLogout={onLogout}
                />
            )}
            
            <div ref={plannerRef} className={styles.plannerContent}>
                {/* Header */}
                <div className={styles.plannerHeader}>
                    <h1 className={styles.plannerTitle}>{userDetails?.name} G-Day 假期規劃表</h1>
                    <div className={styles.navigationContainer}>
                        <div className={styles.datePickerWrapper}>
                            <div className={styles.datePickerContainer}>
                                <span 
                                    className={styles.clickableDate}
                                    onClick={handleYearClick}
                                    title="點擊選擇年份"
                                >
                                    {currentYear}年
                                </span>
                                {showYearPicker && (
                                    <div className={`${styles.pickerDropdown} ${styles.yearPicker}`}>
                                        {getYearOptions().map(year => (
                                            <div
                                                key={year}
                                                className={`${styles.pickerOption} ${year === currentYear ? styles.selected : ''}`}
                                                onClick={() => selectYear(year)}
                                            >
                                                {year}年
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.datePickerContainer}>
                                <span 
                                    className={styles.clickableDate}
                                    onClick={handleMonthClick}
                                    title="點擊選擇月份"
                                >
                                    {monthNames[currentMonth]}
                                </span>
                                {showMonthPicker && (
                                    <div className={`${styles.pickerDropdown} ${styles.monthPicker}`}>
                                        {monthNames.map((month, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.pickerOption} ${index === currentMonth ? styles.selected : ''}`}
                                                onClick={() => selectMonth(index)}
                                            >
                                                {month}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leave Types */}
                <div className={styles.leaveTypesSection}>
                    <div className={styles.leaveTypesHeader}>
                        <h3 className={styles.leaveTypesTitle}>假期類型</h3>
                        {isTouchDevice && selectedLeaveType && (
                            <button
                                onClick={clearSelection}
                                className={styles.clearSelectionBtn}
                                title="取消選擇"
                            >
                                <X size={16} />
                                取消選擇
                            </button>
                        )}
                    </div>
                    <div className={styles.leaveTypesGrid}>
                        {leaveTypes.map((leaveType) => (
                            <div
                                key={leaveType.id}
                                draggable={!isTouchDevice}
                                onDragStart={(e) => handleDragStart(e, leaveType)}
                                onClick={() => handleLeaveTypeClick(leaveType)}
                                className={`${styles.leaveTypeItem} ${styles[`leave${leaveType.id.charAt(0).toUpperCase() + leaveType.id.slice(1)}`]} ${
                                    isTouchDevice && selectedLeaveType?.id === leaveType.id ? styles.selected : ''
                                }`}
                                title={leaveType.description}
                            >
                                <span className={styles.leaveTypeLabel}>{leaveType.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar */}
                <div className={styles.calendarContainer}>
                    <div className={styles.calendarHeader}>
                        {dayNames.map((day) => (
                            <div key={day} className={styles.calendarDayName}>
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className={styles.calendarGrid}>
                        {calendarDays.map((day, index) => {
                            if (!day) {
                                return <div key={index} className={styles.calendarEmptyCell}></div>
                            }

                            const key = `${currentYear}-${currentMonth}-${day}`
                            const droppedLeave = droppedItems[key]
                            const dayOfWeek = (startDayOfWeek + day - 1) % 7
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                            return (
                                <div
                                    key={`${index}-${day}`}
                                    data-day={day}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day)}
                                    onClick={() => handleCalendarCellClick(day)}
                                    className={`${styles.calendarCell} ${isWeekend ? styles.weekend : ''} ${
                                        isTouchDevice ? styles.clickable : ''
                                    }`}
                                >
                                    <div className={styles.calendarDayNumber}>{day}</div>
                                    {droppedLeave && (
                                        <div 
                                            className={`${styles.droppedLeave} ${styles[`leave${droppedLeave.id.charAt(0).toUpperCase() + droppedLeave.id.slice(1)}`]}`}
                                            draggable={!isTouchDevice}
                                            onDragStart={(e) => handleLeaveDragStart(e, droppedLeave, key)}
                                            title={isTouchDevice ? "點擊移除" : "拖拉到空白處可刪除"}
                                        >
                                            {droppedLeave.label}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Instructions */}
                <div className={styles.instructions}>
                    {isTouchDevice ? (
                        <>
                            <p className={styles.instructionText}>
                                <Calendar className={styles.instructionIcon} />
                                點選假期類別後，再點選日期進行安排
                            </p>
                            <p className={styles.instructionNote}>點選已安排的假期可移除（需確認）</p>
                        </>
                    ) : (
                        <>
                            <p className={styles.instructionText}>
                                <Calendar className={styles.instructionIcon} />
                                把假期類型拖拉到指定日期上進行規劃
                            </p>
                            <p className={styles.instructionNote}>拖拉已安排的假期到空白處可刪除</p>
                        </>
                    )}
                    <p className={styles.instructionNote}>點選年份或月份可快速切換</p>
                </div>
            </div>

            {/* Screenshot Button */}
            <div className={styles.screenshotSection}>
                <button
                    onClick={generateScreenshot}
                    className={styles.screenshotButton}
                >
                    <Camera className={styles.screenshotIcon} />
                    截圖 & 產生表單
                </button>
            </div>
        </div>
    )
}

export default GDayPlanner