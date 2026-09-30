"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ShieldAlert, Terminal, Copy, Check, Flame } from "lucide-react";
import { AttackStep, GraphNode } from "../lib/types";
import { fetchAttackSteps } from "../lib/api";

interface AttackPathStepperProps {
  target: string;
  graphNodes: GraphNode[];
  onSelectNode: (node: GraphNode | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AttackPathStepper: React.FC<AttackPathStepperProps> = ({
  target,
  graphNodes,
  onSelectNode,
  isOpen,
  onClose,
}) => {
  const [steps, setSteps] = useState<AttackStep[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch step sequence when target changes
  const loadSteps = useCallback(async () => {
    if (!target) return;
    setLoading(true);
    try {
      const res = await fetchAttackSteps(target);
      if (res && res.steps && res.steps.length > 0) {
        setSteps(res.steps);
        setCurrentIdx(0);
      }
    } catch (err) {
      console.error("Failed to load attack steps:", err);
    } finally {
      setLoading(false);
    }
  }, [target]);

  useEffect(() => {
    if (isOpen) {
      loadSteps();
    }
  }, [isOpen, loadSteps]);

  // Sync selected node in 2D/3D graph view
  useEffect(() => {
    if (!steps || steps.length === 0) return;
    const currentStep = steps[currentIdx];
    if (currentStep) {
      // Find matching graph node by ID or name
      const matchingNode = graphNodes.find(
        (n) => n.id === currentStep.node_id || n.name.toLowerCase().includes(currentStep.node_name.toLowerCase())
      );
      if (matchingNode) {
        onSelectNode(matchingNode);
      }
    }
  }, [currentIdx, steps, graphNodes, onSelectNode]);

  // Auto-play stepper loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  if (!isOpen) return null;

  const activeStep = steps[currentIdx];

  const handleCopyPayload = () => {
    if (activeStep?.payload_preview) {
      navigator.clipboard.writeText(activeStep.payload_preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return "from-cyan-500 to-blue-500";
    if (risk < 70) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-red-600 animate-pulse";
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-red-500/30 rounded-2xl p-5 shadow-2xl shadow-red-950/40 text-slate-100 transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-wide text-slate-100 flex items-center gap-2">
              Autonomous Attack Stepper
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono">
                Red Team Simulation
              </span>
            </h3>
            <p className="text-xs text-slate-400">Simulating step-by-step adversary reachability vector</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-sm px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800 transition"
        >
          Close HUD
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 animate-spin text-red-400" />
          Synthesizing Red Team Execution Steps...
        </div>
      ) : activeStep ? (
        <div className="mt-4 space-y-4">
          {/* Step Timeline Indicator */}
          <div className="flex items-center justify-between gap-1.5">
            {steps.map((st, idx) => (
              <button
                key={st.step_index}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIdx(idx);
                }}
                className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIdx
                    ? "bg-red-500 shadow-md shadow-red-500/50 scale-105"
                    : idx < currentIdx
                    ? "bg-amber-500/80"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
                title={`Step ${idx + 1}: ${st.action_title}`}
              />
            ))}
          </div>

          {/* Action Title & Risk Score */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                STEP {currentIdx + 1} OF {steps.length} {"//"} {activeStep.node_label.toUpperCase()}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Blast Radius Risk:</span>
                <span className="text-sm font-bold font-mono text-red-400">
                  {activeStep.cumulative_risk}%
                </span>
              </div>
            </div>

            {/* Risk Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${getRiskColor(activeStep.cumulative_risk)} transition-all duration-500`}
                style={{ width: `${activeStep.cumulative_risk}%` }}
              />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {activeStep.action_title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeStep.description}</p>
            </div>
          </div>

          {/* Payload / Execution Preview Box */}
          {activeStep.payload_preview && (
            <div className="bg-slate-950 rounded-xl border border-red-900/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-2">
                <span className="flex items-center gap-1.5 text-red-400">
                  <Terminal className="w-3.5 h-3.5" />
                  SIMULATED PAYLOAD / STACK TRACE
                </span>
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-400 bg-black/60 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-36 scrollbar-thin">
                {activeStep.payload_preview}
              </pre>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIdx(0);
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Reset to Step 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIdx((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentIdx === 0}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                title="Previous Step"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause Attack" : "Auto Play"}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIdx((prev) => Math.min(steps.length - 1, prev + 1));
                }}
                disabled={currentIdx === steps.length - 1}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                title="Next Step"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Target Node: <strong className="text-red-400">{activeStep.node_name}</strong>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
