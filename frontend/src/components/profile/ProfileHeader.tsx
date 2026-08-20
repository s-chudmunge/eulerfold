import React from 'react';
import { Share2, Edit2, Camera, Loader2, CheckCircle2, Target, Clock } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

interface ProfileHeaderProps {
    profile: any;
    isOwner: boolean;
    uploading: boolean;
    effectiveAvatarUrl: string;
    onShare: () => void;
    onEdit: () => void;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({
    profile, isOwner, uploading, effectiveAvatarUrl, onShare, onEdit, onAvatarUpload
}: ProfileHeaderProps) {
    return (
        <div className="w-full bg-sidebar/30 border-b border-border/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            
            {/* Actions Bar */}
            <div className="max-w-4xl mx-auto px-6 pt-6 flex justify-end gap-3 relative z-20">
                <button 
                    onClick={onShare}
                    className="px-4 py-1.5 bg-background border border-border/80 hover:border-accent/40 rounded-md text-[10px] font-bold text-text-heading flex items-center gap-2 transition-all uppercase tracking-widest shadow-sm"
                >
                    <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                {isOwner && (
                    <button 
                        onClick={onEdit}
                        className="px-4 py-1.5 bg-accent text-white rounded-md text-[10px] font-bold flex items-center gap-2 transition-all uppercase tracking-widest shadow-sm hover:bg-teal-700"
                    >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-8 pb-16 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border border-border/50 shadow-xl overflow-hidden bg-header flex items-center justify-center relative group shrink-0">
                    {effectiveAvatarUrl ? (
                        <img src={effectiveAvatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-sidebar flex items-center justify-center text-text-heading text-4xl font-bold inconsolata-ui">
                            {profile.display_name?.[0] || profile.username[0].toUpperCase()}
                        </div>
                    )}
                    {isOwner && (
                        <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                            {uploading ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                                <>
                                    <Camera className="w-6 h-6 text-white mb-1" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest inconsolata-ui">Change</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={onAvatarUpload}
                                disabled={uploading}
                            />
                        </label>
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left mt-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-heading tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                        {profile.display_name || profile.username}
                        {(profile as any).is_pro && <VerifiedBadge size={24} className="text-accent" />}
                    </h1>
                    <p className="text-[15px] font-medium text-text-muted mb-6 inconsolata-ui">@{profile.username}</p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                                <CheckCircle2 className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[17px] font-black text-text-heading leading-tight">{profile.total_skills || 0}</span>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Proven Skills</span>
                            </div>
                        </div>
                        <div className="w-[1px] bg-border hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Target className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[17px] font-black text-text-heading leading-tight">{profile.total_roadmaps || 0}</span>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Courses</span>
                            </div>
                        </div>
                        <div className="w-[1px] bg-border hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[17px] font-black text-text-heading leading-tight">{Math.round(profile.total_hours || 0)}</span>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Hours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
