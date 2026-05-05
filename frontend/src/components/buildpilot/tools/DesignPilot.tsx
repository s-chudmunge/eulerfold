"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Layout, Maximize2, Download, MousePointer2, Pencil, Square, Circle, 
  Minus, Type, Image as ImageIcon, Sparkles, Trash2, Eraser, Undo2, 
  Redo2, Upload, Move, ArrowRight, Save, Layers, Settings2, ZoomIn, ZoomOut, Hand,
  Spline, Grid3X3, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type as TypeIcon
} from 'lucide-react';

interface Element {
  id: string;
  type: 'pencil' | 'rectangle' | 'circle' | 'arrow' | 'curvedArrow' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  color: string;
  brushSize: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  image?: HTMLImageElement;
}

interface DesignPilotProps {
  moduleTitle: string;
}

const DesignPilot: React.FC<DesignPilotProps> = ({ moduleTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [elements, setElements] = useState<Element[]>([]);
  const [history, setHistory] = useState<Element[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [tool, setTool] = useState<Element['type'] | 'selection' | 'hand' | 'eraser'>('pencil');
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  
  // Text & Property States
  const [color, setColor] = useState('#0F766E');
  const [brushSize, setBrushSize] = useState(3);
  const [fontFamily, setFontFamily] = useState('Inconsolata, monospace');
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  const [editingText, setEditingText] = useState<{ id: string, x: number, y: number, value: string } | null>(null);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);

  const drawArrowhead = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const renderSmoothPath = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (points.length === 2) {
      ctx.lineTo(points[1].x, points[1].y);
    } else {
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(points[points.length - 2].x, points[points.length - 2].y, points[points.length - 1].x, points[points.length - 1].y);
    }
    ctx.stroke();
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (showGrid) {
      const gridSize = 30;
      ctx.save();
      ctx.translate(pan.x % (gridSize * scale), pan.y % (gridSize * scale));
      ctx.beginPath();
      for (let x = -gridSize * scale; x <= canvas.width + gridSize * scale; x += gridSize * scale) {
        for (let y = -gridSize * scale; y <= canvas.height + gridSize * scale; y += gridSize * scale) {
          ctx.moveTo(x, y);
          ctx.arc(x, y, 0.8 * scale, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = '#cbd5e1'; ctx.globalAlpha = 0.5; ctx.fill();
      ctx.restore();
    }

    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    const allElements = [...elements];
    if (currentElement) allElements.push(currentElement);

    allElements.forEach(el => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if ((el.type === 'pencil' || el.type === 'curvedArrow') && el.points) {
        renderSmoothPath(ctx, el.points);
        if (el.type === 'curvedArrow' && el.points.length >= 2) {
          const p1 = el.points[el.points.length - 2];
          const p2 = el.points[el.points.length - 1];
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          drawArrowhead(ctx, p2.x, p2.y, angle, el.brushSize * 4);
        }
      } else if (el.type === 'rectangle') {
        ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
      } else if (el.type === 'circle') {
        ctx.beginPath();
        const rx = Math.abs(el.width || 0) / 2;
        const ry = Math.abs(el.height || 0) / 2;
        ctx.ellipse(el.x + rx, el.y + ry, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (el.type === 'arrow') {
        const x2 = el.x + (el.width || 0);
        const y2 = el.y + (el.height || 0);
        ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(x2, y2); ctx.stroke();
        const angle = Math.atan2(y2 - el.y, x2 - el.x);
        drawArrowhead(ctx, x2, y2, angle, el.brushSize * 4);
      } else if (el.type === 'text') {
        // Skip rendering if being edited inline
        if (editingText?.id === el.id) return;
        
        ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 'normal'} ${el.brushSize * 4}px ${el.fontFamily || 'Inconsolata'}`;
        ctx.textAlign = el.textAlign || 'left';
        ctx.textBaseline = 'top';
        const lines = (el.text || '').split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, el.x, el.y + (i * el.brushSize * 5));
        });
      } else if (el.type === 'image' && el.image) {
        ctx.drawImage(el.image, el.x, el.y, el.width || 100, el.height || 100);
      }

      if (el.id === selectedElementId) {
        ctx.setLineDash([5, 5]); ctx.strokeStyle = '#0F766E'; ctx.lineWidth = 1 / scale;
        let bx = el.x, by = el.y, bw = el.width || 0, bh = el.height || 0;
        if (el.points) {
           const xs = el.points.map(p => p.x); const ys = el.points.map(p => p.y);
           bx = Math.min(...xs); by = Math.min(...ys); bw = Math.max(...xs) - bx; bh = Math.max(...ys) - by;
        } else if (el.type === 'text') {
           const lines = (el.text || '').split('\n');
           bw = Math.max(...lines.map(l => l.length)) * el.brushSize * 2.5;
           bh = lines.length * el.brushSize * 5;
           if (el.textAlign === 'center') bx -= bw/2;
           else if (el.textAlign === 'right') bx -= bw;
        }
        ctx.strokeRect(bx - 5, by - 5, bw + 10, bh + 10); ctx.setLineDash([]);
      }
    });
    ctx.restore();
  }, [elements, currentElement, selectedElementId, pan, scale, showGrid, editingText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) { canvas.width = parent.clientWidth; canvas.height = parent.clientHeight; render(); }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [render]);

  useEffect(() => { render(); }, [render]);

  // Inline Text Editor Lifecycle
  useEffect(() => {
    if (editingText && textInputRef.current) {
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editingText]);

  const handleFinishText = () => {
    if (!editingText) return;
    
    if (editingText.value.trim() === '') {
      setElements(elements.filter(el => el.id !== editingText.id));
    } else {
      const newElements = elements.map(el => 
        el.id === editingText.id ? { ...el, text: editingText.value } : el
      );
      setElements(newElements);
      saveToHistory(newElements);
    }
    setEditingText(null);
  };

  // Sync selected element properties to sidebar
  useEffect(() => {
    if (selectedElementId) {
      const el = elements.find(e => e.id === selectedElementId);
      if (el) {
        setColor(el.color);
        setBrushSize(el.brushSize);
        if (el.type === 'text') {
          setFontFamily(el.fontFamily || 'Inconsolata, monospace');
          setFontWeight(el.fontWeight || 'normal');
          setFontStyle(el.fontStyle || 'normal');
          setTextAlign(el.textAlign || 'left');
        }
      }
    }
  }, [selectedElementId, elements]);

  const updateSelectedProperty = (key: string, value: any) => {
    if (!selectedElementId) return;
    const newElements = elements.map(el => 
      el.id === selectedElementId ? { ...el, [key]: value } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left - pan.x) / scale, y: (e.clientY - rect.top - pan.y) / scale };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingText) { handleFinishText(); return; }

    const { x, y } = getCanvasCoords(e);
    if (tool === 'hand') { setIsDrawing(true); return; }

    if (tool === 'selection') {
      const found = [...elements].reverse().find(el => {
        let bx = el.x, by = el.y, bw = el.width || 0, bh = el.height || 0;
        if (el.points) {
           const xs = el.points.map(p => p.x); const ys = el.points.map(p => p.y);
           bx = Math.min(...xs); by = Math.min(...ys); bw = Math.max(...xs) - bx; bh = Math.max(...ys) - by;
        } else if (el.type === 'text') {
           const lines = (el.text || '').split('\n');
           bw = Math.max(...lines.map(l => l.length)) * el.brushSize * 2.5;
           bh = lines.length * el.brushSize * 5;
           if (el.textAlign === 'center') bx -= bw/2; else if (el.textAlign === 'right') bx -= bw;
        }
        return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
      });
      setSelectedElementId(found?.id || null);
      
      // Double click to edit text logic could go here
      return;
    }

    setIsDrawing(true);
    const id = Math.random().toString(36).substr(2, 9);
    
    if (tool === 'pencil' || tool === 'curvedArrow') {
      setCurrentElement({ id, type: tool, x, y, points: [{ x, y }], color, brushSize });
    } else if (['rectangle', 'circle', 'arrow'].includes(tool)) {
      setCurrentElement({ id, type: tool as any, x, y, width: 0, height: 0, color, brushSize });
    } else if (tool === 'text') {
      const newEl: Element = { 
        id, type: 'text', x, y, text: '', color, brushSize, 
        fontFamily, fontWeight, fontStyle, textAlign 
      };
      setElements([...elements, newEl]);
      setEditingText({ id, x, y, value: '' });
      setSelectedElementId(id);
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    if (tool === 'hand') { setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY })); return; }
    if (!currentElement) return;
    const { x, y } = getCanvasCoords(e);
    if (currentElement.type === 'pencil' || currentElement.type === 'curvedArrow') {
      const lastPoint = currentElement.points![currentElement.points!.length - 1];
      if (Math.hypot(x - lastPoint.x, y - lastPoint.y) > 3) {
        setCurrentElement({ ...currentElement, points: [...(currentElement.points || []), { x, y }] });
      }
    } else {
      setCurrentElement({ ...currentElement, width: x - currentElement.x, height: y - currentElement.y });
    }
  };

  const handleMouseUp = () => {
    if (currentElement) { const newElements = [...elements, currentElement]; setElements(newElements); saveToHistory(newElements); }
    setCurrentElement(null); setIsDrawing(false);
  };

  const saveToHistory = (newElements: Element[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]); setHistory(newHistory); setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => { if (historyIndex > 0) { setElements(history[historyIndex - 1]); setHistoryIndex(historyIndex - 1); } else if (historyIndex === 0) { setElements([]); setHistoryIndex(-1); } };
  const redo = () => { if (historyIndex < history.length - 1) { setElements(history[historyIndex + 1]); setHistoryIndex(historyIndex + 1); } };
  const clearCanvas = () => { if (confirm('Clear entire canvas?')) { setElements([]); saveToHistory([]); setSelectedElementId(null); } };
  const exportCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a'); link.download = `eulerfold-design.png`; link.href = dataUrl; link.click();
  };

  const handleImportImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const newElements = [...elements, { 
          id, type: 'image', x: 50, y: 50, width: 200, height: (200 / img.width) * img.height, 
          image: img, color: '', brushSize: 0 
        }];
        setElements(newElements);
        saveToHistory(newElements);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background animate-in fade-in duration-500 overflow-hidden">
      <div className="h-9 border-b border-border flex items-center justify-between px-6 bg-background z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-sidebar/40 p-0.5 border border-border">
             {[
               { id: 'selection', icon: MousePointer2, label: 'Select' },
               { id: 'hand', icon: Hand, label: 'Pan' },
               { id: 'pencil', icon: Pencil, label: 'Draw' },
               { id: 'rectangle', icon: Square, label: 'Box' },
               { id: 'circle', icon: Circle, label: 'Circle' },
               { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
               { id: 'curvedArrow', icon: Spline, label: 'Bent Arrow' },
               { id: 'text', icon: TypeIcon, label: 'Text' },
             ].map((t) => (
               <button 
                 key={t.id}
                 onClick={() => { setTool(t.id as any); setSelectedElementId(null); }}
                 className={`p-1.5 transition-all ${tool === t.id ? 'bg-teal-700 text-white shadow-sm' : 'hover:bg-sidebar text-text-muted opacity-60 hover:opacity-100'}`} 
                 title={t.label}
               >
                  <t.icon className="w-3 h-3" />
               </button>
             ))}
             <div className="h-3 w-[1px] bg-border mx-1" />
             <button onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-sidebar text-text-muted opacity-60 hover:opacity-100 transition-all" title="Import Image">
                <Upload className="w-3 h-3" />
             </button>
          </div>

          <div className="flex items-center gap-1">
             <button onClick={undo} disabled={historyIndex < 0} className="p-1.5 hover:bg-sidebar text-text-muted disabled:opacity-20"><Undo2 className="w-3 h-3" /></button>
             <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-sidebar text-text-muted disabled:opacity-20"><Redo2 className="w-3 h-3" /></button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 border border-border transition-all ${showGrid ? 'bg-teal-700/10 text-teal-700 border-teal-700/20' : 'text-text-muted opacity-40'}`} title="Toggle Grid"><Grid3X3 className="w-3 h-3" /></button>
           <div className="flex items-center bg-sidebar/40 p-0.5 border border-border gap-1 mr-2">
              <button onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))} className="p-1 hover:bg-background text-text-muted transition-all"><ZoomOut className="w-3 h-3" /></button>
              <span className="inconsolata-ui text-[9px] font-bold w-8 text-center text-text-heading">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(prev => Math.min(5, prev + 0.1))} className="p-1 hover:bg-background text-text-muted transition-all"><ZoomIn className="w-3 h-3" /></button>
           </div>
           <button onClick={clearCanvas} className="flex items-center gap-2 px-3 py-1 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all text-[9px] font-bold uppercase tracking-widest inconsolata-ui"><Trash2 className="w-3 h-3" /> Clear</button>
           <button onClick={exportCanvas} className="flex items-center gap-2 px-4 py-1 bg-teal-800 text-white hover:bg-teal-900 transition-all text-[9px] font-bold uppercase tracking-widest shadow-md"><Download className="w-3 h-3" /> Export</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <aside className="w-60 border-r border-border bg-sidebar/10 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
           <div className="p-4 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                 <Settings2 className="w-3.5 h-3.5 text-teal-700" />
                 <span className="inconsolata-ui text-[10px] font-black uppercase tracking-widest">Properties</span>
              </div>
              
              <div>
                 <label className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase mb-2 block">Color</label>
                 <div className="grid grid-cols-5 gap-1.5">
                    {['#000000', '#0F766E', '#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#6B7280', '#ffffff'].map(c => (
                       <button key={c} onClick={() => { setColor(c); updateSelectedProperty('color', c); }} className={`w-6 h-6 border ${color === c ? 'ring-2 ring-teal-700 scale-110' : 'border-border'} transition-all`} style={{ backgroundColor: c }} />
                    ))}
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase">Size</label>
                    <span className="inconsolata-ui text-[10px] font-bold text-teal-700">{brushSize}px</span>
                 </div>
                 <input type="range" min="1" max="40" value={brushSize} onChange={(e) => { const v = parseInt(e.target.value); setBrushSize(v); updateSelectedProperty('brushSize', v); }} className="w-full accent-teal-700 h-1 bg-sidebar rounded-none appearance-none cursor-pointer" />
              </div>

              {(tool === 'text' || (selectedElementId && elements.find(e => e.id === selectedElementId)?.type === 'text')) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                   <div className="h-[1px] bg-border w-full" />
                   <div>
                      <label className="inconsolata-ui text-[9px] font-bold text-text-muted uppercase mb-2 block">Font Family</label>
                      <select 
                        value={fontFamily} 
                        onChange={(e) => { setFontFamily(e.target.value); updateSelectedProperty('fontFamily', e.target.value); }}
                        className="w-full bg-background border border-border p-2 inconsolata-ui text-[11px] font-bold outline-none"
                      >
                         <option value="Inconsolata, monospace">Monospace</option>
                         <option value="Manrope, sans-serif">Sans Serif</option>
                         <option value="serif">Serif</option>
                      </select>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <button onClick={() => { const v = fontWeight === 'bold' ? 'normal' : 'bold'; setFontWeight(v); updateSelectedProperty('fontWeight', v); }} className={`flex-1 p-2 border border-border transition-all ${fontWeight === 'bold' ? 'bg-teal-700 text-white border-teal-700' : 'hover:bg-sidebar text-text-muted'}`}><Bold className="w-3.5 h-3.5 mx-auto" /></button>
                      <button onClick={() => { const v = fontStyle === 'italic' ? 'normal' : 'italic'; setFontStyle(v); updateSelectedProperty('fontStyle', v); }} className={`flex-1 p-2 border border-border transition-all ${fontStyle === 'italic' ? 'bg-teal-700 text-white border-teal-700' : 'hover:bg-sidebar text-text-muted'}`}><Italic className="w-3.5 h-3.5 mx-auto" /></button>
                   </div>
                   <div className="flex items-center gap-1.5">
                      {[
                        { id: 'left', icon: AlignLeft },
                        { id: 'center', icon: AlignCenter },
                        { id: 'right', icon: AlignRight }
                      ].map(a => (
                        <button key={a.id} onClick={() => { setTextAlign(a.id as any); updateSelectedProperty('textAlign', a.id); }} className={`flex-1 p-2 border border-border transition-all ${textAlign === a.id ? 'bg-teal-700 text-white border-teal-700' : 'hover:bg-sidebar text-text-muted'}`}><a.icon className="w-3.5 h-3.5 mx-auto" /></button>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </aside>

        <div ref={containerRef} className="flex-1 relative cursor-crosshair overflow-hidden bg-background">
           <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="absolute inset-0 z-10" />
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImportImage} />
           
           {editingText && (
             <textarea
               ref={textInputRef}
               value={editingText.value}
               placeholder="Type something..."
               onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
               onBlur={handleFinishText}
               onMouseDown={(e) => e.stopPropagation()}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleFinishText();
                 if (e.key === 'Escape') handleFinishText();
               }}
               className="absolute z-30 bg-white/10 border border-teal-700/30 outline-none resize-none p-1 overflow-hidden select-text min-w-[150px] shadow-lg backdrop-blur-[2px]"
               style={{
                 left: editingText.x * scale + pan.x,
                 top: editingText.y * scale + pan.y,
                 fontFamily: fontFamily,
                 fontSize: `${Math.max(brushSize * 4, 12) * scale}px`,
                 fontWeight: fontWeight,
                 fontStyle: fontStyle,
                 color: color,
                 textAlign: textAlign,
                 transform: textAlign === 'center' ? 'translateX(-50%)' : textAlign === 'right' ? 'translateX(-100%)' : 'none',
                 minHeight: '1.2em',
                 lineHeight: '1.2'
               }}
             />
           )}

           {elements.length === 0 && !currentElement && !editingText && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-10">
                 <Sparkles className="w-8 h-8 text-teal-700 mb-4" />
                 <p className="inconsolata-ui text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">Infinite Canvas</p>
                 <p className="manrope-body text-[10px] text-text-muted mt-1 italic">Ctrl+Scroll to Zoom | Drag to Pan | Type to Design</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DesignPilot;
