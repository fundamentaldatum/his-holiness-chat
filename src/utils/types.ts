import { ReactNode } from 'react';

/**
 * Generic ID type for database entities
 */
export type Id = string;

/**
 * Chat message interface
 */
export interface ChatMessage {
  _id: Id;
  _creationTime: number;
  author: string;
  body: string;
  userId: string;
}

/**
 * Props for components that accept children
 */
export interface WithChildrenProps {
  children: ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  disabled?: boolean;
}

/**
 * Props for components that can have a className
 */
export interface ClassNameProps {
  className?: string;
}

/**
 * Combined props for components that can have children, be disabled, and have a className
 */
export type CommonComponentProps = WithChildrenProps & DisableableProps & ClassNameProps;

/**
 * Confession dropdown type
 */
export type ConfessionType = 'venial' | 'mortal';

/**
 * Props for the ConfessionDropdown component
 */
export interface ConfessionDropdownProps extends DisableableProps {
  onSelect: (confession: string) => void;
  type?: ConfessionType;
  mobile?: boolean;
}

/**
 * Props for the ChatInput component
 */
export interface ChatInputProps {
  onSubmit: (body: string) => Promise<void>;
  onConfess?: () => void;
}

/**
 * Ref interface for the ChatInput component
 */
export interface ChatInputRef {
  setValue: (value: string) => void;
  submitForm: () => Promise<void>;
}

/**
 * Props for the ChatMessage component
 */
export interface ChatMessageProps {
  author: string;
  body: string;
  time: number;
}

/**
 * Props for the AbsolveModal component
 */
export interface AbsolveModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Props for the FireOverlay3D component
 */
export interface FireOverlay3DProps {
  // No props needed for now, but keeping the interface for future extensibility
}

/**
 * Props for the ModelLoader component
 */
export interface ModelLoaderProps {
  // No props needed for now, but keeping the interface for future extensibility
}

/**
 * Props for the ModelFallback component
 */
export interface ModelFallbackProps {
  // No props needed for now, but keeping the interface for future extensibility
}

/**
 * Props for the Model component
 */
export interface ModelProps {
  // No props needed for now, but keeping the interface for future extensibility
}

/**
 * Props for the ResetButton component
 */
export interface ResetButtonProps {
  onClick: () => void;
}

/**
 * Props for the ModelErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * State for the ModelErrorBoundary component
 */
export interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Viewport state
 */
export interface ViewportState {
  isMobile: boolean;
  isSmallMobile: boolean;
  isKeyboardVisible: boolean;
  width: number;
  height: number;
  appHeight: number;
}

/**
 * User identity
 */
export interface UserIdentity {
  userId: string;
  isNewUser: boolean;
  welcomeShown: boolean;
  markWelcomeAsShown: () => void;
  clearWelcomeFlag: () => void;
}
