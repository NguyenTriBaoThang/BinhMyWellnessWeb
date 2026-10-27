import type { SeasonId } from '@/lib/seasons';

const palettes: Record<SeasonId, { surface: string; accent: string; ink: string; mid: string }> = {
  spring: { surface: '#EAF4EB', accent: '#40916C', ink: '#174C3C', mid: '#A9CCB4' },
  summer: { surface: '#FFF4D9', accent: '#D6A545', ink: '#72521D', mid: '#E6C778' },
  autumn: { surface: '#F8EAE2', accent: '#C77952', ink: '#6E4534', mid: '#DCA58A' },
  winter: { surface: '#E6F2F2', accent: '#35858B', ink: '#24585D', mid: '#9BC8C7' },
};

export default function SeasonArtwork({ season, className = '' }: { season: SeasonId; className?: string }) {
  const color = palettes[season];

  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ backgroundColor: color.surface }} aria-hidden="true">
      <svg viewBox="0 0 720 480" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect width="720" height="480" fill={color.surface} />
        <circle cx="550" cy="116" r="58" fill={color.accent} opacity=".15" />
        <path d="M0 274C110 224 182 262 281 229C396 191 506 212 720 156V480H0Z" fill={color.mid} opacity=".52" />
        <path d="M0 322C125 278 231 321 338 285C470 240 583 279 720 224V480H0Z" fill={color.accent} opacity=".32" />
        {season === 'spring' && <>
          <path d="M-30 362C96 314 186 360 280 332C380 303 479 338 750 270V510H-30Z" fill="#6EB4A1" />
          <path d="M-30 391C75 352 161 398 259 367C363 334 477 375 750 306" fill="none" stroke="#F7F4EA" strokeWidth="9" opacity=".85" />
          <path d="M0 421C115 383 171 424 284 393C403 360 531 403 720 351" fill="none" stroke="#35858B" strokeWidth="3" opacity=".55" />
          <path d="M132 291v-64m0 26c-27-11-35-30-39-46 26 1 41 12 48 30m-9 23c20-18 37-19 53-14-8 20-23 32-45 35" fill="none" stroke={color.ink} strokeWidth="7" strokeLinecap="round" />
          <path d="M486 350c30-12 65-11 94 0l-19 16h-62z" fill="#F7F4EA" />
          <path d="M530 347v-35l20 34" fill={color.accent} />
        </>}
        {season === 'summer' && <>
          <path d="M94 334c6-82 54-137 124-143 73 7 113 65 118 143z" fill={color.ink} opacity=".82" />
          <path d="M127 337c8-55 37-93 91-101 51 7 81 45 87 101z" fill="#B6C995" />
          <path d="M217 237v163" stroke="#75533A" strokeWidth="12" />
          <circle cx="372" cy="300" r="18" fill="#D87952" /><circle cx="418" cy="279" r="18" fill="#E7A45A" />
          <circle cx="467" cy="308" r="18" fill="#C95F42" /><circle cx="384" cy="348" r="17" fill="#E7A45A" />
          <path d="M355 292c10-13 19-15 28-14m23-7c10-14 19-16 28-14m27 40c11-13 20-15 29-14" fill="none" stroke={color.ink} strokeWidth="5" strokeLinecap="round" />
          <path d="M80 400h560" stroke="#A87843" strokeWidth="10" strokeLinecap="round" opacity=".55" />
        </>}
        {season === 'autumn' && <>
          <path d="M142 355h320l-28 72H170z" fill={color.ink} opacity=".9" />
          <path d="M195 355c0-74 35-125 106-125s105 51 105 125" fill="#F4D8C6" stroke={color.accent} strokeWidth="12" />
          <path d="M242 289h118M230 321h142" stroke={color.accent} strokeWidth="8" strokeLinecap="round" opacity=".7" />
          <path d="M527 347c-28-27-33-58-13-83 32 15 45 41 38 73m7-6c2-38 20-62 52-69 8 37-4 64-39 83" fill={color.mid} />
          <path d="M555 338v72" stroke={color.ink} strokeWidth="8" strokeLinecap="round" />
          <circle cx="504" cy="226" r="10" fill={color.accent} opacity=".6" /><circle cx="572" cy="201" r="7" fill={color.accent} opacity=".45" />
        </>}
        {season === 'winter' && <>
          <path d="M0 352c129-58 215-33 333-62 129-32 222-12 387-63v253H0z" fill="#8EBB8C" />
          <path d="M0 394c142-51 218-27 349-54 142-29 239-11 371-50v190H0z" fill="#6D9B69" />
          <path d="M130 388v-104m0 16-31-28m31 52 31-29m-31 58-31-28m31 51 31-28m174 32V250m0 20-34-31m34 60 34-31m-34 60-34-31m34 60 34-31" fill="none" stroke={color.ink} strokeWidth="8" strokeLinecap="round" />
          <path d="M468 393V278m0 21-29-27m29 53 29-27m-29 54-29-27m29 54 29-27" fill="none" stroke="#54764E" strokeWidth="8" strokeLinecap="round" />
          <path d="M0 438h720" stroke="#F7F4EA" strokeWidth="8" opacity=".65" />
        </>}
        <path d="M0 455c153-22 268-13 390 0 115 12 221 15 330-2" fill="none" stroke={color.ink} strokeWidth="2" opacity=".18" />
      </svg>
    </div>
  );
}
