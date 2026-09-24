import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Official SamadhanSetu Logo Component
 * Matches the website branding: Devanagari 'स' mark in a rounded square
 * with bold 'SamadhanSetu' and 'Govt. of Jharkhand' subtext.
 */
export const AppLogo = ({
  size = 'medium', // 'small' | 'medium' | 'large'
  theme = 'light', // 'light' (white text on dark header) | 'dark' (navy text on light background)
  showSubtitle = true,
  style,
}) => {
  const isLight = theme === 'light';

  let boxSize = 30;
  let fontSize = 16;
  let titleSize = 15;
  let subSize = 8.5;

  if (size === 'small') {
    boxSize = 24;
    fontSize = 13;
    titleSize = 13;
    subSize = 7.5;
  } else if (size === 'large') {
    boxSize = 56;
    fontSize = 30;
    titleSize = 22;
    subSize = 11;
  }

  const boxBg = isLight ? '#ffffff' : '#0f2c59';
  const boxText = isLight ? '#0f2c59' : '#ffffff';
  const textColor = isLight ? '#ffffff' : '#0f2c59';
  const subColor = isLight ? '#cbd5e1' : '#64748b';

  return (
    <View style={[styles.container, style]}>
      {/* Official 'स' Emblem Box */}
      <View
        style={[
          styles.logoBox,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: Math.round(boxSize * 0.22),
            backgroundColor: boxBg,
          },
        ]}
      >
        <Text style={[styles.emblemText, { fontSize, color: boxText }]}>
          स
        </Text>
      </View>

      {/* Typography */}
      <View style={styles.textCol}>
        <Text style={[styles.brandTitle, { fontSize: titleSize, color: textColor }]}>
          SamadhanSetu
        </Text>
        {showSubtitle && (
          <Text style={[styles.brandSub, { fontSize: subSize, color: subColor }]}>
            Govt. of Jharkhand
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  emblemText: {
    fontWeight: '900',
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: undefined,
  },
  textCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 0.2,
    lineHeight: undefined,
  },
  brandSub: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
