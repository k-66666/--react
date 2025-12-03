
import React, { useState, useEffect, useRef } from 'react';
import { playRandomMeow } from '../services/soundService';

export const DraggableMascot: React.FC = () => {
  // Drag State
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Animation State
  const [hearts, setHearts] = useState<{id: number, left: number, animationDuration: number}[]>([]);
  const [isJelly, setIsJelly] = useState(false);
  const [mascotMsg, setMascotMsg] = useState("");
  const [showBubble, setShowBubble] = useState(false);

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Interaction Handler
  const handleClick = () => {
    if (isDragging) return; // Don't trigger click if dragging

    playRandomMeow();
    
    // Heart Particles
    const newHeart = {
      id: Date.now(),
      left: Math.random() * 60 - 30,
      animationDuration: 1 + Math.random()
    };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
       setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);

    // Jelly Animation
    setIsJelly(true);
    setTimeout(() => setIsJelly(false), 600);

    // Romantic Messages
    const msgs = [
      "喵~ (想你)", "抱抱~", "你最棒啦!", "累了吗? 揉揉~", 
      "今天也超级可爱!", "我在陪你哦~", "记得喝水水", 
      "mua~ 💋", "辛苦啦宝~", "想吃小鱼干...", "贴贴~",
      "下班带我回家?", "永远陪着你", "摸摸头~", "你是我的骄傲",
      "看见你就开心!", "呼噜噜~ (舒服)", "最喜欢你了!"
    ];
    setMascotMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 6000);
  };

  return (
    <div 
      className="fixed z-[1000] cursor-grab active:cursor-grabbing select-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        {/* Cat Emoji */}
        <div 
           className={`text-7xl filter drop-shadow-2xl hover:scale-110 transition-transform duration-200 ${isJelly ? 'animate-jelly' : 'animate-float'}`} 
           onClick={handleClick}
        >
          🐱
        </div>

        {/* Hearts */}
        {hearts.map(heart => (
          <div 
             key={heart.id} 
             className="absolute text-2xl pointer-events-none animate-float-up z-10 top-0" 
             style={{ left: `${heart.left}px`, animationDuration: `${heart.animationDuration}s` }}
          >
            ❤️
          </div>
        ))}

        {/* Message Bubble */}
        {showBubble && (
          <div 
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl rounded-bl-none shadow-xl border border-purple-100 text-sm font-bold text-violet-600 whitespace-nowrap animate-pop-in z-30"
          >
            {mascotMsg}
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b border-r border-purple-100 transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};
