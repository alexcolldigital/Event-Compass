import { Alert, Platform } from 'react-native';

export const showToast = (msg: string) => {
  if (Platform.OS === 'ios') {
    Alert.alert('', msg, [{ text: 'OK', style: 'cancel' }], { cancelable: true });
  }
};
