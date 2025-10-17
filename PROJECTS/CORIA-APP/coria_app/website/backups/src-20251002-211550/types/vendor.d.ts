/**
 * Third-party library type declarations and augmentations
 */

// Web Vitals library types
declare module 'web-vitals' {
  export interface Metric {
    name: 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    entries: PerformanceEntry[];
    id: string;
    navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  }

  export type ReportHandler = (metric: Metric) => void;

  export function getCLS(onReport: ReportHandler, opts?: { reportAllChanges?: boolean }): void;
  export function getFCP(onReport: ReportHandler, opts?: { reportAllChanges?: boolean }): void;
  export function getFID(onReport: ReportHandler, opts?: { reportAllChanges?: boolean }): void;
  export function getINP(onReport: ReportHandler, opts?: { reportAllChanges?: boolean }): void;
  export function getLCP(onReport: ReportHandler, opts?: { reportAllChanges?: boolean }): void;
  export function getTTFB(onReport: ReportHandler, opts?: { reportAllChanges?: boolean }): void;
}

// Contentful Rich Text Renderer types augmentation
declare module '@contentful/rich-text-react-renderer' {
  import { Document, Block, Inline } from '@contentful/rich-text-types';
  import { ReactNode } from 'react';

  export interface Options {
    renderMark?: {
      [key: string]: (text: ReactNode) => ReactNode;
    };
    renderNode?: {
      [key: string]: (node: Block | Inline, children: ReactNode) => ReactNode;
    };
    renderText?: (text: string) => ReactNode;
  }

  export function documentToReactComponents(
    richTextDocument: Document,
    options?: Options
  ): ReactNode;
}

// Framer Motion augmentation for better TypeScript support
declare module 'framer-motion' {
  export interface AnimationProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileInView?: any;
    viewport?: {
      once?: boolean;
      margin?: string;
      amount?: number | 'some' | 'all';
    };
  }
}

// Class Variance Authority types
declare module 'class-variance-authority' {
  export interface VariantProps<T> {
    [key: string]: any;
  }

  export function cva(
    base?: string,
    config?: {
      variants?: Record<string, Record<string, string>>;
      compoundVariants?: Array<Record<string, any> & { class: string }>;
      defaultVariants?: Record<string, any>;
    }
  ): (props?: Record<string, any>) => string;

  export type { VariantProps };
}

// Tailwind Merge types
declare module 'tailwind-merge' {
  export function twMerge(...classes: (string | undefined | null | false)[]): string;
  export function clsx(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string;
}

// CLSX types
declare module 'clsx' {
  export type ClassValue = 
    | string 
    | number 
    | boolean 
    | undefined 
    | null 
    | { [key: string]: boolean | undefined | null }
    | ClassValue[];

  export default function clsx(...classes: ClassValue[]): string;
  export function clsx(...classes: ClassValue[]): string;
}

// Next.js Image component augmentation
declare module 'next/image' {
  export interface ImageProps {
    src: string | import('next/image').StaticImageData;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    sizes?: string;
    quality?: number;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
    loading?: 'lazy' | 'eager';
    className?: string;
    style?: React.CSSProperties;
  }

  const Image: React.ComponentType<ImageProps>;
  export default Image;
}

// Next.js Link component augmentation
declare module 'next/link' {
  export interface LinkProps {
    href: string | import('url').UrlObject;
    as?: string | import('url').UrlObject;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
    onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
  }

  const Link: React.ComponentType<LinkProps>;
  export default Link;
}

// Radix UI Slot component types
declare module '@radix-ui/react-slot' {
  export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
  }

  export const Slot: React.ForwardRefExoticComponent<
    SlotProps & React.RefAttributes<HTMLElement>
  >;

  export interface SlottableProps {
    asChild?: boolean;
    children?: React.ReactNode;
  }

  export const Slottable: React.ComponentType<SlottableProps>;
}

// Heroicons React types
declare module '@heroicons/react/24/outline' {
  import { ComponentType, SVGProps } from 'react';
  
  export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;
  
  export const AcademicCapIcon: HeroIcon;
  export const AdjustmentsHorizontalIcon: HeroIcon;
  export const ArchiveBoxArrowDownIcon: HeroIcon;
  export const ArchiveBoxIcon: HeroIcon;
  export const ArrowDownCircleIcon: HeroIcon;
  export const ArrowDownIcon: HeroIcon;
  export const ArrowDownLeftIcon: HeroIcon;
  export const ArrowDownOnSquareIcon: HeroIcon;
  export const ArrowDownOnSquareStackIcon: HeroIcon;
  export const ArrowDownRightIcon: HeroIcon;
  export const ArrowDownTrayIcon: HeroIcon;
  export const ArrowLeftCircleIcon: HeroIcon;
  export const ArrowLeftIcon: HeroIcon;
  export const ArrowLeftOnRectangleIcon: HeroIcon;
  export const ArrowLongDownIcon: HeroIcon;
  export const ArrowLongLeftIcon: HeroIcon;
  export const ArrowLongRightIcon: HeroIcon;
  export const ArrowLongUpIcon: HeroIcon;
  export const ArrowPathIcon: HeroIcon;
  export const ArrowPathRoundedSquareIcon: HeroIcon;
  export const ArrowRightCircleIcon: HeroIcon;
  export const ArrowRightIcon: HeroIcon;
  export const ArrowRightOnRectangleIcon: HeroIcon;
  export const ArrowSmallDownIcon: HeroIcon;
  export const ArrowSmallLeftIcon: HeroIcon;
  export const ArrowSmallRightIcon: HeroIcon;
  export const ArrowSmallUpIcon: HeroIcon;
  export const ArrowTopRightOnSquareIcon: HeroIcon;
  export const ArrowTrendingDownIcon: HeroIcon;
  export const ArrowTrendingUpIcon: HeroIcon;
  export const ArrowUpCircleIcon: HeroIcon;
  export const ArrowUpIcon: HeroIcon;
  export const ArrowUpLeftIcon: HeroIcon;
  export const ArrowUpOnSquareIcon: HeroIcon;
  export const ArrowUpOnSquareStackIcon: HeroIcon;
  export const ArrowUpRightIcon: HeroIcon;
  export const ArrowUpTrayIcon: HeroIcon;
  export const ArrowUturnDownIcon: HeroIcon;
  export const ArrowUturnLeftIcon: HeroIcon;
  export const ArrowUturnRightIcon: HeroIcon;
  export const ArrowUturnUpIcon: HeroIcon;
  export const AtSymbolIcon: HeroIcon;
  export const BackspaceIcon: HeroIcon;
  export const BackwardIcon: HeroIcon;
  export const BanknotesIcon: HeroIcon;
  export const Bars2Icon: HeroIcon;
  export const Bars3BottomLeftIcon: HeroIcon;
  export const Bars3BottomRightIcon: HeroIcon;
  export const Bars3CenterLeftIcon: HeroIcon;
  export const Bars3Icon: HeroIcon;
  export const Bars4Icon: HeroIcon;
  export const BarsArrowDownIcon: HeroIcon;
  export const BarsArrowUpIcon: HeroIcon;
  export const Battery0Icon: HeroIcon;
  export const Battery100Icon: HeroIcon;
  export const Battery50Icon: HeroIcon;
  export const BeakerIcon: HeroIcon;
  export const BellAlertIcon: HeroIcon;
  export const BellIcon: HeroIcon;
  export const BellSlashIcon: HeroIcon;
  export const BellSnoozeIcon: HeroIcon;
  export const BoltIcon: HeroIcon;
  export const BoltSlashIcon: HeroIcon;
  export const BookOpenIcon: HeroIcon;
  export const BookmarkIcon: HeroIcon;
  export const BookmarkSlashIcon: HeroIcon;
  export const BookmarkSquareIcon: HeroIcon;
  export const BriefcaseIcon: HeroIcon;
  export const BugAntIcon: HeroIcon;
  export const BuildingLibraryIcon: HeroIcon;
  export const BuildingOffice2Icon: HeroIcon;
  export const BuildingOfficeIcon: HeroIcon;
  export const BuildingStorefrontIcon: HeroIcon;
  export const CakeIcon: HeroIcon;
  export const CalculatorIcon: HeroIcon;
  export const CalendarDaysIcon: HeroIcon;
  export const CalendarIcon: HeroIcon;
  export const CameraIcon: HeroIcon;
  export const ChartBarIcon: HeroIcon;
  export const ChartBarSquareIcon: HeroIcon;
  export const ChartPieIcon: HeroIcon;
  export const ChatBubbleBottomCenterIcon: HeroIcon;
  export const ChatBubbleBottomCenterTextIcon: HeroIcon;
  export const ChatBubbleLeftEllipsisIcon: HeroIcon;
  export const ChatBubbleLeftIcon: HeroIcon;
  export const ChatBubbleLeftRightIcon: HeroIcon;
  export const ChatBubbleOvalLeftEllipsisIcon: HeroIcon;
  export const ChatBubbleOvalLeftIcon: HeroIcon;
  export const CheckBadgeIcon: HeroIcon;
  export const CheckCircleIcon: HeroIcon;
  export const CheckIcon: HeroIcon;
  export const ChevronDoubleDownIcon: HeroIcon;
  export const ChevronDoubleLeftIcon: HeroIcon;
  export const ChevronDoubleRightIcon: HeroIcon;
  export const ChevronDoubleUpIcon: HeroIcon;
  export const ChevronDownIcon: HeroIcon;
  export const ChevronLeftIcon: HeroIcon;
  export const ChevronRightIcon: HeroIcon;
  export const ChevronUpDownIcon: HeroIcon;
  export const ChevronUpIcon: HeroIcon;
  export const CircleStackIcon: HeroIcon;
  export const ClipboardDocumentCheckIcon: HeroIcon;
  export const ClipboardDocumentIcon: HeroIcon;
  export const ClipboardDocumentListIcon: HeroIcon;
  export const ClipboardIcon: HeroIcon;
  export const ClockIcon: HeroIcon;
  export const CloudArrowDownIcon: HeroIcon;
  export const CloudArrowUpIcon: HeroIcon;
  export const CloudIcon: HeroIcon;
  export const CodeBracketIcon: HeroIcon;
  export const CodeBracketSquareIcon: HeroIcon;
  export const Cog6ToothIcon: HeroIcon;
  export const Cog8ToothIcon: HeroIcon;
  export const CogIcon: HeroIcon;
  export const CommandLineIcon: HeroIcon;
  export const ComputerDesktopIcon: HeroIcon;
  export const CpuChipIcon: HeroIcon;
  export const CreditCardIcon: HeroIcon;
  export const CubeIcon: HeroIcon;
  export const CubeTransparentIcon: HeroIcon;
  export const CurrencyBangladeshiIcon: HeroIcon;
  export const CurrencyDollarIcon: HeroIcon;
  export const CurrencyEuroIcon: HeroIcon;
  export const CurrencyPoundIcon: HeroIcon;
  export const CurrencyRupeeIcon: HeroIcon;
  export const CurrencyYenIcon: HeroIcon;
  export const CursorArrowRaysIcon: HeroIcon;
  export const CursorArrowRippleIcon: HeroIcon;
  export const DevicePhoneMobileIcon: HeroIcon;
  export const DeviceTabletIcon: HeroIcon;
  export const DocumentArrowDownIcon: HeroIcon;
  export const DocumentArrowUpIcon: HeroIcon;
  export const DocumentChartBarIcon: HeroIcon;
  export const DocumentCheckIcon: HeroIcon;
  export const DocumentDuplicateIcon: HeroIcon;
  export const DocumentIcon: HeroIcon;
  export const DocumentMagnifyingGlassIcon: HeroIcon;
  export const DocumentMinusIcon: HeroIcon;
  export const DocumentPlusIcon: HeroIcon;
  export const DocumentTextIcon: HeroIcon;
  export const EllipsisHorizontalCircleIcon: HeroIcon;
  export const EllipsisHorizontalIcon: HeroIcon;
  export const EllipsisVerticalIcon: HeroIcon;
  export const EnvelopeIcon: HeroIcon;
  export const EnvelopeOpenIcon: HeroIcon;
  export const ExclamationCircleIcon: HeroIcon;
  export const ExclamationTriangleIcon: HeroIcon;
  export const EyeDropperIcon: HeroIcon;
  export const EyeIcon: HeroIcon;
  export const EyeSlashIcon: HeroIcon;
  export const FaceFrownIcon: HeroIcon;
  export const FaceSmileIcon: HeroIcon;
  export const FilmIcon: HeroIcon;
  export const FilterIcon: HeroIcon;
  export const FingerPrintIcon: HeroIcon;
  export const FireIcon: HeroIcon;
  export const FlagIcon: HeroIcon;
  export const FolderArrowDownIcon: HeroIcon;
  export const FolderIcon: HeroIcon;
  export const FolderMinusIcon: HeroIcon;
  export const FolderOpenIcon: HeroIcon;
  export const FolderPlusIcon: HeroIcon;
  export const ForwardIcon: HeroIcon;
  export const FunnelIcon: HeroIcon;
  export const GifIcon: HeroIcon;
  export const GiftIcon: HeroIcon;
  export const GiftTopIcon: HeroIcon;
  export const GlobeAltIcon: HeroIcon;
  export const GlobeAmericasIcon: HeroIcon;
  export const GlobeAsiaAustraliaIcon: HeroIcon;
  export const GlobeEuropeAfricaIcon: HeroIcon;
  export const HandRaisedIcon: HeroIcon;
  export const HandThumbDownIcon: HeroIcon;
  export const HandThumbUpIcon: HeroIcon;
  export const HashtagIcon: HeroIcon;
  export const HeartIcon: HeroIcon;
  export const HomeIcon: HeroIcon;
  export const HomeModernIcon: HeroIcon;
  export const IdentificationIcon: HeroIcon;
  export const InboxArrowDownIcon: HeroIcon;
  export const InboxIcon: HeroIcon;
  export const InboxStackIcon: HeroIcon;
  export const InformationCircleIcon: HeroIcon;
  export const KeyIcon: HeroIcon;
  export const LanguageIcon: HeroIcon;
  export const LifebuoyIcon: HeroIcon;
  export const LightBulbIcon: HeroIcon;
  export const LinkIcon: HeroIcon;
  export const ListBulletIcon: HeroIcon;
  export const LockClosedIcon: HeroIcon;
  export const LockOpenIcon: HeroIcon;
  export const MagnifyingGlassCircleIcon: HeroIcon;
  export const MagnifyingGlassIcon: HeroIcon;
  export const MagnifyingGlassMinusIcon: HeroIcon;
  export const MagnifyingGlassPlusIcon: HeroIcon;
  export const MapIcon: HeroIcon;
  export const MapPinIcon: HeroIcon;
  export const MegaphoneIcon: HeroIcon;
  export const MicrophoneIcon: HeroIcon;
  export const MinusCircleIcon: HeroIcon;
  export const MinusIcon: HeroIcon;
  export const MinusSmallIcon: HeroIcon;
  export const MoonIcon: HeroIcon;
  export const MusicalNoteIcon: HeroIcon;
  export const NewspaperIcon: HeroIcon;
  export const NoSymbolIcon: HeroIcon;
  export const PaintBrushIcon: HeroIcon;
  export const PaperAirplaneIcon: HeroIcon;
  export const PaperClipIcon: HeroIcon;
  export const PauseCircleIcon: HeroIcon;
  export const PauseIcon: HeroIcon;
  export const PencilIcon: HeroIcon;
  export const PencilSquareIcon: HeroIcon;
  export const PhoneArrowDownLeftIcon: HeroIcon;
  export const PhoneArrowUpRightIcon: HeroIcon;
  export const PhoneIcon: HeroIcon;
  export const PhoneXMarkIcon: HeroIcon;
  export const PhotoIcon: HeroIcon;
  export const PlayCircleIcon: HeroIcon;
  export const PlayIcon: HeroIcon;
  export const PlayPauseIcon: HeroIcon;
  export const PlusCircleIcon: HeroIcon;
  export const PlusIcon: HeroIcon;
  export const PlusSmallIcon: HeroIcon;
  export const PowerIcon: HeroIcon;
  export const PresentationChartBarIcon: HeroIcon;
  export const PresentationChartLineIcon: HeroIcon;
  export const PrinterIcon: HeroIcon;
  export const PuzzlePieceIcon: HeroIcon;
  export const QrCodeIcon: HeroIcon;
  export const QuestionMarkCircleIcon: HeroIcon;
  export const QueueListIcon: HeroIcon;
  export const RadioIcon: HeroIcon;
  export const ReceiptPercentIcon: HeroIcon;
  export const ReceiptRefundIcon: HeroIcon;
  export const RectangleGroupIcon: HeroIcon;
  export const RectangleStackIcon: HeroIcon;
  export const RocketLaunchIcon: HeroIcon;
  export const RssIcon: HeroIcon;
  export const ScaleIcon: HeroIcon;
  export const ScissorsIcon: HeroIcon;
  export const ServerIcon: HeroIcon;
  export const ServerStackIcon: HeroIcon;
  export const ShareIcon: HeroIcon;
  export const ShieldCheckIcon: HeroIcon;
  export const ShieldExclamationIcon: HeroIcon;
  export const ShoppingBagIcon: HeroIcon;
  export const ShoppingCartIcon: HeroIcon;
  export const SignalIcon: HeroIcon;
  export const SignalSlashIcon: HeroIcon;
  export const SparklesIcon: HeroIcon;
  export const SpeakerWaveIcon: HeroIcon;
  export const SpeakerXMarkIcon: HeroIcon;
  export const Square2StackIcon: HeroIcon;
  export const Square3Stack3DIcon: HeroIcon;
  export const Squares2X2Icon: HeroIcon;
  export const SquaresPlusIcon: HeroIcon;
  export const StarIcon: HeroIcon;
  export const StopCircleIcon: HeroIcon;
  export const StopIcon: HeroIcon;
  export const SunIcon: HeroIcon;
  export const SwatchIcon: HeroIcon;
  export const TableCellsIcon: HeroIcon;
  export const TagIcon: HeroIcon;
  export const TicketIcon: HeroIcon;
  export const TrashIcon: HeroIcon;
  export const TrophyIcon: HeroIcon;
  export const TruckIcon: HeroIcon;
  export const TvIcon: HeroIcon;
  export const UserCircleIcon: HeroIcon;
  export const UserGroupIcon: HeroIcon;
  export const UserIcon: HeroIcon;
  export const UserMinusIcon: HeroIcon;
  export const UserPlusIcon: HeroIcon;
  export const UsersIcon: HeroIcon;
  export const VariableIcon: HeroIcon;
  export const VideoCameraIcon: HeroIcon;
  export const VideoCameraSlashIcon: HeroIcon;
  export const ViewColumnsIcon: HeroIcon;
  export const ViewfinderCircleIcon: HeroIcon;
  export const WalletIcon: HeroIcon;
  export const WifiIcon: HeroIcon;
  export const WindowIcon: HeroIcon;
  export const WrenchIcon: HeroIcon;
  export const WrenchScrewdriverIcon: HeroIcon;
  export const XCircleIcon: HeroIcon;
  export const XMarkIcon: HeroIcon;
}

declare module '@heroicons/react/24/solid' {
  export * from '@heroicons/react/24/outline';
}

declare module '@heroicons/react/20/solid' {
  export * from '@heroicons/react/24/outline';
}

// Next-intl types augmentation
declare module 'next-intl' {
  export interface AbstractIntlMessages {
    [key: string]: string | AbstractIntlMessages;
  }

  export function useTranslations<T extends keyof AbstractIntlMessages>(
    namespace?: T
  ): (key: string, values?: Record<string, any>) => string;

  export function useLocale(): string;

  export function useMessages(): AbstractIntlMessages;

  export function useFormatter(): {
    dateTime: (date: Date | number, options?: Intl.DateTimeFormatOptions) => string;
    number: (value: number, options?: Intl.NumberFormatOptions) => string;
    relativeTime: (date: Date | number, options?: { now?: Date | number }) => string;
  };

  export function getTranslations<T extends keyof AbstractIntlMessages>(
    namespace?: T
  ): Promise<(key: string, values?: Record<string, any>) => string>;

  export function getLocale(): Promise<string>;

  export function getMessages(): Promise<AbstractIntlMessages>;

  export function getFormatter(): Promise<{
    dateTime: (date: Date | number, options?: Intl.DateTimeFormatOptions) => string;
    number: (value: number, options?: Intl.NumberFormatOptions) => string;
    relativeTime: (date: Date | number, options?: { now?: Date | number }) => string;
  }>;
}

// Sentry Next.js types
declare module '@sentry/nextjs' {
  export * from '@sentry/react';
  export * from '@sentry/node';

  export function withSentryConfig<T>(
    nextConfig: T,
    sentryOptions?: {
      silent?: boolean;
      org?: string;
      project?: string;
      authToken?: string;
      configFile?: string;
      include?: string | string[];
      ignore?: string | string[];
      urlPrefix?: string;
      stripPrefix?: string | string[];
      validate?: boolean;
      uploadLegacySourcemaps?: boolean;
      reactComponentAnnotation?: {
        enabled?: boolean;
      };
      unstable_sentryWebpackPluginOptions?: Record<string, any>;
      hideSourceMaps?: boolean;
      disableLogger?: boolean;
      automaticVercelMonitors?: boolean;
    }
  ): T;
}

export {};