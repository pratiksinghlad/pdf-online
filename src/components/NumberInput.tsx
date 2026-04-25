import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NumberInputProps {
    id?: string;
    value: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    isInvalid?: boolean;
    'aria-label'?: string;
    onChange: (value: number) => void;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const BRAND        = '#e53e3e';
const BRAND_LIGHT  = '#fff5f5';
const BRAND_ACTIVE = '#fed7d7';
const BORDER_IDLE  = 'rgba(0,0,0,0.13)';
const BORDER_ERROR = '#e53e3e';
const DIVIDER      = 'rgba(0,0,0,0.09)';

// ---------------------------------------------------------------------------
// Stepper button (native <button> — reliable on all devices)
// ---------------------------------------------------------------------------

interface StepBtnProps {
    label: string;
    disabled: boolean;
    onStep: () => void;
    children: React.ReactNode;
}

function StepBtn({ label, disabled, onStep, children }: StepBtnProps) {
    const repeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [pressed, setPressed] = useState(false);

    const startRepeat = useCallback(() => {
        if (disabled) return;
        onStep(); // immediate first step
        timeoutRef.current = setTimeout(() => {
            repeatRef.current = setInterval(onStep, 80);
        }, 350); // start repeating after 350 ms hold
    }, [disabled, onStep]);

    const stopRepeat = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (repeatRef.current) clearInterval(repeatRef.current);
        timeoutRef.current = null;
        repeatRef.current = null;
        setPressed(false);
    }, []);

    // Clean up on unmount
    useEffect(() => () => stopRepeat(), [stopRepeat]);

    const bg = disabled
        ? 'transparent'
        : pressed
          ? BRAND_ACTIVE
          : undefined;

    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); setPressed(true); startRepeat(); }}
            onMouseUp={stopRepeat}
            onMouseLeave={stopRepeat}
            onTouchStart={(e) => { e.preventDefault(); setPressed(true); startRepeat(); }}
            onTouchEnd={stopRepeat}
            onTouchCancel={stopRepeat}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                minWidth: '40px',
                height: '44px',
                border: 'none',
                background: bg ?? 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? 'rgba(0,0,0,0.22)' : BRAND,
                flexShrink: 0,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                transition: 'background 0.12s, color 0.12s',
                outline: 'none',
                padding: 0,
                borderRadius: 0,
            }}
            onFocus={(e) => { (e.currentTarget.style.background = disabled ? 'transparent' : BRAND_LIGHT); }}
            onBlur={(e)  => { (e.currentTarget.style.background = 'transparent'); }}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------
// NumberInput
// ---------------------------------------------------------------------------

/**
 * Reliable numeric stepper:
 * - Native <button> elements — click always works on mobile & desktop
 * - Press-and-hold auto-repeat
 * - String internal state so mid-typing (e.g. "1" before "12") works
 * - Clamps & validates on blur
 * - Blocks non-numeric keys
 * - Red brand focus ring
 */
export function NumberInput({
    id,
    value,
    min = 1,
    max = 9999,
    disabled = false,
    isInvalid = false,
    onChange,
    'aria-label': ariaLabel,
}: NumberInputProps) {
    // Internal string so user can type freely without the value snapping mid-digit
    const [raw, setRaw] = useState(String(value));
    const [prevValue, setPrevValue] = useState(value);
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync raw string with value prop if it changes externally while not focused
    if (value !== prevValue) {
        setPrevValue(value);
        if (!focused) {
            setRaw(String(value));
        }
    }

    // ── handlers ──────────────────────────────────────────────────────────

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const nav = ['Backspace','Delete','Tab','Escape','Enter',
                     'ArrowLeft','ArrowRight','Home','End'];
        if (nav.includes(e.key)) return;
        if (e.key === 'ArrowUp')   { e.preventDefault(); onChange(Math.min(max, value + 1)); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(min, value - 1)); return; }
        if (e.key >= '0' && e.key <= '9') return;
        e.preventDefault();
    }, [value, min, max, onChange]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value.replace(/[^0-9]/g, ''); // strip non-digits
        setRaw(text);
        const parsed = parseInt(text, 10);
        if (!isNaN(parsed)) onChange(parsed);
    }, [onChange]);

    const handleBlur = useCallback(() => {
        setFocused(false);
        const parsed = parseInt(raw, 10);
        const clamped = isNaN(parsed) ? min : Math.min(max, Math.max(min, parsed));
        setRaw(String(clamped));
        onChange(clamped);
    }, [raw, min, max, onChange]);

    const handleFocus = useCallback(() => setFocused(true), []);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        if (!/^\d+$/.test(text)) e.preventDefault();
    }, []);

    // ── stepper callbacks ──────────────────────────────────────────────────

    const decrement = useCallback(() => {
        const next = Math.max(min, value - 1);
        onChange(next);
        setRaw(String(next));
    }, [value, min, onChange]);

    const increment = useCallback(() => {
        const next = Math.min(max, value + 1);
        onChange(next);
        setRaw(String(next));
    }, [value, max, onChange]);

    // ── styles ─────────────────────────────────────────────────────────────

    const borderColor = isInvalid ? BORDER_ERROR : focused ? BRAND : BORDER_IDLE;
    const boxShadow   = focused
        ? isInvalid
          ? '0 0 0 3px rgba(229,62,62,0.20)'
          : '0 0 0 3px rgba(229,62,62,0.15)'
        : 'none';

    return (
        <div
            role="group"
            aria-invalid={isInvalid}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: `1.5px solid ${borderColor}`,
                borderRadius: '10px',
                background: disabled ? 'rgba(0,0,0,0.03)' : 'white',
                overflow: 'hidden',
                opacity: disabled ? 0.55 : 1,
                boxShadow,
                transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
        >
            {/* − button */}
            <StepBtn label="Decrease value" disabled={disabled || value <= min} onStep={decrement}>
                {/* Minus SVG — no lucide dependency issues */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </StepBtn>

            {/* Divider */}
            <div style={{ width: '1px', height: '22px', background: DIVIDER, flexShrink: 0 }} />

            {/* Input */}
            <input
                ref={inputRef}
                id={id}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={raw}
                disabled={disabled}
                aria-label={ariaLabel}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onPaste={handlePaste}
                style={{
                    /* Responsive: shrinks on mobile, comfortable on desktop */
                    width: 'clamp(40px, 12vw, 56px)',
                    height: '44px',
                    border: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '15px',
                    color: '#1a202c',
                    background: 'transparent',
                    fontFamily: 'inherit',
                    cursor: disabled ? 'not-allowed' : 'text',
                    // Hide browser spinners
                    appearance: 'textfield',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield',
                    padding: '0 2px',
                }}
            />

            {/* Divider */}
            <div style={{ width: '1px', height: '22px', background: DIVIDER, flexShrink: 0 }} />

            {/* + button */}
            <StepBtn label="Increase value" disabled={disabled || value >= max} onStep={increment}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5"  y1="12" x2="19" y2="12" />
                </svg>
            </StepBtn>
        </div>
    );
}

// ---------------------------------------------------------------------------
// LabeledNumberInput
// ---------------------------------------------------------------------------

export function LabeledNumberInput({
    label,
    ...props
}: NumberInputProps & { label: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
            <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#a0aec0',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.07em',
                userSelect: 'none',
                whiteSpace: 'nowrap',
            }}>
                {label}
            </span>
            <NumberInput {...props} />
        </div>
    );
}
