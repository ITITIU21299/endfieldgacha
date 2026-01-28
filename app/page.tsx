"use client";

import { useState, useCallback } from "react";
import {
  BannerType,
  GameState,
  performPull,
  getInitialState,
} from "../lib/gacha-system";
import { loadGameState, saveGameState, clearGameState } from "../lib/storage";

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getRarityColor(rarity: number): string {
  switch (rarity) {
    case 6:
      return "border-orange-400";
    case 5:
      return "border-yellow-300";
    case 4:
      return "border-purple-400";
    default:
      return "border-blue-400";
  }
}

function getRarityTextColor(rarity: number): string {
  switch (rarity) {
    case 6:
      return "text-orange-400";
    case 5:
      return "text-yellow-300";
    case 4:
      return "text-purple-400";
    default:
      return "text-blue-400";
  }
}

function getRarityStarColor(rarity: number): string {
  switch (rarity) {
    case 6:
      return "text-orange-400";
    case 5:
      return "text-yellow-300";
    case 4:
      return "text-purple-400";
    default:
      return "text-blue-400";
  }
}

function getDefaultImage(rarity: number, type: string): string {
  if (type === "weapon" || type === "item") {
    if (rarity === 4) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuBGIBrJQqOWescr2kV0sxgUxpV2dAFnABUQvoaR8iU7_A64SPYtQHNUblZoHPmBDtVzmPHDj_GBm8oyYe15Qc-Hmh3x-T8gQLHiKfkl5ettoYV0CLUvcCFxx3jgxYW3uN0vGezXmPI1g_ohZ9LREg3LgsJwI-0XSIh3_bt0usIQ90WzCCwmm30rv5fFYB79ht_xmpKMBS735yDt-7AAHUgUp_wikPx-X4uKze3H_Zc97-Q4X1diDerxyhnfd5Su9r2d4SLiuefZ0s4o";
    }
    if (rarity === 3) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuB5WKuaAI6LXWURvsn-pBYyQ3Exdah3soCCEYnlLhr2xDNlNN1_SBdGP1DtH5sVJxJvsydmu6wfjZpGf9gxiMw1Txl5lJgEsCzksvHacRtY9GErMHqlP5PjCF1_h66Z00x1001CBHmGZXMJYxtmp-GjO7DnUNz6TJHft2KBqZFQ32dOLlEEgzEpqhra8YJ4TZUQYCEvnRDXfVFlX1gLQGAnpxVHwnjR2eEIjSVl3OONK4oLCDQrPbQECTNpbeY9nA0-AbIQI9gXS5WS";
    }
  }
  return "";
}

function getBannerName(type: BannerType): string {
  switch (type) {
    case "limited":
      return "Limited";
    case "standard":
      return "Standard";
    case "weapon":
      return "Weapon";
    case "beginner":
      return "Beginner";
  }
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(() => {
    if (typeof window !== "undefined") {
      return loadGameState();
    }
    return null;
  });
  const [activeBanner, setActiveBanner] = useState<BannerType>("limited");
  const [isPulling, setIsPulling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [show6Star, setShow6Star] = useState(true);
  const [show5Star, setShow5Star] = useState(true);

  const handlePull = useCallback(
    (count: 1 | 10) => {
      if (!gameState || isPulling) return;

      setIsPulling(true);
      const { newState } = performPull(gameState, activeBanner, count);
      setGameState(newState);
      saveGameState(newState);

      setTimeout(() => {
        setIsPulling(false);
      }, 500);
    },
    [gameState, activeBanner, isPulling]
  );

  const handleAddCurrency = useCallback(
    (oroberyl: number) => {
      if (!gameState) return;
      const newState = {
        ...gameState,
        oroberyl: gameState.oroberyl + oroberyl,
      };
      setGameState(newState);
      saveGameState(newState);
    },
    [gameState]
  );

  const handleReset = useCallback(() => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      clearGameState();
      const initialState = getInitialState();
      setGameState(initialState);
      saveGameState(initialState);
    }
  }, []);

  // Reset page when filters change
  const handleFilterChange = useCallback((filterType: "6star" | "5star") => {
    if (filterType === "6star") {
      setShow6Star((prev) => !prev);
    } else {
      setShow5Star((prev) => !prev);
    }
    setHistoryPage(1);
  }, []);

  if (!gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const banner = gameState.banners[activeBanner];
  const hardPity = activeBanner === "beginner" ? 40 : 80;
  const pityPercentage = (banner.pityCount / hardPity) * 100;
  
  // Filter pull history by active banner
  const bannerHistory = gameState.pullHistory.filter(
    (pull) => pull.bannerType === activeBanner
  );
  
  // Apply rarity filters
  const filteredHistory = bannerHistory.filter((pull) => {
    // If both filters are off, show all pulls
    if (!show6Star && !show5Star) return true;
    
    // Otherwise, only show selected rarities
    if (pull.rarity === 6) return show6Star;
    if (pull.rarity === 5) return show5Star;
    // Don't show 3★ and 4★ when filters are active
    return false;
  });
  
  const recentPulls = bannerHistory.slice(0, 10);
  const totalSpent = gameState.stats.totalOroberylSpent || 0;
  const moneySpent = (totalSpent / 18150) * 70;

  // 120-pull spark (limited only)
  const sparkMax = 120;
  const sparkCount =
    activeBanner === "limited" && banner.limitedSparkCount !== undefined
      ? banner.limitedSparkCount
      : 0;
  const sparkUsed =
    activeBanner === "limited" && banner.limitedSparkUsed === true;
  const sparkPercent = sparkUsed
    ? 100
    : Math.min((sparkCount / sparkMax) * 100, 100);

  // Pagination for history (filtered by banner and rarity)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (historyPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistoryPage = filteredHistory.slice(startIndex, endIndex);

  const getBannerInfo = (type: BannerType) => {
    switch (type) {
      case "limited":
        return {
          title: "EVENT: LAEVATAIN",
          subtitle: "Operator: LAEVATAIN",
          description:
            "Red hair girl...",
          imageUrl:
            "https://endfield.wiki.gg/images/thumb/Snapshot_Laevatain_5.png/1920px-Snapshot_Laevatain_5.png?b4b08a",
          badge: "Limited Time",
          rates: { six: "0.8%", five: "8.0%", four: "91.2%" },
        };
      case "standard":
        return {
          title: "STANDARD",
          subtitle: "Standard Pool",
          description: "Permanent operators available in the standard banner.",
          imageUrl:
            "https://www.pcgamesn.com/wp-content/sites/pcgamesn/2025/02/arknights-endfield-banners-permanent-basic-headhunting.jpg",
          badge: "Permanent",
          rates: { six: "0.8%", five: "8.0%", four: "91.2%" },
        };
      case "weapon":
        return {
          title: "WEAPON",
          subtitle: "Arsenal Banner",
          description: "Weapons and equipment for your operators.",
          imageUrl: "https://media.discordapp.net/attachments/834371039453642762/1466077337169821717/image.png?ex=697b6e6b&is=697a1ceb&hm=23ecf0eb49f504bc8e22a27f8c4c020feefcf1c9187c4257a04682b84237da31&=&format=webp&quality=lossless",
          badge: "Arsenal",
          rates: { six: "4.0%", five: "15.0%", four: "81.0%" },
        };
      case "beginner":
        return {
          title: "NOVICE",
          subtitle: "Beginner Banner",
          description: "One-time beginner banner with guaranteed 6★ within 40 pulls.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBgwicYLisnI8yu_vuyTAT7nfpblf2Cx-wPtSHXU4YzmxTcp9hmZIMSzncYOJAOE9doS3vCGhoOcSEl69NTRAWJ8C_C1q89c7HA4PkPkq-jXCgrCeRYJv2WSU7u-H9UZ6lPgz9fHCZ8TDq6Uld-WYF3Ge0JH7G8HigpxHSEJiKH2z31jhLb0nBbd9CNdT9pUvE4tuFe-zPziVVgNk2NG_qoReLjnW1vLXDGiKn21AeLF6GghJkg03lm7sQqNym7_YBx0IvromKWT6dS",
          badge: "Beginner",
          rates: { six: "0.8%", five: "8.0%", four: "91.2%" },
        };
    }
  };

  const bannerInfo = getBannerInfo(activeBanner);
  const canPull1x =
    activeBanner === "weapon"
      ? gameState.arsenalTickets >= 198
      : gameState.oroberyl >= 500;
  const canPull10x =
    activeBanner === "weapon"
      ? gameState.arsenalTickets >= 1980
      : gameState.oroberyl >= 5000;

  return (
    <div className="flex min-h-screen flex-col bg-background-dark">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-surface-border bg-background-dark/95 backdrop-blur-md px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">
              deployed_code
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight glow-text uppercase text-white">
            Endfield {"//"} Simulator
          </h1>
        </div>
        <div className="hidden md:flex gap-3 items-center">
          <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-dark px-4 py-2">
            <span className="material-symbols-outlined text-primary text-xl">
              diamond
            </span>
            <span className="font-bold text-sm tracking-wide text-white">
              {formatNumber(gameState.oroberyl)}
            </span>
            <span className="text-xs text-gray-300 uppercase">Oroberyl</span>
          </div>
          {activeBanner === "weapon" && (
            <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-dark px-4 py-2">
              <span className="material-symbols-outlined text-rarity-blue text-xl">
                inventory_2
              </span>
              <span className="font-bold text-sm tracking-wide text-white">
                {formatNumber(gameState.arsenalTickets)}
              </span>
              <span className="text-xs text-gray-300 uppercase">Arsenal</span>
            </div>
          )}
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => handleAddCurrency(50000)}
              className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-xs font-bold uppercase transition-colors"
              type="button"
              title="Add 50,000 Oroberyl"
            >
              +50K
            </button>
          </div>
        </div>
        <button className="md:hidden p-2 text-white" type="button">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <div className="flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 p-4 lg:p-6 lg:h-[calc(100vh-80px)]">
        <main className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
          <nav className="flex w-full overflow-x-auto pb-1 border-b border-surface-border scrollbar-hide">
            <div className="flex gap-8 min-w-max px-2">
              {(
                [
                  { type: "limited", label: "EVENT: PERLICA" },
                  { type: "standard", label: "STANDARD" },
                  { type: "weapon", label: "WEAPON" },
                ] as const
              ).map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setActiveBanner(type)}
                  className={`group flex flex-col items-center gap-2 pb-3 border-b-2 transition-colors ${
                    activeBanner === type
                      ? "border-primary"
                      : "border-transparent hover:border-surface-border"
                  }`}
                  type="button"
                >
                  <span
                    className={`font-bold tracking-wide text-sm lg:text-base transition-colors ${
                      activeBanner === type
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          <div className="relative flex-1 rounded-2xl overflow-hidden bg-radial-void border border-surface-border group isolate min-h-[500px] lg:min-h-0">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#8c25f4 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            {bannerInfo.imageUrl && (
              <div className="absolute inset-0 z-0 flex items-center justify-center lg:justify-end lg:pr-20">
                <img
                  alt={bannerInfo.subtitle}
                  className="h-[120%] w-auto object-cover opacity-80 mix-blend-overlay lg:mix-blend-normal lg:opacity-100 mask-image-gradient"
                  src={bannerInfo.imageUrl}
                />
              </div>
            )}
            <div className="relative z-10 flex flex-col h-full justify-between p-6 lg:p-10">
              <div className="flex flex-col gap-2 max-w-lg">
                <div className="inline-flex items-center gap-2 self-start rounded bg-primary/20 px-2 py-1 text-xs font-bold text-primary uppercase tracking-wider border border-primary/30">
                  {bannerInfo.badge}
                </div>
                <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase drop-shadow-2xl text-outline-strong">
                  {bannerInfo.subtitle}
                </h2>
                <div className="h-1 w-24 bg-primary mt-2 mb-4" />
                <p className="text-lg text-gray-200 font-body max-w-md drop-shadow-md text-outline-strong">
                  {bannerInfo.description}
                </p>
                {activeBanner === "limited" && (
                  <div className="mt-2 flex gap-4 text-sm font-mono text-gray-300 text-outline-strong">
                    <span>CLASS: STRIKER</span>
                    <span>{"//"}</span>
                    <span className="text-primary">RATE UP: 50%</span>
                  </div>
                )}
              </div>
              <div className="mt-auto pt-10 flex flex-wrap gap-4 items-end">
                <button
                  onClick={() => handlePull(1)}
                  disabled={
                    !canPull1x ||
                    isPulling ||
                    (activeBanner === "beginner" && banner.isCompleted)
                  }
                  className="relative group flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-surface-dark border border-surface-border px-8 h-14 min-w-[160px] hover:bg-surface-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <span className="material-symbols-outlined text-white">
                    person
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-white font-bold text-lg leading-none uppercase">
                      Authorize 1x
                    </span>
                    <span className="text-gray-300 text-xs font-mono">
                      {activeBanner === "weapon" ? "198 Arsenal" : "500 ORO"}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => handlePull(10)}
                  disabled={
                    !canPull10x ||
                    isPulling ||
                    (activeBanner === "beginner" && banner.isCompleted)
                  }
                  className="relative group flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary px-10 h-16 min-w-[200px] hover:bg-primary-dark transition-all glow-border-gold border border-rarity-gold/50 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="material-symbols-outlined text-white text-3xl">
                    groups
                  </span>
                  <div className="flex flex-col items-start relative z-10">
                    <span className="text-white font-black text-xl leading-none uppercase tracking-wide">
                      Authorize 10x
                    </span>
                    <span className="text-white/90 text-xs font-mono">
                      {activeBanner === "weapon"
                        ? "1,980 Arsenal"
                        : "5,000 ORO"}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-surface-border pt-6">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">
                Pull History
              </h3>
              <button
                onClick={() => setShowHistory(true)}
                className="text-primary hover:text-white text-xs font-mono flex items-center gap-1 transition-colors"
                type="button"
              >
                <span>VIEW ALL</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {recentPulls.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-8">
                  No pulls yet. Start pulling to see your results!
                </div>
              ) : (
                recentPulls.map((pull) => (
                  <div
                    key={pull.id}
                    className={`aspect-[3/4] rounded-lg bg-surface-dark border-2 ${getRarityColor(
                      pull.rarity
                    )} relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform`}
                  >
                    {pull.rarity >= 5 && (
                      <div className="absolute top-0 right-0 p-1 z-20">
                        <span
                          className={`material-symbols-outlined ${getRarityStarColor(
                            pull.rarity
                          )} text-sm`}
                        >
                          star
                        </span>
                      </div>
                    )}
                    {pull.imageUrl || getDefaultImage(pull.rarity, pull.type) ? (
                      <img
                        alt={`${pull.rarity}★ ${pull.name}`}
                        className={`absolute inset-0 w-full h-full object-cover ${
                          pull.rarity >= 5
                            ? "opacity-80 group-hover:opacity-100"
                            : "opacity-60 group-hover:opacity-100 grayscale hover:grayscale-0"
                        } transition-opacity`}
                        src={
                          pull.imageUrl ||
                          getDefaultImage(pull.rarity, pull.type) ||
                          ""
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-surface-border/20">
                        <span className="material-symbols-outlined text-gray-500 text-4xl">
                          inventory_2
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                      <p
                        className={`text-xs font-bold truncate ${
                          pull.rarity >= 5 ? "text-white" : "text-gray-200"
                        }`}
                      >
                        {pull.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <aside className="flex flex-col gap-6 bg-surface-dark/50 border border-surface-border rounded-xl p-6 h-fit lg:h-full overflow-y-auto">
          <div className="flex items-center gap-2 pb-4 border-b border-surface-border">
            <span className="material-symbols-outlined text-primary">
              analytics
            </span>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
              Pity Tracker
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <p className="text-gray-300 text-sm font-mono">
                CURRENT HARD PITY
              </p>
              <p className="text-white text-xl font-bold font-mono">
                {banner.pityCount}
                <span className="text-gray-400 text-base">/{hardPity}</span>
              </p>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-border overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400"
                style={{ width: `${Math.min(pityPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>0</span>
              <span className="text-primary">
                Soft Pity: {activeBanner === "beginner" ? 40 : 65}
              </span>
              <span>{hardPity}</span>
            </div>
          </div>
          {activeBanner === "limited" && (
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex justify-between items-end">
                <p className="text-gray-300 text-sm font-mono">120 SPARK</p>
                <p className="text-white text-sm font-mono">
                  {sparkUsed ? "COMPLETED" : `${sparkCount}/${sparkMax}`}
                </p>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    sparkUsed
                      ? "bg-orange-400"
                      : "bg-gradient-to-r from-purple-400 to-orange-400"
                  }`}
                  style={{ width: `${sparkPercent}%` }}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="bg-background-dark border border-surface-border rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-gray-300 text-xs uppercase mb-1">
                Total Pulls
              </span>
              <span className="text-white text-2xl font-bold tracking-tight">
                {formatNumber(gameState.stats.totalPulls)}
              </span>
            </div>
            <div className="bg-background-dark border border-surface-border rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-orange-400 text-xs uppercase mb-1">
                6★ Count
              </span>
              <span className="text-orange-400 text-2xl font-bold tracking-tight">
                {gameState.stats.sixStarCount}
              </span>
            </div>
            <div className="bg-background-dark border border-surface-border rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-yellow-300 text-xs uppercase mb-1">
                5★ Count
              </span>
              <span className="text-yellow-300 text-2xl font-bold tracking-tight">
                {gameState.stats.fiveStarCount}
              </span>
            </div>
            <div className="bg-background-dark border border-surface-border rounded-lg p-3 flex flex-col items-center justify-center text-center">
              <span className="text-gray-300 text-xs uppercase mb-1">
                Avg Pity
              </span>
              <span className="text-white text-2xl font-bold tracking-tight">
                {gameState.stats.avgPity || 0}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-border flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Banner Probability
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-400 font-bold">
                  {activeBanner === "weapon" ? "6★ Weapon" : "6★ Operator"}
                </span>
                <span className="text-white font-mono">
                  {bannerInfo.rates.six}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-300 font-bold">
                  {activeBanner === "weapon" ? "5★ Weapon" : "5★ Operator"}
                </span>
                <span className="text-white font-mono">
                  {bannerInfo.rates.five}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400">
                  {activeBanner === "weapon"
                    ? "4★ Weapon"
                    : "4★ Operator/Item"}
                </span>
                <span className="text-white font-mono">
                  {bannerInfo.rates.four}
                </span>
              </div>
              {activeBanner !== "weapon" && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-400">3★ Item</span>
                  <span className="text-white font-mono">-</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-border flex flex-col gap-4">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Money Spent
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-200">Oroberyl Spent</span>
                <span className="text-white font-mono">
                  {formatNumber(totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-200">USD Equivalent</span>
                <span className="text-rarity-gold font-bold font-mono">
                  {formatCurrency(moneySpent)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-surface-border">
                Rate: 18,150 Oroberyl = $70
              </div>
            </div>
          </div>
          <div className="mt-auto pt-6 flex flex-col gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="w-full py-3 rounded-lg border border-surface-border text-gray-300 hover:text-white hover:border-gray-400 hover:bg-surface-border/50 transition-all text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">history</span>
              Full Pull History
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/20 transition-all text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Reset All Data
            </button>
          </div>
        </aside>
      </div>

      {/* Full Pull History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface-dark border border-surface-border rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="text-2xl font-bold text-white uppercase">
                {getBannerName(activeBanner)} Banner History
              </h2>
              <button
                onClick={() => {
                  setShowHistory(false);
                  setHistoryPage(1);
                  setShow6Star(true);
                  setShow5Star(true);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="px-6 pb-4 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-300 font-bold uppercase">Filters:</span>
                <button
                  onClick={() => handleFilterChange("6star")}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm font-bold uppercase ${
                    show6Star
                      ? "bg-rarity-gold/20 border-rarity-gold text-rarity-gold"
                      : "bg-surface-dark border-surface-border text-gray-400 hover:text-gray-300"
                  }`}
                  type="button"
                >
                  6★
                </button>
                <button
                  onClick={() => handleFilterChange("5star")}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm font-bold uppercase ${
                    show5Star
                      ? "bg-rarity-purple/20 border-rarity-purple text-rarity-purple"
                      : "bg-surface-dark border-surface-border text-gray-400 hover:text-gray-300"
                  }`}
                  type="button"
                >
                  5★
                </button>
                {(show6Star || show5Star) && (
                  <button
                    onClick={() => {
                      setShow6Star(true);
                      setShow5Star(true);
                      setHistoryPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-surface-border bg-surface-dark text-gray-400 hover:text-gray-300 text-xs font-bold uppercase transition-colors"
                    type="button"
                  >
                    Show All
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {filteredHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  {bannerHistory.length === 0
                    ? "No pull history for this banner yet."
                    : "No pulls match the selected filters."}
                </div>
              ) : (
                <div className="space-y-2">
                  {currentHistoryPage.map((pull) => {
                    // Find the original position in the full banner history
                    const originalIndex = bannerHistory.findIndex(
                      (p) => p.id === pull.id
                    );
                    const pullNumber = bannerHistory.length - originalIndex;
                    const date = new Date(pull.timestamp);
                    const imageSrc =
                      pull.imageUrl ||
                      getDefaultImage(pull.rarity, pull.type) ||
                      "";
                    return (
                      <div
                        key={pull.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-background-dark border border-surface-border hover:bg-surface-border/50 transition-colors"
                      >
                        <div
                          className={`relative flex items-center justify-center w-14 h-14 rounded-md border-2 ${getRarityColor(
                            pull.rarity
                          )} bg-surface-dark overflow-hidden`}
                        >
                          {imageSrc ? (
                            <img
                              alt={`${pull.rarity}★ ${pull.name}`}
                              src={imageSrc}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className={`material-symbols-outlined text-2xl ${getRarityTextColor(
                                pull.rarity
                              )}`}
                            >
                              inventory_2
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">
                              {pull.name}
                            </span>
                            {pull.isFeatured && (
                              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold uppercase">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span>{getBannerName(pull.bannerType)}</span>
                            <span>•</span>
                            <span>{pull.type}</span>
                            <span>•</span>
                            <span>
                              {date.toLocaleDateString()} {date.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-400 text-sm font-mono">
                          #{pullNumber}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-surface-border">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="px-4 py-2 rounded-lg border border-surface-border bg-surface-dark text-white hover:bg-surface-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  Previous
                </button>
                <span className="text-gray-300 text-sm font-mono">
                  Page {historyPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setHistoryPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={historyPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-surface-border bg-surface-dark text-white hover:bg-surface-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
