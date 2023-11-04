import React, { useState, useEffect } from 'react';
import './App.css';
import {Oval} from "react-loader-spinner"

const keywords = ['React', 'UI', 'Component', 'JavaScript', 'Programming'];

const conceptEndpoint = '/concept-generate'
const storyEndpoint = '/story-merge'

function Loading(){
  return (
      <Oval
        color='#fff000'
        height={20}
        width={20}
      />
    )
}

function Keyword({ keyword, text, onInsert, isTextLoading }) {
  const [detail, setDetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadComplete, setIsLoadComplete] = useState(false); // 상태 추가

  // 로딩 상태(isTextLoading)가 변경될 때마다 실행됩니다.
  useEffect(() => {
    if (!isTextLoading && isOpen) {
      setIsLoadComplete(true); // 로딩이 끝났을 때 true로 설정합니다.
    } else {
      setIsLoadComplete(false); // 로딩 중이거나 말풍선이 닫혔을 때 false로 설정합니다.
    }
  }, [isTextLoading, isOpen]);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(conceptEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ story: text, keyword})
      });
      const data = await response.json();
      setDetail(data.concept_detail); // API 응답에서 세부사항을 설정
    } catch (error) {
      setDetail('Failed to load details'); // 오류 처리
    }
    setIsLoading(false);
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchDetails();
    }
    setIsOpen(!isOpen);
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
                  ) : (
                    <button onClick={() => onInsert(keyword, detail)}>Insert?</button>
                  )}
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function TextView({ text, onTextChange }) {
  return (
    <textarea
      className="text-view"
      value={text}
      onChange={onTextChange}
    />
  );
}

function App() {
  const [text, setText] = useState("29-year-old Bong-Wi, Chauri, and Kim, whose relationships, jobs, and exams aren't going as planned.  We got it! Our fact-bombing romantic comedy!");
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [alert, setAlert] = useState(null); // 알림 메시지를 위한 상태

  const handleTextChange = (e) => {
    setText(e.target.value);
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
      setText(data.merged_story); // API 응답에서 세부사항을 설정
    } catch {
      setAlert('Failed to fetch data. Try again.'); // 에러 발생 시 알림 설정
      setTimeout(() => setAlert(null), 3000); // 3초 후 알림 해제
    }
  };

  const handleInsert = async (keyword, detail) => {
    // fetchText 함수를 호출하고 인자를 전달합니다.
    await fetchText(keyword, detail);
  };

  return (
    <div className="app">
      {alert && <div className="alert">{alert}</div>}
      <div className="sidebar">
        {keywords.map((keyword, index) => (
          <Keyword
            key={index}
            keyword={keyword}
            story={text}
            onInsert={handleInsert}
            isTextLoading={isTextLoading} // 로딩 상태를 Keyword 컴포넌트에 전달
          />
        ))}
      </div>
      <div className="textarea">
        <TextView text={text} onTextChange={handleTextChange} />
      </div>
    </div>
  );
}

export default App;
