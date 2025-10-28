import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type RobotSkinnedRef = {
  /** 상태 애니메이션 전환 (Idle/Walking/Running/Dance/Death/Sitting/Standing ...) */
  playState: (name: string, fade?: number) => void;
  /** 이모트(1회 재생) 실행 (Jump/Yes/No/Wave/Punch/ThumbsUp ...) */
  playEmote: (name: string, fade?: number) => void;
  /** 표정 모프값 설정 (0~1) */
  setExpression: (name: string, value: number) => void;
  /** 사용 가능한 상태/이모트/표정 리스트 조회 */
  list: () => {
    states: string[];
    emotes: string[];
    expressions: string[];
  };
};

type Props = {
  /** glb 경로 */
  modelUrl?: string;
  /** 초기 상태 애니메이션 */
  initialState?: string; // e.g. "Walking"
  /** 배경색 */
  background?: string;
  /** 안개 사용 여부 */
  useFog?: boolean;
  /** 지면/그리드 표시 */
  showGround?: boolean;
  /** 캔버스 스타일 */
  style?: React.CSSProperties;
  width: number;
};

/** 화면 전체를 채우는 캔버스로 로봇 skinned+morphing 렌더 */
const RobotSkinned = forwardRef<RobotSkinnedRef, Props>(
  (
    {
      modelUrl = '/models/gltf/RobotExpressive/RobotExpressive.glb',
      initialState = 'Walking',
      background = '#e0e0e0',
      useFog = true,
      showGround = true,
      style,
      width,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // 내부 핸들
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
    const activeActionRef = useRef<THREE.AnimationAction | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const faceRef = useRef<THREE.Object3D | null>(null);

    // 리스트 캐시
    const states = useRef<string[]>([
      'Idle',
      'Walking',
      'Running',
      'Dance',
      'Death',
      'Sitting',
      'Standing',
    ]);
    const emotes = useRef<string[]>(['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']);
    const [expressions, setExpressions] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({
      playState: (name: string, fade = 0.5) => fadeToAction(name, fade, true),
      playEmote: (name: string, fade = 0.2) => {
        fadeToAction(name, fade, false, () => {
          // 완료되면 상태로 복귀
          fadeToAction(activeStateName.current, 0.2, true);
        });
      },
      setExpression: (name: string, value: number) => {
        const face = faceRef.current as any;
        if (!face || !face.morphTargetDictionary) return;
        const idx = face.morphTargetDictionary[name];
        if (typeof idx !== 'number') return;
        face.morphTargetInfluences[idx] = THREE.MathUtils.clamp(value, 0, 1);
      },
      list: () => ({
        states: states.current.slice(),
        emotes: emotes.current.slice(),
        expressions,
      }),
    }));

    const activeStateName = useRef<string>(initialState);

    useEffect(() => {
      if (!containerRef.current) return;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(background);
      if (useFog) {
        scene.fog = new THREE.Fog(new THREE.Color(background), 20, 100);
      }

      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / window.innerHeight, 0.25, 100);
      camera.position.set(-5, 3, 10);
      camera.lookAt(0, 2, 0);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Lights
      const hemi = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
      hemi.position.set(0, 20, 0);
      scene.add(hemi);

      const dir = new THREE.DirectionalLight(0xffffff, 3);
      dir.position.set(0, 20, 10);
      scene.add(dir);

      // Ground & Grid
      let ground: THREE.Mesh | null = null;
      let grid: THREE.GridHelper | null = null;
      if (showGround) {
        ground = new THREE.Mesh(
          new THREE.PlaneGeometry(2000, 2000),
          new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
        );
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
        (grid.material as THREE.Material).transparent = true;
        (grid.material as THREE.Material & { opacity: number }).opacity = 0.2;
        scene.add(grid);
      }

      // Load model
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          modelRef.current = model;
          scene.add(model);

          // Animation
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          // Build actions
          const actions: Record<string, THREE.AnimationAction> = {};
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            actions[clip.name] = action;

            // emote or one-shot
            if (emotes.current.includes(clip.name) || states.current.indexOf(clip.name) >= 4) {
              action.clampWhenFinished = true;
              action.loop = THREE.LoopOnce;
            }
          });
          actionsRef.current = actions;

          // Face / expressions
          // 원본 데모 기준 이름: 'Head_4'
          const face = model.getObjectByName('Head_4') as any;
          faceRef.current = face;
          const expr = face?.morphTargetDictionary ? Object.keys(face.morphTargetDictionary) : [];
          setExpressions(expr);

          // 최초 상태 재생
          fadeToAction(initialState, 0.5, true);
        },
        undefined,
        (err) => {
          // 모델 로드 실패 처리
          // 콘솔만 남김
          console.error(err);
        }
      );

      // Resize
      const onResize = () => {
        const w = width;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      // Loop
      const clock = new THREE.Clock();
      let rafId = 0;
      const loop = () => {
        const dt = clock.getDelta();
        if (mixerRef.current) mixerRef.current.update(dt);
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

      // Cleanup
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        scene.traverse((obj) => {
          if ((obj as THREE.Mesh).geometry) {
            (obj as THREE.Mesh).geometry.dispose();
          }
          const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
          if (m) {
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else m.dispose();
          }
        });
        containerRef.current && (containerRef.current.innerHTML = '');
      };
    }, [modelUrl, background, useFog, showGround, initialState, width]);

    function fadeToAction(name: string, duration: number, isState = true, onFinished?: () => void) {
      const actions = actionsRef.current;
      const mixer = mixerRef.current;
      if (!actions || !mixer) return;
      const next = actions[name];
      if (!next) return;

      const prev = activeActionRef.current;

      if (prev && prev !== next) {
        prev.fadeOut(duration);
      }

      next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();

      activeActionRef.current = next;
      if (isState) activeStateName.current = name;
      ref = activeActionRef.current as any;

      if (onFinished) {
        const finishedOnce = () => {
          mixer.removeEventListener('finished', finishedOnce as any);
          onFinished();
        };
        mixer.addEventListener('finished', finishedOnce as any);
      }
    }

    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...style,
        }}
      />
    );
  }
);

export default RobotSkinned;
