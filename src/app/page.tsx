"use client";
import type { Tenant } from '@/lib/types';
import { useState, Suspense, useRef, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { supabaseClient } from '@/lib/supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Camera, 
  X, 
  Paperclip, 
  Mic, 
  Image as ImageIcon,
  Video,
  ChevronLeft,
  MoreVertical,
  Plus,
  Smile,
  FileText,
  Headphones,
  MapPin,
  User as UserIcon,
  BarChart2,
  Calendar,
  Loader2,
  Star
} from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';
import nextDynamic from 'next/dynamic';

const CameraCapture = nextDynamic(() => import('@/components/camera/CameraCapture'), { ssr: false });

function PassengerForm({ branding }: { branding: Tenant | null }) {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const unitId = searchParams.get('unitId');

  const [type, setType] = useState<string>('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{url: string, type: string}[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [showFinalCoopMessage, setShowFinalCoopMessage] = useState(false);
  const [showFinalVideo, setShowFinalVideo] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const ratingContainerRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const brandColor = branding?.brand_color || '#075E54';
  const logoUrl = branding?.logo_url;
  const tenantName = branding?.name || 'ActivaQR';
  const whatsappNumber = branding?.whatsapp_number;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Ubicación denegada o no disponible:', err.message)
      );
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const generateAndDownloadVCard = () => {
    if (!whatsappNumber) return;
    const vcardData = `BEGIN:VCARD
VERSION:3.0
N:;${tenantName} (ActivaQR2);;;
FN:${tenantName} (ActivaQR2)
TEL;TYPE=WORK,VOICE:+${whatsappNumber}
URL:https://activaqr2.vercel.app/dashboard
NOTE:Contacto de emergencia y soporte (Plataforma ActivaQR2)
END:VCARD`;

    const blob = new Blob([vcardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacto_${tenantName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (ticket) {
      const timer = setTimeout(() => setShowFinalCoopMessage(true), 1000);
      const videoTimer = setTimeout(() => {
        setShowFinalVideo(true);
        generateAndDownloadVCard();
      }, 1500);
      return () => {
        clearTimeout(timer);
        clearTimeout(videoTimer);
      };
    }
  }, [ticket, tenantName, whatsappNumber]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [type, content, imagePreviews, ticket, showFinalCoopMessage, showFinalVideo]);

  if (!tenantId || !unitId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-8 text-center gap-4">
        <div className="w-16 h-16 bg-red-100/10 rounded-full flex items-center justify-center">
           <X className="text-red-500 w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Acceso no válido</h1>
        <p className="text-sm text-muted-foreground">Información del vehículo o cliente faltante. Por favor, escanee el código QR de nuevo.</p>
      </div>
    );
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setMediaType('audio');
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFilesList: File[] = [];
    const newPreviewsList: {url: string, type: string}[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
          const compressedFile = await imageCompression(file, options);
          newFilesList.push(compressedFile);
          newPreviewsList.push({ url: URL.createObjectURL(compressedFile), type: 'image' });
        } catch (error) {
          newFilesList.push(file);
          newPreviewsList.push({ url: URL.createObjectURL(file), type: 'image' });
        }
      } else if (file.type.startsWith('video/')) {
        if (file.size > 50 * 1024 * 1024) {
          alert(`El video ${file.name} es demasiado pesado (>50MB).`);
          continue;
        }
        newFilesList.push(file);
        newPreviewsList.push({ url: URL.createObjectURL(file), type: 'video' });
      } else if (file.type.startsWith('audio/')) {
        newFilesList.push(file);
        newPreviewsList.push({ url: URL.createObjectURL(file), type: 'audio' });
      }
    }

    setSelectedFiles(prev => [...prev, ...newFilesList]);
    setImagePreviews(prev => [...prev, ...newPreviewsList]);
    setShowAttachments(false);
  };

  const onCapture = async (file: File, type: 'image' | 'video') => {
    if (type === 'image') {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        setSelectedFiles(prev => [...prev, compressedFile]);
        setImagePreviews(prev => [...prev, { url: URL.createObjectURL(compressedFile), type: 'image' }]);
      } catch (e) {
        setSelectedFiles(prev => [...prev, file]);
        setImagePreviews(prev => [...prev, { url: URL.createObjectURL(file), type: 'image' }]);
      }
    } else {
      setSelectedFiles(prev => [...prev, file]);
      setImagePreviews(prev => [...prev, { url: URL.createObjectURL(file), type: 'video' }]);
    }
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    if (!type) return;
    setIsSubmitting(true);
    setUploadProgress(10);
    
    try {
      const uploadedUrls: string[] = [];
      
      // 1. Upload audio if exists
      if (audioBlob) {
        const fileName = `${uuidv4()}.webm`;
        const filePath = `audios/${fileName}`;
        const { error: uploadError } = await supabaseClient.storage.from('reports-media').upload(filePath, audioBlob);
        if (!uploadError) {
          const { data: { publicUrl } } = supabaseClient.storage.from('reports-media').getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
      }

      // 2. Upload all selected files (photos/videos)
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const mType = file.type.startsWith('image/') ? 'image' : 'video';
        const fileExt = file.name.split('.').pop() || (mType === 'image' ? 'jpg' : 'mp4');
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${mType}s/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage.from('reports-media').upload(filePath, file);
        if (!uploadError) {
          const { data: { publicUrl } } = supabaseClient.storage.from('reports-media').getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
        setUploadProgress(10 + ((i + 1) / selectedFiles.length) * 60);
      }

      const mediaUrl = uploadedUrls.length > 0 ? uploadedUrls.join(',') : null;
      setUploadProgress(80);

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content,
          rating,
          mediaUrl,
          mediaType: uploadedUrls.length > 0 ? 'mixed' : null,
          location,
          tenantId,
          unitId
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
        setUploadProgress(100);
      } else {
        alert("Error: " + (data.error || 'Intenta de nuevo'));
      }
    } catch (error: any) {
      console.error('Error enviando reporte:', error);
      alert(error.message || "Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!ratingContainerRef.current) return;
    const touch = e.touches[0];
    const rect = ratingContainerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const starWidth = rect.width / 5;
    const newRating = Math.min(5, Math.max(1, Math.ceil(x / starWidth)));
    setRating(newRating);
  };

  const handleWhatsAppRedirect = () => {
    if (!whatsappNumber || !ticket) return;
    const message = `Necesito mi ticket de reclamo: ${ticket}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent relative overflow-hidden font-sans text-foreground transition-colors duration-500">
      
      {showCamera && (
        <CameraCapture 
          onCapture={onCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {/* Background Spatial Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>
      </div>

      <style>{`
        :root {
          --brand-primary: ${brandColor};
        }
        .bg-brand { background-color: ${brandColor} !important; }
        .text-brand { color: ${brandColor} !important; }
        .border-brand { border-color: ${brandColor} !important; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <header className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-center">
        <div className="vision-pill px-5 py-3 flex items-center justify-between gap-4 shadow-2xl backdrop-blur-3xl border-border/20 w-full max-w-lg bg-card/80">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 vision-pill bg-white flex items-center justify-center p-1.5 overflow-hidden shadow-inner border-border/20">
                {logoUrl ? (
                   <img src={logoUrl} alt={tenantName} className="w-full h-full object-contain" />
                ) : (
                   <MessageSquare className="text-brand w-5 h-5" />
                )}
             </div>
             <div className="flex flex-col">
                <h1 className="text-foreground font-black text-xs leading-none flex items-center gap-1 uppercase tracking-tight">
                  {tenantName} 
                  <CheckCircle2 className="w-3 h-3 text-blue-500 fill-current ml-0.5" />
                </h1>
                <p className="text-muted-foreground text-[9px] uppercase font-black tracking-[0.2em] leading-none mt-1.5 italic">Interfaz de Seguridad</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <ThemeToggle className="scale-75 md:scale-100" />
             <div className="vision-pill p-2 bg-foreground/5 border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                <MoreVertical className="w-4 h-4" />
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-28 pb-32 z-10 relative">
        <div 
          ref={scrollRef}
          className="w-full max-w-lg vision-window p-6 md:p-10 flex flex-col gap-8 shadow-[0_30px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-y-auto h-[75vh] md:h-auto md:max-h-[80vh] scroll-smooth no-scrollbar bg-card/60 backdrop-blur-3xl border border-border/20"
        >
          {/* Welcome Section */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="w-16 h-1 w-brand bg-brand rounded-full opacity-50"></div>
             <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight tracking-tighter">
                Hola. 👋 <br />
                ¿En qué podemos <span className="text-brand underline decoration-brand/30 underline-offset-4">ayudarte</span> hoy?
             </h2>
             <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed max-w-[90%]">
                Bienvenido al acceso oficial de reportes de <b>{tenantName}</b>. Tus comentarios impulsan nuestra excelencia.
             </p>
          </div>

          {!type && (
            <div className="grid grid-cols-1 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              {[
                 { id: 'felicitacion', label: 'Felicitaciones', sub: 'Compartir experiencia positiva', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                 { id: 'reporte', label: 'Reporte de Novedad', sub: 'Observación estándar', icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                 { id: 'queja', label: 'Emergencia / Auxilio', sub: 'Atención inmediata', icon: MessageSquare, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
              ].map((opt) => (
                <button 
                  key={opt.id}
                  onClick={() => setType(opt.id)}
                  className={`flex items-center gap-6 p-5 rounded-[2rem] border transition-all hover:scale-[1.02] active:scale-95 shadow-xl group ${opt.bg} backdrop-blur-md`}
                >
                  <div className={`p-4 vision-pill ${opt.bg} border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl dark:shadow-black/50`}>
                    <opt.icon className={`w-7 h-7 ${opt.color}`} />
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="text-sm font-black tracking-tight text-foreground uppercase">{opt.label}</span>
                     <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1 italic">{opt.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {type && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="flex justify-between items-center">
                  <div 
                    ref={ratingContainerRef}
                    className="flex items-center gap-1 group/rating touch-none"
                    onMouseLeave={() => setHoverRating(null)}
                    onTouchMove={handleTouchMove}
                  >
                     {[1, 2, 3, 4, 5].map((star) => {
                       const activeRating = hoverRating !== null ? hoverRating : rating;
                       return (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          className={`p-1.5 transition-all duration-200 ${activeRating >= star ? 'scale-110' : 'scale-100 opacity-100'}`}
                        >
                          <Star 
                            className={`w-7 h-7 ${activeRating >= star ? 'fill-current text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-muted-foreground/40 stroke-[1.5px]'}`} 
                          />
                        </button>
                       );
                     })}
                  </div>
                 <div className="vision-pill px-6 py-4 bg-brand/10 border-brand/20 shadow-2xl shadow-brand/5">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-foreground">
                       Seleccionado: <span className="italic ml-2">{type.toUpperCase()}</span>
                    </p>
                 </div>
              </div>

              {!ticket && (
                 <div className="flex justify-start">
                    <div className="vision-card p-6 border-border/20 shadow-3xl max-w-[90%] bg-card backdrop-blur-3xl">
                       <p className="text-sm md:text-base font-medium text-foreground/90 leading-relaxed italic">
                          Entendido. Por favor, proporciona los detalles operativos a continuación. Puedes incluir evidencia en alta resolución para una resolución más rápida.
                       </p>
                       <div className="mt-4 flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-ping"></div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Listo para recibir información</span>
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}

            {/* Media Preview (Compact Thumbnails) */}
            {(imagePreviews.length > 0 || audioBlob || location) && !ticket && (
              <div className="flex flex-wrap gap-3 my-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="w-20 h-20 vision-card p-1 relative group overflow-hidden border-border/20 bg-card/40 backdrop-blur-xl shrink-0">
                    {preview.type === 'image' ? (
                       <img 
                         src={preview.url} 
                         alt="Preview" 
                         className="w-full h-full object-cover rounded-xl"
                       />
                    ) : preview.type === 'video' ? (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-accent/20 rounded-xl">
                          <Video className="w-5 h-5 text-purple-400" />
                          <span className="text-[7px] font-black uppercase mt-1 opacity-60">Video</span>
                       </div>
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-accent/20 rounded-xl">
                          <Mic className="w-5 h-5 text-red-400" />
                          <span className="text-[7px] font-black uppercase mt-1 opacity-60">Audio</span>
                       </div>
                    )}
                    <button 
                      onClick={() => { 
                        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 w-5 h-5 vision-pill bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {audioBlob && (
                  <div className="w-20 h-20 vision-card p-1 relative group overflow-hidden border-border/20 bg-card/40 backdrop-blur-xl shrink-0">
                     <div className="w-full h-full flex flex-col items-center justify-center bg-accent/20 rounded-xl">
                        <div className="w-7 h-7 vision-pill bg-red-500/20 flex items-center justify-center mb-1">
                           <Mic className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="text-[7px] font-black uppercase opacity-60">Voz</span>
                     </div>
                    <button 
                      onClick={() => { setAudioBlob(null); }}
                      className="absolute top-1 right-1 w-5 h-5 vision-pill bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {location && (
                  <div className="w-20 h-20 vision-card p-1 relative group overflow-hidden border-border/20 bg-card/40 backdrop-blur-xl shrink-0">
                     <div className="w-full h-full flex flex-col items-center justify-center bg-accent/20 rounded-xl">
                        <div className="w-7 h-7 vision-pill bg-blue-500/20 flex items-center justify-center mb-1">
                           <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="text-[7px] font-black uppercase opacity-60 text-center px-1">Ubicación</span>
                     </div>
                    <button 
                      onClick={() => setLocation(null)}
                      className="absolute top-1 right-1 w-5 h-5 vision-pill bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

           {ticket && (
            <>
              <div className="self-end max-w-[85%] bg-brand/10 p-4 rounded-2xl rounded-tr-none shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                 <p className="text-sm italic text-foreground">{content || 'Información enviada con multimedia.'}</p>
                 <span className="text-[10px] text-muted-foreground block text-right mt-2">Justo ahora</span>
              </div>

              <div className="self-center w-full p-8 shadow-3xl border border-brand/30 rounded-[2.5rem] animate-in zoom-in-95 duration-1000 mt-12 relative bg-brand/5 backdrop-blur-2xl">
                 <div className="absolute -top-10 -right-6 opacity-10">
                    <CheckCircle2 className="w-32 h-32 text-brand" />
                 </div>
                 
                 <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 vision-pill bg-yellow-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] shrink-0">
                       <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <div className="flex flex-col">
                       <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-tight">Incidente Registrado</h3>
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Estado: Sincronizado • ID #{ticket}</p>
                    </div>
                 </div>

                 <p className="text-sm md:text-base text-foreground/60 leading-relaxed mb-8 font-medium">
                    Protocolo operativo iniciado. La gestión de flota ha sido sincronizada con tu reporte. Tu seguridad es nuestra prioridad.
                 </p>
                 
                 <div className="p-4 vision-pill bg-foreground/5 border-foreground/10 text-[10px] text-muted-foreground text-center font-black uppercase tracking-[0.2em] italic">
                    Excelencia a través de la innovación y la seguridad
                 </div>
              </div>

              {showFinalCoopMessage && (
                 <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
                     <div className="vision-pill px-6 py-3 bg-accent/10 border-border/30 text-muted-foreground text-xs font-medium">
                        Gracias por elegir a <b className="font-bold">{tenantName}</b>. ¡Buen viaje! 👋
                     </div>
                 </div>
              )}

              {showFinalVideo && (
                 <div className="w-full vision-card p-4 border-white/10 flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-1000 bg-card mt-4">
                    <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 aspect-video relative group shadow-2xl">
                       <video 
                        src="/clientes.mp4" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                       />
                    </div>
                    
                    {whatsappNumber && (
                      <button 
                        onClick={handleWhatsAppRedirect}
                        className="bg-foreground text-background py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <Send className="w-4 h-4" />
                        Solicitar Certificado vía WhatsApp
                      </button>
                    )}
                     <p className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-[0.2em] text-center italic">
                       Sincronización automática de VCard y Ticket
                     </p>
                 </div>
              )}
            </>
          )}
        </div>
      </main>

      {!ticket && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50 animate-in slide-in-from-bottom-12 duration-1000">
          <div className="vision-pill p-2 flex items-center gap-3 shadow-3xl bg-card border-border/40 backdrop-blur-3xl min-h-[64px]">
             <button 
              className="w-12 h-12 vision-pill flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all shrink-0"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <Plus className={`${showAttachments ? 'rotate-45 text-brand' : ''} transition-all duration-500 w-6 h-6`} />
            </button>
            <div className="flex-1 relative flex items-center">
              {isRecording ? (
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                   <span className="text-xs font-black text-red-500 uppercase tracking-widest">{Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
                  <span className="text-[10px] font-medium text-muted-foreground italic">Grabando...</span>
                </div>
              ) : (
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe los detalles del incidente..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 max-h-32 resize-none placeholder-muted-foreground/40 text-foreground font-medium"
                />
              )}
            </div>
            {isRecording ? (
              <button 
                className="w-12 h-12 vision-pill bg-red-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-bounce shrink-0"
                onClick={stopRecording}
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  className="w-12 h-12 vision-pill flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all shrink-0 relative border border-border/10 active:scale-95"
                  onClick={() => startRecording()}
                  title="Grabar Voz"
                >
                  <Mic className={audioBlob ? 'text-brand w-5 h-5' : 'w-5 h-5'} />
                  {audioBlob && <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand rounded-full animate-pulse border-2 border-background"></div>}
                </button>
                <button 
                  className="w-12 h-12 vision-pill flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all shrink-0 relative border border-border/10 active:scale-95"
                  onClick={() => setShowCamera(true)}
                  title="Cámara"
                >
                  <Camera className={selectedFiles.length > 0 ? 'text-brand w-5 h-5' : 'w-5 h-5'} />
                  {selectedFiles.length > 0 && <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-brand rounded-full animate-pulse border-2 border-background"></div>}
                </button>
              </div>
            )}
            <input type="file" ref={galleryInputRef} hidden accept="image/*,video/*,audio/*" multiple onChange={handleFileChange} />
            <button 
              disabled={(!content && selectedFiles.length === 0 && !audioBlob) || isSubmitting || isRecording}
              onClick={handleSubmit}
               className={`w-12 h-12 vision-pill flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-2xl border
                ${(!content && selectedFiles.length === 0 && !audioBlob) || isSubmitting || isRecording 
                  ? 'bg-muted/20 border-border/10 text-muted-foreground/40' 
                  : 'bg-foreground text-background border-foreground hover:scale-110 shadow-[0_0_20px_rgba(var(--foreground),0.2)]'}`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className={`w-5 h-5 ml-0.5 ${(!content && selectedFiles.length === 0 && !audioBlob) ? 'opacity-40' : 'opacity-100'}`} />}
            </button>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
           <div className="w-full max-w-sm space-y-10 text-center">
              <div className="inline-block p-6 vision-pill bg-brand/20 border-brand/30 shadow-[0_0_50px_rgba(var(--foreground),0.1)] mb-4">
                 <Loader2 className="w-10 h-10 animate-spin text-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground mb-2 uppercase">Syncing Protocol</h3>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">
                   {uploadProgress < 30 ? 'Encoding metadata...' : uploadProgress < 70 ? 'Transmitting evidence...' : 'Finalizing security log...'}
                </p>
              </div>
              <div className="w-full bg-foreground/5 h-2 rounded-full overflow-hidden border border-foreground/10 p-0.5">
                 <div className="bg-foreground h-full rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(var(--foreground),0.5)]" style={{ width: `${uploadProgress}%` }}></div>
              </div>
               <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Establishing Secure Connection</p>
           </div>
        </div>
      )}

      {showAttachments && (
         <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-[100] animate-in slide-in-from-bottom-20 duration-500">
           <div className="vision-card p-10 grid grid-cols-3 gap-8 shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-border/40 bg-card backdrop-blur-3xl">
              {[
                { 
                  icon: Camera, 
                  label: 'Cámara', 
                  color: 'text-red-400', 
                  click: () => setShowCamera(true) 
                },
                { 
                  icon: ImageIcon, 
                  label: 'Galería', 
                  color: 'text-purple-400', 
                  click: () => galleryInputRef.current?.click() 
                },
                { 
                  icon: MapPin, 
                  label: 'Ubicación', 
                  color: 'text-blue-400', 
                  click: () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                          alert('📍 Ubicación capturada con éxito');
                        },
                        (err) => alert('No se pudo obtener la ubicación: ' + err.message)
                      );
                    }
                  } 
                },
              ].map((item, idx) => (
                <button key={idx} onClick={() => { item.click?.(); setShowAttachments(false); }} className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 vision-pill bg-accent/20 border-border/40 flex items-center justify-center group-hover:bg-accent/40 group-hover:scale-110 transition-all duration-500 shadow-xl">
                       <item.icon className={`w-7 h-7 ${item.color}`} />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{item.label}</span>
                </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}

function PassengerFormWrapper() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');
  const [branding, setBranding] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranding() {
      if (!tenantId) return;
      const { data } = await supabaseClient.from('activaqr2_tenants').select('*').eq('id', tenantId).single();
      if (data) setBranding(data);
      setLoading(false);
    }
    loadBranding();
  }, [tenantId]);

  if (!tenantId || tenantId === 'ID_DE_EMPRESA') {
    return (
       <div className="flex h-screen items-center justify-center p-8 text-center bg-background font-sans transition-colors duration-500">
          <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/5">
                <AlertTriangle className="w-10 h-10 text-yellow-500" />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Acceso no válido</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                   Estás usando un enlace con texto genérico como <code className="text-yellow-500/80 bg-yellow-500/5 px-1 rounded">ID_DE_EMPRESA</code>. 
                   La base de datos necesita un ID real (UUID) para funcionar.
                </p>
             </div>
             <div className="p-1 bg-gradient-to-b from-foreground/10 to-transparent rounded-2xl">
                <a 
                  href="http://localhost:3000/?tenantId=11db7f98-6732-452f-b2ef-8ad424783d3d&unitId=dadbff96-face-4dfb-a036-0fbf41bcb4f3" 
                  className="block p-4 bg-foreground text-background rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-foreground/5"
                >
                   Ir al Enlace Funcional
                </a>
             </div>
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Sincronización de Base de Datos Activa</p>
          </div>
       </div>
    );
  }

  if (loading && tenantId) {
    return (
      <div className="flex h-screen bg-background items-center justify-center flex-col gap-4 transition-colors duration-500">
         <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
         <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Cargando Identidad...</p>
      </div>
    );
  }

  return <PassengerForm branding={branding} />;
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-background items-center justify-center flex-col gap-4 transition-colors duration-500">
         <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
         <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Cargando Sistema...</p>
      </div>
    }>
      <PassengerFormWrapper />
    </Suspense>
  );
}
