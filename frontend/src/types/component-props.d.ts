declare module '../../components/Button.jsx' {
  import * as React from 'react';
  import type { StyleProp, ViewStyle, TextStyle } from 'react-native';

  interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    leftIcon?: string | React.ReactNode;
    rightIcon?: string | React.ReactNode;
  }

  const Button: React.ComponentType<ButtonProps>;
  export default Button;
}

declare module '../../components/Card.jsx' {
  import * as React from 'react';
  import type { StyleProp, ViewStyle } from 'react-native';

  interface CardProps {
    children?: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined' | 'filled';
    elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    interactive?: boolean;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    [key: string]: any;
  }

  interface MarketplaceCardProps {
    image?: string;
    title?: string;
    subtitle?: string;
    rating?: number | string;
    reviewCount?: number;
    price?: number | string;
    unit?: string;
    category?: string;
    badge?: string;
    onPress?: () => void;
    onAddToCart?: () => void;
    style?: StyleProp<ViewStyle>;
  }

  interface FeatureCardProps {
    icon?: React.ReactNode | string;
    title?: string;
    description?: string;
    count?: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'gradient';
  }

  interface StatCardProps {
    value?: string | number;
    label?: string;
    icon?: React.ReactNode | string;
    trend?: string;
    trendUp?: boolean;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
  }

  interface HorizontalCardProps {
    image?: string;
    title?: string;
    subtitle?: string;
    rating?: number | string;
    reviewCount?: number;
    price?: number | string;
    unit?: string;
    category?: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
  }

  const Card: React.ComponentType<CardProps>;
  const MarketplaceCard: React.ComponentType<MarketplaceCardProps>;
  const FeatureCard: React.ComponentType<FeatureCardProps>;
  const StatCard: React.ComponentType<StatCardProps>;
  const HorizontalCard: React.ComponentType<HorizontalCardProps>;

  export { Card, MarketplaceCard, FeatureCard, StatCard, HorizontalCard };
  export default Card;
}
