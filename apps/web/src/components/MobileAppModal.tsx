'use client';

import React from 'react';
import {
  Smartphone,
  Download,
  QrCode,
  PackageCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  X,
  GitBranch,
} from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mobile Application Package</h3>
            <p className="text-xs text-slate-500">Cross-platform native companion app for iOS & Android</p>
          </div>
        </div>

        {/* Package Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Packaged Application Ready</p>
              <p className="text-[11px] text-emerald-700">Hermes Bytecode (Android + iOS) + Web Assets</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-white text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            v1.0.0
          </span>
        </div>

        {/* Package Details */}
        <div className="space-y-3.5 text-xs text-slate-600 mb-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-blue-500" /> GitLab CI Job:
              </span>
              <code className="bg-slate-200/70 px-2 py-0.5 rounded text-slate-800 font-mono text-[11px]">
                package:mobile
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Exposed Artifact:</span>
              <span className="font-mono text-slate-600 text-[11px]">mobile-app-package.zip</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Target Framework:</span>
              <span>Expo 52 / React Native 0.76</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="font-bold text-slate-900 text-xs">Included in this Package:</p>
            <ul className="space-y-1 pl-1">
              <li className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Android Native:</strong> Hermes compiled bytecode (`_expo/static/js/android`)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>iOS Native:</strong> Hermes compiled bytecode (`_expo/static/js/ios`)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Assets & Fonts:</strong> Vector icons, fonts, and responsive layouts</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Web Companion:</strong> Single-page progressive web bundle</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <a
            href="https://gitlab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Package from GitLab CI Artifacts
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-slate-400">
              Run locally: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">pnpm package:mobile</code>
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
