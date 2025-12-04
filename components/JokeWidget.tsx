import React, { useState, useEffect, useRef } from 'react';
import { Smile, Frown, Sparkles, Snowflake, RefreshCw } from 'lucide-react';
import { playFocusSound, playCommitSound } from '../services/soundService';

const JOKES = [
  "有一天0跟8在街上吵架，0骂8：'胖就胖呗，还扎腰带！'",
  "为什么企鹅只有肚子是白的？因为手短洗不到后背。",
  "虾和蚌同时考了一百分，老师问虾：'你抄谁的？' 虾说：'我抄蚌的。' 老师：'你棒什么棒？'",
  "有一根火柴头痒痒，它挠啊挠，然后着火了。去医院包扎后变成了棉签。",
  "小明问爸爸：'爸爸，我是不是傻孩子啊？' 爸爸说：'傻孩子，你怎么会是傻孩子呢？'",
  "吸血鬼喜欢吃辣吗？不喜欢，因为他们喜欢 'Blood' (不辣的)。",
  "为什么飞机飞这么高？因为飞低了会撞到星星啊 (开玩笑，为了省油)。",
  "诸葛亮：'风起！' 周瑜：'你开空调了？'",
  "王老吉和加多宝打架，打得头破血流，这个时候谁来了？派出所民警（老干妈/严正以待）。不，是绿巨人（绿茶）。",
  "有的歌听前奏就喜欢，有的人看第一眼就心动。而我不一样，我做题第一眼就想放弃。",
  "今天走在路上看到一块钱，刚想捡，结果发现是陷阱，旁边草丛跳出来个大汉说：'惊不惊喜，意不意外？' 我：'......'",
  "为什么海鸥喜欢飞在海边？因为如果飞在湾边，它们就成了'Bagels' (Bay-gulls)。",
  "所有的东西都会变老，只有什么不会？照片。",
  "如果你的左眼跳财，右眼跳灾。那两个眼皮一起跳呢？说明你该睡觉了。",
  "从前有座山，山里有座庙，庙里有个老和尚给小和尚讲故事：'从前有座山...'",
  "你知道星星有多重吗？8克。因为星巴克 (Starbucks)。",
  "历史上谁跑得最快？曹操。因为'说曹操，曹操到'。",
  "香草味和巧克力味的冰淇淋打架，巧克力味输了。为什么？因为它没'香' (没想) 到。",
  "小明上课睡觉被抓，老师问他：'你为什么睡觉？' 小明：'梦到我在听课。'",
  "三分熟的牛排碰到七分熟的牛排，为什么它们不打招呼？因为它们不熟。",
  "为什么大雁秋天要往南飞？因为走过去太远了。",
  "透明人去医院看病，医生说：'我很清楚你的情况。' (I see right through you)",
  "花儿为什么会笑？因为它有梗。",
  "布和纸怕什么？布怕一万，纸怕万一 (不/纸)。",
  "麒麟飞到了北极会变成什么？冰淇淋 (冰麒麟)。",
  "把大象装进冰箱需要几步？三步。打开冰箱，放进大象，关上冰箱。",
  "有一只公鹿越跑越快，最后变成了什么？高速公鹿。",
  "包子最怕什么？豆。因为豆沙包 (豆杀包)。",
  "达芬奇密码的上面是什么？达芬奇账号。",
  "键盘上哪个键最帅？F4。",
  "什么动物最容易被贴在墙上？海报 (海豹)。",
  "方便面去逛街，被水泼了一身，然后它就变成了拉面（烫卷了）。"
];

export const JokeWidget: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [reaction, setReaction] = useState<'laugh' | 'cold' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextJoke = () => {
    setAnimating(true);
    setTimeout(() => {
      setIndex(prev => (prev + 1) % JOKES.length);
      setAnimating(false);
      setReaction(null);
    }, 300);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    timerRef.current = setInterval(nextJoke, 5 * 60 * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleManualRefresh = () => {
    playFocusSound();
    nextJoke();
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(nextJoke, 5 * 60 * 1000);
    }
  };

  const handleVote = (type: 'laugh' | 'cold') => {
    playCommitSound();
    setReaction(type);
    
    // Auto switch after a short delay showing reaction
    setTimeout(() => {
       handleManualRefresh();
    }, 1200);
  };

  return (
    <div className="mx-4 mt-2 mb-4 bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
       {/* Background Effects */}
       {reaction === 'laugh' && <div className="absolute inset-0 bg-orange-100/60 animate-pulse z-0 transition-colors duration-500"></div>}
       {reaction === 'cold' && <div className="absolute inset-0 bg-cyan-100/60 animate-pulse z-0 transition-colors duration-500"></div>}

       <div className="relative z-10">
          <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce" style={{ animationDuration: '2s' }}>🎪</span>
                <span className="text-sm font-bold text-slate-700">每日笑话</span>
             </div>
             <button 
               onClick={handleManualRefresh} 
               className="p-1.5 bg-white/60 hover:bg-white rounded-full text-slate-400 hover:text-violet-600 transition-all hover:rotate-180 duration-500 shadow-sm"
               title="换一个"
             >
                <RefreshCw size={14} />
             </button>
          </div>

          <div className={`min-h-[80px] flex items-center justify-center transition-all duration-300 ${animating ? 'opacity-0 transform -translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
             <p className="text-sm text-slate-600 leading-relaxed font-medium text-center">
               {JOKES[index]}
             </p>
          </div>

          {/* Interaction Area */}
          <div className="flex gap-3 mt-4">
             <button 
               onClick={() => handleVote('laugh')}
               disabled={!!reaction}
               className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all transform active:scale-95 border group/btn
                  ${reaction === 'laugh' ? 'bg-orange-500 text-white border-orange-500 shadow-lg scale-105' : 'bg-white border-purple-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'}
               `}
             >
                {reaction === 'laugh' ? <Sparkles size={16} className="animate-spin" /> : <Smile size={16} className="group-hover/btn:scale-110 transition-transform"/>}
                爆笑
             </button>
             
             <button 
               onClick={() => handleVote('cold')}
               disabled={!!reaction}
               className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all transform active:scale-95 border group/btn
                  ${reaction === 'cold' ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105' : 'bg-white border-purple-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200'}
               `}
             >
                {reaction === 'cold' ? <Snowflake size={16} className="animate-spin" /> : <Frown size={16} className="group-hover/btn:scale-110 transition-transform"/>}
                好冷
             </button>
          </div>
       </div>

       {/* Floating Particles for Reaction */}
       {reaction === 'laugh' && (
          <div className="pointer-events-none">
            <div className="absolute bottom-2 left-1/4 text-2xl animate-float-up-sway opacity-0" style={{ animationDelay: '0s' }}>😂</div>
            <div className="absolute bottom-4 right-1/4 text-2xl animate-float-up-sway opacity-0" style={{ animationDelay: '0.2s' }}>🤣</div>
            <div className="absolute bottom-10 left-1/2 text-2xl animate-float-up-sway opacity-0" style={{ animationDelay: '0.4s' }}>🔥</div>
          </div>
       )}
       {reaction === 'cold' && (
          <div className="pointer-events-none">
            <div className="absolute bottom-2 left-1/4 text-2xl animate-float-up-sway opacity-0 text-cyan-500" style={{ animationDelay: '0s' }}>❄️</div>
            <div className="absolute bottom-4 right-1/4 text-2xl animate-float-up-sway opacity-0 text-cyan-500" style={{ animationDelay: '0.2s' }}>🥶</div>
            <div className="absolute bottom-10 left-1/2 text-2xl animate-float-up-sway opacity-0 text-cyan-500" style={{ animationDelay: '0.4s' }}>🐧</div>
          </div>
       )}
    </div>
  );
};