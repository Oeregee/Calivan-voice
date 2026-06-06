"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, 
  Square, 
  Mic2, 
  Activity, 
  Settings2, 
  Zap, 
  Radio, 
  Waves, 
  MessageSquare, 
  Monitor, 
  Headphones,
  Download,
  Power,
  RefreshCw,
  Cpu,
  Volume2,
  Terminal,
  CheckCircle2,
  Loader2,
  Ghost,
  Bot,
  PhoneCall,
  Megaphone,
  Rocket,
  Wand2,
  Sparkles,
  Unlock,
  Shield,
  Landmark,
  Bug,
  Siren
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Preset = "normal" | "radio" | "robot" | "demon" | "alien" | "cave" | "megaphone" | "telephone" | "astronaut" | "magic" | "titan" | "cyborg" | "spirit" | "underwater" | "walkietalkie" | "cathedral" | "dalek" | "overdrive" | "zelensky";

export default function AudioEngine() {
  // core state
  const [isListening, setIsListening] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset>("normal");
  const [volume, setVolume] = useState(1);
  
  // setup & installation state
  const [setupPhase, setSetupPhase] = useState<"welcome" | "installing" | "done">("welcome");
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [installProgress, setInstallProgress] = useState(0);

  // routing & devices state
  const [devices, setDevices] = useState<{ inputs: MediaDeviceInfo[], outputs: MediaDeviceInfo[] }>({ inputs: [], outputs: [] });
  const [selectedInput, setSelectedInput] = useState<string>("default");
  const [selectedOutput, setSelectedOutput] = useState<string>("default");
  const [hearMyself, setHearMyself] = useState<boolean>(false);
  
  // Audio Context Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Output Routing Refs
  const streamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const localGainRef = useRef<GainNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // DSP Node Refs (Modular Graph)
  const masterGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  const rmOscRef = useRef<OscillatorNode | null>(null);
  const amDepthRef = useRef<GainNode | null>(null);
  const rmNodeRef = useRef<GainNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const feedbackRef = useRef<GainNode | null>(null);
  const delayOutRef = useRef<GainNode | null>(null);

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Hardware Initialization
  const fetchDevices = async () => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const inputs = allDevices.filter(d => d.kind === 'audioinput');
      const outputs = allDevices.filter(d => d.kind === 'audiooutput');
      setDevices({ inputs, outputs });
      
      if (!selectedInput && inputs.length > 0) setSelectedInput(inputs[0].deviceId);
      if (!selectedOutput && outputs.length > 0) setSelectedOutput(outputs[0].deviceId);
      
      tempStream.getTracks().forEach(t => t.stop());
    } catch (err) {
      console.error("Permission denied or error getting devices", err);
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices({ 
        inputs: allDevices.filter(d => d.kind === 'audioinput'), 
        outputs: allDevices.filter(d => d.kind === 'audiooutput') 
      });
    }
  };

  const startInstallation = async () => {
    setSetupPhase("installing");
    const addLog = (msg: string) => setInstallLogs(prev => [...prev, msg]);

    addLog("Анализ системной архитектуры и аудио драйверов...");
    await new Promise(r => setTimeout(r, 600));
    setInstallProgress(15);
    
    addLog("Запрос доступа к аппаратному ядру (Микрофон)...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      addLog("Доступ к оборудованию успешно получен.");
      setInstallProgress(40);
    } catch (e) {
      addLog("КРИТИЧЕСКАЯ ОШИБКА: Доступ к микрофону отклонен пользователем.");
      return;
    }

    await new Promise(r => setTimeout(r, 600));
    addLog("Развертывание модулей DSP (Ring Mod, Biquad, Delay)...");
    setInstallProgress(60);
    
    await new Promise(r => setTimeout(r, 800));
    addLog("Сканирование виртуальных аудиоинтерфейсов для интеграции...");
    await fetchDevices();
    addLog("Сборка графа маршрутизации...");
    
    await new Promise(r => setTimeout(r, 800));
    addLog("Установка драйвера Calivan Voice Virtual Audio Device (VAD)...");
    addLog("Создание виртуального аудио кабеля (Calivan Voice Virtual Mic)...");
    setInstallProgress(85);

    await new Promise(r => setTimeout(r, 1000));
    addLog("Маршрутизация настроена. Интеграция с Discord подтверждена.");
    addLog("Драйвер Calivan Voice: PRO Все Голоса Разблокированы.");
    setInstallProgress(100);

    setTimeout(() => {
      setSetupPhase("done");
    }, 1200);
  };

  useEffect(() => {
    if (localGainRef.current) {
      localGainRef.current.gain.setTargetAtTime(
        hearMyself ? 1 : 0, 
        audioCtxRef.current?.currentTime || 0, 
        0.05
      );
    }
  }, [hearMyself]);

  useEffect(() => {
    const updateSink = async () => {
      if (audioElementRef.current && (audioElementRef.current as any).setSinkId) {
        try {
          await (audioElementRef.current as any).setSinkId(selectedOutput);
        } catch (e) {
          console.error("Error setting output device. Browser might not support it.", e);
        }
      }
    };
    updateSink();
  }, [selectedOutput]);

  const makeDistortionCurve = (amount: number) => {
    if (amount === 0) return new Float32Array([0, 0]);
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  const applyPresetSettings = useCallback((presetId: Preset) => {
    if (!dryGainRef.current || !wetGainRef.current || !filterRef.current || !distortionRef.current || !rmOscRef.current || !amDepthRef.current || !rmNodeRef.current || !delayRef.current || !feedbackRef.current || !delayOutRef.current) return;

    // Reset to "Clean" Defaults
    dryGainRef.current.gain.value = 1;
    wetGainRef.current.gain.value = 0;
    
    filterRef.current.type = "peaking";
    filterRef.current.frequency.value = 1000;
    filterRef.current.Q.value = 0;
    
    distortionRef.current.curve = makeDistortionCurve(0);
    
    rmOscRef.current.frequency.value = 0; // Off
    amDepthRef.current.gain.value = 0;    // No AM modulation
    rmNodeRef.current.gain.value = 1;     // Pass-through gain
    
    delayRef.current.delayTime.value = 0;
    feedbackRef.current.gain.value = 0;
    delayOutRef.current.gain.value = 0;

    switch (presetId) {
      case "normal":
        break; // Stays clean

      case "radio":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        filterRef.current.type = "bandpass";
        filterRef.current.frequency.value = 2000;
        filterRef.current.Q.value = 3;
        distortionRef.current.curve = makeDistortionCurve(60);
        break;

      case "robot":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        rmOscRef.current.type = "sawtooth";
        rmOscRef.current.frequency.value = 50; // Robotic Dalek stutter
        amDepthRef.current.gain.value = 1; 
        distortionRef.current.curve = makeDistortionCurve(20);
        break;

      case "demon":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1.3; // Boost Volume
        filterRef.current.type = "lowpass";
        filterRef.current.frequency.value = 600; // Block high pitches instantly
        rmOscRef.current.type = "sine";
        rmOscRef.current.frequency.value = 25; // Sub-bass flutter creating demon "growl"
        amDepthRef.current.gain.value = 0.9; 
        distortionRef.current.curve = makeDistortionCurve(40);
        break;

      case "alien":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        rmOscRef.current.type = "sine";
        rmOscRef.current.frequency.value = 400; // High frequency metallic sound
        amDepthRef.current.gain.value = 0.8;
        delayRef.current.delayTime.value = 0.05;
        feedbackRef.current.gain.value = 0.4;
        delayOutRef.current.gain.value = 0.5;
        break;

      case "cave":
        dryGainRef.current.gain.value = 0.8;
        wetGainRef.current.gain.value = 0.2;
        delayRef.current.delayTime.value = 0.4;
        feedbackRef.current.gain.value = 0.5;
        delayOutRef.current.gain.value = 0.6;
        filterRef.current.type = "lowpass";
        filterRef.current.frequency.value = 4000;
        break;

      case "megaphone":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        filterRef.current.type = "bandpass";
        filterRef.current.frequency.value = 1200;
        filterRef.current.Q.value = 5; // Very tight bandpass
        distortionRef.current.curve = makeDistortionCurve(200); // Heavy saturation
        break;

      case "telephone":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1.2;
        filterRef.current.type = "bandpass";
        filterRef.current.frequency.value = 1500;
        filterRef.current.Q.value = 2; // Wider than megaphone but still tinny
        distortionRef.current.curve = makeDistortionCurve(15); // Mild fuzz
        break;

      case "astronaut":
        dryGainRef.current.gain.value = 0.2;
        wetGainRef.current.gain.value = 1;
        filterRef.current.type = "bandpass";
        filterRef.current.frequency.value = 1800;
        filterRef.current.Q.value = 2;
        distortionRef.current.curve = makeDistortionCurve(25);
        delayRef.current.delayTime.value = 0.08; // Slapback reflection of helmet
        feedbackRef.current.gain.value = 0.1;
        delayOutRef.current.gain.value = 0.3;
        break;

      case "magic":
        dryGainRef.current.gain.value = 0.5;
        wetGainRef.current.gain.value = 0.8;
        filterRef.current.type = "highpass";
        filterRef.current.frequency.value = 1000; // Ethereal highs
        rmOscRef.current.type = "sine";
        rmOscRef.current.frequency.value = 4; // Slow wobble / tremolo
        amDepthRef.current.gain.value = 0.5;
        delayRef.current.delayTime.value = 0.35;
        feedbackRef.current.gain.value = 0.6;
        delayOutRef.current.gain.value = 0.7; // Lots of wet delay
        break;

      case "titan":
        dryGainRef.current.gain.value = 0.2;
        wetGainRef.current.gain.value = 1.2;
        filterRef.current.type = "lowpass";
        filterRef.current.frequency.value = 400; // Deep bassy
        distortionRef.current.curve = makeDistortionCurve(10);
        delayRef.current.delayTime.value = 0.02; // Chorus-like short delay for thickness
        feedbackRef.current.gain.value = 0.4;
        delayOutRef.current.gain.value = 0.8;
        break;

      case "cyborg":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        rmOscRef.current.type = "sawtooth";
        rmOscRef.current.frequency.value = 80;
        amDepthRef.current.gain.value = 0.8;
        delayRef.current.delayTime.value = 0.1;
        feedbackRef.current.gain.value = 0.4;
        delayOutRef.current.gain.value = 0.4;
        break;

      case "spirit":
        dryGainRef.current.gain.value = 0.3;
        wetGainRef.current.gain.value = 1;
        filterRef.current.type = "bandpass";
        filterRef.current.frequency.value = 800;
        filterRef.current.Q.value = 1.5;
        rmOscRef.current.type = "sine";
        rmOscRef.current.frequency.value = 3; // tremolo
        amDepthRef.current.gain.value = 0.7;
        delayRef.current.delayTime.value = 0.5;
        feedbackRef.current.gain.value = 0.7;
        delayOutRef.current.gain.value = 0.8;
        break;

      case "underwater":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        filterRef.current.type = "lowpass";
        filterRef.current.frequency.value = 300;
        rmOscRef.current.type = "sine";
        rmOscRef.current.frequency.value = 1; // slow modulation
        amDepthRef.current.gain.value = 0.6;
        delayRef.current.delayTime.value = 0.15;
        feedbackRef.current.gain.value = 0.3;
        delayOutRef.current.gain.value = 0.4;
        break;

      case "walkietalkie":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        filterRef.current.type = "bandpass";
        filterRef.current.frequency.value = 2500;
        filterRef.current.Q.value = 4;
        distortionRef.current.curve = makeDistortionCurve(100);
        break;

      case "cathedral":
        dryGainRef.current.gain.value = 0.7;
        wetGainRef.current.gain.value = 0.3;
        filterRef.current.type = "lowpass";
        filterRef.current.frequency.value = 3000;
        delayRef.current.delayTime.value = 0.7;
        feedbackRef.current.gain.value = 0.8; // Huge echo
        delayOutRef.current.gain.value = 0.8;
        break;

      case "dalek":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1.2;
        rmOscRef.current.type = "square";
        rmOscRef.current.frequency.value = 35;
        amDepthRef.current.gain.value = 1;
        distortionRef.current.curve = makeDistortionCurve(80);
        break;

      case "overdrive":
        dryGainRef.current.gain.value = 0;
        wetGainRef.current.gain.value = 1;
        filterRef.current.type = "peaking";
        filterRef.current.frequency.value = 1000;
        distortionRef.current.curve = makeDistortionCurve(400);
        break;

      case "zelensky":
        dryGainRef.current.gain.value = 0.8;
        wetGainRef.current.gain.value = 0.5;
        filterRef.current.type = "peaking";
        filterRef.current.frequency.value = 400; // Boost lower mids
        filterRef.current.Q.value = 0.7;
        distortionRef.current.curve = makeDistortionCurve(5); // slight saturation
        delayRef.current.delayTime.value = 0.01; // tiny room bounce
        feedbackRef.current.gain.value = 0.1;
        delayOutRef.current.gain.value = 0.2;
        break;
    }
    setActivePreset(presetId);
  }, []);

  const startAudio = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedInput !== "default" ? { exact: selectedInput } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      // 1. Initial Master & Analyser nodes
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGainRef.current = masterGain;

      // 2. Modular DSP Units
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const dist = ctx.createWaveShaper();
      
      const rmOsc = ctx.createOscillator();
      const amDepth = ctx.createGain();
      const rmNode = ctx.createGain();

      const delay = ctx.createDelay(2.0); // max delay 2s
      const feedback = ctx.createGain();
      const delayOut = ctx.createGain();

      // Configure RM Osc (Starts immediately but is silent if amDepth is 0)
      rmOsc.start();
      rmOsc.connect(amDepth);
      amDepth.connect(rmNode.gain);

      // --- WIRING GRAPH ---
      
      // Dry Path
      source.connect(dryGain);
      dryGain.connect(masterGain);

      // Wet Path (Filter -> Dist -> RM)
      source.connect(filter);
      filter.connect(dist);
      dist.connect(rmNode);
      
      // Main Wet to Master
      rmNode.connect(wetGain);
      wetGain.connect(masterGain);

      // Delay Line (fed from Wet signal before it hits master)
      rmNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(delayOut);
      delayOut.connect(masterGain);

      // --- ROUTING/DRIVER LOGIC ---
      const streamDest = ctx.createMediaStreamDestination();
      streamDestRef.current = streamDest;

      const localGain = ctx.createGain();
      localGain.gain.value = hearMyself ? 1 : 0;
      localGainRef.current = localGain;

      // Master output hooks everything up
      masterGain.connect(analyser);
      
      // Bifurcation: 
      // 1. To Speakers for monitoring
      analyser.connect(localGain);
      localGain.connect(ctx.destination);
      
      // 2. To Virtual Cable
      analyser.connect(streamDest);

      if (!audioElementRef.current) audioElementRef.current = new Audio();
      audioElementRef.current.srcObject = streamDest.stream;
      audioElementRef.current.play();

      if (selectedOutput !== "default" && "setSinkId" in audioElementRef.current) {
        await (audioElementRef.current as any).setSinkId(selectedOutput);
      }

      // Save refs
      dryGainRef.current = dryGain;
      wetGainRef.current = wetGain;
      filterRef.current = filter;
      distortionRef.current = dist;
      rmOscRef.current = rmOsc;
      amDepthRef.current = amDepth;
      rmNodeRef.current = rmNode;
      delayRef.current = delay;
      feedbackRef.current = feedback;
      delayOutRef.current = delayOut;

      applyPresetSettings(activePreset);
      setIsListening(true);
      drawVisualizer();
      
    } catch (err) {
      console.error("Microphone access denied or error occurred.", err);
      alert("Не удалось запустить аудио. Проверьте разрешения микрофона.");
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().then(() => {
        audioCtxRef.current = null;
      });
    }
    if (rmOscRef.current) {
      try { rmOscRef.current.stop(); } catch(e) {}
    }
    if (sourceRef.current && sourceRef.current.mediaStream) {
      sourceRef.current.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current?.currentTime || 0, 0.05);
    }
  }, [volume]);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(15, 15, 20)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        const r = barHeight + (25 * (i / bufferLength));
        const g = 250 * (i / bufferLength);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };
    draw();
  };

  const presets = [
    { id: "normal", label: "Clean", icon: Mic2, color: "text-zinc-300" },
    { id: "robot", label: "Robot", icon: Bot, color: "text-cyan-400" },
    { id: "demon", label: "Demon", icon: Ghost, color: "text-rose-600" },
    { id: "alien", label: "Alien", icon: Sparkles, color: "text-emerald-400" },
    { id: "radio", label: "Radio", icon: Radio, color: "text-amber-400" },
    { id: "megaphone", label: "Megaphone", icon: Megaphone, color: "text-orange-500" },
    { id: "telephone", label: "Phone", icon: PhoneCall, color: "text-yellow-400" },
    { id: "cave", label: "Cave", icon: Waves, color: "text-blue-400" },
    { id: "astronaut", label: "Astronaut", icon: Rocket, color: "text-indigo-400" },
    { id: "magic", label: "Magic", icon: Wand2, color: "text-fuchsia-400" },
    { id: "titan", label: "Titan", icon: Shield, color: "text-red-700" },
    { id: "cyborg", label: "Cyborg", icon: Cpu, color: "text-teal-400" },
    { id: "spirit", label: "Spirit", icon: Activity, color: "text-violet-400" },
    { id: "underwater", label: "Underwater", icon: Waves, color: "text-cyan-600" },
    { id: "walkietalkie", label: "Cop Radio", icon: Siren, color: "text-red-500" },
    { id: "cathedral", label: "Cathedral", icon: Landmark, color: "text-purple-300" },
    { id: "dalek", label: "Dalek", icon: Bug, color: "text-orange-700" },
    { id: "overdrive", label: "Overdrive", icon: Zap, color: "text-yellow-500" },
    { id: "zelensky", label: "Зеленский", icon: Mic2, color: "text-blue-500" },
  ] as const;

  if (setupPhase !== "done") {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center justify-center overflow-hidden rounded-2xl bg-zinc-950/90 shadow-2xl border border-zinc-800/80 p-8 backdrop-blur-xl">
        <div className="w-full max-w-lg py-8">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
              <Cpu className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">Calivan Voice Core</h1>
            <p className="text-zinc-400">Инициализация аудиосистемы</p>
          </div>

          {setupPhase === "welcome" ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 text-sm text-zinc-300">
                <p className="mb-4">Вас приветствует инсталлятор драйвера <strong>Calivan Voice</strong>. Данная версия предоставляет полный премиум-доступ ко всем голосам без подписок (PRO версия разблокирована).</p>
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                  <Terminal className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">Система сама установит виртуальный микрофон для работы с Discord, Skype, OBS и др. Не нужно устанавливать сторонние VB-Audio кабели.</p>
                </div>
              </div>
              <button 
                onClick={startInstallation}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-indigo-500 py-4 font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:bg-indigo-400 transition"
              >
                Установить драйвера и разблокировать PRO <CheckCircle2 className="h-5 w-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div 
                  className="absolute bottom-0 left-0 top-0 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  initial={{ width: "0%" }}
                  animate={{ width: `${installProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
              
              <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-black p-5 font-mono text-[11px] text-zinc-400 h-48 overflow-y-auto scroll-smooth">
                {installLogs.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-indigo-500">{">"}</span> {log}
                  </motion.div>
                ))}
                {installProgress < 100 && (
                  <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="flex items-center gap-2">
                    <span className="text-indigo-500">{">"}</span> Установка_
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[900px] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl lg:flex-row border border-zinc-800">
      
      {/* Sidebar: Audio Driver & Routing Settings */}
      <div className="w-full lg:w-80 flex-col border-r border-zinc-800 bg-zinc-900/40 p-6 flex overflow-y-auto overflow-x-hidden">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold tracking-tight text-white leading-tight">Audio System</h2>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Driver Routing</p>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {/* Hardware Dropdowns */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <span>Устройство ввода</span>
                <button onClick={fetchDevices} className="hover:text-white transition" title="Обновить устройства">
                  <RefreshCw className="h-3 w-3" />
                </button>
              </label>
              <select 
                value={selectedInput}
                onChange={(e) => {
                  setSelectedInput(e.target.value);
                  if (isListening) alert("Для применения устройства ввода необходимо перезапустить трансляцию (Выкл/Вкл).");
                }}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-500"
              >
                <option value="default">Чувствительный микрофон (Сис. по умолч.)</option>
                {devices.inputs.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Микрофон ${d.deviceId.slice(0,4)}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Вывод (вирт. драйвер)
              </label>
              <select 
                value={selectedOutput}
                onChange={(e) => setSelectedOutput(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-emerald-400 outline-none focus:border-indigo-500 transition-colors"
                title="Направьте обработанный звук на виртуальный кабель"
              >
                <option value="default">Динамики (Сис. по умолч.)</option>
                {devices.outputs.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Вывод ${d.deviceId.slice(0,4)}`}</option>
                ))}
              </select>
              <p className="mt-2 text-[10px] text-zinc-500 leading-tight">
                * Для вывода в Discord выберите здесь динамик Virtual Audio Cable (VB-Cable).
              </p>
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Hear Myself Switch */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4">
            <div className="flex gap-3 items-center">
              <Headphones className={cn("h-5 w-5 transition-colors", hearMyself ? "text-indigo-400" : "text-zinc-500")} />
              <div>
                <span className="block text-sm font-medium text-zinc-200">Прослушивать себя</span>
                <span className="block text-[10px] text-zinc-500">Контролируйте свой вокал</span>
              </div>
            </div>
            <button
              onClick={() => setHearMyself(!hearMyself)}
              className={cn(
                "relative flex h-6 w-11 items-center rounded-full transition-colors",
                hearMyself ? "bg-indigo-500" : "bg-zinc-700"
              )}
            >
              <motion.div
                className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
                animate={{ x: hearMyself ? 24 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Instructions Box */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl"></div>
            <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Драйвер Calivan Voice VAD
            </h4>
            <ol className="text-[11px] text-indigo-200/80 list-decimal pl-3 space-y-2 leading-relaxed">
              <li>Система использует встроенный виртуальный драйвер <strong>Calivan Voice Virtual Audio Device (VAD)</strong>.</li>
              <li>В меню <strong>Вывод (выше)</strong> драйвер выбирается автоматически при упаковке в Desktop (Electron/Tauri).</li>
              <li>В Discord или другой программе просто выберите микрофон <code>Calivan Voice Virtual Mic</code>.</li>
            </ol>
            <p className="mt-3 text-[10px] text-indigo-300/50 italic border-t border-indigo-500/20 pt-2">
              * В текущей веб-версии (до сборки в .exe) для маршрутизации по-прежнему используются системные аудиоинтерфейсы.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col relative bg-zinc-950/80">
        <div className="flex-1 p-6 lg:p-10 flex flex-col items-center overflow-y-auto">
          
          {/* Main Engine Status Area */}
          <div className="relative mb-10 flex w-full flex-shrink-0 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-inner h-64">
             {/* Engine Toggle Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopAudio : startAudio}
                className={cn(
                  "group relative mx-auto flex h-32 w-32 items-center justify-center rounded-full shadow-2xl transition-all duration-500 border border-zinc-800/50 backdrop-blur-md",
                  isListening 
                    ? "bg-red-500/10 hover:bg-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]" 
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                )}
              >
                <div className={cn(
                  "absolute inset-0 rounded-full border-2 transition-all duration-500",
                  isListening ? "border-red-500/50 scale-110 opacity-0 animate-ping" : "border-emerald-500/50 border-dashed animate-[spin_10s_linear_infinite]"
                )} />
                <div className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500",
                  isListening ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                )}>
                  {isListening ? (
                    <Square className="h-8 w-8 text-black fill-black flex-shrink-0" />
                  ) : (
                    <Power className="h-10 w-10 text-black flex-shrink-0 ml-1" />
                  )}
                </div>
              </motion.button>
              <div className="mt-8 text-sm font-semibold uppercase tracking-[0.2em]">
                {isListening ? (
                  <span className="text-red-400 block animate-pulse">Трансляция активна</span>
                ) : (
                  <span className="text-emerald-400 block">Мотор остановлен</span>
                )}
              </div>
            </div>

            <canvas 
              ref={canvasRef} 
              width={800} 
              height={200}
              className={cn(
                "w-full h-full object-cover opacity-50 transition-opacity duration-700 blur-[1px]",
                isListening ? "opacity-40" : "opacity-0"
              )}
            />
          </div>

          {/* Sound Presets Grid */}
          <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-white tracking-tight">VoiceBox</h3>
                <span className="text-xs text-zinc-500">PRO Подписка активна • Все голоса</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-wider">
                <Unlock className="h-3 w-3" />
                <span>PRO UNLOCKED</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {presets.map((preset) => {
                const Icon = preset.icon;
                const isActive = activePreset === preset.id;
                return (
                  <motion.button
                    key={preset.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isListening) applyPresetSettings(preset.id as Preset);
                    }}
                    disabled={!isListening}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border p-6 transition-all duration-300 group",
                      isActive 
                        ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]" 
                        : "border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700",
                      !isListening && "opacity-50 cursor-not-allowed grayscale"
                    )}
                  >
                    <div className={cn(
                      "absolute top-2 right-2 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[8px] font-bold text-indigo-400",
                      !isListening && "opacity-0"
                    )}>PRO</div>
                    <Icon className={cn(
                      "h-10 w-10 transition-transform duration-300 group-hover:scale-110", 
                      isActive ? preset.color : "text-zinc-500"
                    )} />
                    <span className={cn("text-sm font-bold tracking-wide", isActive ? "text-white" : "text-zinc-400")}>{preset.label}</span>
                    
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Toolbar (Mixer) */}
        <div className="border-t border-zinc-800 bg-zinc-900/90 p-5 backdrop-blur-xl">
          <div className="mx-auto flex w-full items-center gap-8 px-4">
            <div className="flex items-center gap-4 text-zinc-400">
              <Volume2 className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Громкость DSP</span>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <span className="w-8 text-right text-xs font-bold text-zinc-500">0%</span>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.05" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-2 flex-1 appearance-none rounded-full bg-zinc-800 accent-indigo-500 outline-none hover:bg-zinc-700 transition"
              />
              <span className="w-8 text-left text-xs font-bold text-zinc-500">200%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
