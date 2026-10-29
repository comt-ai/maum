import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const emotionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    empathyResponse: {
      type: Type.STRING,
      description: '사용자의 감정을 깊이 경청하고 공감하며 따뜻하게 맞장구치는 한국어 대화체 답변',
    },
    emotionAnalysis: {
      type: Type.OBJECT,
      properties: {
        primaryEmotion: {
          type: Type.STRING,
          description: '기쁨, 평온, 슬픔, 불안, 분노, 번아웃, 외로움, 자책, 설렘, 감사 중 대표 감정 1개',
        },
        emotionEmoji: {
          type: Type.STRING,
          description: '대표 감정에 어울리는 이모지',
        },
        secondaryEmotions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '사용자가 느끼는 복합적인 미세 감정 2~3개 (예: 서운함, 부담감, 기대감)',
        },
        valence: {
          type: Type.NUMBER,
          description: '감정 긍/부정 지수 (-1.0 매우 부정 ~ 0 중립 ~ +1.0 매우 긍정)',
        },
        energyLevel: {
          type: Type.STRING,
          description: '감정 에너지 수준 (낮음, 보통, 높음)',
        },
        stressLevel: {
          type: Type.INTEGER,
          description: '스트레스/심리적 긴장도 (1부터 10까지 정수)',
        },
        summaryReason: {
          type: Type.STRING,
          description: '사용자가 이런 감정을 느끼게 된 핵심 원인과 심리적 배경 요약 (1~2문장)',
        },
        detectedKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '사용자의 발화에서 감지된 핵심 정서/상황 키워드 3~5개',
        },
      },
      required: [
        'primaryEmotion',
        'emotionEmoji',
        'secondaryEmotions',
        'valence',
        'energyLevel',
        'stressLevel',
        'summaryReason',
        'detectedKeywords',
      ],
    },
    advice: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: '마음 처방전 제목 (예: "오늘의 나에게 허락하는 쉼표")',
        },
        actionableSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '사용자가 오늘 당장 마음을 돌보기 위해 실천할 수 있는 구체적 단계 2~3가지',
        },
        perspectiveShift: {
          type: Type.STRING,
          description: '생각을 다르게 바라보도록 돕는 인지적 재구성 / 따뜻한 관점의 전환',
        },
        quote: {
          type: Type.STRING,
          description: '마음에 깊은 위로와 용기를 주는 감동적인 한 줄 문장',
        },
      },
      required: ['title', 'actionableSteps', 'perspectiveShift', 'quote'],
    },
    recommendedActivity: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: '추천 마음 챙김 행동 이름 (예: 4-7-8 심호흡, 따뜻한 차 한 잔, 어깨 긴장 풀기)',
        },
        duration: {
          type: Type.STRING,
          description: '소요 시간 (예: 3분, 5분)',
        },
        description: {
          type: Type.STRING,
          description: '어떻게 행동하면 좋은지 친절한 설명',
        },
      },
      required: ['name', 'duration', 'description'],
    },
    suggestedReplies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '사용자가 편하게 이어서 말할 수 있는 추천 답변 3가지',
    },
  },
  required: [
    'empathyResponse',
    'emotionAnalysis',
    'advice',
    'recommendedActivity',
    'suggestedReplies',
  ],
};

async function callGeminiEmotionModel(userPrompt: string, systemInstruction: string) {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.85,
            responseMimeType: 'application/json',
            responseSchema: emotionResponseSchema,
          },
        });

        const rawText = response.text?.trim() || '{}';
        const parsed = JSON.parse(rawText);
        if (parsed && parsed.empathyResponse && parsed.emotionAnalysis) {
          return parsed;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Attempt Failed] model=${model}, attempt=${attempt}: ${err?.message || err}`);
        // If 503 / 429 wait 800ms before next attempt
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }

  // Graceful fallback if external model endpoint has temporary universal outage
  console.warn('All Gemini model candidates exhausted, returning fallback care response');
  return {
    empathyResponse:
      '이야기를 들려주셔서 고마워요. 지금 마음속에 느껴지는 여러 감정들이 많이 복잡하고 버거우셨겠어요. 어떤 감정이든 그럴 만한 충분한 이유가 있고, 당신의 솔직한 마음은 그 자체로 소중해요.',
    emotionAnalysis: {
      primaryEmotion: '지침/복합감정',
      emotionEmoji: '🌿',
      secondaryEmotions: ['부담감', '혼란', '휴식 필요'],
      valence: -0.2,
      energyLevel: '낮음',
      stressLevel: 5,
      summaryReason: '마음속에 담아둔 생각과 감정의 무게로 인해 작은 쉼과 따뜻한 인정이 필요한 상태입니다.',
      detectedKeywords: ['마음', '감정', '생각', '위로'],
    },
    advice: {
      title: '오늘의 나에게 선물하는 작은 쉼표',
      actionableSteps: [
        '편안하게 기대어 앉아 3번 깊게 심호흡하기',
        '나에게 "오늘 하루도 애썼어"라고 속으로 다정하게 속삭이기',
        '따뜻한 물 한 잔을 마시며 몸의 온기 느껴보기',
      ],
      perspectiveShift:
        '모든 것을 당장 완벽하게 해결하지 않아도 괜찮아요. 지금은 내 마음에 먼저 온기를 건넬 때입니다.',
      quote: '당신은 생각보다 훨씬 더 잘 해내고 있고, 지금 그대로도 충분히 소중한 존재예요.',
    },
    recommendedActivity: {
      name: '4-7-8 이완 호흡',
      duration: '3분',
      description: '숨을 깊게 마시고 천천히 내쉬며 몸에 쌓인 긴장을 내려놓아 보세요.',
    },
    suggestedReplies: [
      '지금 조금 더 쉬고 싶어요',
      '제 마음을 이해해줘서 고마워요',
      '마음이 조금 가벼워진 것 같아요',
    ],
  };
}

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasKey: Boolean(process.env.GEMINI_API_KEY) });
});

// API: Emotional Chat with Gemini
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], currentMoodTag } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: '메시지를 입력해주세요.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY가 설정되지 않았습니다. Secrets 패널에서 키를 확인해주세요.',
      });
      return;
    }

    const formattedHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .map((item: { role: string; content: string }) => `${item.role === 'user' ? '사용자' : '마음모디'}: ${item.content}`)
          .join('\n')
      : '';

    const systemInstruction = `당신은 마음 건강 및 감정 케어 전문 AI 심리 코치 "마음모디 (MaeumModi)"입니다.
당신의 역할은 사용자가 털어놓는 일상의 사건과 그때그때의 솔직한 기분을 경청하고, 사용자의 감정을 섬세하고 정확하게 분석하며, 깊은 공감 반응과 실질적이고 따뜻한 마음 처방전(조언)을 제공하는 것입니다.

[상담 및 분석 원칙]
1. 비판이나 훈계, 상투적인 "힘내세요" 대신 사용자의 감정을 그 자체로 온전히 수용하고 인정(Validation)하세요.
2. 기쁨, 슬픔, 분노, 불안, 번아웃, 외로움 등 겉으로 드러난 감정 이면에 있는 욕구(안정, 인정, 휴식, 연결감 등)를 헤아리세요.
3. 한국어로 온화하고 사려 깊은 대화체(~해요, ~군요, ~을 권해드려요)를 사용하세요.
4. 조언(Advice)은 부담스럽지 않고 지금 바로 작은 쉼표가 될 수 있는 실천 지침(Actionable Steps)과 긍정적/현실적 재구성(Perspective Shift)을 제시하세요.
5. 주어진 JSON 스키마를 엄격히 준수하여 응답하세요.`;

    const userPrompt = `[이전 대화 맥락]
${formattedHistory ? formattedHistory : '(첫 대화 시작)'}
${currentMoodTag ? `[사용자가 사전에 선택한 오늘의 기분 태그: ${currentMoodTag}]` : ''}

[사용자의 최근 이야기와 기분]
"${message}"

위 사용자의 발화와 기분을 정밀 분석하여, 공감 어린 답변, 감정 분석 데이터, 맞춤형 조언 처방전, 추천 활동, 이어서 나눌 추천 대답을 JSON 형식으로 작성해주세요.`;

    const parsedData = await callGeminiEmotionModel(userPrompt, systemInstruction);

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || '감정 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
});

// API: Daily Mood Journal Deep Analysis
app.post('/api/analyze-journal', async (req: Request, res: Response) => {
  try {
    const { journalText, selectedEmotions = [] } = req.body;

    if (!journalText || typeof journalText !== 'string') {
      res.status(400).json({ error: '일기 내용을 입력해주세요.' });
      return;
    }

    const systemInstruction = `당신은 심층 심리 분석 및 감정 일기 코치 "마음모디"입니다. 사용자의 긴 글이나 하루 일기를 읽고 하루 전체의 감정 곡선과 심리적 의미를 심층 분석하여 마음 처방 리포트를 만듭니다. JSON 형식으로 답하세요.`;

    const prompt = `[사용자의 하루 감정 일기]
${journalText}
${selectedEmotions.length > 0 ? `[사용자가 체크한 감정 키워드]: ${selectedEmotions.join(', ')}` : ''}

이 일기를 바탕으로 공감 응답, 감정 분석, 조언 처방전을 JSON 스키마에 맞춰 생성해주세요.`;

    const parsedData = await callGeminiEmotionModel(prompt, systemInstruction);
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Gemini journal analysis error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || '일기 분석 중 오류가 발생했습니다.',
    });
  }
});

// Setup Vite or Static Serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
