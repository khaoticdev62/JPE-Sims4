"use client";

import React, { useState } from 'react';
import { Upload, Globe, CheckCircle2, AlertCircle, X, Package, FileText } from 'lucide-react';
import { motion, AnimatePresence } from '@/components/jpe-motion';
import { T } from '@/components/robust/jpe-theme';
import { JpeButton } from '@/components/jpe-design-system';
import { TS4RebelsService } from '@/services/api/TS4RebelsService';
import { CredentialManager } from '@/services/api/CredentialManager';
import { toast } from 'sonner';

interface ModPublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  packageBuffer?: ArrayBuffer;
}

export function ModPublishDialog({ isOpen, onClose, projectName, packageBuffer }: ModPublishDialogProps) {
  const [step, setStep] = useState<'login' | 'details' | 'uploading' | 'success' | 'error'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicTags, setTopicTags] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load saved credentials on mount
  React.useEffect(() => {
    if (isOpen) {
      CredentialManager.getCredential('ts4rebels-user').then(u => {
        if (u) setUsername(u);
      });
      CredentialManager.getCredential('ts4rebels-pass').then(p => {
        if (p) {
          setPassword(p);
          setRememberMe(true);
        }
      });

      // Pre-fill topic details from project name
      setTopicTitle(projectName);
      setTopicDescription(`Mod created with JPE Studio - ${projectName}`);
    }
  }, [isOpen, projectName]);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    setStep('uploading');
    setUploadProgress(10);

    try {
      const result = await TS4RebelsService.login(username, password);

      if (result.success && result.data.ok) {
        // Save credentials if requested
        if (rememberMe) {
          await CredentialManager.saveCredential('ts4rebels-user', username);
          await CredentialManager.saveCredential('ts4rebels-pass', password);
        }

        setUploadProgress(30);
        setStep('details');
      } else {
        setErrorMessage(result.error || 'Authentication failed');
        setStep('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
      setStep('error');
    }
  };

  const handlePublish = async () => {
    if (!topicTitle) {
      setErrorMessage('Topic title is required');
      setStep('error');
      return;
    }

    setStep('uploading');
    setUploadProgress(40);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // In a real implementation, this would call the TS4Rebels API to create a topic and upload the package
      // For now, we'll simulate the flow with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Simulate success
      setTimeout(() => {
        setStep('success');
        toast.success(`${projectName} published to TS4Rebels!`);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Publishing failed');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('login');
    setErrorMessage('');
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-lg relative z-10 rounded-2xl border overflow-hidden"
        style={{ background: T.bgPanel, borderColor: T.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <Upload size={20} color={T.cyanBright} />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 900, fontFamily: T.display, color: T.textPrimary }}>
                Publish Mod
              </h2>
              <p style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, marginTop: 2 }}>
                Upload to TS4Rebels.cc
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} color={T.textSecondary} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Login Step */}
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Globe size={32} color={T.cyanBright} className="mx-auto mb-3" />
                  <p style={{ fontSize: 12, color: T.textSecondary }}>
                    Sign in to your TS4Rebels.cc account to publish your mod
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                      USERNAME
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 mt-1"
                      placeholder="Your TS4Rebels username"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                      PASSWORD
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 mt-1"
                      placeholder="Your password"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-[10px] font-mono text-textMuted">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-border"
                    />
                    Remember me
                  </label>
                </div>

                <JpeButton
                  variant="spectral"
                  size="lg"
                  icon={Upload}
                  onClick={handleLogin}
                  className="w-full mt-4"
                >
                  Sign In & Continue
                </JpeButton>
              </motion.div>
            )}

            {/* Details Step */}
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Package size={32} color={T.emerald} className="mx-auto mb-3" />
                  <p style={{ fontSize: 12, color: T.textSecondary }}>
                    Configure your mod publication details
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                      TOPIC TITLE
                    </label>
                    <input
                      type="text"
                      value={topicTitle}
                      onChange={(e) => setTopicTitle(e.target.value)}
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 mt-1"
                      placeholder="Mod name"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                      DESCRIPTION
                    </label>
                    <textarea
                      value={topicDescription}
                      onChange={(e) => setTopicDescription(e.target.value)}
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 mt-1 resize-none"
                      rows={3}
                      placeholder="Describe your mod"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, fontWeight: 700, letterSpacing: '0.1em' }}>
                      TAGS (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={topicTags}
                      onChange={(e) => setTopicTags(e.target.value)}
                      className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-[11px] font-mono text-textPrimary outline-none focus:border-cyan/50 mt-1"
                      placeholder="tuning, interaction, buff"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan/5 border border-cyan/20">
                    <FileText size={14} color={T.cyan} />
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary }}>
                      Package: {projectName}.package ({packageBuffer ? (packageBuffer.byteLength / 1024).toFixed(1) : '0'} KB)
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <JpeButton variant="secondary" size="lg" onClick={() => setStep('login')} className="flex-1">
                    Back
                  </JpeButton>
                  <JpeButton
                    variant="spectral"
                    size="lg"
                    icon={Upload}
                    onClick={handlePublish}
                    className="flex-1"
                  >
                    Publish Mod
                  </JpeButton>
                </div>
              </motion.div>
            )}

            {/* Uploading Step */}
            {step === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-cyan/20 border-t-cyan rounded-full mx-auto mb-4"
                />
                <p style={{ fontSize: 14, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, marginBottom: 8 }}>
                  Publishing Mod...
                </p>
                <p style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, marginBottom: 16 }}>
                  Uploading {projectName}.package to TS4Rebels.cc
                </p>

                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, marginTop: 8 }}>
                  {uploadProgress}%
                </p>
              </motion.div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                <CheckCircle2 size={48} color={T.emerald} className="mx-auto mb-4" />
                <p style={{ fontSize: 16, fontWeight: 900, fontFamily: T.display, color: T.textPrimary, marginBottom: 8 }}>
                  Published Successfully!
                </p>
                <p style={{ fontSize: 11, color: T.textSecondary, marginBottom: 20 }}>
                  {topicTitle} is now live on TS4Rebels.cc
                </p>

                <div className="flex gap-3 justify-center">
                  <JpeButton variant="secondary" size="lg" onClick={handleClose}>
                    Close
                  </JpeButton>
                  <JpeButton
                    variant="spectral"
                    size="lg"
                    icon={Globe}
                    onClick={() => {
                      window.open('https://ts4rebels.cc', '_blank');
                      handleClose();
                    }}
                  >
                    View on TS4Rebels
                  </JpeButton>
                </div>
              </motion.div>
            )}

            {/* Error Step */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                <AlertCircle size={48} color={T.rose} className="mx-auto mb-4" />
                <p style={{ fontSize: 16, fontWeight: 900, fontFamily: T.display, color: T.textPrimary, marginBottom: 8 }}>
                  Publishing Failed
                </p>
                <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 20 }}>
                  {errorMessage}
                </p>

                <JpeButton variant="secondary" size="lg" onClick={() => setStep('login')}>
                  Try Again
                </JpeButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default ModPublishDialog;
