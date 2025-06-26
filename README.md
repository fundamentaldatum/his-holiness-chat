# 🕊️ HIS HOLINESS WILL SEE YOU NOW

> *An AI-powered digital confessional featuring a bewildered floating Pope Francis*

[![Built with Convex](https://img.shields.io/badge/Built%20with-Convex-orange)](https://convex.dev)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.175.0-green)](https://threejs.org/)

## 🎭 What Is This?

"His Holiness Will See You Now" is a surreal digital confession experience where users can confess their sins to an AI-powered Pope Francis who appears as a confused, rotating 3D head floating in a dark void. The Pope, genuinely bewildered by his digital predicament, still earnestly attempts to provide pastoral guidance while occasionally asking for Burger King and sharing his ideas for Transformers movies.

### ✨ Key Features

- **🗣️ AI-Powered Confessions**: Chat with Pope Francis powered by OpenAI GPT-4
- **🌀 3D Rotating Pope**: Interactive Three.js model that spins mysteriously in space
- **🔥 Digital Absolution**: Clear your sins with a dramatic fire animation
- **📱 Mobile Responsive**: Confess on any device, anywhere
- **👤 Personal Sessions**: Each user gets their own private confession space
- **📜 Pre-Written Sins**: Choose from curated lists of venial and mortal sins
- **🎪 Surreal Humor**: The Pope's genuine confusion about his floating state

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- [Convex account](https://convex.dev)
- [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd his-holiness-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   Follow the prompts to create/connect your Convex project.

4. **Configure environment variables**
   
   Create a `.env.local` file in the Convex dashboard or set environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` and begin your digital confession.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Convex (real-time database + serverless functions)
- **3D Graphics**: Three.js + React Three Fiber
- **AI**: OpenAI GPT-4 (gpt-4.1-nano-2025-04-14)
- **Styling**: Tailwind CSS + Custom CSS
- **Authentication**: Convex Auth (Anonymous)

### Project Structure

```
his-holiness-chat/
├── src/
│   ├── components/
│   │   ├── chat/              # Chat interface components
│   │   ├── effects/           # Visual effects (fire animation)
│   │   ├── model/             # 3D Pope model components
│   │   └── modals/            # UI modals
│   ├── contexts/              # React contexts for state management
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions and constants
│   └── App.tsx               # Main application component
├── convex/                   # Backend functions and schema
├── public/                   # Static assets (3D model, images)
└── package.json
```

## 🎮 How to Use

### Starting a Confession

1. **Enter the Digital Confessional**: The Pope will greet you with a welcome message
2. **Choose Your Approach**:
   - Type your own confession in the text input
   - Use the dropdown to select from pre-written sins
3. **Receive Guidance**: The Pope responds with pastoral advice (and occasional confusion about his floating state)
4. **Seek Absolution**: Click "Absolve Me" to clear your sins with a dramatic fire effect

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript and ESLint checks
- `npm run dev:frontend` - Start only the frontend server
- `npm run dev:backend` - Start only the Convex backend

### Recent Improvements

The codebase was recently refactored for better organization:

- **Component Separation**: Extracted reusable components from monolithic App.tsx
- **Custom Hooks**: Added hooks for scrolling, viewport detection, and user management
- **Context API**: Implemented React contexts for state management
- **Type Safety**: Improved TypeScript definitions throughout
- **Performance**: Optimized rendering and state updates

### Customization

#### Modifying the Pope's Personality

Edit the system prompt in `convex/messages.ts` to change how the Pope responds:

```typescript
// In the generateBotReply function
content: `You are Pope Francis, but you've somehow become a floating, rotating head...`
```

#### Adding New Confession Options

Update the sin lists in `src/utils/constants.ts`:

```typescript
export const VENIAL_SINS = [
  "Your new venial sin here",
  // ... existing sins
];

export const MORTAL_SINS = [
  "Your new mortal sin here", 
  // ... existing sins
];
```

#### Adjusting the 3D Model

Modify model properties in `src/utils/constants.ts`:

```typescript
export const MODEL_SCALE = 2.5;        // Size of the Pope's head
export const ROTATION_SPEED = 0.5;     // How fast he spins
export const SPIN_THRESHOLD = 3.5;     // When he gets dizzy
```

## 🚀 Deployment

### Convex Deployment

1. **Deploy your backend**:
   ```bash
   npx convex deploy
   ```

2. **Set production environment variables** in the Convex dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key

3. **Build and deploy frontend** to your preferred hosting service:
   ```bash
   npm run build
   ```

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Automatically handled by Convex
- **Database**: Automatically handled by Convex

## 🤝 Contributing

Contributions are welcome! This project embraces both technical excellence and creative absurdity.

### Development Guidelines

- Follow the existing TypeScript patterns
- Maintain the Pope's character consistency
- Test on both desktop and mobile
- Keep the surreal humor intact
- Document any new features

## 📜 License

This project is proprietary software owned by James Blackwell. See the [LICENSE](LICENSE) file for details.

**Summary**: You may view and run this software locally for personal use, but commercial use, distribution, modification, and public deployment are prohibited without explicit permission.

Please use responsibly and with respect for religious sensitivities.
---

*"Pax vobiscum, my digital children. Now, has anyone seen my body? I seem to have misplaced it somewhere in cyberspace..."* - Pope Francis (probably)
