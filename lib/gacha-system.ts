// Gacha System Logic based on GachaSystem.txt

export type BannerType = "limited" | "standard" | "beginner" | "weapon";
export type Rarity = 3 | 4 | 5 | 6;
export type ItemType = "operator" | "weapon" | "item";

export interface PullResult {
  id: string;
  timestamp: number;
  bannerType: BannerType;
  rarity: Rarity;
  name: string;
  type: ItemType;
  isFeatured?: boolean;
  imageUrl?: string;
}

export interface BannerState {
  pityCount: number; // Current pity counter for 6★
  lastRarity: Rarity | null; // Last rarity pulled (for 5★ guarantee)
  guaranteeCount: number; // Used for weapon featured 6★ cycle
  totalPulls: number; // Total pulls on this banner
  isCompleted?: boolean; // For Beginner banner
  // Limited banner 120-pull featured guarantee (spark)
  limitedSparkCount?: number; // Number of pulls since banner start towards first featured 6★
  limitedSparkUsed?: boolean; // Whether the one-time 120 spark has been consumed
}

export interface GameState {
  oroberyl: number;
  tickets: number;
  arsenalTickets: number;
  banners: Record<BannerType, BannerState>;
  pullHistory: PullResult[];
  stats: {
    totalPulls: number;
    sixStarCount: number;
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    avgPity: number;
    pityHistory: number[]; // Track pity when 6★ is pulled
    totalOroberylSpent: number; // Track only spent from pulls, not added
  };
  limitedBonuses: {
    free10Pull: boolean; // 60 pulls bonus
  };
}

// Character pool (simplified - in real game would be larger)
const CHARACTER_POOL = {
  6: [
    { name: "Laevatain", isFeatured: true, imageUrl: "https://www.prydwen.gg/static/5909b148a77c8311b612a8a0f2306976/b26e2/Laevatain_card.webp" },
    { name: "Ember", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/271c93d0a66fc6608a907ddb44924455/b26e2/Ember_card.webp" },
    { name: "Gilberta", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/ea11bc1f5a07f87e1f09b427077f80ce/b26e2/Gilberta_card.webp" },
    { name: "Yvonne", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/3329002cd26c80ef654481fb8470b6eb/b26e2/Yvonne_card.webp" },
    { name: "Last Rite", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/2a92e48cfa9514dda6d3ae2bae3464c7/b26e2/lastrite_card.webp" },
    { name: "Ardelina", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/33dc6ba762f79eb801a225df3f23fc63/b26e2/ardelia_card.webp" },
    { name: "Lifeng", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/824a2636112f900b39e0b880f0721a70/b26e2/Lifeng_card.webp" },
    { name: "Pogranichnik", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/93cc60b9b7b5d8e4d10d75049c13a12d/b26e2/pog_card.webp" },
  ],
  5: [
    { name: "Alesh", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/4ab4a04bc6ea4608e3fdc0b029e8adbd/b26e2/alesh_card.webp" },
    { name: "Arclight", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/47af9a2d24eae5c81e42cf52a2f93ec8/b26e2/Arclight_card.webp" },
    { name: "Avywenna", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/6645b4a98fe068e1a0baf2d92671a2c8/b26e2/Avywenna_card.webp" },
    { name: "Chen Qianyu", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/ffb2f1fdf02c5addcfdb98f7b4349c6a/b26e2/Chen_Qianyu_card.webp" },
    { name: "Da Pan", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/1dcf4fb5768b0ebed63fdec362a9f32d/b26e2/Da_Pan_card.webp" },
    { name: "Perlica", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/75c75610b5049c97925ee6fe298fa01d/b26e2/Perlica_card.webp" },
    { name: "Snowshine", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/267013fd7ebe68504acdc30a40822370/b26e2/Snowshine_card.webp" },
    { name: "Wulfgard", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/387044801881e9b065a92997bb940612/b26e2/Wulfguard_card.webp" },
    { name: "Xaihi", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/033cef5dba728ff5d8e058a457523093/b26e2/Xaihi_card.webp" },
  ],
  4: [
    { name: "Akekuri", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/4ae8f2802b09b4861048cd448ba8ac1c/b26e2/akekuri_card.webp" },
    { name: "Antal", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/e273a723742f6952c1c3ea33bb8f91dc/b26e2/antel_card.webp" },
    { name: "Catcher", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/b14c31b1d502e096c14d250da05ee67c/b26e2/catcher_card.webp" },
    { name: "Estalla", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/ddc19b6df6cc72c0a54dc8613e593441/b26e2/estella_card.webp" },
    { name: "Fluorite", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/c43a32a2c506dea5dc1cdb7e1bf4536e/b26e2/fluorite_card.webp" },
    { name: "Catcher", isFeatured: false, imageUrl: "https://www.prydwen.gg/static/b14c31b1d502e096c14d250da05ee67c/b26e2/catcher_card.webp" },
  ],
};

const WEAPON_POOL = {
  6: [
    { name: "Forgeborn Scathe", isFeatured: true, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/The-Fifth-Heirloom.png" },
    { name: "White Night Nova", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Cerulean-Resonance.png" },
    { name: "Wedge", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Wedge.png" },
    { name: "Clannibal", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Clannibal.png" },
    { name: "Chivalric Virtues", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Chivalric-Virtues.png" },
    { name: "Valiant", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Valiant.png" },
    { name: "Former Finery", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Former-Finery.png" },
  ],
  5: [
    { name: "5 star", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/OBJ-Velocitous.png" },
  ],
  4: [
    { name: "4 star", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Howling-Guard.png" },
  ],
  3: [
    { name: "3 star", isFeatured: false, imageUrl: "https://arknightsendfield.gg/wp-content/uploads/Peco-5.png" },
  ],
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function calculateCharacterRarity(
  pityCount: number,
  lastRarity: Rarity | null,
  bannerType: BannerType
): Rarity {
  // Hard pity at 80 (or 40 for Beginner)
  const hardPity = bannerType === "beginner" ? 40 : 80;
  if (pityCount >= hardPity) {
    return 6;
  }

  // Soft pity starts at 65
  if (pityCount >= 65) {
    const softPityRate = 0.008 + (pityCount - 65) * 0.05; // Base 0.8% + 5% per pull
    if (Math.random() < softPityRate) {
      return 6;
    }
  }

  // 5★ guarantee every 10 pulls (if last wasn't 5★ or 6★)
  if (pityCount % 10 === 0 && lastRarity !== 5 && lastRarity !== 6) {
    return 5;
  }

  // Base rates
  const roll = Math.random();
  if (roll < 0.008) return 6; // 0.8%
  if (roll < 0.088) return 5; // 8%
  if (roll < 1.0) return 4; // 91.2%

  return 4; // Fallback
}

function calculateWeaponRarity(
  pityCount: number,
  lastRarity: Rarity | null
): Rarity {
  // Hard pity cycles for weapons
  if (pityCount >= 80) {
    return 6; // 100% featured 6★
  }
  if (pityCount >= 40 && Math.random() < 0.25) {
    return 6; // 25% featured 6★
  }

  // 5★ guarantee every 10 pulls
  if (pityCount % 10 === 0 && lastRarity !== 5 && lastRarity !== 6) {
    return 5;
  }

  // Base rates
  const roll = Math.random();
  if (roll < 0.04) return 6; // 4%
  if (roll < 0.19) return 5; // 15%
  if (roll < 1.0) return 4; // 81%

  return 4;
}

function pullCharacter(
  rarity: Rarity,
  bannerType: BannerType,
  forceFeatured?: boolean
): PullResult {
  const pool = CHARACTER_POOL[rarity as keyof typeof CHARACTER_POOL];
  if (!pool || pool.length === 0) {
    // Fallback
    return {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      bannerType,
      rarity,
      name: `Unknown ${rarity}★`,
      type: "operator",
    };
  }

  let item = getRandomItem(pool);

  // Limited banner featured logic (rate-up + optional forced featured)
  if (bannerType === "limited" && rarity === 6) {
    let makeFeatured = false;

    if (forceFeatured) {
      // 120-spark guarantee forces a featured 6★
      makeFeatured = true;
    } else {
      // Otherwise, 50/50 on featured for limited 6★
      if (Math.random() < 0.5) {
        makeFeatured = true;
      }
    }

    if (makeFeatured) {
      const featuredItem = (pool as Array<{ name: string; isFeatured?: boolean }>).find(
        (i) => i.isFeatured
      );
      if (featuredItem) {
        item = featuredItem as (typeof pool)[number];
      }
    }
  }

  return {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    bannerType,
    rarity,
    name: item.name,
    type: "operator",
    isFeatured: item.isFeatured,
    imageUrl: "imageUrl" in item && typeof item.imageUrl === "string" ? item.imageUrl : undefined,
  };
}

function pullWeapon(rarity: Rarity, guaranteeCount: number): PullResult {
  const pool = WEAPON_POOL[rarity as keyof typeof WEAPON_POOL];
  if (!pool || pool.length === 0) {
    return {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      bannerType: "weapon",
      rarity,
      name: `Unknown ${rarity}★ Weapon`,
      type: "weapon",
    };
  }

  let item = getRandomItem(pool);

  // Weapon banner featured logic
  if (rarity === 6) {
    if (guaranteeCount >= 80) {
      // 100% featured
      item = pool.find((i) => i.isFeatured) || item;
    } else if (guaranteeCount >= 40) {
      // 25% featured
      if (Math.random() < 0.25) {
        item = pool.find((i) => i.isFeatured) || item;
      }
    }
  }

  return {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    bannerType: "weapon",
    rarity,
    name: item.name,
    type: rarity === 3 ? "item" : "weapon",
    isFeatured: item.isFeatured,
    imageUrl: "imageUrl" in item && typeof item.imageUrl === "string" ? item.imageUrl : undefined,
  };
}

export function performPull(
  state: GameState,
  bannerType: BannerType,
  count: 1 | 10
): { results: PullResult[]; newState: GameState } {
  const banner = state.banners[bannerType];
  const results: PullResult[] = [];

  // Ensure limited spark fields are initialized
  if (bannerType === "limited") {
    if (banner.limitedSparkCount === undefined) {
      banner.limitedSparkCount = 0;
    }
    if (banner.limitedSparkUsed === undefined) {
      banner.limitedSparkUsed = false;
    }
  }

  // Check if beginner banner is completed
  if (bannerType === "beginner" && banner.isCompleted) {
    return { results: [], newState: state };
  }

  // Check currency
  if (bannerType === "weapon") {
    const cost = count === 10 ? 1980 : 198;
    if (state.arsenalTickets < cost) {
      return { results: [], newState: state };
    }
  } else {
    const cost = count === 10 ? 5000 : 500;
    if (state.oroberyl < cost) {
      return { results: [], newState: state };
    }
  }

  // Perform pulls
  for (let i = 0; i < count; i++) {
    // Limited 120-pull featured spark logic
    let forceFeatured = false;
    if (bannerType === "limited") {
      if (!banner.limitedSparkUsed) {
        const currentSpark = banner.limitedSparkCount ?? 0;
        const nextSpark = currentSpark + 1;
        banner.limitedSparkCount = nextSpark;
        if (nextSpark >= 120) {
          // This pull triggers the 120 spark: force a featured 6★
          forceFeatured = true;
        }
      }
    }

    let rarity: Rarity;
    if (bannerType === "weapon") {
      rarity = calculateWeaponRarity(banner.pityCount, banner.lastRarity);
    } else {
      rarity = calculateCharacterRarity(
        banner.pityCount,
        banner.lastRarity,
        bannerType
      );

      // If 120-spark should trigger, ensure the roll is 6★
      if (bannerType === "limited" && forceFeatured && rarity !== 6) {
        rarity = 6;
      }
    }

    const result =
      bannerType === "weapon"
        ? pullWeapon(rarity, banner.guaranteeCount)
        : pullCharacter(rarity, bannerType, forceFeatured);

    results.push(result);

    // Update banner state
    banner.pityCount++;
    banner.totalPulls++;
    banner.lastRarity = rarity;

    // Reset pity on 6★ and record it
    if (rarity === 6) {
      state.stats.pityHistory.push(banner.pityCount);
      banner.pityCount = 0;
    }

    // Weapon banner featured guarantees (40/80 cycle)
    if (bannerType === "weapon" && rarity === 6) {
      banner.guaranteeCount = 0;
    } else if (bannerType === "weapon") {
      banner.guaranteeCount++;
    }

    // Beginner banner completion
    if (bannerType === "beginner" && rarity === 6) {
      banner.isCompleted = true;
    }

    // Limited 120-spark completion:
    // If we just obtained a featured 6★ on the limited banner and the spark wasn't used yet,
    // mark the spark as consumed and clamp the counter to 120 for display.
    if (
      bannerType === "limited" &&
      !banner.limitedSparkUsed &&
      rarity === 6 &&
      result.isFeatured
    ) {
      banner.limitedSparkUsed = true;
      banner.limitedSparkCount = 120;
    }

    // Update stats
    state.stats.totalPulls++;
    if (rarity === 6) state.stats.sixStarCount++;
    else if (rarity === 5) state.stats.fiveStarCount++;
    else if (rarity === 4) state.stats.fourStarCount++;
    else state.stats.threeStarCount++;

    // Earn Arsenal Tickets
    if (bannerType !== "weapon") {
      if (rarity === 6) state.arsenalTickets += 2000;
      else if (rarity === 5) state.arsenalTickets += 200;
      else if (rarity === 4) state.arsenalTickets += 20;
    }

    // Limited banner bonus removed (no tickets feature)
  }

  // Update currency
  if (bannerType === "weapon") {
    const cost = count === 10 ? 1980 : 198;
    state.arsenalTickets -= cost;
  } else {
    const cost = count === 10 ? 5000 : 500;
    state.oroberyl -= cost;
    // Track spent Oroberyl (only from pulls, not from add button)
    state.stats.totalOroberylSpent += cost;
  }

  // Update average pity
  if (state.stats.pityHistory.length > 0) {
    state.stats.avgPity = Math.round(
      state.stats.pityHistory.reduce((a, b) => a + b, 0) /
        state.stats.pityHistory.length
    );
  }

  // Add to history
  state.pullHistory.unshift(...results);
  // Keep only last 1000 pulls in memory
  if (state.pullHistory.length > 1000) {
    state.pullHistory = state.pullHistory.slice(0, 1000);
  }

  return { results, newState: state };
}

export function getInitialState(): GameState {
  return {
    oroberyl: 6767676767,
    tickets: 0, // No longer used, kept for compatibility
    arsenalTickets: 0,
    banners: {
      limited: {
        pityCount: 0,
        lastRarity: null,
        guaranteeCount: 0,
        totalPulls: 0,
      },
      standard: {
        pityCount: 0,
        lastRarity: null,
        guaranteeCount: 0,
        totalPulls: 0,
      },
      beginner: {
        pityCount: 0,
        lastRarity: null,
        guaranteeCount: 0,
        totalPulls: 0,
        isCompleted: false,
      },
      weapon: {
        pityCount: 0,
        lastRarity: null,
        guaranteeCount: 0,
        totalPulls: 0,
      },
    },
    pullHistory: [],
    stats: {
      totalPulls: 0,
      sixStarCount: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      avgPity: 0,
      pityHistory: [],
      totalOroberylSpent: 0,
    },
    limitedBonuses: {
      free10Pull: false,
    },
  };
}

