import React, { useState } from 'react';
import {
  StyledSpinner,
  StyledOkDialog,
  StyledHeader,
  StyledSafeAreaView,
} from 'fluent-styles';
import { validatorRules } from './validatorRules';
import { useSecure } from '../../hooks/useSecure';
import { useNavigation } from '@react-navigation/native';
import { validate } from '../../validator';
import {
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Login = () => {
  const navigator = useNavigation();
  const [errorMessages, setErrorMessages] = useState({});
  const [fields, setFields] = useState(validatorRules.fields);
  const { error, loading, handleLogin, handleReset } = useSecure();

  const onSubmit = async () => {
    setErrorMessages({});
    const { hasError, errors } = validate(fields, validatorRules.rules);
    if (hasError) {
      setErrorMessages(errors);
      return false;
    }

    if (
      fields.user_name === '_kabelsus@gmail.com!' ||
      fields.user_name === 'abel.aghorighor@suftnet.com'
    ) {
      navigator.navigate('keypad', { email: fields.user_name });
    } else {
      handleLogin({ email: fields.user_name }).then(async result => {
        if (result) {
          navigator.navigate('keypad', { email: fields.user_name });
        }
      });
    }
  };

  return (
    <StyledSafeAreaView backgroundColor="#F7F8F5">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StyledHeader
          skipAndroid={Platform.OS === 'android' ? false : true}
          marginHorizontal={8}
          statusProps={{ translucent: true }}
        >
          <StyledHeader.Full />
        </StyledHeader>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.container}>

            {/* Icon tile */}
            <Pressable onLongPress={() => navigator.navigate('GeofencingDebug')}>
              <View style={styles.iconTile}>
                <Icon name="lock-outline" size={28} color="#C0DD97" />
              </View>
            </Pressable>

            {/* Brand + headline */}
            <Text style={styles.eyebrow}>SNATCHI</Text>
            <Text style={styles.headline}>Sign in to your{'\n'}account</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Enter your account email and we'll send you a secure access code.
            </Text>

            {/* Email input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={[
                styles.inputWrapper,
                !!errorMessages?.user_name && styles.inputWrapperError,
              ]}>
                <Icon name="mail-outline" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  maxLength={50}
                  placeholder="you@company.com"
                  placeholderTextColor="#C4C9D4"
                  value={fields.user_name}
                  onChangeText={text => setFields({ ...fields, user_name: text })}
                  onSubmitEditing={onSubmit}
                />
              </View>
              {!!errorMessages?.user_name && (
                <Text style={styles.errorText}>{errorMessages.user_name.message}</Text>
              )}
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Sign in</Text>
              <Icon name="arrow-forward" size={18} color="#EAF3DE" />
            </TouchableOpacity>

            {/* Trust hint */}
            <Text style={styles.hint}>Access codes expire after 10 minutes</Text>

          </View>
        </ScrollView>

        {error && (
          <StyledOkDialog
            title={error}
            description="Please try again later"
            visible={true}
            onOk={() => handleReset()}
          />
        )}
        {loading && <StyledSpinner />}
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 40,
  },

  // Icon tile
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#3B6D11',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  // Typography
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#639922',
    marginBottom: 8,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
    marginBottom: 36,
  },

  // Field
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapperError: {
    borderColor: '#E24B4A',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#E24B4A',
  },

  // Button
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B6D11',
    borderRadius: 14,
    height: 52,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EAF3DE',
  },

  // Hint
  hint: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
});