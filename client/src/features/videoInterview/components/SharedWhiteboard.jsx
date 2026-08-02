import React, { useRef, useState, useEffect } from 'react';
import {
  Pencil,
  Eraser,
  Square,
  Circle as CircleIcon,
  RotateCcw,
  Trash2,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/common';

export const SharedWhiteboard = ({ socket, roomId }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser' | 'rect' | 'circle'
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(3);

  // Initialize Canvas Context & Socket Listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Handle Incoming Whiteboard Socket Events
    if (socket) {
      socket.on('whiteboard:draw', (drawData) => {
        handleRemoteDraw(drawData);
      });

      socket.on('whiteboard:clear', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    return () => {
      if (socket) {
        socket.off('whiteboard:draw');
        socket.off('whiteboard:clear');
      }
    };
  }, [socket]);

  // Handle Remote Draw Operations
  const handleRemoteDraw = ({ tool: remoteTool, color: remoteColor, lineWidth: remoteWidth, from, to }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.strokeStyle = remoteTool === 'eraser' ? '#0f172a' : remoteColor;
    ctx.lineWidth = remoteWidth;

    if (remoteTool === 'pen' || remoteTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (remoteTool === 'rect') {
      ctx.beginPath();
      ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
    } else if (remoteTool === 'circle') {
      const radius = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
      ctx.beginPath();
      ctx.arc(from.x, from.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    const pos = getCanvasCoordinates(e);
    startPosRef.current = pos;
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const currentPos = getCanvasCoordinates(e);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.save();
      ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.stroke();
      ctx.restore();

      // Emit Draw Action over Socket
      if (socket && roomId) {
        socket.emit('whiteboard:draw', {
          roomId,
          drawData: {
            tool,
            color,
            lineWidth,
            from: startPosRef.current,
            to: currentPos,
          },
        });
      }
      startPosRef.current = currentPos;
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const endPos = getCanvasCoordinates(e);

    if (tool === 'rect' || tool === 'circle') {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(
          startPosRef.current.x,
          startPosRef.current.y,
          endPos.x - startPosRef.current.x,
          endPos.y - startPosRef.current.y
        );
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(endPos.x - startPosRef.current.x, 2) + Math.pow(endPos.y - startPosRef.current.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPosRef.current.x, startPosRef.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();

      if (socket && roomId) {
        socket.emit('whiteboard:draw', {
          roomId,
          drawData: {
            tool,
            color,
            lineWidth,
            from: startPosRef.current,
            to: endPos,
          },
        });
      }
    }
  };

  const handleClearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (socket && roomId) {
      socket.emit('whiteboard:clear', { roomId });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `SkillBridge-Whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
      {/* WHITEBOARD TOOLBAR */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              tool === 'pen' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Pencil Tool"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              tool === 'rect' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              tool === 'circle' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Circle"
          >
            <CircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              tool === 'eraser' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  color === c ? 'scale-125 border-white shadow-md' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold">Width:</span>
            <input
              type="range"
              min="1"
              max="12"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 accent-brand-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearBoard}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all"
            title="Clear Board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
            title="Download PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="flex-1 relative bg-[#0f172a] cursor-crosshair flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full bg-slate-900 rounded-xl border border-slate-800 touch-none shadow-inner"
        />
      </div>
    </div>
  );
};
