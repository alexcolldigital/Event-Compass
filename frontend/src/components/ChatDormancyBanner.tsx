/**
 * ChatDormancyBanner
 * Displays information about chat dormancy and auto-clearing after 7 days
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

interface DormancyInfo {
  daysInactive: number;
  daysUntilClear: number;
  willBeCleared: boolean;
  dormancyDays: number;
}

interface ChatDormancyBannerProps {
  dormancyInfo: DormancyInfo | null;
  isActive: boolean;
  endReason?: string | null;
  colors: Record<string, string>;
  onDismiss?: () => void;
}

export const ChatDormancyBanner: React.FC<ChatDormancyBannerProps> = ({
  dormancyInfo,
  isActive,
  endReason,
  colors,
  onDismiss,
}) => {
  if (!dormancyInfo || !isActive) {
    // Show info about ended chats
    if (endReason) {
      const endReasons: Record<string, { icon: string; message: string; color: string }> = {
        user_satisfied: {
          icon: 'check-circle',
          message: 'Chat ended - User satisfied',
          color: colors.success || '#4CAF50',
        },
        user_unsatisfied: {
          icon: 'alert-circle',
          message: 'Chat ended - User unsatisfied',
          color: colors.warning || '#FF9800',
        },
        want_follow_up: {
          icon: 'phone-callback',
          message: 'Chat ended - Follow-up planned',
          color: colors.info || '#2196F3',
        },
        dormant: {
          icon: 'clock-alert',
          message: 'Chat cleared due to 7 days of inactivity',
          color: colors.muted || '#999',
        },
      };

      const reason = endReasons[endReason] || endReasons.dormant;

      return (
        <View style={[styles.banner, { backgroundColor: `${reason.color}15` }]}>
          <MaterialCommunityIcons
            name={reason.icon}
            size={18}
            color={reason.color}
            style={styles.icon}
          />
          <Text style={[styles.text, { color: reason.color }]}>
            {reason.message}
          </Text>
        </View>
      );
    }
    return null;
  }

  const { daysInactive, daysUntilClear, dormancyDays } = dormancyInfo;
  const percentage = Math.min((daysInactive / dormancyDays) * 100, 100);

  // Determine warning level
  let warningLevel: 'info' | 'warning' | 'critical' = 'info';
  let bannerColor = colors.primary || '#2196F3';
  let icon = 'information';

  if (daysUntilClear <= 1) {
    warningLevel = 'critical';
    bannerColor = colors.error || '#F44336';
    icon = 'alert-circle';
  } else if (daysUntilClear <= 3) {
    warningLevel = 'warning';
    bannerColor = colors.warning || '#FF9800';
    icon = 'alert';
  }

  return (
    <View style={styles.container}>
      {/* Main Banner */}
      <View
        style={[
          styles.banner,
          { backgroundColor: `${bannerColor}15`, borderLeftColor: bannerColor },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={bannerColor}
          style={styles.icon}
        />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {warningLevel === 'critical'
              ? '⚠️ Chat clearing tomorrow'
              : warningLevel === 'warning'
              ? '⏰ Chat will clear soon'
              : 'ℹ️ Auto-clear info'}
          </Text>
          <Text style={[styles.message, { color: colors.muted }]}>
            {daysUntilClear > 0
              ? `This chat will be automatically cleared in ${daysUntilClear} day${
                  daysUntilClear > 1 ? 's' : ''
                } if there's no activity.`
              : 'This chat will be cleared due to inactivity.'}
          </Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={18} color={bannerColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressContainer,
          { backgroundColor: colors.surfaceAlt || '#f5f5f5' },
        ]}
      >
        <View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: bannerColor,
            },
          ]}
        />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.muted }]}>
            Inactive for:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {daysInactive} day{daysInactive !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.muted }]}>
            Auto-clear in:
          </Text>
          <Text
            style={[
              styles.detailValue,
              { color: warningLevel === 'critical' ? colors.error : bannerColor },
              { fontWeight: '700' },
            ]}
          >
            {daysUntilClear} day{daysUntilClear !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.muted }]}>
            Policy:
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {dormancyDays}-day dormancy
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    gap: 10,
  },
  icon: {
    marginTop: 2,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: appFont,
  },
  message: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    fontFamily: appFont,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  details: {
    paddingHorizontal: 4,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: appFont,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: appFont,
  },
});

export default ChatDormancyBanner;
