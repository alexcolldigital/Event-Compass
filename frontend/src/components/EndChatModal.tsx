/**
 * EndChatModal
 * Modal for admin/service provider to end chat session with satisfaction feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const appFont = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

interface EndChatModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, feedback?: string) => Promise<void>;
  colors: Record<string, string>;
  loading?: boolean;
}

const REASONS = [
  {
    id: 'user_satisfied',
    label: 'User is Satisfied',
    icon: 'check-circle',
    description: 'Customer is happy and resolved',
  },
  {
    id: 'user_unsatisfied',
    label: 'User is Unsatisfied',
    icon: 'close-circle',
    description: 'Issue not resolved',
  },
  {
    id: 'want_follow_up',
    label: 'Want to Follow Up',
    icon: 'phone-callback',
    description: 'Need to check in later',
  },
];

export const EndChatModal: React.FC<EndChatModalProps> = ({
  visible,
  onClose,
  onSubmit,
  colors,
  loading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Required', 'Please select a reason to end the chat');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(selectedReason, feedback.trim() || undefined);
      setSelectedReason(null);
      setFeedback('');
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to end chat session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedReason(null);
      setFeedback('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>End Chat Session</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={submitting}
              style={styles.closeBtn}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Select a reason for ending this chat session. This helps us improve our service.
            </Text>
          </View>

          {/* Reason Selection */}
          <View style={styles.reasonsContainer}>
            {REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                onPress={() => setSelectedReason(reason.id)}
                disabled={submitting}
                style={[
                  styles.reasonButton,
                  {
                    backgroundColor: selectedReason === reason.id
                      ? colors.primaryLight || `${colors.primary}20`
                      : colors.bg,
                    borderColor:
                      selectedReason === reason.id ? colors.primary : colors.border,
                    borderWidth: selectedReason === reason.id ? 2 : 1,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={reason.icon}
                  size={24}
                  color={
                    selectedReason === reason.id ? colors.primary : colors.muted
                  }
                />
                <View style={styles.reasonText}>
                  <Text
                    style={[
                      styles.reasonLabel,
                      {
                        color:
                          selectedReason === reason.id
                            ? colors.primary
                            : colors.text,
                      },
                    ]}
                  >
                    {reason.label}
                  </Text>
                  <Text
                    style={[
                      styles.reasonDesc,
                      {
                        color:
                          selectedReason === reason.id
                            ? colors.primary
                            : colors.muted,
                      },
                    ]}
                  >
                    {reason.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Optional Feedback */}
          <View style={styles.feedbackSection}>
            <Text style={[styles.feedbackLabel, { color: colors.text }]}>
              Additional Feedback (Optional)
            </Text>
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Add any notes about this conversation..."
              placeholderTextColor={colors.muted}
              multiline
              maxLength={500}
              editable={!submitting}
              style={[
                styles.feedbackInput,
                {
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />
            <Text style={[styles.charCount, { color: colors.muted }]}>
              {feedback.length}/500
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleClose}
              disabled={submitting}
              style={[
                styles.cancelBtn,
                { backgroundColor: colors.surfaceAlt },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !selectedReason}
              style={[
                styles.submitBtn,
                {
                  backgroundColor:
                    selectedReason && !submitting
                      ? colors.primary
                      : colors.surfaceAlt,
                  opacity: submitting || !selectedReason ? 0.5 : 1,
                },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>End Session</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: appFont,
  },
  closeBtn: {
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
    opacity: 0.8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: appFont,
    lineHeight: 16,
  },
  reasonsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  reasonText: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: appFont,
  },
  reasonDesc: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: appFont,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: appFont,
  },
  feedbackInput: {
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    fontFamily: appFont,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
    fontFamily: appFont,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: appFont,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: appFont,
  },
});

export default EndChatModal;
