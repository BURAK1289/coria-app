'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type Intensity = 'low' | 'med' | 'high';

interface BrandBackgroundProps {
  intensity?: Intensity;
  interactive?: boolean;
  palette?: 'cream';
}

// Simplex noise shader for organic flow animation
const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_intensity;

  varying vec2 v_uv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Curl noise for flow
  vec2 curl(vec2 p) {
    float eps = 0.01;
    float n1 = snoise(p + vec2(eps, 0.0));
    float n2 = snoise(p - vec2(eps, 0.0));
    float n3 = snoise(p + vec2(0.0, eps));
    float n4 = snoise(p - vec2(0.0, eps));

    float dx = (n2 - n1) / (2.0 * eps);
    float dy = (n3 - n4) / (2.0 * eps);

    return vec2(dy, -dx);
  }

  void main() {
    vec2 uv = v_uv;
    vec2 st = uv * u_resolution.xy / min(u_resolution.x, u_resolution.y);

    // Time-based flow
    float time = u_time * 0.05 * u_intensity;

    // Multi-layered noise for organic movement
    vec2 flow = vec2(0.0);
    float amplitude = 1.0;
    float frequency = 0.5;

    for(int i = 0; i < 3; i++) {
      flow += curl(st * frequency + time * 0.1) * amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    // Interactive mouse influence (very subtle)
    vec2 mouseInfluence = (u_pointer - 0.5) * 0.02 * u_intensity;
    flow += mouseInfluence;

    // Sample noise with flow distortion
    float noise = snoise(st + flow * 0.3 + time);
    noise = noise * 0.5 + 0.5; // Normalize to 0-1

    // Cream color palette
    vec3 cream1 = vec3(0.984, 0.969, 0.945); // #FBF7F1
    vec3 cream2 = vec3(0.965, 0.937, 0.890); // #F6EFE3
    vec3 cream3 = vec3(0.937, 0.886, 0.808); // #EFE2CE

    // Blend between cream tones
    vec3 color = mix(cream1, cream2, smoothstep(0.3, 0.7, noise));
    color = mix(color, cream3, smoothstep(0.6, 0.9, noise + snoise(st * 2.0 + time * 0.2) * 0.2));

    // Add very subtle green tint for brand consistency
    vec3 brandGreen = vec3(0.290, 0.620, 0.467); // #4A9E72
    color = mix(color, brandGreen, 0.02 * u_intensity);

    // Subtle vignette for depth
    float vignette = 1.0 - length(uv - 0.5) * 0.3;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function BrandBackground({
  intensity = 'low',
  interactive = true,
  palette = 'cream'
}: BrandBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef(Date.now());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Intensity multipliers
  const intensityMultipliers = {
    low: 0.5,
    med: 0.75,
    high: 1.0
  };

  // Check for WebGL support
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const testCanvas = document.createElement('canvas');
        const testContext = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        setWebGLSupported(!!testContext);
      } catch (e) {
        setWebGLSupported(false);
      }
    };

    checkWebGL();
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);

    // Check for reduced data preference
    const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    if (dataQuery.matches) {
      setReducedMotion(true);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Visibility change handler for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check battery status for performance mode
    const checkBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          if (battery.level < 0.2 && !battery.charging) {
            setReducedMotion(true);
          }
        } catch (e) {
          // Battery API not available
        }
      }
    };

    checkBattery();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // WebGL shader compilation helper
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      console.error('Shader source:', source);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }, []);

  // WebGL program creation
  const createProgram = useCallback((gl: WebGLRenderingContext, vertShader: WebGLShader, fragShader: WebGLShader): WebGLProgram | null => {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }, []);

  // Main WebGL effect
  useEffect(() => {
    if (reducedMotion || !isVisible || !webGLSupported) {
      return; // Use CSS fallback
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try to get WebGL context
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power'
    });

    if (!gl) {
      setWebGLSupported(false);
      return;
    }

    glRef.current = gl;

    // Create shaders and program
    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    if (!vShader || !fShader) {
      setWebGLSupported(false);
      return;
    }

    const program = createProgram(gl, vShader, fShader);
    if (!program) {
      setWebGLSupported(false);
      return;
    }

    programRef.current = program;
    gl.useProgram(program);
    console.log('✅ BrandBackground WebGL initialized successfully');

    // Set up geometry (full-screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const pointerLocation = gl.getUniformLocation(program, 'u_pointer');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    // Clamp device pixel ratio for performance
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - (e.clientY / window.innerHeight) // Flip Y for WebGL coordinates
      };
    };

    if (interactive && !isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop with FPS monitoring
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameTime = 1000 / targetFPS;

    // FPS monitoring (only in dev mode)
    let frameCount = 0;
    let fpsTime = performance.now();
    const logFPS = process.env.NODE_ENV === 'development';

    const animate = (currentTime: number) => {
      if (!isVisible) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameTime) {
        lastTime = currentTime - (deltaTime % frameTime);

        const elapsedTime = (Date.now() - startTimeRef.current) / 1000;

        // Clear the canvas with cream background
        gl.clearColor(0.984, 0.969, 0.945, 1.0); // Cream base color
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update uniforms
        gl.uniform1f(timeLocation, elapsedTime);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(pointerLocation, mouseRef.current.x, mouseRef.current.y);
        gl.uniform1f(intensityLocation, intensityMultipliers[intensity]);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // FPS monitoring
        if (logFPS) {
          frameCount++;
          const currentFPSTime = performance.now();
          if (currentFPSTime - fpsTime >= 1000) {
            console.log(`🎨 BrandBackground FPS: ${frameCount}`);
            frameCount = 0;
            fpsTime = currentFPSTime;
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      if (interactive && !isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      // Clean up WebGL resources
      if (gl && program) {
        gl.deleteProgram(program);
      }
      if (gl && vShader) {
        gl.deleteShader(vShader);
      }
      if (gl && fShader) {
        gl.deleteShader(fShader);
      }
      if (gl && positionBuffer) {
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [intensity, interactive, reducedMotion, isVisible, webGLSupported, isMobile, createShader, createProgram, intensityMultipliers]);

  // CSS fallback for reduced motion or no WebGL
  if (reducedMotion || !webGLSupported) {
    return (
      <div
        id="brand-bg"
        className={reducedMotion ? "brand-bg-static" : "brand-bg-animated-gradient"}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        {/* Subtle leaf vein overlay for desktop only */}
        {!isMobile && !reducedMotion && (
          <div
            className="brand-bg-leaf-pattern"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      id="brand-bg"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        id="brand-bg-canvas"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      {/* Subtle leaf vein overlay for desktop only */}
      {!isMobile && (
        <div
          className="brand-bg-leaf-pattern"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/leaf-vein.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '400px 400px',
            opacity: 0.035,
            pointerEvents: 'none',
            mixBlendMode: 'multiply'
          }}
        />
      )}
    </div>
  );
}