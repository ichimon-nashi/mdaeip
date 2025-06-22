import { useState, useEffect, useRef } from 'react';
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { additionalRemarkData, bulletinData, ccomData } from './ETRData';
import Navbar from '../common/Navbar.jsx';
import styles from '../../styles/etr-generator.module.css';
import audio from "./hallelujahSound.mp3";

const ETRGenerator = ({ userDetails, onLogout }) => {
  const [startDate, setStartDate] = useState(Date.now());
  const [selectedTime, setSelectedTime] = useState('23:59'); // Default to end of day
  const [noOfBulletin, setNoOfBulletin] = useState(5);
  const [textToCopy, setTextToCopy] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  
  const ccomDataRef = useRef(null);
  const bulletinDataRef = useRef(null);
  const textAreaDataRef = useRef(null);
  const audioRef = useRef(new Audio(audio));

  const formattedMonth = moment(startDate).format("MM-DD");
  const dayOfWeek = moment(startDate).format("dddd");
  const oneWeekFromStartDate = moment(startDate).subtract(7, "days").format('YYYY-MM-DD');

  useEffect(() => {
    audioRef.current.volume = 0.4;
    return () => {
      audioRef.current.pause();
    };
  }, []);

  const processTextContent = () => {
    if (!ccomDataRef.current || !bulletinDataRef.current || !textAreaDataRef.current) return '';
    
    // CCOM Data - Safe extraction with null checks
    let ccomDataToBeCopied = '';
    const h2CcomElement = ccomDataRef.current.querySelector('h2');
    const pCcomElement = ccomDataRef.current.querySelector('p');
    
    if (h2CcomElement) {
      ccomDataToBeCopied += h2CcomElement.textContent + "\r\n";
    }
    
    if (pCcomElement) {
      ccomDataToBeCopied += pCcomElement.textContent;
    }
    
    // Bulletin Data - Safe extraction
    let bulletinDataToBeCopied = '';
    const bulletinItems = bulletinDataRef.current.querySelectorAll('li');
    
    if (bulletinItems && bulletinItems.length > 0) {
      bulletinDataToBeCopied = Array.from(bulletinItems)
        .map(li => li.textContent)
        .join("\r\n");
    }
    
    // Additional Remarks - Safe extraction
    let additionalRemarkToBeCopied = '';
    const h2TextAreaElement = textAreaDataRef.current.querySelector('h2');
    const remarkItems = textAreaDataRef.current.querySelectorAll('li');
    
    if (h2TextAreaElement) {
      additionalRemarkToBeCopied += h2TextAreaElement.textContent + "\r\n";
    }
    
    if (remarkItems && remarkItems.length > 0) {
      additionalRemarkToBeCopied += Array.from(remarkItems)
        .map(li => li.textContent)
        .join("\r\n");
    }
    
    return ccomDataToBeCopied + "\n\n" + "二、公告抽問合格，摘要如下:" + "\r\n" + bulletinDataToBeCopied + "\n\n" + additionalRemarkToBeCopied;
  };

  useEffect(() => {
    // Wait for refs to be populated and trigger re-render when time changes
    if (ccomDataRef.current && bulletinDataRef.current && textAreaDataRef.current) {
      setTextToCopy(processTextContent());
    }
  }, [startDate, selectedTime, noOfBulletin]);

  // Force component update when selectedTime changes
  const [forceUpdate, setForceUpdate] = useState(0);
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [selectedTime]);

  const getCCOMQuestion = () => {
    const randomCCOMQuestion = [];
    for (let i = 0; i < ccomData.length; i++) {
      if ((formattedMonth >= ccomData[i]["startDate"]) && (formattedMonth <= ccomData[i]["endDate"])) {
        if (ccomData[i]["chapter"] === "12") {
          switch (dayOfWeek) {
            case "Monday":
              randomCCOMQuestion.push(`1. 依公告抽問飛安暨主題加強宣導月題庫。抽問 F2${ccomData[i]["questionList"][0]}，抽問結果正常。`);
              break;
            case "Tuesday":
              randomCCOMQuestion.push(`1. 依公告抽問飛安暨主題加強宣導月題庫。抽問 F2${ccomData[i]["questionList"][1]}，抽問結果正常。`);
              break;
            case "Wednesday":
              randomCCOMQuestion.push(`1. 依公告抽問飛安暨主題加強宣導月題庫。抽問 F2${ccomData[i]["questionList"][2]}，抽問結果正常。`);
              break;
            case "Thursday":
              randomCCOMQuestion.push(`1. 依公告抽問飛安暨主題加強宣導月題庫。抽問 F2${ccomData[i]["questionList"][3]}，抽問結果正常。`);
              break;
            case "Friday":
              randomCCOMQuestion.push(`1. 依公告抽問飛安暨主題加強宣導月題庫。抽問 F2${ccomData[i]["questionList"][4]}，抽問結果正常。`);
              break;
            case "Saturday":
              randomCCOMQuestion.push(`1. 依公告抽問飛安暨主題加強宣導月題庫。抽問 F2${ccomData[i]["questionList"][5]}，抽問結果正常。`);
              break;
            case "Sunday":
              randomCCOMQuestion.push(`1. 依公告抽問飛安暨主題加強宣導月題庫。抽問 F2${ccomData[i]["questionList"][6]}，抽問結果正常。`);
              break;
            default:
              break;
          }
        } else {
          const randomNumber = Math.floor(Math.random() * (ccomData[i]["questionList"].length));
          randomCCOMQuestion.push(`1. 抽問 F2 CCOM Ch.${ccomData[i]["questionList"][randomNumber]}，抽問結果正常。`);
        }
      }
    }
    return <p>{randomCCOMQuestion}</p>;
  }

  // Helper function to check if bulletin time is before selected time
  const isTimeBeforeSelected = (bulletinTime) => {
    // Ensure we're parsing the times correctly
    const selectedMoment = moment(selectedTime, 'HH:mm');
    const bulletinMoment = moment(bulletinTime, 'HH:mm');
    return bulletinMoment.isSameOrBefore(selectedMoment);
  };

  const bulletinTimeStamp = bulletinData
    .filter(criteria => moment(criteria.date).isSameOrBefore(startDate))
    .filter(criteria => {
      // If bulletin is from the same date as selected date, check time
      if (moment(criteria.date).isSame(startDate, 'day')) {
        return isTimeBeforeSelected(criteria.time);
      }
      // If bulletin is from before the selected date, include it
      return moment(criteria.date).isBefore(startDate, 'day');
    })
    .slice(-noOfBulletin) //No of bulletin displayed based on input
    .map((item) => {
      return (
        <li key={`id${item.id}${item.date}${item.time}`}>{`${item.date} : ${item.time}`}</li>
      )
    });

  const newestBulletin = bulletinData
    .filter(criteria => moment(criteria.date).isSameOrBefore(startDate))
    .filter(criteria => {
      // If bulletin is from the same date as selected date, check time
      if (moment(criteria.date).isSame(startDate, 'day')) {
        return isTimeBeforeSelected(criteria.time);
      }
      // If bulletin is from before the selected date, include it
      return moment(criteria.date).isBefore(startDate, 'day');
    })
    .slice(-noOfBulletin) //No of bulletin displayed based on input
    .map((item, index) => {
      const timestamp = `${item.date} : ${item.time}`;
      return (
        <li key={`id${item.id}`} data-timestamp={timestamp}>
          {`${index + 1}. ${item.id} : ${item.title}`}
        </li>
      )
    });

  const filteredRemarks = additionalRemarkData
    .filter(criteria1 => moment(criteria1.date).isSameOrBefore(startDate))
    .filter(criteria2 => moment(criteria2.date).isSameOrAfter(oneWeekFromStartDate))
    .map((item, index) => {
      return (
        <li key={item.message}>
          {`${index + 1}. ${item.message}`}
        </li>
      )
    });

  return (
    <div className={styles.etrGeneratorContainer}>
      {userDetails && (
        <Navbar 
          userDetails={userDetails} 
          title="eTR產生器" 
          onLogout={onLogout}
        />
      )}
      
      <div className={styles.etrContent}>
        <div className={styles.headerContainer}>
          <h1 className={`${styles.title} ${styles.neonText}`}>
            e-<span className={`${styles.redNeon} ${styles.neonFlicker}`}>TAHI</span> Report
          </h1>
          <small className={styles.versionNo}>
            最後更新: {bulletinData[bulletinData.length - 1].date > additionalRemarkData[additionalRemarkData.length - 1].date ? moment(bulletinData[bulletinData.length - 1].date).format("YYYY-MM-DD") : moment(additionalRemarkData[additionalRemarkData.length - 1].date).format("YYYY-MM-DD")}
          </small>
          <p className={styles.warning}>👇點選任務日期&時間👇</p>
          <div className={styles.datePickerContainer}>
            <DatePicker
              showIcon
              name="datepicker"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
            />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </div>
        </div>

        <fieldset className={styles.ccomContainer}>
          <legend>CCOM抽問</legend>
          <div id="ccomData" ref={ccomDataRef}>
            <h2>一、飛安抽問合格，摘要如下：</h2>
            {getCCOMQuestion()}
          </div>
        </fieldset>

        <fieldset className={styles.bulletinContainer}>
          <legend>公告宣導/抽問</legend>
          <div className={styles.bulletinControlContainer}>
            <label className={styles.bulletinLabel}>
              公告數量 <em>(最少5筆)</em>
            </label>
            <div className={styles.bulletinInputGroup}>
              <button 
                type="button"
                className={styles.bulletinButton}
                onClick={() => setNoOfBulletin(prev => Math.max(5, prev - 1))}
                disabled={noOfBulletin <= 5}
              >
                −
              </button>
              <input
                className={styles.bulletinInput}
                type="number"
                value={noOfBulletin}
                min="5"
                max="50"
                onChange={(event) => {
                  const value = parseInt(event.target.value) || 5;
                  setNoOfBulletin(Math.max(5, Math.min(50, value)));
                }}
              />
              <button 
                type="button"
                className={styles.bulletinButton}
                onClick={() => setNoOfBulletin(prev => Math.min(50, prev + 1))}
                disabled={noOfBulletin >= 50}
              >
                +
              </button>
            </div>
          </div>
          <div>
            <h2>二、公告抽問合格，摘要如下:</h2>
            <div className={styles.bulletinDataContainer}>
              <div className={styles.leftColumn}>
                {bulletinTimeStamp}
              </div>
              <div id="bulletinData" ref={bulletinDataRef} className={styles.rightColumn}>
                {newestBulletin}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.additionalRemarksContainer}>
          <legend>Team+宣達事項</legend>
          <div id="textAreaData" ref={textAreaDataRef}>
            <h2>三、其他：</h2>
            {filteredRemarks.length < 1 ? <li>1. 無。</li> : filteredRemarks}
          </div>
        </fieldset>

        <button
          className={`${styles.copyButton} ${copyStatus ? styles.copied : ""}`}
          onClick={() => {
            const currentText = processTextContent();
            navigator.clipboard.writeText(currentText)
              .then(() => {
                console.log("Text copied successfully:\n\n", currentText);
                setCopyStatus(true);
                setTimeout(() => setCopyStatus(false), 2000);
                audioRef.current.play();
              })
              .catch(err => {
                console.error("Failed to copy text: ", err);
              });
          }}
        >
          {copyStatus ? "COPIED ✅" : "COPY 📋"}
        </button>
      </div>
    </div>
  )
}

export default ETRGenerator