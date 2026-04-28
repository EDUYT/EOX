const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const motionOk = !motionQuery.matches;
const pointerOk = pointerQuery.matches;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (from, to, progress) => from + (to - from) * progress;
const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
const listenToMedia = (query, listener) => {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return;
  }
  query.addListener(listener);
};

document.documentElement.classList.toggle("reduced-motion", !motionOk);

listenToMedia(motionQuery, () => {
  window.location.reload();
});

const topMenu = document.querySelector("#top-menu");
const nav = document.querySelector("#site-nav");
const menuToggle = document.querySelector("#menu-toggle");
const brand = document.querySelector(".brand");
const mainContent = document.querySelector("main");
const siteFooter = document.querySelector(".site-footer");
const mobileMenuQuery = window.matchMedia("(max-width: 1100px)");
const cursorElements = document.querySelectorAll("#cursor-dot, #cursor-ring");
let closeMenuTimer;
let detachCloseTransition;

const setElementInert = (element, isInert) => {
  if (!element) return;
  element.toggleAttribute("inert", isInert);
  if (isInert) {
    element.setAttribute("aria-hidden", "true");
  } else {
    element.removeAttribute("aria-hidden");
  }
};

const setPageBehindMenuInert = (isInert) => {
  setElementInert(brand, isInert);
  setElementInert(mainContent, isInert);
  setElementInert(siteFooter, isInert);
};

const getMenuFocusables = () =>
  [menuToggle, ...(nav?.querySelectorAll("a[href], button:not([disabled])") ?? [])].filter(
    (element) => element instanceof HTMLElement && !element.hidden && element.offsetParent !== null
  );

const finishMenuClose = () => {
  window.clearTimeout(closeMenuTimer);
  detachCloseTransition?.();
  detachCloseTransition = undefined;
  nav?.classList.remove("is-closing");
  menuToggle?.removeAttribute("data-menu-state");
  document.body.classList.remove("menu-open");
  setPageBehindMenuInert(false);
};

const setMenuOpen = (isOpen) => {
  window.clearTimeout(closeMenuTimer);
  detachCloseTransition?.();
  detachCloseTransition = undefined;

  const wasOpen = nav?.classList.contains("is-open") ?? false;

  if (isOpen) {
    nav?.classList.remove("is-closing");
    nav?.classList.add("is-open");
    menuToggle?.setAttribute("aria-expanded", "true");
    menuToggle?.setAttribute("aria-label", "Fechar menu");
    menuToggle?.setAttribute("data-menu-state", "open");
    document.body.classList.add("menu-open");
    setPageBehindMenuInert(true);

    if (mobileMenuQuery.matches) {
      window.requestAnimationFrame(() => {
        nav?.querySelector("a")?.focus({ preventScroll: true });
      });
    }

    return;
  }

  nav?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", "Abrir menu");

  if (!wasOpen) {
    finishMenuClose();
    return;
  }

  nav?.classList.add("is-closing");
  menuToggle?.setAttribute("data-menu-state", "closing");

  const onCloseTransitionEnd = (event) => {
    if (event.target !== nav || event.propertyName !== "transform") return;
    finishMenuClose();
  };

  nav?.addEventListener("transitionend", onCloseTransitionEnd);
  detachCloseTransition = () => {
    nav?.removeEventListener("transitionend", onCloseTransitionEnd);
  };
  closeMenuTimer = window.setTimeout(finishMenuClose, 460);
};

const closeMenu = () => setMenuOpen(false);

if (!motionOk || !pointerOk) {
  cursorElements.forEach((element) => {
    element.hidden = true;
  });
}

function setHeaderState() {
  topMenu?.classList.toggle("is-scrolled", window.scrollY > 18);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle?.addEventListener("click", () => {
  setMenuOpen(!(nav?.classList.contains("is-open") ?? false));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    menuToggle?.focus({ preventScroll: true });
    return;
  }

  if (event.key !== "Tab" || !document.body.classList.contains("menu-open")) return;

  const focusables = getMenuFocusables();
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (!focusables.includes(active)) {
    event.preventDefault();
    first.focus({ preventScroll: true });
    return;
  }

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
});

listenToMedia(mobileMenuQuery, (event) => {
  if (!event.matches) closeMenu();
});

document.querySelectorAll(".float-title").forEach((title) => {
  if (title.dataset.split === "true") return;

  const parts = (title.textContent ?? "").trim().split(/(\s+)/);
  let charIndex = 0;
  title.textContent = "";
  title.dataset.split = "true";

  parts.forEach((part) => {
    if (!part.trim()) {
      title.appendChild(document.createTextNode(" "));
      return;
    }

    const word = document.createElement("span");
    word.className = "word";

    Array.from(part).forEach((char) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--i", charIndex);
      span.textContent = char;
      word.appendChild(span);
      charIndex += 1;
    });

    title.appendChild(word);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -8%" }
);

document.querySelectorAll(".reveal, .float-title").forEach((element) => {
  revealObserver.observe(element);
});

const explicitExperienceRoot = document.querySelector("[data-experience]");
const explicitExperienceFrame = document.querySelector("#experience-frame");
const experienceRoot = explicitExperienceRoot ?? document.querySelector(".motion-stage");
const experienceFrame =
  explicitExperienceFrame ??
  experienceRoot?.querySelector("#dashboard-card") ??
  document.querySelector("#dashboard-card");
const motionSection = document.querySelector("#motion");
const experienceScrollRoot = motionSection ?? experienceRoot;
const experienceControls = Array.from(document.querySelectorAll("[data-mode]"));
const experienceRailSteps = Array.from(document.querySelectorAll("#experience-frame .scroll-rail span"));
const panelTitle = document.querySelector("[data-panel-title]");
const panelCopy = document.querySelector("[data-panel-copy]");

const isPointerInsideElement = (event, element) => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
};

const experienceDefaults = [
  {
    mode: "crm",
    title: "CRM que acompanha cada conta",
    copy: "Carteira, histórico, oportunidades e próximas ações ficam no mesmo painel para o time agir sem perder contexto.",
    background:
      "linear-gradient(145deg, rgba(239, 63, 93, 0.28), rgba(255, 255, 255, 0.08) 45%, rgba(37, 215, 195, 0.08))",
    border: "rgba(239, 63, 93, 0.42)",
    glow: "rgba(239, 63, 93, 0.32)",
    accent: "#ef3f5d",
    rotate: -10
  },
  {
    mode: "telefonia",
    title: "Telefonia ligada ao histórico",
    copy: "Chamadas, registros e contexto comercial aparecem juntos para que cada atendimento comece mais preparado.",
    background:
      "linear-gradient(145deg, rgba(37, 215, 195, 0.24), rgba(255, 255, 255, 0.08) 48%, rgba(239, 63, 93, 0.1))",
    border: "rgba(37, 215, 195, 0.4)",
    glow: "rgba(37, 215, 195, 0.26)",
    accent: "#25d7c3",
    rotate: -2
  },
  {
    mode: "erp",
    title: "ERP no fluxo comercial",
    copy: "Pedidos, cadastros e dados operacionais entram no CRM sem obrigar a equipe a alternar sistemas.",
    background:
      "linear-gradient(145deg, rgba(255, 189, 89, 0.2), rgba(239, 63, 93, 0.18) 42%, rgba(255, 255, 255, 0.075))",
    border: "rgba(255, 189, 89, 0.42)",
    glow: "rgba(255, 189, 89, 0.24)",
    accent: "#ffbd59",
    rotate: 6
  },
  {
    mode: "bi",
    title: "BI para decidir com clareza",
    copy: "Indicadores de produtividade, conversão e atendimento mostram onde agir e como acompanhar resultados.",
    background:
      "linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(37, 215, 195, 0.16) 40%, rgba(239, 63, 93, 0.24))",
    border: "rgba(255, 255, 255, 0.28)",
    glow: "rgba(239, 63, 93, 0.24)",
    accent: "#f8fbfb",
    rotate: 12
  }
];

const readControlText = (control) => (control?.textContent ?? "").replace(/\s+/g, " ").trim();
const readFiniteNumber = (value, fallback) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};
const findDefaultState = (mode, index) =>
  experienceDefaults.find((state) => state.mode === mode) ?? experienceDefaults[index % experienceDefaults.length];

const experienceStates = (experienceControls.length ? experienceControls : experienceDefaults).map((source, index) => {
  const fromMarkup = source instanceof HTMLElement;
  const mode = fromMarkup ? source.dataset.mode || `state-${index + 1}` : source.mode;
  const fallback = findDefaultState(mode, index);

  return {
    ...fallback,
    mode,
    title: fromMarkup ? source.dataset.title || fallback.title || readControlText(source) : fallback.title,
    copy: fromMarkup ? source.dataset.copy || fallback.copy : fallback.copy,
    background: fromMarkup ? source.dataset.background || fallback.background : fallback.background,
    border: fromMarkup ? source.dataset.border || fallback.border : fallback.border,
    glow: fromMarkup ? source.dataset.glow || fallback.glow : fallback.glow,
    accent: fromMarkup ? source.dataset.accent || fallback.accent : fallback.accent,
    rotate: fromMarkup ? readFiniteNumber(source.dataset.rotate, fallback.rotate) : fallback.rotate
  };
});

let experienceIndex = Math.max(
  0,
  experienceStates.findIndex((state) => state.mode === explicitExperienceRoot?.dataset.experience)
);
let experienceTicking = false;
let experienceClickLockUntil = 0;
let experienceSwitchToken = 0;
let experienceCommitTimer;
let experienceSwitchTimer;
let snapTimer;

const setExperienceState = (index, intent = "scroll") => {
  if (!experienceFrame || !experienceStates.length) return;

  const safeIndex = ((index % experienceStates.length) + experienceStates.length) % experienceStates.length;

  if (intent === "click" && motionOk) {
    experienceSwitchToken += 1;
    const switchToken = experienceSwitchToken;

    window.clearTimeout(experienceCommitTimer);
    window.clearTimeout(experienceSwitchTimer);
    experienceFrame.classList.add("is-switching");
    experienceClickLockUntil = performance.now() + 950;
    experienceCommitTimer = window.setTimeout(() => {
      if (switchToken !== experienceSwitchToken) return;
      setExperienceState(safeIndex, "click-commit");
      requestExperienceFrame();
    }, 220);
    experienceSwitchTimer = window.setTimeout(() => {
      if (switchToken !== experienceSwitchToken) return;
      experienceFrame.classList.remove("is-switching");
    }, 680);
    return;
  }

  const state = experienceStates[safeIndex];
  experienceIndex = safeIndex;

  experienceRoot?.setAttribute("data-experience-state", state.mode);
  experienceFrame.setAttribute("data-state", state.mode);
  experienceFrame.style.setProperty("--experience-accent", state.accent);
  experienceFrame.style.setProperty("--experience-index", String(safeIndex));
  experienceFrame.style.background = state.background;
  experienceFrame.style.borderColor = state.border;
  experienceFrame.style.boxShadow = `0 34px 96px ${state.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.16)`;

  if (panelTitle) panelTitle.textContent = state.title;
  if (panelCopy) panelCopy.textContent = state.copy;

  experienceControls.forEach((control) => {
    const isActive = control.dataset.mode === state.mode;
    control.classList.toggle("is-active", isActive);
    control.setAttribute("data-active", String(isActive));
    if (control.getAttribute("role") === "tab") {
      control.setAttribute("aria-selected", String(isActive));
    } else if (control.matches("button, [role='button']")) {
      control.setAttribute("aria-pressed", String(isActive));
    }
  });

  experienceRailSteps.forEach((step, index) => {
    step.classList.toggle("is-active", index === safeIndex);
  });

  if (intent === "click" || intent === "click-commit") {
    experienceClickLockUntil = performance.now() + 900;
  }
};

const getExperienceProgress = () => {
  const progressRoot = experienceScrollRoot ?? experienceRoot;
  if (!progressRoot) return 0;

  const rect = progressRoot.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight || 1;
  const rootTop = window.scrollY + rect.top;
  const start = rootTop - viewport * 0.04;
  const end = Math.max(start + 1, rootTop + Math.max(rect.height, viewport * 1.1) - viewport * 0.76);
  return clamp((window.scrollY - start) / (end - start), 0, 1);
};

const renderExperienceFrame = () => {
  experienceTicking = false;
  if (!experienceFrame || !experienceStates.length) return;

  const progress = getExperienceProgress();
  const steppedIndex = Math.round(progress * (experienceStates.length - 1));
  const chapterRaw = progress * Math.max(experienceStates.length - 1, 1);
  const chapterProgress = chapterRaw - Math.floor(chapterRaw);
  const chapterEase = easeInOutCubic(chapterProgress);

  motionSection?.style.setProperty("--motion-progress", progress.toFixed(3));
  experienceFrame.style.setProperty("--experience-progress", progress.toFixed(3));
  experienceFrame.style.setProperty("--chapter-progress", chapterProgress.toFixed(3));

  if (performance.now() > experienceClickLockUntil) {
    setExperienceState(steppedIndex, "scroll");
  }

  const activeState = experienceStates[experienceIndex] ?? experienceStates[0];
  const surfaceWave = Math.sin(progress * Math.PI);
  experienceFrame.style.setProperty("--surface-y", `${lerp(16, -14, easeOutCubic(progress)).toFixed(2)}px`);
  experienceFrame.style.setProperty("--surface-scale", (0.985 + surfaceWave * 0.024).toFixed(3));
  experienceFrame.style.setProperty("--rail-y", `${lerp(12, -10, easeOutCubic(progress)).toFixed(2)}px`);
  experienceFrame.style.setProperty("--object-x", `${lerp(-18, 18, chapterEase).toFixed(2)}px`);
  experienceFrame.style.setProperty("--object-y", `${lerp(10, -8, surfaceWave).toFixed(2)}px`);
  experienceFrame.style.setProperty("--object-rx", `${lerp(8, -6, progress).toFixed(2)}deg`);
  experienceFrame.style.setProperty(
    "--object-ry",
    `${(lerp(-28, 28, chapterEase) + (activeState.rotate ?? 0) * 0.35).toFixed(2)}deg`
  );
  experienceFrame.style.setProperty("--object-rz", `${lerp(-2.5, 2.5, progress).toFixed(2)}deg`);
  experienceFrame.style.setProperty("--object-scale", (0.98 + surfaceWave * 0.05).toFixed(3));

  if (!motionOk) return;

  const eased = easeOutCubic(progress);
  const rotateZ = lerp(-7, 7, eased) + (activeState.rotate ?? 0) * 0.12;
  const rotateY = lerp(-11, 11, progress);
  const rotateX = lerp(5, -5.5, progress);
  const lift = lerp(18, -18, surfaceWave);
  const slide = lerp(-12, 12, eased);
  const scale = 0.978 + surfaceWave * 0.032;

  experienceFrame.style.transform = `perspective(1180px) translate3d(${slide.toFixed(2)}px, ${lift.toFixed(
    2
  )}px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(
    2
  )}deg) scale(${scale.toFixed(3)})`;
};

const requestExperienceFrame = () => {
  if (!experienceFrame || experienceTicking) return;
  experienceTicking = true;
  requestAnimationFrame(renderExperienceFrame);
};

const pulseExperienceFrame = () => {
  if (!motionOk || !experienceFrame) return;

  experienceFrame.classList.add("is-snapping");
  experienceFrame.style.filter = "saturate(1.25) brightness(1.08)";
  clearTimeout(snapTimer);
  snapTimer = window.setTimeout(() => {
    experienceFrame.classList.remove("is-snapping");
    experienceFrame.style.filter = "";
  }, 180);
};

if (experienceFrame && experienceStates.length) {
  experienceFrame.style.transformOrigin = "50% 58%";
  experienceFrame.style.transition = motionOk
    ? "background 0.48s ease, border-color 0.48s ease, box-shadow 0.48s ease, filter 0.16s ease"
    : "none";
  if (motionOk) {
    experienceFrame.style.animation = "none";
    experienceFrame.style.willChange = "transform, background";
  }

  setExperienceState(experienceIndex, "init");

  if (motionOk) {
    requestExperienceFrame();

    window.addEventListener("scroll", requestExperienceFrame, { passive: true });
    window.addEventListener("resize", requestExperienceFrame);

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (event.button !== 0 || !(event.target instanceof Element)) return;

        const target = event.target.closest("[data-mode], #experience-frame, .motion-card");
        const insideFrame = isPointerInsideElement(event, experienceFrame);
        const withinExperience = target && (experienceRoot?.contains(target) ?? experienceFrame.contains(target));
        if ((!target || !withinExperience) && !insideFrame) return;

        const modeControl = target?.closest("[data-mode]");
        if (modeControl) return;

        setExperienceState(experienceIndex + 1, "click");
        pulseExperienceFrame();
        requestExperienceFrame();
      },
      { passive: true }
    );
  }

  experienceControls.forEach((control) => {
    control.addEventListener("click", () => {
      const index = experienceStates.findIndex((state) => state.mode === control.dataset.mode);
      if (index < 0) return;
      setExperienceState(index, "click");
      pulseExperienceFrame();
      requestExperienceFrame();
    });
  });
}

const getElementProgress = (element, startRatio = 0.88, endRatio = 0.24) => {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight || 1;
  const travel = viewport * (startRatio - endRatio) + Math.max(rect.height, 1);
  return clamp((viewport * startRatio - rect.top) / Math.max(travel, 1), 0, 1);
};

const hero = document.querySelector(".hero");
const heroStage = document.querySelector(".hero .motion-stage");
const heroWord = document.querySelector(".bg-word");
const heroDashboard = document.querySelector("#dashboard-card");
const statement = document.querySelector(".statement");
const bentoCards = Array.from(document.querySelectorAll(".bento-card"));
const metricCards = Array.from(document.querySelectorAll(".metric-card"));
const finalPanel = document.querySelector(".final-panel");
let premiumScrollTicking = false;

const renderPremiumScroll = () => {
  premiumScrollTicking = false;
  if (!motionOk) return;

  const viewport = window.innerHeight || document.documentElement.clientHeight || 1;
  const depthEnabled = !mobileMenuQuery.matches;

  if (hero) {
    const rect = hero.getBoundingClientRect();
    const exitProgress = clamp(-rect.top / Math.max(rect.height - viewport * 0.34, 1), 0, 1);
    const easedExit = easeOutCubic(exitProgress);

    hero.style.setProperty("--hero-progress", exitProgress.toFixed(3));
    hero.style.setProperty("--hero-stage-y", depthEnabled ? `${lerp(0, 34, easedExit).toFixed(2)}px` : "0px");
    hero.style.setProperty("--hero-stage-rx", depthEnabled ? `${lerp(0, -6, easedExit).toFixed(2)}deg` : "0deg");
    hero.style.setProperty("--hero-stage-ry", depthEnabled ? `${lerp(0, 5, easedExit).toFixed(2)}deg` : "0deg");
    heroWord?.style.setProperty("--word-x", `${lerp(0, 96, easedExit).toFixed(2)}px`);
    heroWord?.style.setProperty("--word-y", `${lerp(0, -24, easedExit).toFixed(2)}px`);

    if (heroDashboard) {
      heroDashboard.style.setProperty("--scroll-y", depthEnabled ? `${lerp(0, 22, easedExit).toFixed(2)}px` : "0px");
      heroDashboard.style.setProperty("--scroll-depth", depthEnabled ? `${lerp(0, -18, easedExit).toFixed(2)}px` : "0px");
      heroDashboard.style.setProperty("--scroll-twist", depthEnabled ? `${lerp(0, 6, easedExit).toFixed(2)}deg` : "0deg");
      heroDashboard.style.setProperty("--scroll-scale", depthEnabled ? (1 - easedExit * 0.035).toFixed(3) : "1");
    }
  }

  if (statement) {
    const progress = easeOutCubic(getElementProgress(statement, 0.92, 0.2));
    statement.style.setProperty("--statement-fill", `${(progress * 100).toFixed(2)}%`);
  }

  bentoCards.forEach((card, index) => {
    const progress = easeOutCubic(getElementProgress(card, 0.9, 0.26));
    const delay = index * 0.055;
    const stagedProgress = clamp((progress - delay) / Math.max(1 - delay, 0.01), 0, 1);
    card.style.setProperty("--card-lift", depthEnabled ? `${lerp(26, 0, stagedProgress).toFixed(2)}px` : "0px");
    card.style.setProperty("--card-tilt", depthEnabled ? `${lerp(5, 0, stagedProgress).toFixed(2)}deg` : "0deg");
    card.style.setProperty("--card-scroll-glow", stagedProgress.toFixed(3));
  });

  metricCards.forEach((card, index) => {
    const progress = easeOutCubic(getElementProgress(card, 0.86, 0.28));
    const stagedProgress = clamp((progress - index * 0.07) / 0.93, 0, 1);
    card.style.setProperty("--metric-y", depthEnabled ? `${lerp(22, 0, stagedProgress).toFixed(2)}px` : "0px");
    card.style.setProperty("--metric-scale", depthEnabled ? (0.982 + stagedProgress * 0.018).toFixed(3) : "1");
    card.style.setProperty("--metric-progress", stagedProgress.toFixed(3));
  });

  if (finalPanel) {
    const progress = easeOutCubic(getElementProgress(finalPanel, 0.9, 0.2));
    finalPanel.style.setProperty("--final-y", depthEnabled ? `${lerp(26, 0, progress).toFixed(2)}px` : "0px");
    finalPanel.style.setProperty("--final-rx", depthEnabled ? `${lerp(6, 0, progress).toFixed(2)}deg` : "0deg");
    finalPanel.style.setProperty("--final-sweep", `${lerp(-120, 120, progress).toFixed(2)}%`);
  }
};

const requestPremiumScroll = () => {
  if (premiumScrollTicking) return;
  premiumScrollTicking = true;
  requestAnimationFrame(renderPremiumScroll);
};

if (motionOk && (heroStage || statement || bentoCards.length || metricCards.length || finalPanel)) {
  requestPremiumScroll();
  window.addEventListener("scroll", requestPremiumScroll, { passive: true });
  window.addEventListener("resize", requestPremiumScroll);
  listenToMedia(mobileMenuQuery, requestPremiumScroll);
}

if (motionOk && pointerOk) {
  const dot = document.querySelector("#cursor-dot");
  const ring = document.querySelector("#cursor-ring");
  const cursor = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    ringX: window.innerWidth / 2,
    ringY: window.innerHeight / 2
  };
  let cursorLoopActive = false;

  const placeCursor = (element, x, y) => {
    if (!element) return;
    element.style.transform = `translate(${x}px, ${y}px)`;
  };

  placeCursor(dot, cursor.x, cursor.y);
  placeCursor(ring, cursor.ringX, cursor.ringY);

  const cursorLoop = () => {
    cursor.ringX += (cursor.x - cursor.ringX) * 0.18;
    cursor.ringY += (cursor.y - cursor.ringY) * 0.18;
    placeCursor(ring, cursor.ringX, cursor.ringY);

    const remainingX = Math.abs(cursor.x - cursor.ringX);
    const remainingY = Math.abs(cursor.y - cursor.ringY);

    if (remainingX > 0.12 || remainingY > 0.12) {
      requestAnimationFrame(cursorLoop);
      return;
    }

    cursor.ringX = cursor.x;
    cursor.ringY = cursor.y;
    placeCursor(ring, cursor.ringX, cursor.ringY);
    cursorLoopActive = false;
  };

  const requestCursorLoop = () => {
    if (cursorLoopActive) return;
    cursorLoopActive = true;
    requestAnimationFrame(cursorLoop);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      cursor.x = event.clientX;
      cursor.y = event.clientY;
      placeCursor(dot, cursor.x, cursor.y);
      requestCursorLoop();
    },
    { passive: true }
  );

  document.querySelectorAll("a, button, .bento-card").forEach((target) => {
    target.addEventListener("pointerenter", () => {
      if (dot) {
        dot.style.width = "20px";
        dot.style.height = "20px";
        dot.style.filter = "saturate(1.35) brightness(1.12)";
      }
    });
    target.addEventListener("pointerleave", () => {
      if (dot) {
        dot.style.width = "";
        dot.style.height = "";
        dot.style.filter = "";
      }
    });
  });

  document.querySelectorAll(".magnet").forEach((magnet) => {
    const inner = magnet.querySelector(".magnet-inner") ?? magnet;
    const strength = Math.max(readFiniteNumber(magnet.dataset.strength, 6), 1);
    const padding = Math.max(readFiniteNumber(magnet.dataset.padding, 72), 0);

    magnet.addEventListener(
      "pointermove",
      (event) => {
        const rect = magnet.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clamp((event.clientX - cx) / strength, -padding / 4, padding / 4);
        const dy = clamp((event.clientY - cy) / strength, -padding / 5, padding / 5);
        inner.style.transform = `translate(${dx}px, ${dy}px)`;
      },
      { passive: true }
    );

    magnet.addEventListener("pointerleave", () => {
      inner.style.transform = "";
    });
  });

  document.querySelectorAll(".bento-card").forEach((card) => {
    card.addEventListener(
      "pointermove",
      (event) => {
        const rect = card.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);
        const x = ((event.clientX - rect.left) / width) * 100;
        const y = ((event.clientY - rect.top) / height) * 100;
        const rotateX = clamp((50 - y) / 6, -8, 8);
        const rotateY = clamp((x - 50) / 7, -8, 8);
        card.style.setProperty("--x", `${x}%`);
        card.style.setProperty("--y", `${y}%`);
        card.style.setProperty("--glow", "1");
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      },
      { passive: true }
    );

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--glow", "0");
      card.style.transform = "";
    });
  });

  const dashboard = document.querySelector("#dashboard-card");
  const hero = document.querySelector(".hero");

  hero?.addEventListener(
    "pointermove",
    (event) => {
      if (!dashboard) return;
      const rect = dashboard.getBoundingClientRect();
      const dx = clamp((event.clientX - (rect.left + rect.width / 2)) / 48, -8, 8);
      const dy = clamp((event.clientY - (rect.top + rect.height / 2)) / 64, -6, 6);
      dashboard.style.setProperty("--mx", `${dx}px`);
      dashboard.style.setProperty("--my", `${dy}px`);
    },
    { passive: true }
  );

  hero?.addEventListener("pointerleave", () => {
    dashboard?.style.setProperty("--mx", "0px");
    dashboard?.style.setProperty("--my", "0px");
  });
}

if (motionOk && pointerOk) {
  const canvas = document.querySelector("#spark-canvas");
  const ctx = canvas?.getContext("2d");
  const sparks = [];
  const sparkPalette = ["#25d7c3", "#9af7df", "#ef3f5d", "#ffbd59", "#f8fbfb"];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let sparkFrameActive = false;

  const resize = () => {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize);

  const emitSnap = (x, y, intensity = 1) => {
    const count = intensity > 1 ? 18 : 12;

    sparks.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1,
      decay: 0.045,
      size: intensity > 1 ? 34 : 24,
      type: "lock",
      rotation: Math.random() * Math.PI,
      color: sparkPalette[0]
    });

    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.26;
      const speed = 3.2 + Math.random() * 4.8 * intensity;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.026 + Math.random() * 0.018,
        size: 4 + Math.random() * 4.5,
        type: i % 3 === 0 ? "packet" : i % 3 === 1 ? "dash" : "node",
        rotation: angle + Math.PI / 4,
        color: sparkPalette[i % sparkPalette.length]
      });
    }

    for (let i = 0; i < 4; i += 1) {
      const angle = Math.PI * 0.5 * i + Math.random() * 0.18;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * (1.4 + Math.random()),
        vy: Math.sin(angle) * (1.4 + Math.random()),
        life: 1,
        decay: 0.032,
        size: 42 + Math.random() * 12,
        type: "signal",
        rotation: angle,
        color: i % 2 ? sparkPalette[2] : sparkPalette[0]
      });
    }

    if (sparks.length > 220) {
      sparks.splice(0, sparks.length - 220);
    }

    requestSparkFrame();
  };

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return;

      const interactive = event.target.closest(
        "a, button, .bento-card, .motion-card, .metric-card, #experience-frame, #dashboard-card, [data-mode]"
      );
      const frameBoundsClick =
        isPointerInsideElement(event, experienceFrame) || isPointerInsideElement(event, heroDashboard);
      if (!interactive && !frameBoundsClick) return;

      const frameClick =
        frameBoundsClick || Boolean(interactive?.closest("#experience-frame, #dashboard-card, [data-mode]"));
      emitSnap(event.clientX, event.clientY, frameClick ? 1.35 : 1);
    },
    { passive: true }
  );

  const draw = () => {
    if (!canvas || !ctx) {
      sparkFrameActive = false;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const spark = sparks[i];
      const prevX = spark.x;
      const prevY = spark.y;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.04;
      spark.life -= spark.decay ?? 0.028;

      if (spark.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = spark.life;
      ctx.strokeStyle = spark.color ?? (i % 2 ? "#25d7c3" : "#ef3f5d");
      ctx.fillStyle = spark.color ?? (i % 2 ? "#25d7c3" : "#ef3f5d");
      ctx.translate(spark.x, spark.y);
      ctx.rotate((spark.rotation ?? 0) + (1 - spark.life) * 1.4);
      ctx.beginPath();

      if (spark.type === "lock") {
        const size = spark.size * (1 - spark.life * 0.22);
        ctx.lineWidth = 1.4 * spark.life;
        for (let j = 0; j < 4; j += 1) {
          ctx.rotate(Math.PI / 2);
          ctx.moveTo(size * 0.38, -size * 0.5);
          ctx.lineTo(size * 0.5, -size * 0.5);
          ctx.lineTo(size * 0.5, -size * 0.38);
        }
        ctx.stroke();
      } else if (spark.type === "signal") {
        ctx.lineWidth = 1.2 * spark.life;
        ctx.moveTo(-spark.size * 0.5, 0);
        ctx.lineTo(spark.size * 0.5, 0);
        ctx.moveTo(spark.size * 0.25, -5);
        ctx.lineTo(spark.size * 0.5, 0);
        ctx.lineTo(spark.size * 0.25, 5);
        ctx.stroke();
      } else if (spark.type === "dash") {
        ctx.lineWidth = 2 * spark.life;
        ctx.moveTo(-spark.size * 0.8, 0);
        ctx.lineTo(spark.size * 0.8, 0);
        ctx.stroke();
      } else if (spark.type === "packet") {
        const size = spark.size * spark.life;
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.arc(0, 0, spark.size * 0.46 * spark.life, 0, Math.PI * 2);
        ctx.fill();
      }

      if (spark.type !== "lock" && spark.type !== "signal") {
        ctx.rotate(-(spark.rotation ?? 0) - (1 - spark.life) * 1.4);
        ctx.beginPath();
        ctx.globalAlpha = spark.life * 0.38;
        ctx.moveTo(0, 0);
        ctx.lineTo((prevX - spark.x) * 2.3, (prevY - spark.y) * 2.3);
        ctx.stroke();
      }

      ctx.restore();
    }

    if (sparks.length) {
      requestAnimationFrame(draw);
      return;
    }

    sparkFrameActive = false;
  };

  const requestSparkFrame = () => {
    if (sparkFrameActive || !canvas || !ctx) return;
    sparkFrameActive = true;
    requestAnimationFrame(draw);
  };
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = readFiniteNumber(counter.dataset.target, 0);
      const duration = motionOk ? 1100 : 1;
      const start = performance.now();

      const tick = (now) => {
        const progress = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.65 }
);

document.querySelectorAll(".count").forEach((counter) => {
  counterObserver.observe(counter);
});
