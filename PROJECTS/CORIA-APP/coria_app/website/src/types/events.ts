/**
 * Event handling type definitions for interactive components
 */

// Base event handler types
export type EventHandler<T = HTMLElement> = (event: React.SyntheticEvent<T>) => void;
export type MouseEventHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void;
export type KeyboardEventHandler<T = HTMLElement> = (event: React.KeyboardEvent<T>) => void;
export type FocusEventHandler<T = HTMLElement> = (event: React.FocusEvent<T>) => void;
export type TouchEventHandler<T = HTMLElement> = (event: React.TouchEvent<T>) => void;
export type ChangeEventHandler<T = HTMLElement> = (event: React.ChangeEvent<T>) => void;

// Specific element event handlers
export type ButtonClickHandler = MouseEventHandler<HTMLButtonElement>;
export type LinkClickHandler = MouseEventHandler<HTMLAnchorElement>;
export type InputChangeHandler = ChangeEventHandler<HTMLInputElement>;
export type TextareaChangeHandler = ChangeEventHandler<HTMLTextAreaElement>;
export type SelectChangeHandler = ChangeEventHandler<HTMLSelectElement>;

// Form event handlers
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type FormResetHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// Navigation event handlers
export type NavigationHandler = (path: string) => void;
export type RouteChangeHandler = (url: string) => void;

// Keyboard navigation types
export type KeyCode = 
  | 'Enter'
  | 'Space'
  | 'Escape'
  | 'Tab'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown';

export interface KeyboardNavigationHandler {
  onKeyDown?: KeyboardEventHandler;
  onKeyUp?: KeyboardEventHandler;
  onKeyPress?: KeyboardEventHandler;
}

// Touch and gesture event types
export interface TouchPosition {
  x: number;
  y: number;
}

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

export type SwipeHandler = (direction: SwipeDirection) => void;
export type PinchHandler = (scale: number) => void;
export type LongPressHandler = (position: TouchPosition) => void;

// Focus management types
export interface FocusableElement {
  focus(): void;
  blur(): void;
  tabIndex?: number;
}

export type FocusHandler<T = HTMLElement> = FocusEventHandler<T>;
export type BlurHandler<T = HTMLElement> = FocusEventHandler<T>;

export interface FocusManagement {
  onFocus?: FocusHandler;
  onBlur?: BlurHandler;
  onFocusIn?: FocusHandler;
  onFocusOut?: FocusHandler;
}

// Accessibility event types
export interface A11yEventHandlers<T = HTMLElement> {
  onKeyDown?: KeyboardEventHandler<T>;
  onKeyUp?: KeyboardEventHandler<T>;
  onClick?: MouseEventHandler<T>;
  onFocus?: FocusHandler<T>;
  onBlur?: BlurHandler<T>;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  tabIndex?: number;
}

// Button event types
export interface ButtonEventHandlers extends A11yEventHandlers<HTMLButtonElement> {
  onClick?: ButtonClickHandler;
  onDoubleClick?: MouseEventHandler<HTMLButtonElement>;
  onMouseDown?: MouseEventHandler<HTMLButtonElement>;
  onMouseUp?: MouseEventHandler<HTMLButtonElement>;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
  onTouchStart?: TouchEventHandler<HTMLButtonElement>;
  onTouchEnd?: TouchEventHandler<HTMLButtonElement>;
}

// Input event types
export interface InputEventHandlers extends A11yEventHandlers<HTMLInputElement> {
  onChange?: InputChangeHandler;
  onInput?: ChangeEventHandler<HTMLInputElement>;
  onSelect?: EventHandler<HTMLInputElement>;
  onInvalid?: EventHandler<HTMLInputElement>;
}

// Select event types
export interface SelectEventHandlers extends A11yEventHandlers {
  onChange?: SelectChangeHandler;
  onSelect?: EventHandler<HTMLSelectElement>;
}

// Textarea event types
export interface TextareaEventHandlers extends A11yEventHandlers {
  onChange?: TextareaChangeHandler;
  onInput?: ChangeEventHandler<HTMLTextAreaElement>;
  onSelect?: EventHandler<HTMLTextAreaElement>;
  onResize?: EventHandler<HTMLTextAreaElement>;
}

// Modal and dialog event types
export interface ModalEventHandlers {
  onOpen?: () => void;
  onClose?: () => void;
  onEscapeKey?: KeyboardEventHandler;
  onBackdropClick?: MouseEventHandler;
}

// Dropdown and menu event types
export interface DropdownEventHandlers {
  onToggle?: (isOpen: boolean) => void;
  onSelect?: (value: string) => void;
  onKeyDown?: KeyboardEventHandler;
}

// Tab event types
export interface TabEventHandlers {
  onTabChange?: (tabId: string) => void;
  onTabClick?: (tabId: string, event: React.MouseEvent) => void;
  onTabKeyDown?: (tabId: string, event: React.KeyboardEvent) => void;
}

// Carousel and slider event types
export interface CarouselEventHandlers {
  onSlideChange?: (index: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onAutoplayStart?: () => void;
  onAutoplayStop?: () => void;
}

// Search and filter event types
export interface SearchEventHandlers {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  onSuggestionSelect?: (suggestion: string) => void;
}

// Pagination event types
export interface PaginationEventHandlers {
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
}

// Drag and drop event types
export interface DragEventHandlers {
  onDragStart?: (event: React.DragEvent) => void;
  onDrag?: (event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
  onDragEnter?: (event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
}

// Scroll event types
export interface ScrollEventHandlers {
  onScroll?: (event: React.UIEvent) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
}

// Resize event types
export interface ResizeEventHandlers {
  onResize?: (dimensions: { width: number; height: number }) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

// Animation event types
export interface AnimationEventHandlers {
  onAnimationStart?: (event: React.AnimationEvent) => void;
  onAnimationEnd?: (event: React.AnimationEvent) => void;
  onAnimationIteration?: (event: React.AnimationEvent) => void;
  onTransitionStart?: (event: React.TransitionEvent) => void;
  onTransitionEnd?: (event: React.TransitionEvent) => void;
}

// Custom event types
export interface CustomEventData<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
  source?: string;
}

export type CustomEventHandler<T = unknown> = (event: CustomEventData<T>) => void;

// Event delegation types
export interface EventDelegationConfig {
  selector: string;
  event: string;
  handler: EventHandler;
  capture?: boolean;
}

// Event listener management
export interface EventListenerConfig {
  element: HTMLElement | Window | Document;
  event: string;
  handler: EventHandler;
  options?: boolean | AddEventListenerOptions;
}

// Utility types for event handling
export type PreventDefault<T extends EventHandler> = T & {
  preventDefault(): void;
};

export type StopPropagation<T extends EventHandler> = T & {
  stopPropagation(): void;
};

export type EventWithModifiers<T extends EventHandler> = T & {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

// Event handler factory types
export type EventHandlerFactory<T = HTMLElement> = (
  element: T,
  options?: Record<string, unknown>
) => EventHandler<T>;

// Debounced and throttled event handlers
export interface DebouncedEventHandler<T extends EventHandler> {
  handler: T;
  delay: number;
  immediate?: boolean;
}

export interface ThrottledEventHandler<T extends EventHandler> {
  handler: T;
  delay: number;
  leading?: boolean;
  trailing?: boolean;
}

// Event validation types
export interface EventValidation {
  required?: boolean;
  allowedKeys?: KeyCode[];
  preventDefaultKeys?: KeyCode[];
  stopPropagationKeys?: KeyCode[];
}

// Composite event handler types
export interface CompositeEventHandlers extends
  Omit<ButtonEventHandlers, 'onClick' | 'onKeyDown' | 'onBlur' | 'onFocus' | 'onKeyUp'>,
  Omit<InputEventHandlers, 'onClick' | 'onKeyDown' | 'onBlur' | 'onFocus'>,
  Omit<KeyboardNavigationHandler, 'onKeyDown' | 'onKeyUp'>,
  Omit<FocusManagement, 'onBlur' | 'onFocus'>,
  TouchEventHandler {
  // Use generic event handlers for composite elements
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  onKeyUp?: KeyboardEventHandler<HTMLElement>;
  onBlur?: BlurHandler<HTMLElement>;
  onFocus?: FocusHandler<HTMLElement>;
}

// Export commonly used event handler combinations
export interface InteractiveElementProps extends A11yEventHandlers {
  onClick?: MouseEventHandler;
  onKeyDown?: KeyboardEventHandler;
  onFocus?: FocusHandler;
  onBlur?: BlurHandler;
  disabled?: boolean;
  tabIndex?: number;
}

export interface FormElementProps extends InteractiveElementProps {
  onChange?: ChangeEventHandler;
  onInput?: ChangeEventHandler;
  onInvalid?: EventHandler;
  required?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}