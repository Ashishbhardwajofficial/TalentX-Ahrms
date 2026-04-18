import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { Eye, EyeOff, User, Lock, ArrowRight, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Floating 3D Particle
   ═══════════════════════════════════════════════════════════════ */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
  shape: 'circle' | 'square' | 'triangle';
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
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      color: randColor(),
      speedX: (Math.random() - 0.5) * 0.04,
      speedY: (Math.random() - 0.5) * 0.04,
      opacity: Math.random() * 0.5 + 0.15,
      shape: randShape(),
    }));
    setParticles(init);

    const animate = () => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: ((p.x + p.speedX + 100) % 100),
          y: ((p.y + p.speedY + 100) % 100),
        }))
      );
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [count]);

  return particles;
};

/* ═══════════════════════════════════════════════════════════════
   3D Rotating Cube (TalentX logo)
   ═══════════════════════════════════════════════════════════════ */
const RotatingCube: React.FC = () => {
  const [rotX, setRotX] = useState(20);
  const [rotY, setRotY] = useState(0);

  useEffect(() => {
    let frame: number;
    let angle = 0;
    const animate = () => {
      angle += 0.4;
      setRotY(angle);
      setRotX(20 + Math.sin(angle * 0.017) * 8);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const faceStyle = (bg: string, transform: string): React.CSSProperties => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: bg,
    border: '1px solid rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 900,
    color: '#fff',
    fontFamily: 'Lexend, sans-serif',
    letterSpacing: '-0.04em',
    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
    transform,
    backfaceVisibility: 'hidden',
  });

  return (
    <div style={{ perspective: 600, width: 90, height: 90 }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: 'transform 0.016s linear',
        }}
      >
        {/* Front */}
        <div style={faceStyle(
          'linear-gradient(135deg,#FFD700,#FF9A3C,#FF6B00)',
          'translateZ(45px)'
        )}>TX</div>
        {/* Back */}
        <div style={faceStyle(
          'linear-gradient(135deg,#8B5CF6,#6D28D9)',
          'rotateY(180deg) translateZ(45px)'
        )}>TX</div>
        {/* Left */}
        <div style={faceStyle(
          'linear-gradient(135deg,#2196F3,#1565C0)',
          'rotateY(-90deg) translateZ(45px)'
        )}>T</div>
        {/* Right */}
        <div style={faceStyle(
          'linear-gradient(135deg,#FF6B00,#E05A00)',
          'rotateY(90deg) translateZ(45px)'
        )}>X</div>
        {/* Top */}
        <div style={faceStyle(
          'linear-gradient(135deg,#FFF176,#FFD700)',
          'rotateX(90deg) translateZ(45px)'
        )}>✦</div>
        {/* Bottom */}
        <div style={faceStyle(
          'linear-gradient(135deg,#4C1D95,#2D0A00)',
          'rotateX(-90deg) translateZ(45px)'
        )}>✦</div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Animated Orb
   ═══════════════════════════════════════════════════════════════ */
const Orb: React.FC<{
  size: number; color: string; x: string; y: string; delay: number; blur: number;
}> = ({ size, color, x, y, delay, blur }) => (
  <div
    style={{
      position: 'absolute',
      left: x, top: y,
      width: size, height: size,
      borderRadius: '50%',
      background: color,
      filter: `blur(${blur}px)`,
      opacity: 0.35,
      animation: `orbFloat ${3 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none',
    }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   Main Login Page
   ═══════════════════════════════════════════════════════════════ */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focusUser, setFocusUser] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [shake, setShake] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const particles = useParticles(40);

  /* Card 3D tilt on mouse move */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setMousePos({ x: dx * 8, y: -dy * 8 });
  };
  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-24px) scale(1.08); }
        }
        @keyframes loginShake {
          0%,100% { transform: rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg) translateX(0); }
          20%     { transform: rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg) translateX(-8px); }
          40%     { transform: rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg) translateX(8px); }
          60%     { transform: rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg) translateX(-5px); }
          80%     { transform: rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg) translateX(5px); }
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
          width: 100%;
          padding: 14px 14px 14px 44px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: all 0.25s ease;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff;
          box-sizing: border-box;
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
        .submit-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #8B5CF6 0%, #FF6B00 100%);
          background-size: 200% 200%;
          color: #fff;
          box-shadow: 0 4px 20px rgba(139,92,246,0.4);
        }
        .submit-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,107,0,0.45);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: -50%; left: -60%;
          width: 40%; height: 200%;
          background: rgba(255,255,255,0.18);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .submit-btn:hover::before { left: 120%; }
      `}</style>

      {/* ── Full-screen background ── */}
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #060D1F 0%, #0D1B3E 35%, #1A0A3E 65%, #2D0A00 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 12s ease infinite',
          padding: '20px',
        }}
      >
        {/* ── Animated orbs ── */}
        <Orb size={500} color="radial-gradient(circle,#8B5CF6,transparent)" x="-10%" y="-15%" delay={0} blur={60} />
        <Orb size={400} color="radial-gradient(circle,#FF6B00,transparent)" x="70%" y="60%" delay={1.5} blur={70} />
        <Orb size={300} color="radial-gradient(circle,#2196F3,transparent)" x="80%" y="-5%" delay={0.8} blur={55} />
        <Orb size={250} color="radial-gradient(circle,#FFD700,transparent)" x="5%" y="70%" delay={2} blur={50} />

        {/* ── Floating particles ── */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          aria-hidden
        >
          {particles.map(p => (
            p.shape === 'circle' ? (
              <circle
                key={p.id}
                cx={`${p.x}%`} cy={`${p.y}%`}
                r={p.size}
                fill={p.color}
                opacity={p.opacity}
              />
            ) : p.shape === 'square' ? (
              <rect
                key={p.id}
                x={`${p.x}%`} y={`${p.y}%`}
                width={p.size * 2} height={p.size * 2}
                fill={p.color}
                opacity={p.opacity}
                transform={`rotate(45, ${p.x}, ${p.y})`}
              />
            ) : (
              <polygon
                key={p.id}
                points={`${p.x}%,${p.y - p.size * 0.5}% ${p.x - p.size * 0.5}%,${p.y + p.size * 0.5}% ${p.x + p.size * 0.5}%,${p.y + p.size * 0.5}%`}
                fill={p.color}
                opacity={p.opacity}
              />
            )
          ))}
        </svg>

        {/* ── Grid overlay ── */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* ── Main card ── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '100%',
            maxWidth: 440,
            position: 'relative',
            zIndex: 10,
            perspective: 1000,
            animation: 'floatIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          <div
            style={{
              background: 'rgba(13,27,62,0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 28,
              padding: '40px 36px',
              border: '1px solid rgba(255,255,255,0.1)',
              animation: shake ? 'loginShake 0.5s ease' : 'borderGlow 4s ease-in-out infinite',
              transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
              transition: shake ? 'none' : 'transform 0.12s ease',
              transformStyle: 'preserve-3d',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* ── Spinning rings behind card ── */}
            <div style={{
              position: 'absolute', inset: -2, borderRadius: 30, pointerEvents: 'none', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: -40,
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '50%',
                animation: 'spinRing 12s linear infinite',
              }} />
              <div style={{
                position: 'absolute', inset: -20,
                border: '1px dashed rgba(255,107,0,0.15)',
                borderRadius: '50%',
                animation: 'counterSpinRing 8s linear infinite',
              }} />
            </div>

            {/* ── Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              {/* 3D Cube */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <RotatingCube />
              </div>

              {/* Brand name */}
              <h1 style={{
                margin: '0 0 6px',
                fontSize: 32,
                fontWeight: 900,
                fontFamily: 'Lexend, sans-serif',
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #FFD700 0%, #FF9A3C 40%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}>
                TalentX
              </h1>
              <p style={{
                margin: '0 0 4px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>
                Personnel Strategy Platform
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 12, padding: '4px 14px',
                borderRadius: 99,
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.25)',
              }}>
                <Sparkles style={{ width: 12, height: 12, color: '#A78BFA' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.1em' }}>
                  SECURE LOGIN
                </span>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Username */}
              <div style={{ position: 'relative' }}>
                <label style={{
                  display: 'block', marginBottom: 8,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: focusUser ? '#A78BFA' : 'rgba(255,255,255,0.5)',
                  transition: 'color 0.2s',
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16, height: 16,
                    color: focusUser ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.2s',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocusUser(true)}
                    onBlur={() => setFocusUser(false)}
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                    className="login-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <label style={{
                  display: 'block', marginBottom: 8,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: focusPass ? '#A78BFA' : 'rgba(255,255,255,0.5)',
                  transition: 'color 0.2s',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16, height: 16,
                    color: focusPass ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.2s',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusPass(true)}
                    onBlur={() => setFocusPass(false)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="login-input"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.35)',
                      padding: 0, display: 'flex', alignItems: 'center',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#A78BFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  >
                    {showPass
                      ? <EyeOff style={{ width: 16, height: 16 }} />
                      : <Eye style={{ width: 16, height: 16 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#FCA5A5',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Signing In…
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    Sign In
                    <ArrowRight style={{ width: 18, height: 18 }} />
                  </span>
                )}
              </button>
            </form>

            {/* ── Footer ── */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    textDecoration: 'none',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg,#A78BFA,#FF9A3C)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Create Account
                </Link>
              </p>
            </div>

            {/* ── Bottom brand strip ── */}
            <div style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
            }}>
              {['Saffron', 'Yellow', 'Blue', 'Violet'].map((name, i) => (
                <div
                  key={name}
                  style={{
                    width: 28, height: 4, borderRadius: 99,
                    background: ['#FF6B00', '#FFD700', '#2196F3', '#8B5CF6'][i],
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spin keyframe for loader */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default LoginPage;
