/**
 * One place to get the Firebase services. Import from here, not from
 * '@react-native-firebase/*' directly, so the region and settings stay
 * consistent across the app.
 *
 * Firebase is configured from google-services.json (Android) and
 * GoogleService-Info.plist (iOS). See README "Create the Firebase project".
 */
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getFunctions } from '@react-native-firebase/functions';

import { FUNCTIONS_REGION } from '../config';

export const auth = getAuth();
export const db = getFirestore();
export const functions = getFunctions(getApp(), FUNCTIONS_REGION);
