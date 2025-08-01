import React, { useState } from 'react'
import { Calendar, Clock, Code, ChevronDown, ChevronUp, Wrench, FilePlus } from 'lucide-react'
import Navbar from '../common/Navbar.jsx'
import { patchUpdates } from './PatchUpdates.js'
import styles from '../../styles/patch-notes.module.css'

const PatchNotes = ({ userDetails, onLogout }) => {
    const [expandedItems, setExpandedItems] = useState({})
    const [selectedApp, setSelectedApp] = useState('all')

    // Get unique app names for filter
    const appNames = ['all', ...new Set(patchUpdates.map(update => update.appName.trim()))]

    // Filter updates based on selected app
    const filteredUpdates = selectedApp === 'all' 
        ? patchUpdates 
        : patchUpdates.filter(update => update.appName.trim() === selectedApp)

    // Sort updates by date (newest first)
    const sortedUpdates = [...filteredUpdates].sort((a, b) => new Date(b.date) - new Date(a.date))

    // Group updates by date
    const groupedUpdates = sortedUpdates.reduce((acc, update) => {
        const date = update.date
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(update)
        return acc
    }, {})

    const toggleExpanded = (key) => {
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${year}年${month}月${day}日`
    }

    const getAppColor = (appName) => {
        const colors = {         
            '任務互換系統': '#F59E0B',
            'GDay劃假系統': '#10B981',
            'BC擺盤訓練': '#8B5CF6',
            'eTR產生器': '#3B82F6',
            'EIP系統': '#EF4444'
        }
        return colors[appName.trim()] || '#6B7280'
    }

    const getUpdateTypeIcon = (updateText) => {
        if (updateText.includes('初稿') || updateText.includes('編輯出')) {
            return <Code size={14} className={styles.updateIcon} />
        }
        if (updateText.includes('調整') || updateText.includes('修改')) {
            return <Wrench size={14} className={styles.updateIcon} />
        }
        if (updateText.includes('增加') || updateText.includes('新增')) {
            return <FilePlus size={14} className={styles.updateIcon} />
        }
        return <Clock size={14} className={styles.updateIcon} />
    }

    return (
        <div className={styles.container}>
            <Navbar 
                userDetails={userDetails} 
                title="系統更新紀錄"
                onLogout={onLogout}
            />
            
            <div className={styles.patchNotesContainer}>
                <div className={styles.mainPanel}>
                    <div className={styles.panelHeader}>
                        <h2 className={styles.panelTitle}>
                            應用程式更新紀錄 
                            <span className={styles.updateCount}>
                                ({sortedUpdates.length} 個更新)
                            </span>
                        </h2>
                        
                        <div className={styles.filterSection}>
                            <label className={styles.filterLabel}>篩選:</label>
                            <select 
                                value={selectedApp}
                                onChange={(e) => setSelectedApp(e.target.value)}
                                className={styles.filterSelect}
                            >
                                {appNames.map(app => (
                                    <option key={app} value={app}>
                                        {app === 'all' ? '全部應用' : app}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.timelineContainer}>
                        {Object.entries(groupedUpdates).map(([date, updates]) => (
                            <div key={date} className={styles.dateGroup}>
                                <div className={styles.dateHeader}>
                                    <div className={styles.dateBadge}>
                                        <Calendar size={16} />
                                        {formatDate(date)}
                                    </div>
                                    <div className={styles.updateCountBadge}>
                                        {updates.length} 個更新
                                    </div>
                                </div>

                                <div className={styles.updatesGrid}>
                                    {updates.map((update, index) => {
                                        const updateKey = `${date}-${index}`
                                        const isExpanded = expandedItems[updateKey]
                                        
                                        return (
                                            <div key={updateKey} className={styles.updateCard}>
                                                <div className={styles.updateHeader}>
                                                    <div className={styles.appInfo}>
                                                        <div 
                                                            className={styles.appBadge}
                                                            style={{ backgroundColor: getAppColor(update.appName) }}
                                                        >
                                                            {update.appName.trim()}
                                                        </div>
                                                        <div className={styles.updateMeta}>
                                                            {update.updateInfo.length} 項更新
                                                        </div>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => toggleExpanded(updateKey)}
                                                        className={styles.expandButton}
                                                        title={isExpanded ? "隱藏詳情" : "展開詳情"}
                                                    >
                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </div>

                                                <div className={`${styles.updateContent} ${isExpanded ? styles.expanded : ''}`}>
                                                    {isExpanded && (
                                                        <div className={styles.updateList}>
                                                            {update.updateInfo.map((info, infoIndex) => (
                                                                <div key={infoIndex} className={styles.updateItem}>
                                                                    {getUpdateTypeIcon(info)}
                                                                    <span className={styles.updateText}>{info}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {!isExpanded && (
                                                        <div className={styles.updatePreview}>
                                                            <div className={styles.updateItem}>
                                                                {getUpdateTypeIcon(update.updateInfo[0])}
                                                                <span className={styles.updateText}>
                                                                    {update.updateInfo[0]}
                                                                    {update.updateInfo.length > 1 && (
                                                                        <span className={styles.moreIndicator}>
                                                                            ...還有 {update.updateInfo.length - 1} 項
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredUpdates.length === 0 && (
                        <div className={styles.emptyState}>
                            <Code size={48} className={styles.emptyIcon} />
                            <h3 className={styles.emptyTitle}>沒有找到更新紀錄</h3>
                            <p className={styles.emptyText}>
                                選擇的應用程式目前沒有更新紀錄
                            </p>
                        </div>
                    )}
                </div>

                <div className={styles.statsSection}>
                    <div className={styles.statsCard}>
                        <h3 className={styles.statsTitle}>更新統計</h3>
                        
                        <div className={styles.statsList}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>總更新數:</span>
                                <span className={styles.statValue}>{patchUpdates.length}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>應用程式數:</span>
                                <span className={styles.statValue}>{appNames.length - 1}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>最新更新:</span>
                                <span className={styles.statValue}>
                                    {formatDate(sortedUpdates[0]?.date || '2025-06-08')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.appsOverview}>
                        <h4 className={styles.overviewTitle}>應用程式一覽</h4>
                        <div className={styles.appsList}>
                            {appNames.slice(1).map(app => {
                                const appUpdates = patchUpdates.filter(update => update.appName.trim() === app)
                                return (
                                    <div key={app} className={styles.appOverviewItem}>
                                        <div 
                                            className={styles.appColorDot}
                                            style={{ backgroundColor: getAppColor(app) }}
                                        ></div>
                                        <div className={styles.appOverviewText}>
                                            <div className={styles.appOverviewName}>{app}</div>
                                            <div className={styles.appOverviewCount}>
                                                {appUpdates.length} 次更新
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PatchNotes