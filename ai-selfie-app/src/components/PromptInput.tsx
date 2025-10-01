import React from 'react';

interface PromptInputProps {
  promptText: string;
  setPromptText: (text: string) => void;
}

const examplePrompts = [
  '한강 야경을 배경으로 다 같이 웃으며 셀카 찍기',
  '노을 지는 해변에서 즐겁게 셀카 찍기',
  '에펠탑 앞에서 찍은 스냅 사진',
  '눈 덮인 산 정상에서 환하게 웃으며 기념 셀카 찍기',
];

export const PromptInput: React.FC<PromptInputProps> = ({ promptText, setPromptText }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">2. 셀카 배경과 상황을 알려주세요</h2>
      <p className="text-gray-600 mb-4">원하는 배경과 분위기를 텍스트로 자유롭게 작성해 주세요.</p>
      
      <textarea
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        placeholder="예) 뉴욕 타임스퀘어에서 찍은 사진처럼 / 서울 한강의 야경을 배경으로, 모두 함께 웃으며 셀카"
        className="w-full h-28 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
      />

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">예시:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example) => (
            <button
              key={example}
              onClick={() => setPromptText(example)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      
       <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
          <p className="text-sm text-green-800">
            <span className="font-bold">팁:</span> 배경과 인물들의 포즈, 표정을 자세히 묘사할수록 더 원하는 결과에 가까워집니다.
          </p>
      </div>
    </div>
  );
};
