import { Text, View, StyleSheet, Pressable } from "react-native";
import { capitalize, hp } from "../helpers/common";
import { theme } from "../constants/theme";

export const SectionView = ({ title, content }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{content}</View>
    </View>
  );
};
export const ColorFilter = ({ data, filterName, setFilters, filters }) => {
  const onSelect = (item) => {
    setFilters({ ...filters, [filterName]: item });
  };
  return (
    <View style={styles.flexRowWrap}>
      {data &&
        data.map((item, index) => {
          let isActive = filters && filters[filterName] == item;
          let borderColor = isActive ? theme.colors.neutral(0.7) : theme.colors.neutral(0.1) ;

          return (
            <Pressable onPress={() => onSelect(item)} key={item}>
              <View style={[styles.colorWrapper, { borderColor }]}>
                <View style={[styles.color, { backgroundColor: item }]}></View>
              </View>
            </Pressable>
          );
        })}
    </View>
  );
};

export const CommonFilterRow = ({ data, filterName, setFilters, filters }) => {
  const onSelect = (item) => {
    setFilters({ ...filters, [filterName]: item });
  };
  return (
    <View style={styles.flexRowWrap}>
      {data &&
        data.map((item, index) => {
          let isActive = filters && filters[filterName] == item;
          let backgroundColor = isActive ? theme.colors.neutral(0.7) : "white";
          let color = isActive ? "white" : theme.colors.neutral(0.7);
          return (
            <Pressable
              onPress={() => onSelect(item)}
              key={item}
              style={[styles.outlineButton, { backgroundColor }]}
            >
              <Text style={[styles.outlineButtonText, { color }]}>
                {capitalize(item)}
              </Text>
            </Pressable>
          );
        })}
    </View>
  );
};

export const sections = {
  order: (props) => <CommonFilterRow {...props} />,
  orientation: (props) => <CommonFilterRow {...props} />,
  type: (props) => <CommonFilterRow {...props} />,
  colors: (props) => <ColorFilter {...props} />,
};

const styles = StyleSheet.create({
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.neutral(0.8),
  },
  flexRowWrap: {
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  outlineButton: {
    padding: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    borderRadius: theme.radius.xs,
    borderCurve: "continuous",
  },
  outlineButtonText: {},
  colorWrapper: {
    padding: 3,
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderWidth: 2,
  },
  color: {
    width: 40,
    height: 30,
    borderRadius: theme.radius.sm - 3,
    borderCurve: "continuous",
  },
});
