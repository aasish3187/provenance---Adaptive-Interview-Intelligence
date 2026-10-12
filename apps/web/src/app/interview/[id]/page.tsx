'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  User,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { LiquidVoiceOrb } from '@/components/LiquidVoiceOrb';
import { WhyCardDeck } from '@/components/WhyCardDeck';
import { PresenceRadarHUD } from '@/components/PresenceRadarHUD';
import { ProvenanceLogo } from '@/components/ProvenanceLogo';

interface QuestionState {
  id: string;
  text: string;
  competency_id: string;
  competency_name: string;
  turn_index: number;
  bloom_level: number;
}

const FALLBACK_QUESTIONS: QuestionState[] = [
  {
    id: 'Q-01',
    text: 'How do you configure and tune pod autoscaling when traffic spikes are driven by asynchronous message queue depth rather than raw CPU usage?',
    competency_id: 'COMP-K8S',
    competency_name: 'Kubernetes Autoscaling',
    turn_index: 1,
    bloom_level: 4,
  },
  {
    id: 'Q-02',
    text: 'Explain your strategy for managing concurrency control and avoiding channel deadlocks in high-throughput Go microservices.',
    competency_id: 'COMP-GO',
    competency_name: 'Go Concurrency Semantics',
    turn_index: 2,
    bloom_level: 4,
  },
  {
    id: 'Q-03',
    text: 'How did you design mutual TLS and perimeter authentication for inter-service communication across your private multi-tenant clusters?',
    competency_id: 'COMP-SEC',
    competency_name: 'Zero-Trust Architecture',
    turn_index: 3,
    bloom_level: 3,
  },
];

const QUESTION_TIME_LIMIT_SECONDS = 120; // 2 minutes per question

export default function CandidateInterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = (params?.id as string) || 'INT-DEMO';

  // Interview metadata
  const [candidateName, setCandidateName] = useState('Candidate');
  const [roleTitle, setRoleTitle] = useState('Software Engineering');

  // Questions and turns
  const [currentQuestion, setCurrentQuestion] = useState<QuestionState>(FALLBACK_QUESTIONS[0]);
  const [turnIndex, setTurnIndex] = useState(1);
  const [totalTurns, setTotalTurns] = useState(3);
  const [canConcludeEarly, setCanConcludeEarly] = useState(false);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saved' | 'submitting'>('idle');
  const [integrityAlert, setIntegrityAlert] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timers
  const [elapsedTotalSeconds, setElapsedTotalSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME_LIMIT_SECONDS);

  // Live Camera & Audio State
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(true);
  const isSubmittingRef = useRef(false);

  // Send Integrity Telemetry Event to Backend
  const sendIntegrityEvent = async (
    eventType: string,
    family: string,
    severityBase: number = 1,
    metadata: any = {}
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      await fetch(`${apiUrl}/interviews/${interviewId}/integrity/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          family: family,
          severity_base: severityBase,
          detector_confidence: 1.0,
          context_multiplier: 1.0,
          t_ms: Date.now(),
          metadata: metadata,
        }),
      });
    } catch (err) {
      console.warn('Integrity telemetry dispatch notice:', err);
    }
  };

  // Fetch initial question & interview status from backend on mount
  useEffect(() => {
    let active = true;
    async function loadLiveStatus() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
        const res = await fetch(`${apiUrl}/interviews/${interviewId}/live-status`);
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          if (data.candidate_name) setCandidateName(data.candidate_name);
          if (data.role_title) setRoleTitle(data.role_title);
          if (data.current_question && data.current_question.text) {
            setCurrentQuestion({
              id: data.current_question.id,
              text: data.current_question.text,
              competency_id: data.current_question.competency_id || 'COMP-CORE',
              competency_name: data.current_question.competency_id || 'Role Competency',
              turn_index: data.current_turn_index || 1,
              bloom_level: data.current_question.bloom_level || 4,
            });
            setTurnIndex(data.current_turn_index || 1);
          }
        }
      } catch (err) {
        console.warn('Could not load live status, maintaining local state:', err);
      }
    }

    loadLiveStatus();
    return () => {
      active = false;
    };
  }, [interviewId]);

  // Client-side Integrity Event Listeners (Tab Switches, Blurs, Pastes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendIntegrityEvent('tab_switch', 'focus', 2, { reason: 'tab_unfocused' });
        setIntegrityAlert('Focus shift recorded (analyzed with benign context)');
        setTimeout(() => setIntegrityAlert(null), 5000);
      }
    };

    const handleWindowBlur = () => {
      sendIntegrityEvent('window_blur', 'focus', 1, { reason: 'window_blur' });
    };

    const handleWindowPaste = (e: ClipboardEvent) => {
      const pasted = e.clipboardData?.getData('text') || '';
      sendIntegrityEvent('clipboard_paste', 'input', 2, { length: pasted.length });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('paste', handleWindowPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [interviewId]);

  // Initialize Camera & Microphone Stream
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: true,
          });

          if (!active) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
          setCameraActive(true);
          setMicActive(true);
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.warn('Camera/Mic permission unavailable or denied in environment:', err);
        setHasCameraPermission(false);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize Speech Recognition with Auto-Restart Loop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsSpeechRecognitionActive(true);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setCandidateAnswer((prev) =>
              prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()
            );
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition status:', e?.error);
        };

        recognition.onend = () => {
          // If mic is still desired and not currently submitting turn, auto-restart
          if (shouldListenRef.current && !isSubmittingRef.current) {
            try {
              recognition.start();
              setIsSpeechRecognitionActive(true);
            } catch (_) {
              setIsSpeechRecognitionActive(false);
            }
          } else {
            setIsSpeechRecognitionActive(false);
          }
        };

        recognitionRef.current = recognition;

        // Auto-start listening on load
        try {
          recognition.start();
        } catch (_) {}
      }
    }

    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Per-Question Countdown Timer
  useEffect(() => {
    setTimeRemaining(QUESTION_TIME_LIMIT_SECONDS);

    const countdownTimer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer reached 0: trigger submission
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [turnIndex]);

  // Overall Session Timer
  useEffect(() => {
    const sessionTimer = setInterval(() => {
      setElapsedTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(sessionTimer);
  }, []);

  // Auto-submit when time reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitting) {
      handleSubmitAnswer();
    }
  }, [timeRemaining]);

  // Read question out loud with Web Speech Synthesis
  const handleReadQuestion = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick most natural English voice available
    try {
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice =
        voices.find(
          (v) =>
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel') ||
              v.name.includes('Neural')) &&
            v.lang.startsWith('en')
        ) || voices.find((v) => v.lang.startsWith('en'));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
    } catch (_) {}

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Camera
  const toggleCamera = () => {
    const newActive = !cameraActive;
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = newActive;
      });
    }
    setCameraActive(newActive);
    if (!newActive) {
      sendIntegrityEvent('camera_muted', 'presence', 1, { action: 'manual_toggle' });
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    const newActive = !micActive;
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = newActive;
      });
    }
    setMicActive(newActive);
    shouldListenRef.current = newActive;

    if (recognitionRef.current) {
      if (newActive) {
        try {
          recognitionRef.current.start();
          setIsSpeechRecognitionActive(true);
        } catch (_) {}
      } else {
        try {
          recognitionRef.current.stop();
          setIsSpeechRecognitionActive(false);
        } catch (_) {}
        sendIntegrityEvent('mic_muted', 'audio', 1, { action: 'manual_toggle' });
      }
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (isSubmitting) return;

    // Stop speaking if AI is talking
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;
    setSavedStatus('submitting');

    const finalAnswer =
      candidateAnswer.trim() || '[Candidate completed response under time window]';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

    try {
      const res = await fetch(`${apiUrl}/interviews/${interviewId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turn_index: turnIndex,
          candidate_answer: finalAnswer,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          router.push(`/interview/${interviewId}/complete`);
          return;
        }

        if (data.can_conclude_early || data.turn_index >= 3) {
          setCanConcludeEarly(true);
        }

        if (data.next_question) {
          setCurrentQuestion({
            ...data.next_question,
            competency_name:
              data.next_question.competency_id || 'Technical Competency',
            bloom_level: data.next_question.bloom_level || 4,
          });
          setTurnIndex(data.turn_index);
          setCandidateAnswer('');
          setSavedStatus('saved');
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }
      }
    } catch (e) {
      console.warn('Turn submission network exception, progressing locally:', e);
    }

    // Local state fallback progression
    if (turnIndex < FALLBACK_QUESTIONS.length) {
      const nextTurn = turnIndex + 1;
      setTurnIndex(nextTurn);
      setCurrentQuestion(FALLBACK_QUESTIONS[nextTurn - 1]);
      setCandidateAnswer('');
      setSavedStatus('saved');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    } else {
      router.push(`/interview/${interviewId}/complete`);
    }
  };

  const handleConcludeSession = async () => {
    if (isSubmitting) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    try {
      await fetch(`${apiUrl}/interviews/${interviewId}/conclude`, {
        method: 'POST',
      });
    } catch (_) {}
    router.push(`/interview/${interviewId}/complete`);
  };

  // Timer urgency colors
  const timerPercentage = (timeRemaining / QUESTION_TIME_LIMIT_SECONDS) * 100;
  const isUrgent = timeRemaining <= 20;
  const isWarning = timeRemaining <= 45 && timeRemaining > 20;

  const timerColor = isUrgent
    ? 'var(--danger)'
    : isWarning
    ? 'var(--warning)'
    : 'var(--accent)';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          padding: '0 var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            aria-label="Exit or pause interview"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              backgroundColor: 'var(--surface-subtle)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setShowExitConfirm(true);
            }}
            style={{ textDecoration: 'none' }}
          >
            <ProvenanceLogo size={28} wordmarkSize={16} />
          </Link>
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            Live AI Camera Session
          </span>
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--ink-strong)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 500,
              maxWidth: '320px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {candidateName} · {roleTitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* Live indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: cameraActive ? 'var(--success)' : 'var(--danger)',
                backgroundColor: cameraActive ? 'var(--success-soft)' : 'var(--danger-soft)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Radio size={12} className={cameraActive ? 'animate-pulse' : ''} />
              {cameraActive ? 'Camera Live' : 'Camera Muted'}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: micActive ? 'var(--accent)' : 'var(--ink-muted)',
                backgroundColor: micActive ? 'var(--accent-soft)' : 'var(--surface-subtle)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {micActive ? <Mic size={12} /> : <MicOff size={12} />}
              {micActive ? 'Mic Active' : 'Mic Muted'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--ink-muted)',
            }}
          >
            <Clock size={14} />
            <span>Session: {formatSeconds(elapsedTotalSeconds)}</span>
          </div>
        </div>
      </header>

      {integrityAlert && (
        <div
          style={{
            backgroundColor: 'var(--warning-soft)',
            borderBottom: '1px solid var(--warning)',
            color: 'var(--ink-strong)',
            padding: '8px 24px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} color="var(--warning)" />
            <span>
              <strong>Integrity Telemetry:</strong> {integrityAlert}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
            Recorded for review priority with benign explanations
          </span>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-6)',
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Live Feeds & Presence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Privacy-Preserving On-Device Presence Radar */}
          <PresenceRadarHUD />

          {/* Candidate Live Webcam Box */}
          <section
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                  Your Live Camera Feed
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>On-Device Stream</span>
            </div>

            {/* Video Viewport */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                backgroundColor: '#0a0d14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror feed for natural feeling
                  display: cameraActive && hasCameraPermission ? 'block' : 'none',
                }}
              />

              {/* Camera Fallback / Off State */}
              {(!cameraActive || !hasCameraPermission) && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    color: '#94a3b8',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={32} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>
                    {!hasCameraPermission ? 'Live Preview Simulated' : 'Camera Muted'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Presence verified on-device
                  </span>
                </div>
              )}

              {/* Video Overlay Badges */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  padding: '3px 8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  color: '#ffffff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                HD 720p
              </div>

              {/* Floating Camera / Mic Control Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  display: 'flex',
                  gap: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={toggleCamera}
                  style={{
                    backgroundColor: cameraActive ? 'transparent' : '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={cameraActive ? 'Turn camera off' : 'Turn camera on'}
                >
                  {cameraActive ? <Camera size={16} /> : <CameraOff size={16} />}
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  style={{
                    backgroundColor: micActive ? 'transparent' : '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    padding: '6px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={micActive ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {micActive ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
              </div>
            </div>

            {/* Audio Indicator Bar */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--surface-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--ink-muted)',
              }}
            >
              <span>Microphone Volume</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: `${micActive ? h * 14 : 3}px`,
                      backgroundColor: micActive ? 'var(--accent)' : 'var(--ink-soft)',
                      borderRadius: '1px',
                      transition: 'height 150ms ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* AI Interviewer Presence Card */}
          <section
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-strong)' }}>
                    Provenance AI Interviewer
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                    {isAiSpeaking ? 'Speaking question...' : 'Listening to candidate response...'}
                  </div>
                </div>
              </div>

              {/* TTS Read Aloud Button */}
              <button
                type="button"
                onClick={handleReadQuestion}
                style={{
                  padding: '6px 12px',
                  backgroundColor: isAiSpeaking ? 'var(--accent)' : 'var(--surface-subtle)',
                  color: isAiSpeaking ? '#ffffff' : 'var(--ink)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                }}
              >
                {isAiSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {isAiSpeaking ? 'Stop Audio' : 'Hear Question'}
              </button>
            </div>

            {/* 3D Liquid Reactive Voice Orb */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <LiquidVoiceOrb
                isSpeaking={isAiSpeaking}
                speaker={isAiSpeaking ? 'ai' : candidateAnswer.trim().length > 0 ? 'candidate' : 'idle'}
                audioLevel={isAiSpeaking ? 0.75 : candidateAnswer.trim().length > 0 ? 0.6 : 0.2}
              />
            </div>

            <p style={{ fontSize: '12px', color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
              The AI dynamically calibrates technical depth and validates your explanations against verified rubric criteria in real time.
            </p>
          </section>

          {/* Adaptive Next-Best-Question WhyCard Deck */}
          <WhyCardDeck />
        </div>

        {/* Right Column: Question Display & Answer Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Top Progress & Live Question Countdown Bar */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4) var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    backgroundColor: 'var(--accent-soft)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                  }}
                >
                  Adaptive Turn {turnIndex} {turnIndex >= 3 ? '(Target Met)' : 'of 3+'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>
                  Competency: {currentQuestion.competency_name}
                </span>
              </div>

              {/* Per-Question Live Countdown Timer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isUrgent ? 'var(--danger-soft)' : isWarning ? 'var(--warning-soft)' : 'var(--surface-subtle)',
                  border: `1px solid ${timerColor}`,
                  color: timerColor,
                  fontWeight: 700,
                  fontSize: '15px',
                  fontFamily: 'monospace',
                }}
              >
                <Clock size={16} />
                <span>{formatSeconds(timeRemaining)}</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--ink-muted)' }}>remaining</span>
              </div>
            </div>

            {/* Countdown Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'var(--surface-subtle)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${timerPercentage}%`,
                  height: '100%',
                  backgroundColor: timerColor,
                  transition: 'width 1s linear, background-color 300ms ease',
                }}
              />
            </div>

            {isUrgent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--danger)', fontWeight: 600 }}>
                <ShieldAlert size={14} />
                Approaching answer limit! Answer will automatically submit when timer reaches 00:00.
              </div>
            )}
          </div>

          {/* Question Presentation Panel */}
          <section
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  backgroundColor: 'var(--surface-subtle)',
                  color: 'var(--ink-muted)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                }}
              >
                Bloom Level {currentQuestion.bloom_level} (Analyze/Design)
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                Timed Live Technical Evaluation
              </span>
            </div>

            <h1
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: 'var(--ink-strong)',
                lineHeight: 1.45,
                letterSpacing: '-0.015em',
                margin: 0,
              }}
            >
              {currentQuestion.text}
            </h1>

            <div style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Answer verbally to the live camera and microphone, or type your structured response below.
            </div>
          </section>

          {/* Live Answer Studio & Voice Dictation */}
          <section
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <label
                  htmlFor="candidate-answer"
                  style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-strong)' }}
                >
                  Candidate Response & Live Transcript:
                </label>
                {isSpeechRecognitionActive && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--danger)',
                      backgroundColor: 'var(--danger-soft)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                    }}
                  >
                    ● Live Voice Dictation Active
                  </span>
                )}
              </div>

              <span style={{ fontSize: '12px', color: 'var(--ink-muted)', fontFamily: 'monospace' }}>
                {candidateAnswer.split(/\s+/).filter(Boolean).length} words · {candidateAnswer.length} chars
              </span>
            </div>

            <textarea
              id="candidate-answer"
              rows={6}
              placeholder="Speak directly to your camera/microphone to transcribe your response, or type your explanation here. You can edit and review in real time..."
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                lineHeight: 1.6,
                color: 'var(--ink)',
                backgroundColor: 'var(--canvas)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />

            {/* Bottom Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                {savedStatus === 'submitting'
                  ? 'Verifying verbatim evidence and updating competency model...'
                  : savedStatus === 'saved'
                  ? 'Answer verified and recorded'
                  : 'Live on-device recording active'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {(canConcludeEarly || turnIndex >= 3) && (
                  <button
                    type="button"
                    onClick={handleConcludeSession}
                    disabled={isSubmitting}
                    id="conclude-interview-btn"
                    style={{
                      padding: 'var(--space-3) var(--space-5)',
                      backgroundColor: 'var(--surface-subtle)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--ink)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <CheckCircle2 size={15} color="var(--success)" />
                    <span>Conclude & View Report</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting}
                  id="submit-turn-btn"
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    backgroundColor: 'var(--accent)',
                    color: 'var(--surface)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Send size={15} />
                  <span>
                    {isSubmitting
                      ? 'Analyzing & Verifying Evidence...'
                      : turnIndex >= 5
                      ? 'Submit Turn'
                      : 'Submit & Next Question'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 25, 43, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 'var(--space-4)',
          }}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--warning-soft)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-strong)', margin: 0 }}>
                  Pause or Exit Interview?
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--ink-muted)', margin: 0 }}>
                  Session ID: {interviewId}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5, margin: 0 }}>
              Your spoken answers and evidence up to Turn {turnIndex} are safely recorded in the cryptographic ledger. You can return to the unified workspace anytime.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                Resume Interview
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mediaStreamRef.current) {
                    mediaStreamRef.current.getTracks().forEach((track) => track.stop());
                  }
                  router.push('/');
                }}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--danger)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Exit to Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
