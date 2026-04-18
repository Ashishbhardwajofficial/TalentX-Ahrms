import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Building2, Shield } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Floating Particles (same as LoginPage)
   ═══════════════════════════════════════════════════════════════ */
interface Particle {
  id: number; x: number; y: number; size: number;
  color: string; speedX: number; speedY: number;
  opacity: number; shape: 'circle' | 'square' | 'triangle';
}

const COLORS: string[] = ['#FF6B00', '#FFD700', '#8B5CF6', '#2196F3', '#ffffff'];
const SHAPES: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];
const randColor = (): string => COLORS[Math.floor(Math.random() * COLORS.length)] as string;
const randShape = (): 'circle' | 'square' | 'triangle' => SHAPES[Math.floor(Math.random() * SHAPES.length)] as 'circle' | 'square' | 'triangle';

const useParticles = (count: number) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animRef = useRef<number>(0);
  useEffect(() => {
    const init: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 6 + 2, color: randColor(),
      speedX: (Math.random() - 0.5) * 0.04, speedY: (Math.random() - 0.5) * 0.04,
      opacity: Math.random() * 0.5 + 0.15, shape: randShape(),
    }));
    setParticles(init);
    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p, x: ((p.x + p.speedX + 100) % 100), y: ((p.y + p.speedY + 100) % 100),
      })));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [count]);
  return particles;
};

/* ═══════════════════════════════════════════════════════════════
   3D Rotating Cube (same as LoginPage)
   ═══════════════════════════════════════════════════════════════ */
const RotatingCube: React.FC = () => {
  const [rotX, setRotX] = useState(20);
  const [rotY, setRotY] = useState(0);
  useEffect(() => {
    let frame: number; let angle = 0;
    const animate = () => {
      angle += 0.4; setRotY(angle); setRotX(20 + Math.sin(angle * 0.017) * 8);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);
  const faceStyle = (bg: string, transform: string): React.CSSProperties => ({
    position: 'absolute', width: '100%', height: '100%', background: bg,
    border: '1px solid rgba(255,255,255,0.15)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 28,
    fontWeight: 900, color: '#fff', fontFamily: 'Lexend, sans-serif',
    letterSpacing: '-0.04em', textShadow: '0 2px 8px rgba(0,0,0,0.4)',
    transform, backfaceVisibility: 'hidden',
  });
  return (
    <div style={{ perspective: 600, width: 90, height: 90 }}>
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        transition: 'transform 0.016s linear',
      }}>
        <div style={faceStyle('linear-gradient(135deg,#FFD700,#FF9A3C,#FF6B00)', 'translateZ(45px)')}>TX</div>
        <div style={faceStyle('linear-gradient(135deg,#8B5CF6,#6D28D9)', 'rotateY(180deg) translateZ(45px)')}>TX</div>
        <div style={faceStyle('linear-gradient(135deg,#2196F3,#1565C0)', 'rotateY(-90deg) translateZ(45px)')}>T</div>
        <div style={faceStyle('linear-gradient(135deg,#FF6B00,#E05A00)', 'rotateY(90deg) translateZ(45px)')}>X</div>
        <div style={faceStyle('linear-gradient(135deg,#FFF176,#FFD700)', 'rotateX(90deg) translateZ(45px)')}>✦</div>
        <div style={faceStyle('linear-gradient(135deg,#4C1D95,#2D0A00)', 'rotateX(-90deg) translateZ(45px)')}>✦</div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Orb
   ═══════════════════════════════════════════════════════════════ */
const Orb: React.FC<{ size: number; color: string; x: string; y: string; delay: number; blur: number }> =
  ({ size, color, x, y, delay, blur }) => (
    <div style={{
      position: 'absolute', left: x, top: y, width: size, height: size,
      borderRadius: '50%', background: color, filter: `blur(${blur}px)`,
      opacity: 0.35, animation: `orbFloat ${3 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`, pointerEvents: 'none',
    }} />
  );

/* ═══════════════════════════════════════════════════════════════
   Input Field Component
   ═══════════════════════════════════════════════════════════════ */
interface InputFieldProps {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ReactNode; focused: boolean;
  onFocus: () => void; onBlur: () => void;
  rightElement?: React.ReactNode;
}
const InputField: React.FC<InputFieldProps> = ({
  id, label, type, value, onChange, placeholder, icon, focused, onFocus, onBlur, rightElement
}) => (
  <div>
    <label style={{
      display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase' as const,
      color: focused ? '#A78BFA' : 'rgba(255,255,255,0.5)',
      transition: 'color 0.2s',
    }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: focused ? '#A78BFA' : 'rgba(255,255,255,0.3)',
        transition: 'color 0.2s', display: 'flex',
      }}>{icon}</div>
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus} onBlur={onBlur}
        placeholder={placeholder}
        className="login-input"
        style={{ paddingRight: rightElement ? 44 : undefined }}
      />
      {rightElement && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          {rightElement}
        </div>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Main Register Page
   ═══════════════════════════════════════════════════════════════ */
const RegisterPage: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const particles = useParticles(40);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setMousePos({
      x: ((e.clientX - cx) / (rect.width / 2)) * 8,
      y: -((e.clientY - cy) / (rect.height / 2)) * 8,
    });
  };

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-24px) scale(1.08); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(255,107,0,0.1); }
          50%     { box-shadow: 0 0 40px rgba(255,107,0,0.4), 0 0 80px rgba(139,92,246,0.2); }
        }
        @keyframes floatIn {
          from { opacity:0; transform: translateY(32px) scale(0.96); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes counterSpinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .login-input {
          width: 100%; padding: 14px 14px 14px 44px;
          border-radius: 14px; font-size: 14px; font-weight: 500;
          outline: none; transition: all 0.25s ease;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff; box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.35); }
        .login-input:focus {
          background: rgba(255,255,255,0.12);
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.2), 0 0 20px rgba(139,92,246,0.15);
        }
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:hover,
        .login-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0 1000px rgba(13,27,62,0.9) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        .register-btn {
          width: 100%; padding: 15px; border: none; border-radius: 14px;
          font-size: 15px; font-weight: 800; letter-spacing: 0.04em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #8B5CF6 0%, #FF6B00 100%);
          background-size: 200% 200%; color: #fff;
          box-shadow: 0 4px 20px rgba(139,92,246,0.4);
        }
        .register-btn:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,107,0,0.45);
        }
        .register-btn:active { transform: translateY(0) scale(0.98); }
        .register-btn::before {
          content: ''; position: absolute; top: -50%; left: -60%;
          width: 40%; height: 200%; background: rgba(255,255,255,0.18);
          transform: skewX(-20deg); transition: left 0.5s ease;
        }
        .register-btn:hover::before { left: 120%; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Full-screen background */}
      <div
        style={{
          minHeight: '100vh', width: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #060D1F 0%, #0D1B3E 35%, #1A0A3E 65%, #2D0A00 100%)',
          backgroundSize: '400% 400%', animation: 'gradientShift 12s ease infinite',
          padding: '20px',
        }}
      >
        {/* Orbs */}
        <Orb size={500} color="radial-gradient(circle,#8B5CF6,transparent)" x="-10%" y="-15%" delay={0} blur={60} />
        <Orb size={400} color="radial-gradient(circle,#FF6B00,transparent)" x="70%" y="60%" delay={1.5} blur={70} />
        <Orb size={300} color="radial-gradient(circle,#2196F3,transparent)" x="80%" y="-5%" delay={0.8} blur={55} />
        <Orb size={250} color="radial-gradient(circle,#FFD700,transparent)" x="5%" y="70%" delay={2} blur={50} />

        {/* Particles */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
          {particles.map(p => (
            p.shape === 'circle' ? (
              <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size} fill={p.color} opacity={p.opacity} />
            ) : p.shape === 'square' ? (
              <rect key={p.id} x={`${p.x}%`} y={`${p.y}%`} width={p.size * 2} height={p.size * 2} fill={p.color} opacity={p.opacity} transform={`rotate(45, ${p.x}, ${p.y})`} />
            ) : (
              <polygon key={p.id} points={`${p.x}%,${p.y - p.size * 0.5}% ${p.x - p.size * 0.5}%,${p.y + p.size * 0.5}% ${p.x + p.size * 0.5}%,${p.y + p.size * 0.5}%`} fill={p.color} opacity={p.opacity} />
            )
          ))}
        </svg>

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        {/* Card */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
          style={{
            width: '100%', maxWidth: 480, position: 'relative', zIndex: 10,
            perspective: 1000, animation: 'floatIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          <div style={{
            background: 'rgba(13,27,62,0.75)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 28, padding: '36px 36px 32px',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'borderGlow 4s ease-in-out infinite',
            transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
            transition: 'transform 0.12s ease', transformStyle: 'preserve-3d',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          }}>
            {/* Spinning rings */}
            <div style={{ position: 'absolute', inset: -2, borderRadius: 30, pointerEvents: 'none', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: -40, border: '1px solid rgba(139,92,246,0.2)', borderRadius: '50%', animation: 'spinRing 12s linear infinite' }} />
              <div style={{ position: 'absolute', inset: -20, border: '1px dashed rgba(255,107,0,0.15)', borderRadius: '50%', animation: 'counterSpinRing 8s linear infinite' }} />
            </div>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <RotatingCube />
              </div>
              <h1 style={{
                margin: '0 0 6px', fontSize: 30, fontWeight: 900,
                fontFamily: 'Lexend, sans-serif', letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #FFD700 0%, #FF9A3C 40%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}>
                Create Account
              </h1>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Join TalentX Platform
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                padding: '4px 14px', borderRadius: 99,
                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)',
              }}>
                <Sparkles style={{ width: 12, height: 12, color: '#A78BFA' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.1em' }}>
                  REGISTRATION PORTAL
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              padding: '20px 24px', borderRadius: 18, marginBottom: 24,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(255,107,0,0.08) 100%)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              {/* Icon row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
                {[
                  { icon: <User style={{ width: 20, height: 20 }} />, label: 'Profile', color: '#A78BFA' },
                  { icon: <Building2 style={{ width: 20, height: 20 }} />, label: 'Org', color: '#FF9A3C' },
                  { icon: <Shield style={{ width: 20, height: 20 }} />, label: 'Secure', color: '#42A5F5' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: `${item.color}18`, color: item.color,
                      border: `1px solid ${item.color}33`,
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Message */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
                  Registration is managed by your administrator
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  To create a new account, please contact your HR team or system administrator. They will set up your credentials and assign the appropriate access level.
                </p>
              </div>
            </div>

            {/* Contact Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { step: '01', text: 'Contact your HR department', color: '#A78BFA' },
                { step: '02', text: 'Provide your employee details', color: '#FF9A3C' },
                { step: '03', text: 'Receive login credentials via email', color: '#42A5F5' },
              ].map((item) => (
                <div key={item.step} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${item.color}20`, color: item.color,
                    fontSize: 11, fontWeight: 900, letterSpacing: '0.05em',
                    border: `1px solid ${item.color}33`,
                  }}>
                    {item.step}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Back to Login Button */}
            <Link
              to="/login"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <button className="register-btn">
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  Back to Sign In
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </span>
              </button>
            </Link>

            {/* Footer */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none', fontWeight: 700,
                    background: 'linear-gradient(90deg,#A78BFA,#FF9A3C)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Brand strip */}
            <div style={{
              marginTop: 24, paddingTop: 18,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', justifyContent: 'center', gap: 6,
            }}>
              {['#FF6B00', '#FFD700', '#2196F3', '#8B5CF6'].map((color, i) => (
                <div key={i} style={{ width: 28, height: 4, borderRadius: 99, background: color, opacity: 0.7 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
