// App configuration
export const APP_NAME = "HIS HOLINESS WILL SEE YOU NOW";
export const APP_VERSION = "1.0.0";

// Local storage keys
export const STORAGE_USER_ID_KEY = "popeUserId";
export const STORAGE_WELCOME_SHOWN_KEY = "popeWelcomeShown";

// UI constants
export const HEADER_HEIGHT = 60; // Approximate header height in pixels
export const SCROLL_THRESHOLD = 100; // Distance from bottom to show scroll button
export const AUTO_SCROLL_THRESHOLD = 50; // Distance from bottom to auto-scroll
export const KEYBOARD_VISIBILITY_RATIO = 0.8; // Ratio to detect keyboard visibility

// Animation durations
export const TYPING_SPEED = 20; // Milliseconds per character
export const TYPING_INITIAL_DELAY = 50; // Milliseconds before typing starts
export const BURNING_ANIMATION_DURATION = 2500; // Milliseconds for burning animation
export const GOLD_GLOW_ANIMATION_DURATION = 7000; // Milliseconds for gold glow animation

// Viewport breakpoints
export const BREAKPOINT_XS = 480; // Extra small devices
export const BREAKPOINT_SM = 640; // Small devices
export const BREAKPOINT_MD = 768; // Medium devices
export const BREAKPOINT_LG = 1024; // Large devices
export const BREAKPOINT_XL = 1280; // Extra large devices

// 3D model constants
export const MODEL_PATH = "/pope_francis.glb";
export const MODEL_SCALE = 2.5;
export const ROTATION_SPEED = 0.5;
export const SPIN_THRESHOLD = 3.5; // Threshold for dizzy pope feature
export const DIZZY_COOLDOWN = 20000; // Cooldown for dizzy pope feature in milliseconds

// Fire effect constants
export const FIRE_COLORS = [
  "#fffbe6", // pale yellow
  "#ffd700", // gold
  "#ffb300", // orange
  "#ff9800", // deep orange
  "#ff5722", // red-orange
  "#e65100", // dark red-orange
  "#b71c1c", // deep red
  "#4e342e", // brown (smoke)
  "#2d1a00", // dark brown (smoke tip)
];

// Confession lists
export const VENIAL_SINS = [
  "I got a tattoo",
  "I was on my phone during Mass",
  "I got married in a Protestant chapel",
  "I got $150 in free Bonus Bets on Fan Duel",
  "I missed church to attend your funeral",
  "I parented my children too strictly",
  "I did not parent my children strictly enough",
  "I grabbed my dog by its hind legs and pushed it around like a vacuum cleaner",
  "I never got to say \"I love you\""
];

export const MORTAL_SINS = [
  "I actively harbor resentment toward the elderly",
  "I defrauded my local parish through a highly-complicated embezzlement scheme for my own personal enrichment",
  "I observed the Sabbath day on a Wednesday",
  "I used my $150 in free Bonus Bets on Fan Duel to participate in rigging the World Series",
  "I lied to the Pope about how I used my $150 in free bonus bets on Fan Duel",
  "I got baptized at 4 different churches and 2 different county jails",
  "I convinced my friend that there is a book in the Bible called \"Mitchell\"",
  "I defrauded my local parish through a highly-complicated embezzlement scheme for my own personal enrichment again"
];

// Welcome message
export const WELCOME_MESSAGE = "Welcome, Penitent One, how many weeks has it been since your last confession?";

// Dizzy message
export const DIZZY_MESSAGE = "Penitent One, the spinning... please...";

// Input placeholder
export const INPUT_PLACEHOLDER = "What troubles you, my son...";
