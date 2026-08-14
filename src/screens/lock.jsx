import React, { useState } from 'react';
import {
  StyledSpinner,
  StyledOkDialog,
  StyledHeader,
  StyledSafeAreaView,
} from 'fluent-styles';
import { useSecure } from '../hooks/useSecure';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppContext } from '../hooks/appContext';

const CODE_LENGTH = 6;

const KeypadButton = ({ label, onPress, variant = 'default' }) => (
  <TouchableOpacity
    style={[styles.key, variant === 'action' && styles.keyAction]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {typeof label === 'string' ? (
      <Text style={[styles.keyLabel, variant === 'action' && styles.keyActionLabel]}>
        {label}
      </Text>
    ) : (
      label
    )}
  </TouchableOpacity>
);

const Keypad = () => {
  const navigation = useNavigation();
  const { login } = useAppContext();
  const route = useRoute();
  const { email } = route.params || {};
  const [code, setCode] = useState([]);
  const { error, loading, handleVerifyCode, handleLogin, handleReset , } = useSecure();

  const handlePress = (digit) => {
    if (code.length >= CODE_LENGTH) return;
    const next = [...code, digit];
    setCode(next);
    if (next.length === CODE_LENGTH) {
      handleVerifyCode({ email, code: next.join('') }).then(async user => {
        if (user) {
          await login(user);
        } else {
          setCode([]);
        }
      });
    }
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
  };

  const handleResendCode = () => {
    setCode([]);
    handleLogin({ email });
  };

  return (
    <StyledSafeAreaView backgroundColor="#F7F8F5">
      <StyledHeader
        skipAndroid={Platform.OS === 'android' ? false : true}
        marginHorizontal={8}
        statusProps={{ translucent: true }}
      >
        <StyledHeader.Full />
      </StyledHeader>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>OTP verification</Text>
      </View>

      <View style={styles.container}>

        <View style={styles.iconTile}>
          <Icon name="forward-to-inbox" size={28} color="#C0DD97" />
        </View>

        <Text style={styles.eyebrow}>SNATCHI</Text>
        <Text style={styles.headline}>Check your email</Text>

        <Text style={styles.subtitle}>Access code sent to</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.cellsRow}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                i === code.length && styles.cellActive,
                code[i] !== undefined && styles.cellFilled,
              ]}
            >
              <Text style={styles.cellText}>{code[i] ?? ''}</Text>
            </View>
          ))}
        </View>

        <View style={styles.keypadGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <KeypadButton key={n} label={String(n)} onPress={() => handlePress(String(n))} />
          ))}
          <KeypadButton label="resend" variant="action" onPress={handleResendCode} />
          <KeypadButton label="0" onPress={() => handlePress('0')} />
          <KeypadButton
            label={<Icon name="backspace" size={20} color="#374151" />}
            onPress={handleDelete}
          />
        </View>

      </View>

      {error && (
        <StyledOkDialog
          title={error}
          description="Please try again later"
          visible={true}
          onOk={() => handleReset()}
        />
      )}
      {loading && <StyledSpinner />}
    </StyledSafeAreaView>
  );
};

export default Keypad;

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#3B6D11',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#639922',
    marginBottom: 6,
  },
  headline: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B6D11',
    marginBottom: 24,
  },
  cellsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  cell: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    borderWidth: 2,
    borderColor: '#3B6D11',
  },
  cellFilled: {
    borderColor: '#C0DD97',
  },
  cellText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  key: {
    width: '30%',
    flexGrow: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyAction: {
    backgroundColor: '#EAF3DE',
    borderColor: '#C0DD97',
  },
  keyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  keyActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B6D11',
  },
});
