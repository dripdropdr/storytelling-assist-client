import React, { useState, useEffect } from 'react';
import './App.css';
import {Oval} from "react-loader-spinner"

const keywords = ['Michal Jackson', 'pink sweater', 'ducks', 'halloween', 'silver dolphins'];

const exampleTexts = [
  "The bad boy I knew as a kid is back and even worse! When Chul, who lives in the villa next door to Mi-ae in middle school and whom she briefly saw in the countryside as a child, goes to the same school and class as her, and is teased as duo Chul takes offense and avoids Mi-ae. Mi-ae is offended, but they continue to get involved through strange coincidences, and eventually they both get very upset and stop pretending to know each other anymore. As Mi-ae gets involved with Chul, who is always angry, and some of the strangest friends she's ever met, Mi-ae experiences puberty the hard way...",
  "Yoon Ji-ho is too positive and too unobtrusive, and there are men who have been secretly crushing on her for years.  Will their hearts be able to reach Yoon Ji-ho, the worst sensation of all? The best no-nonsense comedy romance of this era.",
  "Navier was the perfect empress of the Eastern Empire. When she realizes that her husband, the Emperor, is trying to make her Empress, she decides to divorce him. If I can't be empress here, I'll be empress somewhere else.",
];

const conceptEndpoint = '/concept-generate'
const storyEndpoint = '/story-merge'
const simEndpoint = '/sentence-similarity'

function Loading(){
  return (
      <Oval
        color='#fff000'
        height={20}
        width={20}
      />
    )
}

// ************************************************************************* 
function Keyword({ keyword, story, onInsert, isTextLoading, onCompleted, isOpen, toggleTooltip }) {
  const [detail, setDetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [isOpen, setIsOpen] = useState(false);
  const [isLoadComplete, setIsLoadComplete] = useState(false); // 상태 추가

  const handleInsertClick = async () => {
    setIsLoadComplete(false); // 로딩 시작 전 상태 초기화
    await onInsert(keyword, detail);
    setIsLoadComplete(true); // 로딩 완료 후 상태 업데이트
    onCompleted(keyword); // App에 로딩 완료를 알림
  };

  const fetchDetails = async () => {
    setIsLoading(true);
    console.log(story)
    try {
      const response = await fetch(conceptEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ story, keyword})
      });
      const data = await response.json();
      setDetail(data.concept_detail); // API 응답에서 세부사항을 설정
    } catch (error) {
      setDetail('Failed to load details'); // 오류 처리
    }
    setIsLoading(false);
  };

  const handleToggle = () => {
    toggleTooltip(keyword);
    if (!isOpen) {
      fetchDetails();
    }
  };

  return (
    <div className="keyword-container">
      <button className="keyword-button" onClick={handleToggle}>
        {keyword}
      </button>
      {isOpen && (
        <div className="keyword-tooltip">
          <div className="tooltip-arrow" />
          <div className="tooltip-content">
            {isLoading ? <div className="loading-container"><Loading/></div> : (
                <>
                  <p>{detail}</p>
                  {isTextLoading ? (
                    <div className="loading-container"><Loading/></div>
                  ) : isLoadComplete ? (
                    <div className='loading-container'><img src='/checkmark.png' width='25'/></div>
                  ) : (
                    <button onClick={handleInsertClick}>Insert?</button>
                  )}
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

// ************************************************************************* 
function TextView({ text, onTextChange }) {
  return (
    <textarea
      className="text-view"
      value={text}
      onChange={onTextChange}
    />
  );
}

// ************************************************************************* 
function GaugeBar({ value }) {
  // 게이지 바의 색상을 계산합니다. 값에 따라 색상을 변경합니다.
  const getColor = (value) => {
    if (value <= 0) return '#d3d3d3'; // 회색
    if (value >= 100) return '#ff0000'; // 붉은색
    // 그 외의 경우, 회색과 붉은색 사이의 색상을 계산합니다.
    const redValue = Math.floor((value / 100) * 255);
    return `rgb(${redValue}, 0, 0)`;
  };

  // 게이지 바의 너비를 계산합니다. 값에 따라 너비가 변경됩니다.
  const getWidth = (value) => `${Math.max(0, Math.min(100, value))}%`;

  return (
    <div className="gauge-bar-container" style={{ width: '100%', backgroundColor: '#e0e0e0' }}>
      <div
        className="gauge-bar-fill"
        style={{
          width: getWidth(value),
          height: '10px',
          backgroundColor: getColor(value),
          transition: 'width 0.3s ease-in-out',
        }}
      />
    </div>
  );
}

function GaugeButton({ onCheckDiversity }) {
  const [isInfoTooltipVisible, setIsInfoTooltipVisible] = useState(false);

  const toggleInfo = () => {
    setIsInfoTooltipVisible(!isInfoTooltipVisible);
  };

  return(
    <div className="button-container">
      <button type='button' onClick={onCheckDiversity}>Check diversity</button>
      <div className="info-button-container">
        <img src={'./info-icon.png'} alt="Info" onClick={toggleInfo} className="info-button"/>
        {isInfoTooltipVisible && (
          <div className="info-tooltip">
            This value is calcuated by previous compared text and now.
          </div>
        )}
      </div>
    </div>
  )
}


// ************************************************************************* 
function App() {
  const givenText = "29-year-old Bong-Wi, Chauri, and Kim, whose relationships, jobs, and exams aren't going as planned.  We got it! Our fact-bombing romantic comedy!"
  const [text, setText] = useState(sessionStorage.getItem("text") || givenText);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [completedKeywords, setCompletedKeywords] = useState([]);
  const [alert, setAlert] = useState(null); // 알림 메시지를 위한 상태
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchComplete, setIsSearchComplete] = useState(false);
  const [completeSearchTerm, setCompleteSearchTerm] = useState("");
  const [filteredKeywords, setFilteredKeywords] = useState(keywords); // 필터링된 키워드 목록 상태
  const [gaugeValue, setGaugeValue] = useState(sessionStorage.getItem("gaugeValue") || 0);
  const [previousText, setPreviousText] = useState(sessionStorage.getItem("previousText") ||givenText)
  const [tooltipsOpen, setTooltipsOpen] = useState({});  // 툴팁 표시 상태를 관리하는 상태 변수
  const [newKeyword, setNewKeyword] = useState(''); // 새 키워드 입력을 위한 상태 변수
  const [showInfo, setShowInfo] = useState(false); // 정보 툴팁 표시 여부를 제어하는 상태


  // 예시 텍스트를 `text` 상태에 설정하는 함수
  const handleSetText = (exampleText) => {
    setText(exampleText);
  };

  useEffect(() => {
    const storedText = sessionStorage.getItem("text");
    if (storedText) {
      setText(storedText);
      }
    },
  []);

  useEffect(() => {
    sessionStorage.setItem("gaugeValue", gaugeValue);
    sessionStorage.setItem("previousText", previousText);
  }, [gaugeValue, previousText]);
  

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    sessionStorage.setItem("text", newText); // 세션 스토리지에 저장
  };

  const fetchText= async (keyword, concept_detail) => {
    setIsTextLoading(true)
    try{
      const response = await fetch(storyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ story: text, concept_detail, keyword})
      });

      const data = await response.json();
      setIsTextLoading(false);
      setText(data.merged_story);
    } catch {
      setAlert('Failed to fetch data. Try again.'); // 에러 발생 시 알림 설정
      setTimeout(() => setAlert(null), 3000); // 3초 후 알림 해제
    }
  };

  const handleInsert = async (keyword, detail) => {
    await fetchText(keyword, detail);
  };

  const handleLoadComplete = (keyword) => {
    setCompletedKeywords(prevKeywords => {
      // 중복된 키워드가 없으면 추가
      return prevKeywords.includes(keyword) ? prevKeywords : [...prevKeywords, keyword];
    });
  };

  // 서버에서 필터링된 키워드 목록을 가져오는 함수
  const handleSearch = async () => {
    if (searchTerm){
      setIsSearchComplete(false);
      setIsSearchLoading(true); // 로딩 상태 시작
      try {
        const response = await fetch(`/search-keywords?query=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setFilteredKeywords(data.keywords); // 서버로부터 받은 키워드 목록으로 상태 업데이트
        console.log(data.keywords)
      } catch (error) {
        console.error("Failed to fetch keywords:", error);
        // 에러 처리 로직 (상태 업데이트 등)
      }
      setIsSearchLoading(false); // 로딩 상태 종료
      setIsSearchComplete(true);
      setCompleteSearchTerm(searchTerm)
      setTooltipsOpen({}); // 모든 키워드의 툴팁을 닫는 로직
    }
  };

  // 툴팁 토글 함수
  const toggleTooltip = (keyword) => {
    setTooltipsOpen(prevState => ({
      ...prevState,
      [keyword]: !prevState[keyword]
    }));
  };

  const handleSimilarity = async () => {
    if (text){
      try{
        const response = await fetch(simEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ origin:previousText , new:text })
        });
        const data = await response.json();
        // 서버에서 계산된 유사도 값을 상태에 저장
        const diversity = 100 - data.similarity;
        setGaugeValue(diversity);
        setPreviousText(text);
      } catch (error){
        console.error("Failed to calcuate similarity", error)
      }
    }
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() !== '') {
      // 새 키워드를 기존 키워드 목록에 추가
      setFilteredKeywords(prevKeywords => [...prevKeywords, newKeyword.trim()]);
      setNewKeyword(''); // 입력 필드 초기화
    }
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo); // 정보 툴팁 표시 상태를 토글
  };

  return (
    <div className="app">
      {alert && <div className="alert">{alert}</div>}
      <div className="sidebar">
        <p className='mini-header'>Explore your Keywords!</p>
        <div className="add-keyword-section">
          <input
            type="text"
            placeholder="Add your new keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
          />
          <button onClick={handleAddKeyword}>Add</button>
        </div>
        {isSearchComplete && <p>Result from {completeSearchTerm}..</p>}
        {filteredKeywords.map((keyword, index) => ( // filteredKeywords
          <Keyword
            key={index}
            keyword={keyword}
            story={text}
            onInsert={handleInsert}
            isTextLoading={isTextLoading} // 로딩 상태를 Keyword 컴포넌트에 전달
            onCompleted={handleLoadComplete}
            isOpen={tooltipsOpen[keyword]}
            toggleTooltip={() => toggleTooltip(keyword)}
          />
        ))}
        <p className='mini-header'></p>
        <p className='mini-header'>Search related Keywords</p>
        <div className="info-bar">
          <img src={'./info-icon.png'} alt="Info" onClick={toggleInfo} className="search-info-button"/>
          {showInfo && (
            <div className="search-info-tooltip">
              {/* 여기에 정보 툴팁 내용을 넣습니다 */}
              <p>This searching function is sourced by Reddit. After preprocessing and touching some creativity-intriguing technique, keywords are served.</p>
            </div>
          )}
      </div>
        <div className="search-bar">
          <input
            className='search-input'
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type='button' onClick={handleSearch}>Search</button>
        </div>
        <div className='search-loading-container'>
          <br/>
          {isSearchLoading && <Loading/>}
        </div>
      </div>
      <div className="main-content">
        <div className="examples-container">
            {exampleTexts.map((example, index) => (
              <button key={index} onClick={() => handleSetText(example)}>
                {`Example ${index + 1}`}
              </button>
            ))}
          </div>
        <div className="textarea">
          <TextView text={text} onTextChange={handleTextChange} />
        </div>
      </div>
      <div className="right-sidebar">
        <p className='mini-header'>Completed Keywords</p>
        <GaugeBar value={gaugeValue} />
        <GaugeButton onCheckDiversity={handleSimilarity}/>
          {completedKeywords.map((keyword, index) => (
            <div className='keyword-container'><button className="keyword-button" key={index}>{keyword}</button></div>
          ))}
      </div>
    </div>
  );
}

export default App;
