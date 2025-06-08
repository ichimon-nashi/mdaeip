import React, { useState, useRef, useEffect } from 'react'
import { Calendar, Camera, X, Plus, Clock, Edit3, Trash2 } from 'lucide-react'
import Navbar from '../common/Navbar.jsx'

const MRTChecker = ({ userDetails, onLogout }) => {
    const [draggedItem, setDraggedItem] = useState(null)
    const [droppedItems, setDroppedItems] = useState({})
    const [draggedFromDate, setDraggedFromDate] = useState(null)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [showYearPicker, setShowYearPicker] = useState(false)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [selectedDuty, setSelectedDuty] = useState(null)
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const [showCustomDutyModal, setShowCustomDutyModal] = useState(false)
    const [customDuties, setCustomDuties] = useState([])
    const [newDuty, setNewDuty] = useState({ name: '', startTime: '', endTime: '', code: '', isFlightDuty: false })
    const [validationErrors, setValidationErrors] = useState([])
    const [showValidation, setShowValidation] = useState(false)
    const rosterRef = useRef(null)

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const dayNames = ['一', '二', '三', '四', '五', '六', '日']

    // Enhanced device detection
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

    // Preset duties
    const presetDuties = [
        { id: 'recessday', code: '例', name: '例假', startTime: '', endTime: '', color: '#10B981', isRest: true },
        { id: 'rest', code: '休', name: '休假', startTime: '', endTime: '', color: '#3B82F6', isRest: true },
        { id: '體檢', code: '體檢', name: '體檢', startTime: '09:00', endTime: '17:00', color: '#ff99be', isDuty: true, isFlightDuty: false },
        { id: '訓練', code: '訓練', name: 'Training', startTime: '09:00', endTime: '17:00', color: '#dda15e', isDuty: true, isFlightDuty: false },
        { id: 'SA', code: 'SA', name: '上午待命', startTime: '06:35', endTime: '12:00', color: '#eb606c', isDuty: true, isFlightDuty: false },
        { id: 'SP', code: 'SP', name: '下午待命', startTime: '12:00', endTime: '17:00', color: '#e63946', isDuty: true, isFlightDuty: false },
        //高雄 M 班
        { id: 'M2', code: 'M2', name: 'Flight M2', startTime: '06:35', endTime: '12:40', color: '#7FB3D3 ', isDuty: true, isFlightDuty: true },
        { id: 'M4', code: 'M4', name: 'Flight M4', startTime: '12:45', endTime: '19:45', color: '#67a5cb', isDuty: true, isFlightDuty: true },
        //高雄 I 班
        { id: 'I2', code: 'I2', name: 'Flight I2', startTime: '06:50', endTime: '13:10', color: '#60d2cb  ', isDuty: true, isFlightDuty: true },
        { id: 'I4', code: 'I4', name: 'Flight I4', startTime: '13:05', endTime: '21:15', color: '#32b3aa ', isDuty: true, isFlightDuty: true },
        //高雄 H 班
        { id: 'H2', code: 'H2', name: 'Flight H2', startTime: '08:00', endTime: '14:05', color: '#DDA0DD  ', isDuty: true, isFlightDuty: true },
        { id: 'H4', code: 'H4', name: 'Flight H4', startTime: '14:00', endTime: '20:15', color: '#d07cd0  ', isDuty: true, isFlightDuty: true },
        //高雄 738 V 班
        { id: 'V2', code: 'V2', name: 'Flight V2', startTime: '07:45', endTime: '10:55', color: '#86c6a8  ', isDuty: true, isFlightDuty: true },
        { id: 'V4', code: 'V4', name: 'Flight V4', startTime: '14:30', endTime: '21:30', color: '#63b68f ', isDuty: true, isFlightDuty: true },
    ];

    const [allDuties, setAllDuties] = useState(presetDuties)

    // Utility functions for time calculations
    const timeToMinutes = (timeString) => {
        if (!timeString) return 0
        const [hours, minutes] = timeString.split(':').map(Number)
        return hours * 60 + minutes
    }

    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    const calculateFDP = (duty) => {
        if (!duty.startTime || !duty.endTime) return 0
        if (!duty.isFlightDuty) return 0
        
        const startMinutes = timeToMinutes(duty.startTime)
        const endMinutes = timeToMinutes(duty.endTime)
        
        if (endMinutes < startMinutes) {
            return (24 * 60) - startMinutes + endMinutes
        }
        return endMinutes - startMinutes
    }

    const calculateMRT = (fdpMinutes) => {
        const fdpHours = fdpMinutes / 60
        
        if (fdpHours <= 8) return 11 * 60
        if (fdpHours <= 12) return 12 * 60
        if (fdpHours <= 16) return 20 * 60
        return 24 * 60
    }

    const getEffectiveEndTime = (duty) => {
        if (duty.isFlightDuty && duty.endTime) {
            const endMinutes = timeToMinutes(duty.endTime)
            const bufferedEndMinutes = endMinutes + 30
            return minutesToTime(bufferedEndMinutes >= 24 * 60 ? bufferedEndMinutes - 24 * 60 : bufferedEndMinutes)
        }
        return duty.endTime
    }

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }

    const getCalendarData = () => {
        const firstDay = new Date(currentYear, currentMonth, 1)
        const lastDay = new Date(currentYear, currentMonth + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayOfWeek = (firstDay.getDay() + 6) % 7

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

    const validateRestRequirements = () => {
        const errors = []
        const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate()
        
        for (let day = 1; day <= currentMonthDays; day++) {
            const dayDate = new Date(currentYear, currentMonth, day)
            const dayOfWeek = (dayDate.getDay() + 6) % 7
            
            if (dayOfWeek === 0) {
                const weekDays = []
                for (let i = 0; i < 7; i++) {
                    const weekDay = day + i
                    if (weekDay <= currentMonthDays) {
                        weekDays.push(weekDay)
                    }
                }
                
                if (weekDays.length >= 7) {
                    const weekAssignments = weekDays.map(d => {
                        const key = `${currentYear}-${currentMonth}-${d}`
                        return droppedItems[key]
                    }).filter(Boolean)
                    
                    const recessDayCount = weekAssignments.filter(duty => duty.id === 'recessday').length
                    const restCount = weekAssignments.filter(duty => duty.id === 'rest').length
                    
                    const weekNumber = Math.floor((day - 1) / 7) + 1
                    
                    if (recessDayCount === 0) {
                        errors.push(`Week ${weekNumber} (${day}-${day+6}): Missing required 例 (Recess Day)`)
                    } else if (recessDayCount > 1) {
                        errors.push(`Week ${weekNumber} (${day}-${day+6}): Too many 例 (${recessDayCount}), only 1 allowed per week`)
                    }
                    
                    if (restCount === 0) {
                        errors.push(`Week ${weekNumber} (${day}-${day+6}): Missing required 休 (Rest Day)`)
                    } else if (restCount > 1) {
                        errors.push(`Week ${weekNumber} (${day}-${day+6}): Too many 休 (${restCount}), only 1 allowed per week`)
                    }
                }
            }
        }
        
        for (let startDay = 1; startDay <= currentMonthDays - 6; startDay++) {
            const sevenDayPeriod = []
            for (let day = startDay; day < startDay + 7; day++) {
                const key = `${currentYear}-${currentMonth}-${day}`
                const assignment = droppedItems[key]
                sevenDayPeriod.push({
                    day,
                    assignment,
                    isRest: assignment?.isRest || !assignment
                })
            }
            
            if (!hasConsecutive32HourRest(sevenDayPeriod)) {
                errors.push(`Days ${startDay}-${startDay + 6}: Missing required 32-hour consecutive rest period`)
            }
        }
        
        const dutyViolations = checkMinimumRestViolations()
        errors.push(...dutyViolations)
        
        return errors
    }

    const hasConsecutive32HourRest = (sevenDayPeriod) => {
        for (let i = 0; i < sevenDayPeriod.length - 1; i++) {
            if (sevenDayPeriod[i].isRest && sevenDayPeriod[i + 1].isRest) {
                return true
            }
        }
        return sevenDayPeriod.some(day => day.isRest)
    }

    const checkMinimumRestViolations = () => {
        const errors = []
        const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate()
        
        for (let day = 1; day < currentMonthDays; day++) {
            const todayKey = `${currentYear}-${currentMonth}-${day}`
            const tomorrowKey = `${currentYear}-${currentMonth}-${day + 1}`
            
            const todayDuty = droppedItems[todayKey]
            const tomorrowDuty = droppedItems[tomorrowKey]
            
            if (todayDuty?.isDuty && tomorrowDuty?.isDuty) {
                const todayFDP = calculateFDP(todayDuty)
                const requiredMRT = calculateMRT(todayFDP)
                
                if (todayDuty.endTime && tomorrowDuty.startTime) {
                    const todayEffectiveEndTime = getEffectiveEndTime(todayDuty)
                    const todayEndMinutes = timeToMinutes(todayEffectiveEndTime)
                    const tomorrowStartMinutes = timeToMinutes(tomorrowDuty.startTime)
                    
                    let actualRestMinutes
                    if (tomorrowStartMinutes > todayEndMinutes) {
                        actualRestMinutes = tomorrowStartMinutes - todayEndMinutes
                    } else {
                        actualRestMinutes = (24 * 60) - todayEndMinutes + tomorrowStartMinutes
                    }
                    
                    if (actualRestMinutes < requiredMRT) {
                        errors.push(`Day ${day}-${day + 1}: Insufficient rest time (${formatDuration(actualRestMinutes)} < required ${formatDuration(requiredMRT)})`)
                    }
                }
            }
        }
        
        return errors
    }

    const isDutyInViolation = (day) => {
        const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate()
        const dayKey = `${currentYear}-${currentMonth}-${day}`
        const duty = droppedItems[dayKey]
        
        if (!duty) return false
        
        const dayDate = new Date(currentYear, currentMonth, day)
        const dayOfWeek = (dayDate.getDay() + 6) % 7
        
        const mondayOfWeek = day - dayOfWeek
        const weekDays = []
        for (let d = mondayOfWeek; d < mondayOfWeek + 7 && d <= currentMonthDays && d >= 1; d++) {
            weekDays.push(d)
        }
        
        if (weekDays.length >= 7) {
            const weekAssignments = weekDays.map(d => {
                const key = `${currentYear}-${currentMonth}-${d}`
                return droppedItems[key]
            }).filter(Boolean)
            
            const recessDayCount = weekAssignments.filter(d => d.id === 'recessday').length
            const restCount = weekAssignments.filter(d => d.id === 'rest').length
            
            if ((duty.id === 'recessday' && recessDayCount > 1) || 
                (duty.id === 'rest' && restCount > 1)) {
                return true
            }
        }
        
        if (duty.isDuty) {
            if (day > 1) {
                const yesterdayKey = `${currentYear}-${currentMonth}-${day - 1}`
                const yesterdayDuty = droppedItems[yesterdayKey]
                
                if (yesterdayDuty?.isDuty && yesterdayDuty.endTime && duty.startTime) {
                    const yesterdayFDP = calculateFDP(yesterdayDuty)
                    const requiredMRT = calculateMRT(yesterdayFDP)
                    const yesterdayEffectiveEndTime = getEffectiveEndTime(yesterdayDuty)
                    const yesterdayEndMinutes = timeToMinutes(yesterdayEffectiveEndTime)
                    const todayStartMinutes = timeToMinutes(duty.startTime)
                    
                    let actualRestMinutes
                    if (todayStartMinutes > yesterdayEndMinutes) {
                        actualRestMinutes = todayStartMinutes - yesterdayEndMinutes
                    } else {
                        actualRestMinutes = (24 * 60) - yesterdayEndMinutes + todayStartMinutes
                    }
                    
                    if (actualRestMinutes < requiredMRT) {
                        return true
                    }
                }
            }
            
            if (day < currentMonthDays) {
                const tomorrowKey = `${currentYear}-${currentMonth}-${day + 1}`
                const tomorrowDuty = droppedItems[tomorrowKey]
                
                if (tomorrowDuty?.isDuty && duty.endTime && tomorrowDuty.startTime) {
                    const todayFDP = calculateFDP(duty)
                    const requiredMRT = calculateMRT(todayFDP)
                    const todayEffectiveEndTime = getEffectiveEndTime(duty)
                    const todayEndMinutes = timeToMinutes(todayEffectiveEndTime)
                    const tomorrowStartMinutes = timeToMinutes(tomorrowDuty.startTime)
                    
                    let actualRestMinutes
                    if (tomorrowStartMinutes > todayEndMinutes) {
                        actualRestMinutes = tomorrowStartMinutes - todayEndMinutes
                    } else {
                        actualRestMinutes = (24 * 60) - todayEndMinutes + tomorrowStartMinutes
                    }
                    
                    if (actualRestMinutes < requiredMRT) {
                        return true
                    }
                }
            }
        }
        
        return false
    }

    const getDaySuggestion = (day) => {
        const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate()
        const dayKey = `${currentYear}-${currentMonth}-${day}`
        const duty = droppedItems[dayKey]
        
        if (duty) return null
        
        const dayDate = new Date(currentYear, currentMonth, day)
        const dayOfWeek = (dayDate.getDay() + 6) % 7
        
        const mondayOfWeek = day - dayOfWeek
        const weekDays = []
        for (let d = mondayOfWeek; d < mondayOfWeek + 7 && d <= currentMonthDays && d >= 1; d++) {
            weekDays.push(d)
        }
        
        if (weekDays.length >= 7) {
            const weekAssignments = weekDays.map(d => {
                const key = `${currentYear}-${currentMonth}-${d}`
                return droppedItems[key]
            }).filter(Boolean)
            
            const recessDayCount = weekAssignments.filter(d => d.id === 'recessday').length
            const restCount = weekAssignments.filter(d => d.id === 'rest').length
            
            if (recessDayCount === 0) {
                return { type: 'required', text: '例' }
            }
            if (restCount === 0) {
                return { type: 'required', text: '休' }
            }
        }
        
        if (day > 1) {
            const yesterdayKey = `${currentYear}-${currentMonth}-${day - 1}`
            const yesterdayDuty = droppedItems[yesterdayKey]
            
            if (yesterdayDuty?.isDuty && yesterdayDuty.endTime) {
                const yesterdayFDP = calculateFDP(yesterdayDuty)
                const requiredMRT = calculateMRT(yesterdayFDP)
                const yesterdayEffectiveEndTime = getEffectiveEndTime(yesterdayDuty)
                const yesterdayEndMinutes = timeToMinutes(yesterdayEffectiveEndTime)
                
                const earliestStartMinutes = (yesterdayEndMinutes + requiredMRT) % (24 * 60)
                const earliestStartTime = minutesToTime(earliestStartMinutes)
                
                return { 
                    type: 'rest-time', 
                    text: `earliest: ${earliestStartTime}`,
                    requiredRest: formatDuration(requiredMRT)
                }
            }
        }
        
        return null
    }

    const handleScreenshot = async () => {
        if (validationErrors.length > 0) return
        
        try {
            const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')).default
            
            if (!rosterRef.current) return
            
            const filename = `${currentYear}年${currentMonth + 1}月預排班表-${userDetails?.name || '韓建豪'}.png`
            
            const canvas = await html2canvas(rosterRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false
            })
            
            const link = document.createElement('a')
            link.download = filename
            link.href = canvas.toDataURL('image/png')
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
        } catch (error) {
            console.error('Screenshot failed:', error)
            alert('截圖失敗，請重試')
        }
    }

    useEffect(() => {
        const errors = validateRestRequirements()
        setValidationErrors(errors)
    }, [droppedItems, currentMonth, currentYear])

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
        for (let i = currentYearDefault - 1; i <= currentYearDefault + 2; i++) {
            years.push(i)
        }
        return years
    }

    const handleAddCustomDuty = () => {
        if (!newDuty.name || !newDuty.code) {
            alert('請填寫任務名稱和代碼')
            return
        }

        const customDuty = {
            id: `custom_${Date.now()}`,
            code: newDuty.code,
            name: newDuty.name,
            startTime: newDuty.startTime,
            endTime: newDuty.endTime,
            color: '#6B7280',
            isCustom: true,
            isDuty: newDuty.startTime && newDuty.endTime ? true : false,
            isFlightDuty: newDuty.isFlightDuty
        }

        setCustomDuties(prev => [...prev, customDuty])
        setAllDuties(prev => [...prev, customDuty])
        setNewDuty({ name: '', startTime: '', endTime: '', code: '', isFlightDuty: false })
        setShowCustomDutyModal(false)
    }

    const handleDeleteCustomDuty = (dutyId) => {
        if (window.confirm('確定要刪除此自訂任務嗎？')) {
            setCustomDuties(prev => prev.filter(duty => duty.id !== dutyId))
            setAllDuties(prev => prev.filter(duty => duty.id !== dutyId))
            
            setDroppedItems(prev => {
                const newItems = { ...prev }
                Object.keys(newItems).forEach(key => {
                    if (newItems[key].id === dutyId) {
                        delete newItems[key]
                    }
                })
                return newItems
            })
        }
    }

    const handleDutyClick = (duty) => {
        if (isTouchDevice) {
            if (selectedDuty?.id === duty.id) {
                setSelectedDuty(null)
            } else {
                setSelectedDuty(duty)
            }
        }
    }

    const handleCalendarCellClick = (day) => {
        if (isTouchDevice && day) {
            const key = `${currentYear}-${currentMonth}-${day}`
            
            if (droppedItems[key]) {
                const isConfirmed = window.confirm(`確定要移除 ${droppedItems[key].name} 嗎？`)
                if (isConfirmed) {
                    setDroppedItems(prev => {
                        const newItems = { ...prev }
                        delete newItems[key]
                        return newItems
                    })
                }
            } else if (selectedDuty) {
                setDroppedItems(prev => ({ ...prev, [key]: selectedDuty }))
            }
        }
    }

    const clearSelection = () => {
        setSelectedDuty(null)
    }

    const handleDragStart = (e, duty) => {
        if (isTouchDevice) return
        setDraggedItem(duty)
        setDraggedFromDate(null)
        e.dataTransfer.effectAllowed = 'copy'
    }

    const handleDutyDragStart = (e, duty, dateKey) => {
        if (isTouchDevice) return
        setDraggedItem(duty)
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

    return (
        <div className="min-h-screen">
            <Navbar 
                userDetails={userDetails} 
                title="豪神休時檢視APP"
                onLogout={onLogout}
            />
            
            <div 
                className="duty-roster-container"
                onDragOver={handleDragOver}
                onDrop={handleEmptyAreaDrop}
            >
                <div ref={rosterRef} className="duty-roster-main">
                    <div className="duty-roster-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">{userDetails?.name || '韓建豪'} - {currentYear}年{monthNames[currentMonth]} 預排班表模擬器</h2>
                            <div className="date-navigation">
                                <div className="date-picker-wrapper">
                                    <button 
                                        className="date-picker-button"
                                        onClick={handleYearClick}
                                    >
                                        {currentYear}年
                                    </button>
                                    {showYearPicker && (
                                        <div className="dropdown-menu year-dropdown">
                                            {getYearOptions().map(year => (
                                                <div
                                                    key={year}
                                                    className={`dropdown-item ${year === currentYear ? 'selected' : ''}`}
                                                    onClick={() => selectYear(year)}
                                                >
                                                    {year}年
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="date-picker-wrapper">
                                    <button 
                                        className="date-picker-button"
                                        onClick={handleMonthClick}
                                    >
                                        {monthNames[currentMonth]}
                                    </button>
                                    {showMonthPicker && (
                                        <div className="dropdown-menu month-dropdown">
                                            {monthNames.map((month, index) => (
                                                <div
                                                    key={index}
                                                    className={`dropdown-item ${index === currentMonth ? 'selected' : ''}`}
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

                        <div className="duties-section">
                            <div className="duties-header">
                                <h3 className="duties-title">預設班型</h3>
                                
                                <div className="duties-controls">
                                    {isTouchDevice && selectedDuty && (
                                        <button
                                            onClick={clearSelection}
                                            className="clear-selection-button"
                                        >
                                            <X size={14} />
                                            取消選擇
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowCustomDutyModal(true)}
                                        className="add-duty-button"
                                    >
                                        <Plus size={16} />
                                        Add custom Duty
                                    </button>
                                </div>
                            </div>
                            
                            <div className="duties-grid">
                                {allDuties.map((duty) => {
                                    const fdpMinutes = calculateFDP(duty)
                                    const mrtMinutes = calculateMRT(fdpMinutes)
                                    
                                    return (
                                        <div key={duty.id} className="duty-item-wrapper">
                                            <div
                                                draggable={!isTouchDevice}
                                                onDragStart={(e) => handleDragStart(e, duty)}
                                                onClick={() => handleDutyClick(duty)}
                                                className={`duty-item ${isTouchDevice && selectedDuty?.id === duty.id ? 'selected' : ''}`}
                                                style={{ backgroundColor: duty.color }}
                                                title={`${duty.name}${duty.startTime && duty.endTime ? `\nFDP: ${formatDuration(fdpMinutes)}\nMRT: ${formatDuration(mrtMinutes)}${duty.isFlightDuty ? '\n30min buffer included for rest calculations' : ''}` : ''}`}
                                            >
                                                <div className="duty-code">
                                                    {duty.code}
                                                    {duty.isFlightDuty && <span className="flight-duty-indicator">★</span>}
                                                </div>
                                                {duty.startTime && duty.endTime && (
                                                    <div className="duty-times">
                                                        {duty.startTime}<br />{duty.endTime}
                                                        <div className="duty-fdp">
                                                            FDP: {formatDuration(fdpMinutes)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {duty.isCustom && (
                                                <button
                                                    onClick={() => handleDeleteCustomDuty(duty.id)}
                                                    className="delete-duty-button"
                                                    title="刪除自訂任務"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {validationErrors.length > 0 && (
                            <div className="validation-section">
                                <div className="validation-header">
                                    <h3 className="validation-title">Violations 休時警示</h3>
                                    <button
                                        onClick={() => setShowValidation(!showValidation)}
                                        className="validation-toggle"
                                    >
                                        {showValidation ? 'Hide' : 'Show'} Details ({validationErrors.length})
                                    </button>
                                </div>
                                {showValidation && (
                                    <div className="validation-errors">
                                        {validationErrors.map((error, index) => (
                                            <div key={index} className="validation-error">
                                                <span className="error-bullet">•</span>
                                                <span>{error}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {validationErrors.length === 0 && Object.keys(droppedItems).length > 0 && (
                            <div className="validation-success">
                                <div className="success-indicator"></div>
                                <span className="success-text">All rest time requirements satisfied</span>
                            </div>
                        )}

                        <div className="calendar-container">
                            <div className="calendar-header">
                                {dayNames.map((day) => (
                                    <div key={day} className="calendar-day-name">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="calendar-grid">
                                {calendarDays.map((day, index) => {
                                    if (!day) {
                                        return <div key={index} className="calendar-empty-cell"></div>
                                    }

                                    const key = `${currentYear}-${currentMonth}-${day}`
                                    const assignedDuty = droppedItems[key]
                                    const dayOfWeek = (startDayOfWeek + day - 1) % 7
                                    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
                                    const isInViolation = isDutyInViolation(day)
                                    const suggestion = getDaySuggestion(day)

                                    return (
                                        <div
                                            key={`${index}-${day}`}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, day)}
                                            onClick={() => handleCalendarCellClick(day)}
                                            className={`calendar-cell ${isWeekend ? 'weekend' : ''} ${isTouchDevice ? 'clickable' : ''}`}
                                        >
                                            <div className="calendar-day-number">{day}</div>
                                            {assignedDuty && (
                                                <div 
                                                    draggable={!isTouchDevice}
                                                    onDragStart={(e) => handleDutyDragStart(e, assignedDuty, key)}
                                                    className={`assigned-duty ${isInViolation ? 'duty-violation' : ''}`}
                                                    style={{ backgroundColor: assignedDuty.color }}
                                                    title={isTouchDevice ? "點擊移除" : "拖拉到空白處可刪除"}
                                                >
                                                    <div className="duty-code-calendar">
                                                        {assignedDuty.code}
                                                        {assignedDuty.isFlightDuty && <span className="flight-duty-indicator">★</span>}
                                                    </div>
                                                    {assignedDuty.startTime && assignedDuty.endTime && (
                                                        <div className="duty-time-range">
                                                            {assignedDuty.startTime} - {assignedDuty.endTime}
                                                        </div>
                                                    )}
                                                    {assignedDuty.isDuty && assignedDuty.startTime && assignedDuty.endTime && (
                                                        <div className="duty-mrt">
                                                            MRT: {formatDuration(calculateMRT(calculateFDP(assignedDuty)))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {!assignedDuty && suggestion && (
                                                <div className={`day-suggestion ${suggestion.type}`}>
                                                    {suggestion.type === 'required' && (
                                                        <div className="suggestion-text required">
                                                            Need: {suggestion.text}
                                                        </div>
                                                    )}
                                                    {suggestion.type === 'rest-time' && (
                                                        <div className="suggestion-text rest-time">
                                                            <div className="suggestion-line">{suggestion.text}</div>
                                                            <div className="suggestion-detail">({suggestion.requiredRest} rest)</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="instructions">
                            <div className="instruction-item">
                                <Calendar size={16} />
                                {isTouchDevice ? (
                                    <span>點選任務類別後，再點選日期進行安排</span>
                                ) : (
                                    <span>把任務拉到指定日期上進行規劃</span>
                                )}
                            </div>
                            <div className="instruction-note">
                                {isTouchDevice ? "點選已安排的任務可移除（需確認）" : "拖拉已安排的任務到空白處可刪除"}
                            </div>
                            <div className="instruction-note">點選年份或月份可快速切換</div>
                            <div className="instruction-note">所有警示排除後才能截圖</div>
                            <div className="instruction-requirements">
                                休時規定: 每週需要 例+休 • 每7日需休滿連續 32h • ★ = 飛班任務 (+30min DP)
                            </div>
                        </div>
                    </div>

                    <div className="screenshot-section">
                        <button 
                            onClick={handleScreenshot}
                            className={`screenshot-button ${validationErrors.length > 0 ? 'disabled' : ''}`}
                            disabled={validationErrors.length > 0}
                            title={validationErrors.length > 0 ? 'Please resolve rest time violations first' : ''}
                        >
                            <Camera size={20} />
                            截圖預排班表
                            {validationErrors.length > 0 && (
                                <span className="blocked-text">(Blocked)</span>
                            )}
                        </button>
                    </div>
                </div>

                {showCustomDutyModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">新增自訂任務</h3>
                                <button 
                                    onClick={() => setShowCustomDutyModal(false)}
                                    className="modal-close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="modal-form">
                                <div className="form-group">
                                    <label className="form-label">任務代碼 *</label>
                                    <input
                                        type="text"
                                        value={newDuty.code}
                                        onChange={(e) => setNewDuty(prev => ({ ...prev, code: e.target.value }))}
                                        className="form-input"
                                        placeholder="例: T1, R2, etc."
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">任務名稱 *</label>
                                    <input
                                        type="text"
                                        value={newDuty.name}
                                        onChange={(e) => setNewDuty(prev => ({ ...prev, name: e.target.value }))}
                                        className="form-input"
                                        placeholder="例: Training Session"
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">開始時間</label>
                                        <input
                                            type="time"
                                            value={newDuty.startTime}
                                            onChange={(e) => setNewDuty(prev => ({ ...prev, startTime: e.target.value }))}
                                            className="form-input"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label">結束時間</label>
                                        <input
                                            type="time"
                                            value={newDuty.endTime}
                                            onChange={(e) => setNewDuty(prev => ({ ...prev, endTime: e.target.value }))}
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newDuty.isFlightDuty}
                                            onChange={(e) => setNewDuty(prev => ({ ...prev, isFlightDuty: e.target.checked }))}
                                            className="form-checkbox"
                                        />
                                        <span className="form-checkbox-text">
                                            Flight Duty (adds 30min buffer for rest calculations) ★
                                        </span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="modal-actions">
                                <button
                                    onClick={() => setShowCustomDutyModal(false)}
                                    className="modal-button cancel"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleAddCustomDuty}
                                    className="modal-button confirm"
                                >
                                    新增任務
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MRTChecker