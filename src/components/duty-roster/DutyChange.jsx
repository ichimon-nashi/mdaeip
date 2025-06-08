import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from '../common/Navbar.jsx';
import { getEmployeeById, approvedUsers, getEmployeeSchedule } from "../DataRoster.js";
import formTemplateImage from '../../assets/form-template.png';
import toast from "react-hot-toast";

const DutyChange = ({ userDetails, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstID: "",
        firstName: "",
        firstRank: "",
        firstDate: "",
        firstTask: "",
        secondID: "",
        secondName: "",
        secondRank: "",
        secondDate: "",
        secondTask: "",
        applicationDate: new Date().toISOString().slice(0, 10),
        selectedMonth: "",
        allDuties: []
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userSchedule, setUserSchedule] = useState(null);

    const findCrewMemberRank = (employeeID) => {
        const approvedUser = approvedUsers.find(user => user.id === employeeID);
        if (approvedUser) return approvedUser.rank;
        
        const employee = getEmployeeById(employeeID);
        return employee?.rank || "";
    };

    useEffect(() => {
        if (location.state) {
            const firstRank = findCrewMemberRank(location.state.firstID || "");
            const secondRank = findCrewMemberRank(location.state.secondID || "");
            
            setFormData(prevState => ({
                ...prevState,
                ...location.state,
                firstRank,
                secondRank
            }));

            if (location.state.firstID && location.state.selectedMonth) {
                const userSched = getEmployeeSchedule(location.state.firstID, location.state.selectedMonth);
                setUserSchedule(userSched);
            }
        }
    }, [location.state]);

    function downloadImageMobile(canvas, filename) {
        try {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            setTimeout(() => {
                toast('✅ 換班單(png圖片)已產生並下載！');
            }, 200);
            
        } catch (error) {
            console.error('Download failed:', error);
            toast('圖片產生失敗，請重試');
        }
    }

    const groupConsecutiveDuties = (duties) => {
        if (!duties || duties.length === 0) return [];
        
        const sortedDuties = [...duties].sort((a, b) => new Date(a.date) - new Date(b.date));
        const groups = [];
        let currentGroup = [sortedDuties[0]];
        
        for (let i = 1; i < sortedDuties.length; i++) {
            const currentDate = new Date(sortedDuties[i].date);
            const previousDate = new Date(sortedDuties[i - 1].date);
            const daysDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff === 1) {
                currentGroup.push(sortedDuties[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [sortedDuties[i]];
            }
        }
        
        groups.push(currentGroup);
        return groups;
    };

    const formatGroupedDuties = (dutyGroups, isUserDuties = false) => {
        const formattedEntries = [];
        
        dutyGroups.forEach(group => {
            if (group.length === 1) {
                const duty = group[0];
                const formattedDate = formatDateForForm(duty.date);
                let task;
                
                if (isUserDuties) {
                    const userDuty = userSchedule?.days?.[duty.date] || "";
                    task = userDuty === "" ? "空" : userDuty;
                } else {
                    task = duty.duty === "" ? "空" : duty.duty;
                }
                
                formattedEntries.push({
                    date: formattedDate,
                    task: task,
                    isRange: false
                });
            } else {
                const startDate = formatDateForForm(group[0].date);
                const endDate = formatDateForForm(group[group.length - 1].date);
                const dateRange = `${startDate} - ${endDate}`;
                
                let tasks;
                if (isUserDuties) {
                    tasks = group.map(duty => {
                        const userDuty = userSchedule?.days?.[duty.date] || "";
                        return userDuty === "" ? "空" : userDuty;
                    });
                } else {
                    tasks = group.map(duty => duty.duty === "" ? "空" : duty.duty);
                }
                
                if (tasks.length > 5) {
                    formattedEntries.push({
                        date: dateRange,
                        task: tasks.slice(0, 5).join('、') + '、',
                        isRange: true,
                        isContinued: true
                    });
                    
                    formattedEntries.push({
                        date: '',
                        task: tasks.slice(5).join('、'),
                        isRange: false,
                        isContinuation: true
                    });
                } else {
                    formattedEntries.push({
                        date: dateRange,
                        task: tasks.join('、'),
                        isRange: true
                    });
                }
            }
        });
        
        return formattedEntries;
    };

    const prepareDutiesForPDF = (duties) => {
        if (!duties || duties.length === 0) return [];
        const dutyGroups = groupConsecutiveDuties(duties);
        return formatGroupedDuties(dutyGroups, false);
    };

    const getUserDutiesForPDF = (selectedDates) => {
        if (!selectedDates || selectedDates.length === 0) return [];
        const userDuties = selectedDates.map(date => ({ date, duty: userSchedule?.days?.[date] || "" }));
        const dutyGroups = groupConsecutiveDuties(userDuties);
        return formatGroupedDuties(dutyGroups, true);
    };

    async function generateImageFromTemplate() {
        setIsLoading(true);
        setError(null);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 2480;
            canvas.height = 3508;
            
            const templateImg = new Image();
            templateImg.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                templateImg.onload = resolve;
                templateImg.onerror = reject;
                templateImg.src = formTemplateImage;
            });
            
            ctx.drawImage(templateImg, 0, 0, 2480, 3508);
            
            const renderTextOnCanvas = (text, x, y, fontSize = 14) => {
                if (!text || typeof text !== 'string') return;
                
                const cleanText = String(text).trim();
                if (!cleanText) return;
                
                ctx.font = `${fontSize}px "Noto Sans TC", "Noto Sans Traditional Chinese", "Microsoft JhengHei", "PingFang TC", "Hiragino Sans TC", "Microsoft YaHei", "SimHei", "Arial Unicode MS", sans-serif`;
                ctx.fillStyle = 'black';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(cleanText, x, y);
            };

            const convertToCanvasCoords = (x, y) => {
                const pixelX = (x / 72) * 300;
                const pixelY = 3508 - ((y / 72) * 300);
                return { x: pixelX, y: pixelY };
            };
            
            // First person data
            let coords = convertToCanvasCoords(72, 710);
            renderTextOnCanvas(formData.firstID, coords.x, coords.y, 56);

            coords = convertToCanvasCoords(195, 710);
            renderTextOnCanvas(formData.firstName, coords.x, coords.y, 52);

            // First rank checkboxes
            if (formData.firstRank) {
                ctx.font = '64px Arial';
                if (formData.firstRank === 'PR' || formData.firstRank === 'FI') {
                    coords = convertToCanvasCoords(149, 682);
                    ctx.fillText('X', coords.x, coords.y);
                } else if (formData.firstRank === 'LF') {
                    coords = convertToCanvasCoords(149, 661);
                    ctx.fillText('X', coords.x, coords.y);
                } else if (formData.firstRank === 'FS' || formData.firstRank === 'FA') {
                    coords = convertToCanvasCoords(149, 640);
                    ctx.fillText('X', coords.x, coords.y);
                }
            }

            // First person duties
            if (formData.allDuties && formData.allDuties.length > 0) {
                const selectedDates = formData.allDuties.map(duty => duty.date);
                const userDutiesEntries = getUserDutiesForPDF(selectedDates);
                const dutyYPositions = [572, 554, 535];

                for (let i = 0; i < Math.min(userDutiesEntries.length, 3); i++) {
                    const entry = userDutiesEntries[i];

                    if (entry.isContinuation) {
                        coords = convertToCanvasCoords(142, dutyYPositions[i]);
                        renderTextOnCanvas(entry.task, coords.x, coords.y, 48);
                    } else {
                        const isDateRange = entry.isRange || entry.date.includes(' - ');
                        const dateX = isDateRange ? 43 : 70;
                        const taskX = isDateRange ? 142 : 210;

                        coords = convertToCanvasCoords(dateX, dutyYPositions[i]);
                        renderTextOnCanvas(entry.date, coords.x, coords.y, 48);

                        coords = convertToCanvasCoords(taskX, dutyYPositions[i]);
                        renderTextOnCanvas(entry.task, coords.x, coords.y, 48);
                    }
                }
            } else {
                const isFirstDateMultiple = formData.firstDate && formData.firstDate.includes('-');
                const firstDateX = isFirstDateMultiple ? 43 : 70;
                const firstTaskX = isFirstDateMultiple ? 142 : 210;

                coords = convertToCanvasCoords(firstDateX, 566);
                renderTextOnCanvas(formData.firstDate, coords.x, coords.y, 48);

                coords = convertToCanvasCoords(firstTaskX, 566);
                const firstTask = formData.firstTask === "" ? "空" : formData.firstTask;
                renderTextOnCanvas(firstTask, coords.x, coords.y, 48);
            }

            // Second person data
            coords = convertToCanvasCoords(330, 710);
            renderTextOnCanvas(formData.secondID, coords.x, coords.y, 56);

            coords = convertToCanvasCoords(450, 710);
            renderTextOnCanvas(formData.secondName, coords.x, coords.y, 52);

            // Second rank checkboxes
            if (formData.secondRank) {
                ctx.font = '64px Arial';
                if (formData.secondRank === 'PR' || formData.secondRank === 'FI') {
                    coords = convertToCanvasCoords(406, 682);
                    ctx.fillText('X', coords.x, coords.y);
                } else if (formData.secondRank === 'LF') {
                    coords = convertToCanvasCoords(406, 661);
                    ctx.fillText('X', coords.x, coords.y);
                } else if (formData.secondRank === 'FS' || formData.secondRank === 'FA') {
                    coords = convertToCanvasCoords(406, 640);
                    ctx.fillText('X', coords.x, coords.y);
                }
            }

            // Second person duties
            if (formData.allDuties && formData.allDuties.length > 0) {
                const secondDutiesEntries = prepareDutiesForPDF(formData.allDuties);
                const dutyYPositions = [572, 554, 535];

                for (let i = 0; i < Math.min(secondDutiesEntries.length, 3); i++) {
                    const entry = secondDutiesEntries[i];

                    if (entry.isContinuation) {
                        coords = convertToCanvasCoords(398, dutyYPositions[i]);
                        renderTextOnCanvas(entry.task, coords.x, coords.y, 48);
                    } else {
                        const isDateRange = entry.isRange || entry.date.includes(' - ');
                        const dateX = isDateRange ? 298 : 328;
                        const taskX = isDateRange ? 398 : 465;

                        coords = convertToCanvasCoords(dateX, dutyYPositions[i]);
                        renderTextOnCanvas(entry.date, coords.x, coords.y, 48);

                        coords = convertToCanvasCoords(taskX, dutyYPositions[i]);
                        renderTextOnCanvas(entry.task, coords.x, coords.y, 48);
                    }
                }
            } else {
                const isSecondDateMultiple = formData.secondDate && formData.secondDate.includes('-');
                const secondDateX = isSecondDateMultiple ? 298 : 328;
                const secondTaskX = isSecondDateMultiple ? 398 : 465;

                coords = convertToCanvasCoords(secondDateX, 566);
                renderTextOnCanvas(formData.secondDate, coords.x, coords.y, 48);

                coords = convertToCanvasCoords(secondTaskX, 566);
                const secondTask = formData.secondTask === "" ? "空" : formData.secondTask;
                renderTextOnCanvas(secondTask, coords.x, coords.y, 48);
            }

            // Application date
            coords = convertToCanvasCoords(180, 461);
            if (formData.applicationDate) {
                const formattedDate = new Date(formData.applicationDate).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                });
                renderTextOnCanvas(formattedDate, coords.x, coords.y, 56);
            }

            const filename = `FMEF-06-04客艙組員任務互換申請單-${formData.firstName}&${formData.secondName}.png`;
            downloadImageMobile(canvas, filename);

        } catch (error) {
            console.error('Error generating image:', error);
            setError(`Failed to generate image: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));

        if (name === 'secondID') {
            const employee = getEmployeeById(value);
            if (employee) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    secondName: employee.name,
                    secondRank: employee.rank
                }));
            }
        }
    };

    const formatDateForForm = (dateStr) => {
        const date = new Date(dateStr);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen">
            <Navbar
                userDetails={userDetails}
                title="任務互換系統"
                onLogout={onLogout}
            />

            <div className="confirmWindow">
                <div className="dutyChange-container">
                    <h1 className="confirmTitle">客艙組員任務互換申請單</h1>

                    {error && (
                        <div className="error-container">
                            {error}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-section">
                            <h2 className="section-title">甲方資料</h2>
                            <div className="form-group">
                                <label className="form-label">員工編號</label>
                                <input
                                    type="text"
                                    name="firstID"
                                    placeholder="員工編號"
                                    value={formData.firstID}
                                    className="form-input disabled"
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">姓名</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="姓名"
                                    value={formData.firstName}
                                    className="form-input disabled"
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">職位</label>
                                <input
                                    type="text"
                                    name="firstRank"
                                    placeholder="職位"
                                    value={formData.firstRank}
                                    className="form-input disabled"
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">日期</label>
                                <input
                                    type="text"
                                    name="firstDate"
                                    placeholder="日期 (MM/DD)"
                                    value={formData.firstDate}
                                    className="form-input disabled"
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">任務</label>
                                <input
                                    type="text"
                                    name="firstTask"
                                    placeholder="任務內容"
                                    value={formData.firstTask}
                                    className="form-input disabled"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="section-title">乙方資料</h2>
                            <div className="form-group">
                                <label className="form-label">員工編號</label>
                                <input
                                    type="text"
                                    name="secondID"
                                    placeholder="員工編號"
                                    value={formData.secondID}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">姓名</label>
                                <input
                                    type="text"
                                    name="secondName"
                                    placeholder="姓名"
                                    value={formData.secondName}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">職位</label>
                                <input
                                    type="text"
                                    name="secondRank"
                                    placeholder="職位"
                                    value={formData.secondRank}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">日期</label>
                                <input
                                    type="text"
                                    name="secondDate"
                                    placeholder="日期 (MM/DD)"
                                    value={formData.secondDate}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">任務</label>
                                <input
                                    type="text"
                                    name="secondTask"
                                    placeholder="任務內容"
                                    value={formData.secondTask}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group date-group">
                        <label className="form-label">申請日期</label>
                        <input
                            type="date"
                            name="applicationDate"
                            value={formData.applicationDate}
                            disabled
                            className="form-input disabled date-input"
                        />
                    </div>

                    <div className="confirmButton-container">
                        <button
                            onClick={generateImageFromTemplate}
                            disabled={isLoading}
                            className="generateButton"
                        >
                            {isLoading ? "處理中..." : "產生換班單"}
                        </button>
                        <button
                            onClick={() => navigate('/mdaduty')}
                            className="returnButton"
                        >
                            返回班表
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DutyChange;