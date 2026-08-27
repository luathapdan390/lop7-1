import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from './data/questions.ts';
import { Question, StudentName } from './types.ts';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCcw, Award, BookOpen, User, Check, Sparkles } from 'lucide-react';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw00EtPyhylfx8ZUg3o7CFvc5g44RK17byvTJqy8kMY6grcfIVpTAT7Enu9NenGnBFR/exec';
const STUDENT_LIST: StudentName[] = ['Minh Chi', 'Duy Sang', 'Bảo Khuê'];

export function normalizeFillAnswer(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[.,!?;:]+$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function isAnswerCorrect(q: Question, userAns: string | undefined): boolean {
  if (!userAns) return false;
  if (q.loai === 'mc') {
    return userAns.trim().toUpperCase() === q.dapAn;
  }
  const cleanInput = normalizeFillAnswer(userAns);
  return q.dapAnChapNhan.some((ans) => normalizeFillAnswer(ans) === cleanInput);
}

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'quiz' | 'result'>('welcome');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const hasSentWebhook = useRef<boolean>(false);

  const currentQuestion: Question = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQuestion.cau] || '';

  const canProceed = (() => {
    if (currentQuestion.loai === 'mc') {
      return Boolean(currentAnswer);
    }
    return currentAnswer.trim().length > 0;
  })();

  const handleStart = () => {
    if (!selectedStudent) return;
    setScreen('quiz');
    setCurrentIndex(0);
    setAnswers({});
    hasSentWebhook.current = false;
  };

  const handleSelectMC = (option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.cau]: option,
    }));
  };

  const handleFillChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.cau]: val,
    }));
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finish quiz & show results
      setScreen('result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Calculate score
  const correctCount = QUESTIONS.reduce((acc, q) => {
    return acc + (isAnswerCorrect(q, answers[q.cau]) ? 1 : 0);
  }, 0);

  // Trigger Webhook when entering result screen
  useEffect(() => {
    if (screen === 'result' && !hasSentWebhook.current && selectedStudent) {
      hasSentWebhook.current = true;
      const payload = {
        ten: selectedStudent,
        lop: "7",
        diem: correctCount,
        tongCau: QUESTIONS.length,
        url: window.location.href,
      };

      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      }).catch((err) => {
        console.error('Webhook error:', err);
      });
    }
  }, [screen, correctCount, selectedStudent]);

  const handleRestart = () => {
    setScreen('welcome');
    setSelectedStudent('');
    setCurrentIndex(0);
    setAnswers({});
    hasSentWebhook.current = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Header Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Bài tập Tiếng Anh lớp 7
              </h1>
              <p className="text-xs text-indigo-600 font-medium">Present Simple & Present Continuous</p>
            </div>
          </div>

          {selectedStudent && screen !== 'welcome' && (
            <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-800 shadow-2xs">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{selectedStudent}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl">
          {/* SCREEN 1: WELCOME & NAME SELECTION */}
          {screen === 'welcome' && (
            <div
              id="welcome-card"
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-100/70 border border-slate-100 text-center transition-all"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-6 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Bài tập Tiếng Anh lớp 7
              </h2>
              <p className="text-sm sm:text-base text-indigo-600 font-semibold mb-8">
                Present Simple & Present Continuous
              </p>

              <div className="max-w-md mx-auto text-left mb-8">
                <label
                  htmlFor="student-select"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Chọn tên của em
                </label>
                <div className="relative">
                  <select
                    id="student-select"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-base font-medium outline-none transition cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="" disabled>
                      -- Nhấn vào đây để chọn tên --
                    </option>
                    {STUDENT_LIST.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto">
                <button
                  id="btn-start"
                  onClick={handleStart}
                  disabled={!selectedStudent}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
                    selectedStudent
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>Bắt đầu làm bài</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center space-x-6 text-xs text-slate-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                  30 câu hỏi
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                  Trắc nghiệm & Điền từ
                </span>
              </div>
            </div>
          )}

          {/* SCREEN 2: QUIZ SCREEN */}
          {screen === 'quiz' && (
            <div
              id="quiz-card"
              className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-indigo-100/70 border border-slate-100 flex flex-col transition-all"
            >
              {/* Progress Bar & Counter */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 mb-2">
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                    Câu {currentQuestion.cau} / {QUESTIONS.length}
                  </span>
                  <span className="text-slate-400">
                    {Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)}% hoàn thành
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Content */}
              <div className="mb-6">
                <div className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md mb-3">
                  {currentQuestion.loai === 'mc' ? 'Trắc nghiệm' : 'Điền từ'}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {currentQuestion.hoi}
                </h3>
              </div>

              {/* Interaction Area: Multiple Choice */}
              {currentQuestion.loai === 'mc' && (
                <div className="space-y-3 mb-8">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                    const isSelected = currentAnswer === opt;
                    return (
                      <button
                        key={opt}
                        id={`option-${opt}`}
                        type="button"
                        onClick={() => handleSelectMC(opt)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-semibold shadow-xs ring-2 ring-indigo-600/20'
                            : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-start space-x-3.5">
                          <span
                            className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            {opt}
                          </span>
                          <span className="text-sm sm:text-base pt-0.5">{currentQuestion[opt]}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-2">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Interaction Area: Fill in the blank */}
              {currentQuestion.loai === 'fill' && (
                <div className="mb-8">
                  <div className="space-y-2">
                    <input
                      id="fill-input"
                      type="text"
                      autoComplete="off"
                      spellCheck="false"
                      value={currentAnswer}
                      onChange={(e) => handleFillChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && canProceed) {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      placeholder="Type your answer here..."
                      className="w-full text-base sm:text-lg px-4 py-3.5 bg-slate-50 border-2 border-slate-300 focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-900 shadow-2xs"
                      autoFocus
                    />
                    <p className="text-xs text-slate-500 italic pl-1">
                      Gõ câu trả lời bằng tiếng Anh
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  id="btn-prev"
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-1.5 transition ${
                    currentIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <button
                  id="btn-next"
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center space-x-2 transition shadow-xs ${
                    canProceed
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>{currentIndex === QUESTIONS.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: RESULT SCREEN */}
          {screen === 'result' && (
            <div
              id="result-card"
              className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-indigo-100/70 border border-slate-100 transition-all"
            >
              {/* Result Header */}
              <div className="text-center mb-8 pb-6 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-4 shadow-inner">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  Bài tập Tiếng Anh lớp 7 — Kết quả
                </h2>
                <p className="text-base text-indigo-700 font-semibold mb-4">
                  Học sinh: {selectedStudent}
                </p>

                {/* Score Banner */}
                <div className="inline-block bg-gradient-to-br from-indigo-50 to-sky-50 border-2 border-indigo-200/80 rounded-2xl px-6 py-4 shadow-xs">
                  <p className="text-2xl sm:text-3xl font-black text-indigo-900 tracking-tight">
                    Em đúng {correctCount}/30 câu
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                    {correctCount >= 27
                      ? '🌟 Xuất sắc! Em nắm rất chắc kiến thức!'
                      : correctCount >= 21
                      ? '👏 Rất tốt! Tiếp tục phát huy nhé!'
                      : correctCount >= 15
                      ? '💪 Cố gắng lên nhé, hãy xem lại các câu chưa đúng!'
                      : '📖 Em hãy ôn tập lại lý thuyết và làm lại nhé!'}
                  </p>
                </div>
              </div>

              {/* Review All 30 Questions */}
              <div className="mb-8">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Chi tiết bài làm (30 câu)</span>
                  <span className="text-xs font-semibold text-slate-500">
                    Đúng: {correctCount} | Sai: {30 - correctCount}
                  </span>
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {QUESTIONS.map((q) => {
                    const studentAns = answers[q.cau];
                    const correct = isAnswerCorrect(q, studentAns);

                    return (
                      <div
                        key={q.cau}
                        id={`review-q-${q.cau}`}
                        className={`p-4 rounded-2xl border transition-all ${
                          correct
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-rose-50/60 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="shrink-0 pt-0.5">
                            {correct ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-500 mb-1">
                              Câu {q.cau} • {q.loai === 'mc' ? 'Trắc nghiệm' : 'Điền từ'}
                            </p>
                            <p className="text-sm sm:text-base font-semibold text-slate-900 mb-2 leading-relaxed">
                              {q.hoi}
                            </p>

                            {/* Details for MC */}
                            {q.loai === 'mc' && (
                              <div className="text-xs sm:text-sm space-y-1">
                                {correct ? (
                                  <p className="text-emerald-800 font-medium">
                                    ✓ Đã chọn: <span className="font-bold">{studentAns}. {q[studentAns as 'A'|'B'|'C'|'D']}</span>
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-rose-700 font-medium">
                                      ✗ Câu trả lời của em: <span className="font-semibold">{studentAns ? `${studentAns}. ${q[studentAns as 'A'|'B'|'C'|'D']}` : '(Chưa chọn)'}</span>
                                    </p>
                                    <p className="text-emerald-700 font-bold">
                                      ✓ Đáp án đúng: {q.dapAn}. {q[q.dapAn]}
                                    </p>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Details for Fill */}
                            {q.loai === 'fill' && (
                              <div className="text-xs sm:text-sm space-y-1">
                                {correct ? (
                                  <p className="text-emerald-800 font-medium">
                                    ✓ Câu trả lời của em: <span className="font-bold">"{studentAns}"</span>
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-rose-700 font-medium">
                                      ✗ Câu trả lời của em: <span className="font-semibold">"{studentAns || ''}"</span>
                                    </p>
                                    <p className="text-emerald-700 font-bold">
                                      ✓ Đáp án đúng: {q.dapAnChapNhan[0]}
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Restart */}
              <div className="pt-4 border-t border-slate-100 flex justify-center">
                <button
                  id="btn-restart"
                  type="button"
                  onClick={handleRestart}
                  className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base flex items-center space-x-2 transition shadow-md shadow-indigo-200 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Làm lại từ đầu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/50">
        <p>Bài tập Tiếng Anh lớp 7 • Present Simple & Present Continuous</p>
      </footer>
    </div>
  );
}
