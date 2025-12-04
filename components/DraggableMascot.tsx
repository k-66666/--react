import React, { useState, useEffect, useRef } from 'react';
import { playRandomMeow } from '../services/soundService';

interface Particle {
  id: string;
  type: string;
  left: number;
  rotation: number;
  scale: number;
  duration: number;
  color: string;
}

export const DraggableMascot: React.FC = () => {
  // Drag State
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 180 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Animation State
  const [particles, setParticles] = useState<Particle[]>([]);
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
    if (isDragging) return; 

    playRandomMeow();
    
    // Generate Random Particles
    const types = ['❤️', '⭐', '✨', '🎵', '🌸', '💖'];
    const colors = ['text-red-500', 'text-yellow-400', 'text-purple-400', 'text-blue-400', 'text-pink-400'];
    
    const newParticles: Particle[] = [];
    const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 particles

    for (let i = 0; i < count; i++) {
        newParticles.push({
            id: `${Date.now()}-${Math.random()}`,
            type: types[Math.floor(Math.random() * types.length)],
            left: (Math.random() * 80) - 40, // -40 to 40px spread
            rotation: (Math.random() * 60) - 30,
            scale: 0.8 + Math.random() * 0.7,
            duration: 1 + Math.random() * 0.8,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup particles
    setTimeout(() => {
       setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2000);

    // Jelly Animation
    setIsJelly(true);
    setTimeout(() => setIsJelly(false), 600);

    // Romantic Messages
    const msgs = [
      "喵~ (想你)", "抱抱~", "你最棒啦!", "累了吗? 揉揉~", 
      "今天也超级可爱!", "我在陪你哦~", "记得喝水水", 
      "mua~ 💋", "辛苦啦宝~", "想吃小鱼干...", "贴贴~",
      "下班带我回家?", "永远陪着你", "摸摸头~", "你是我的骄傲",
      "看见你就开心!", "呼噜噜~ (舒服)", "最喜欢你了!", 
      "加油加油!", "我们要发财啦!", "不要太累哦~"
    ];
    setMascotMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 6000);
  };

  return (
    <div 
      className="fixed z-[1000] cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative group">
        {/* Cat Image */}
        <div 
           className={`w-28 h-28 filter drop-shadow-2xl hover:drop-shadow-[0_10px_35px_rgba(167,139,250,0.5)] transition-all duration-300 ${isJelly ? 'animate-jelly' : 'animate-float'} hover:scale-105`} 
           onClick={handleClick}
        >
          <img 
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png" 
            alt="Cute Cat Mascot"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Particles */}
        {particles.map(p => (
          <div 
             key={p.id} 
             className={`absolute pointer-events-none animate-float-up-sway font-bold ${p.color}`} 
             style={{ 
                 left: '50%',
                 top: '10%',
                 marginLeft: `${p.left}px`,
                 fontSize: `${24 * p.scale}px`,
                 animationDuration: `${p.duration}s`,
                 transform: `rotate(${p.rotation}deg)`
             }}
          >
            {p.type}
          </div>
        ))}

        {/* Message Bubble */}
        {showBubble && (
          <div 
            className="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl rounded-bl-sm shadow-xl shadow-purple-200/50 border border-purple-100 text-sm font-bold text-violet-600 whitespace-nowrap animate-pop-in z-30 transform origin-bottom-left"
          >
            {mascotMsg}
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b border-r border-purple-100 transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};