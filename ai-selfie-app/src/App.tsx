import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64, getMimeType } from './utils/file';
import { FileUpload } from './components/FileUpload';
import { PromptInput } from './components/PromptInput';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [promptText, setPromptText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleFilesChange = useCallback((files: File[]) => {
    setUploadedFiles(files);
  }, []);
  
  const handleGenerateClick = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      setError('합성할 인물의 사진을 먼저 올려주세요.');
      return;
    }
    if (!promptText.trim()) {
      setError('셀카 배경과 상황을 알려주세요.');
      return;
    }
    if (!process.env.API_KEY) {
      setError("API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const imageParts = await Promise.all(
        uploadedFiles.map(async (file) => {
          const base64Data = await fileToBase64(file);
          const mimeType = getMimeType(file.name) || 'image/jpeg';
          return {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          };
        })
      );

      let fullPrompt: string;

      if (uploadedFiles.length === 1) {
        // Prompt for single person background change
        fullPrompt = `Using the individual in the [User uploaded photo], generate a new image that places this person in the scene described by the user. It is absolutely critical to maintain 100% facial and stylistic consistency with the original person. The final output must be a hyper-realistic, high-resolution photograph.

User Scenario: ${promptText}

Additional Directives:
• Absolute Identity Lock: Do not alter the person's face, hair, clothing, or accessories in any way. Replicate them exactly as they appear in the uploaded photo.
• No New Subjects: Do not add any other people to the image.
• Pose and Mood: The person's pose and expression should naturally fit the described scene.`;
      } else {
        // Prompt for group selfie
        fullPrompt = `Using the individuals in the [User uploaded photos], generate a group selfie image. It is absolutely critical to maintain 100% facial and stylistic consistency with the originals. The final output must be a hyper-realistic, high-resolution photograph reflecting the following scenario described by the user.

User Scenario: ${promptText}

Additional Directives:
• Absolute Identity Lock: Faithfully reproduce every detail of the subjects, including their facial features, hairstyles, clothing, and accessories. Do not alter their appearance.
• No New Subjects: Strictly use only the people from the uploaded photos and do not add any new individuals.
• Pose and Mood: Portray all subjects smiling or expressing joy, posing together as if genuinely taking a selfie, and looking directly into the camera.`;
      }


      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [...imageParts, { text: fullPrompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
            setGeneratedImage(imageUrl);
            foundImage = true;
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            break; 
          }
        }
      }
      
      if (!foundImage) {
        throw new Error('AI가 이미지를 생성하지 못했습니다. 프롬프트를 수정하거나 다른 사진을 사용해보세요.');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || '이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFiles, promptText]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">원석이의 AI 사진기</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            사진 속 인물을 원하는 배경과 상황에 맞게 합성해 보세요! 한 명의 사진으로 배경을 바꾸거나, 여러 명의 사진을 그룹 셀카로 만들 수 있습니다.
          </p>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
          <FileUpload onFilesChange={handleFilesChange} />
          <PromptInput promptText={promptText} setPromptText={setPromptText} />

          <div className="text-center">
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="w-full md:w-auto inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>생성 중... 잠시만 기다려주세요.</span>
                </>
              ) : (
                'AI 셀카 만들기'
              )}
            </button>
            {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
          </div>

          <div ref={resultRef}>
            {generatedImage && <ResultDisplay imageUrl={generatedImage} />}
          </div>
        </div>
      </main>
       <footer className="text-center py-6 mt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} 원석이의 AI 사진기. All rights reserved.</p>
      </footer>
    </div>
  );
};


export default App;
