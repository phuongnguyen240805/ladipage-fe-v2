import { useEffect, type MutableRefObject } from "react";
import { Application, Assets, TextureStyle, type Texture } from "pixi.js";
import type { Agent, Department, SubAgent, Task } from "../../types";
import { buildSpriteMap } from "../AgentAvatar";
import { type Delivery, MIN_OFFICE_W, findScrollContainer } from "./model";
import { runOfficeTickerStep, type OfficeTickerContext } from "./officeTicker";

interface UseOfficePixiRuntimeParams {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  appRef: MutableRefObject<Application | null>;
  texturesRef: MutableRefObject<Record<string, Texture>>;
  destroyedRef: MutableRefObject<boolean>;
  initIdRef: MutableRefObject<number>;
  initDoneRef: MutableRefObject<boolean>;
  officeWRef: MutableRefObject<number>;
  scrollHostXRef: MutableRefObject<HTMLElement | null>;
  scrollHostYRef: MutableRefObject<HTMLElement | null>;
  deliveriesRef: MutableRefObject<Delivery[]>;
  dataRef: MutableRefObject<{ agents: Agent[] }>;
  buildScene: () => void;
  followCeoInView: () => void;
  triggerDepartmentInteract: () => void;
  keysRef: MutableRefObject<Record<string, boolean>>;
  tickerContext: OfficeTickerContext;
  departments: Department[];
  agents: Agent[];
  tasks: Task[];
  subAgents: SubAgent[];
  unreadAgentIds?: Set<string>;
  language: string;
  activeMeetingTaskId?: string | null;
  customDeptThemes?: Record<string, { floor1: number; floor2: number; wall: number; accent: number }>;
  currentTheme: string;
}

export function useOfficePixiRuntime({
  containerRef,
  appRef,
  texturesRef,
  destroyedRef,
  initIdRef,
  initDoneRef,
  officeWRef,
  scrollHostXRef,
  scrollHostYRef,
  deliveriesRef,
  dataRef,
  buildScene,
  followCeoInView,
  triggerDepartmentInteract,
  keysRef,
  tickerContext,
  departments,
  agents,
  tasks,
  subAgents,
  unreadAgentIds,
  language,
  activeMeetingTaskId,
  customDeptThemes,
  currentTheme,
}: UseOfficePixiRuntimeParams): void {
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measureOfficeWidth = () => {
      const parentWidth = element.parentElement?.getBoundingClientRect().width ?? 0;
      const ownWidth = element.getBoundingClientRect().width;
      const fallbackWidth = typeof window !== "undefined" ? window.innerWidth : MIN_OFFICE_W;
      return Math.max(MIN_OFFICE_W, Math.floor(parentWidth || ownWidth || fallbackWidth));
    };

    destroyedRef.current = false;
    const currentInitId = ++initIdRef.current;
    scrollHostXRef.current = findScrollContainer(element, "x");
    scrollHostYRef.current = findScrollContainer(element, "y");

    async function init() {
      if (!element) return;
      TextureStyle.defaultOptions.scaleMode = "nearest";

      officeWRef.current = measureOfficeWidth();

      const app = new Application();
      await app.init({
        width: officeWRef.current,
        height: 600,
        backgroundAlpha: 0,
        antialias: false,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (initIdRef.current !== currentInitId) {
        try {
          app.destroy();
        } catch {}
        return;
      }

      appRef.current = app;
      const canvas = app.canvas as HTMLCanvasElement;
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.maxWidth = "100%";
      canvas.style.height = "auto";
      canvas.style.imageRendering = "pixelated";
      element.innerHTML = "";
      element.appendChild(canvas);

      const spriteMap = buildSpriteMap(dataRef.current.agents);
      const textures: Record<string, Texture> = {};
      const loads: Promise<void>[] = [];
      const spriteNums = new Set<number>();

      for (let i = 1; i <= 13; i++) spriteNums.add(i);
      for (const num of spriteMap.values()) spriteNums.add(num);

      for (const spriteNum of spriteNums) {
        for (const frame of [1, 2, 3]) {
          const key = `${spriteNum}-D-${frame}`;
          loads.push(
            Assets.load<Texture>(`/sprites/${key}.png`)
              .then((texture) => {
                textures[key] = texture;
              })
              .catch(() => {}),
          );
        }

        for (const direction of ["L", "R"]) {
          const key = `${spriteNum}-${direction}-1`;
          loads.push(
            Assets.load<Texture>(`/sprites/${key}.png`)
              .then((texture) => {
                textures[key] = texture;
              })
              .catch(() => {}),
          );
        }
      }

      loads.push(
        Assets.load<Texture>("/sprites/ceo-lobster.png")
          .then((texture) => {
            textures.ceo = texture;
          })
          .catch(() => {}),
      );

      await Promise.all(loads);

      if (initIdRef.current !== currentInitId) {
        try {
          app.destroy();
        } catch {}
        return;
      }

      texturesRef.current = textures;
      buildScene();
      initDoneRef.current = true;
      followCeoInView();

      app.ticker.add(() => {
        if (destroyedRef.current || appRef.current !== app) return;
        runOfficeTickerStep(tickerContext);
      });
      app.ticker.start();
    }

    const isInputFocused = () => {
      const tag = document.activeElement?.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isInputFocused()) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) {
        event.preventDefault();
        keysRef.current[event.code] = true;
      }
      if (event.code === "Enter" || event.code === "Space") {
        event.preventDefault();
        triggerDepartmentInteract();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isInputFocused()) return;
      keysRef.current[event.code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    init();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !appRef.current || destroyedRef.current || initIdRef.current !== currentInitId) return;
      const newWidth = measureOfficeWidth();
      if (Math.abs(newWidth - officeWRef.current) > 10) {
        officeWRef.current = newWidth;
        buildScene();
      }
    });

    resizeObserver.observe(element.parentElement ?? element);

    return () => {
      destroyedRef.current = true;
      initIdRef.current++;
      resizeObserver.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      deliveriesRef.current = [];
      initDoneRef.current = false;
      scrollHostXRef.current = null;
      scrollHostYRef.current = null;

      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [
    containerRef,
    appRef,
    texturesRef,
    destroyedRef,
    initIdRef,
    initDoneRef,
    officeWRef,
    scrollHostXRef,
    scrollHostYRef,
    deliveriesRef,
    dataRef,
    buildScene,
    followCeoInView,
    triggerDepartmentInteract,
    keysRef,
    tickerContext,
  ]);

  useEffect(() => {
    if (initDoneRef.current && appRef.current) {
      buildScene();
    }
  }, [
    departments,
    agents,
    tasks,
    subAgents,
    unreadAgentIds,
    language,
    activeMeetingTaskId,
    customDeptThemes,
    currentTheme,
    buildScene,
    initDoneRef,
    appRef,
  ]);
}
