/**
 * Simple "Are you sure?" dialogs with big, clear Yes / No buttons.
 */
import { Alert } from 'react-native';

/** Shows a Yes / No question and calls `onYes` only if Yes is tapped. */
export function confirm(opts: {
  title: string;
  message: string;
  yes: string;
  no: string;
  onYes: () => void;
}) {
  Alert.alert(opts.title, opts.message, [
    { text: opts.no, style: 'cancel' },
    { text: opts.yes, style: 'destructive', onPress: opts.onYes },
  ]);
}
