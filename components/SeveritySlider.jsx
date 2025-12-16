import { useState, useEffect } from 'react';

export default function SeveritySlider({ value, onChange, name = 'severity' }) {
    const [isShaking, setIsShaking] = useState(false);

    // Configuration for each level
    const getSeverityData = (level) => {
        if (level <= 2) return {
            emoji: "😌",
            text: "จิ๊บๆ ขำๆ",
            desc: "เรื่องเล็กน้อย เล่าสู่กันฟัง",
            color: "text-green-500",
            border: "border-green-500",
            track: "from-green-200 to-green-500"
        };
        if (level <= 4) return {
            emoji: "😅",
            text: "เริ่มตึงๆ",
            desc: "มีเหงื่อตกนิดหน่อย แต่ยังไหว",
            color: "text-yellow-500",
            border: "border-yellow-500",
            track: "from-green-300 via-yellow-300 to-yellow-500"
        };
        if (level <= 6) return {
            emoji: "😰",
            text: "งานเข้าแล้ว",
            desc: "สถานการณ์เริ่มไม่สู้ดี ต้องการกำลังใจ",
            color: "text-orange-500",
            border: "border-orange-500",
            track: "from-yellow-300 via-orange-400 to-orange-600"
        };
        if (level <= 8) return {
            emoji: "😭",
            text: "มรสุมชีวิต",
            desc: "หนักหนาสาหัส อยากระบายสุดๆ",
            color: "text-red-500",
            border: "border-red-500",
            track: "from-orange-400 via-red-500 to-red-600"
        };
        return {
            emoji: "🤯",
            text: "หายนะระดับชาติ",
            desc: "โลกแตก! ไม่ไหวแล้วโว้ยยย",
            color: "text-purple-600",
            border: "border-purple-600",
            track: "from-red-500 via-red-700 to-purple-800"
        };
    };

    const currentData = getSeverityData(value);

    // Trigger animation when value changes
    useEffect(() => {
        if (value >= 9) {
            setIsShaking(true);
            const timer = setTimeout(() => setIsShaking(false), 500);
            return () => clearTimeout(timer);
        }
    }, [value]);

    return (
        <div className={`space-y-3 bg-gray-50 p-4 rounded-xl border transition-all duration-300 ${isShaking ? 'animate-shake' : ''} ${currentData.border}`}>
            <div className="flex justify-between items-end">
                <label className="block text-gray-700 font-semibold">
                    ความรุนแรง (1-10)
                </label>
                <div className={`text-right transition-colors duration-300 ${currentData.color}`}>
                    <span className="text-sm font-medium opacity-80 block">{currentData.text}</span>
                </div>
            </div>

            <div className="relative py-2 pb-6 group">
                {/* Custom Track Background */}
                <div className={`absolute top-2 left-0 w-full h-3 rounded-full opacity-30 bg-gradient-to-r ${currentData.track}`}></div>

                <input
                    type="range"
                    name={name}
                    min="1"
                    max="10"
                    value={value}
                    onChange={onChange}
                    className={`relative z-20 w-full h-3 bg-transparent appearance-none cursor-pointer focus:outline-none slider-thumb-custom ${currentData.color}`}
                />
            </div>

            {/* Visual Feedback Area */}
            <div className="flex items-center gap-3 mt-2">
                <div key={value} className="text-4xl animate-pop-in filter drop-shadow-md transform hover:scale-110 transition-transform cursor-default">
                    {currentData.emoji}
                </div>
                <div className="flex-1">
                    <div className={`text-sm font-bold transition-colors duration-300 ${currentData.color}`}>
                        ระดับ {value}/10
                    </div>
                    <div className="text-xs text-gray-500 transition-all duration-300">
                        {currentData.desc}
                    </div>
                </div>
            </div>

            <style jsx>{`
                /* Custom Range Slider Styling */
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background: #ffffff;
                    margin-top: -9px; /* (24px - 6px) / 2 = 9px */
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: 4px solid currentColor;
                    transition: transform 0.1s ease-in-out;
                    color: inherit;
                }
                
                /* Applying specific color to the thumb border based on level */
                input[type=range].text-green-500::-webkit-slider-thumb { border-color: rgb(34 197 94); }
                input[type=range].text-yellow-500::-webkit-slider-thumb { border-color: rgb(234 179 8); }
                input[type=range].text-orange-500::-webkit-slider-thumb { border-color: rgb(249 115 22); }
                input[type=range].text-red-500::-webkit-slider-thumb { border-color: rgb(239 68 68); }
                input[type=range].text-purple-600::-webkit-slider-thumb { border-color: rgb(147 51 234); }

                input[type=range]::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }

                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 6px;
                    background: transparent; /* Handled by div behind */
                }

                /* Animations */
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }

                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }

                .animate-pop-in {
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
