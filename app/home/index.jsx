import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Categories from "../../components/categories";
import { apiCall } from "../../api";
import ImageGrid from "../../components/imageGrid";
import { debounce } from "lodash";
import FilterModal from "../../components/filtersModal";
import { useRouter } from "expo-router";

var page = 1;

const HomeScreen = () => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 10 : 30;
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [filters, setFilters] = useState(null);
  const [isEndReached, setIsEndReached] = useState(false);
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  const scrollRef = useRef(null);
  const router = useRouter();
  const handelChangeCategory = (cat) => {
    setActiveCategory(cat);
    clearSearch();
    setImages([]);
    page = 1;
    let params = {
      page,
      ...filters,
    };
    if (cat) {
      params.category = cat;
    }
    fetchImages(params, false);
  };

  const handelSearch = (text) => {
    setSearch(text);
    if (text.length > 2) {
      // search for this text
      page = 1;
      setImages([]);
      setActiveCategory(null); // clear category when searching
      fetchImages({ page, q: text, ...filters }, false);
    }
    if (text == "") {
      //resrt the results
      page = 1;
      searchInputRef?.current?.clear();
      setImages([]);
      setActiveCategory(null); // clear category when searching
      fetchImages({ page, ...filters }, false);
    }
  };
  const clearSearch = () => {
    setSearch("");
    searchInputRef?.current?.clear();
  };
  const handelTextDebounce = useCallback(debounce(handelSearch, 400), []);
  useEffect(() => {
    fetchImages();
  }, []);
  const fetchImages = async (params = { page: 1 }, append = true) => {
    let res = await apiCall(params);
    if (res.success && res?.data?.hits) {
      if (append) setImages([...images, ...res.data.hits]);
      else setImages([...res.data.hits]);
    }
  };
  const openFilterModal = () => {
    modalRef?.current?.present();
  };
  const closeFilterModal = () => {
    modalRef?.current?.close();
  };
  const applayFilters = () => {
    if (filters) {
      page = 1;
      setImages([]);
      let params = {
        page,
        ...filters,
      };
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search;
      fetchImages(params, false);
    }
    closeFilterModal();
  };
  const resetFilters = () => {
    if (filters) {
      page = 1;
      setFilters(null);
      setImages([]);
      let params = {
        page,
      };
      if (activeCategory) params.category = activeCategory;
      if (search) params.q = search;
      fetchImages(params, false);
    }
    closeFilterModal();
  };
  const clearThisFilter = (filterName) => {
    let filterz = { ...filters };
    delete filterz[filterName];
    setFilters({ ...filterz });
    page = 1;
    setImages([]);
    let params = {
      page,
      ...filterz,
    };
    if (activeCategory) params.category = activeCategory;
    if (search) params.q = search;
    fetchImages(params, false);
  };
  const handelScroll = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollOffset = event.nativeEvent.contentOffset.y;
    const bottomPosition = contentHeight - scrollViewHeight;
    if (scrollOffset >= bottomPosition - 1) {
      if (!isEndReached) {
        setIsEndReached(true);
        ++page;
        let params = {
          page,
          ...filters,
        };
        if (activeCategory) params.category = activeCategory;
        if (search) params.q = search;
        fetchImages(params);
      }
    } else if (isEndReached) {
      setIsEndReached(false);
    }
  };
  const handelScrollUp = () => {
    scrollRef?.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  return (
    <View style={[styles.container, { paddingTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handelScrollUp}>
          <Text style={styles.title}>Pixelaze</Text>
        </Pressable>
        <Pressable onPress={openFilterModal}>
          <FontAwesome6
            name="bars-staggered"
            size={22}
            color={theme.colors.neutral(0.7)}
          />
        </Pressable>
      </View>
      <ScrollView
        onScroll={handelScroll}
        scrollEventThrottle={5}
        ref={scrollRef}
        contentContainerStyle={{ gap: 15 }}
      >
        {/* Search Bar  */}
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <Feather
              name="search"
              size={24}
              color={theme.colors.neutral(0.4)}
            />
          </View>

          <TextInput
            ref={searchInputRef}
            placeholder="Search for photos..."
            // value={search}
            onChangeText={handelTextDebounce}
            style={styles.searchInput}
          />
          {search && (
            <Pressable
              onPress={() => handelSearch("")}
              style={styles.closeIcon}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.neutral(0.6)}
              />
            </Pressable>
          )}
        </View>
        {/* Categories */}
        <View>
          <Categories
            activeCategory={activeCategory}
            handelChangeCategory={handelChangeCategory}
          />
        </View>

        {/* Filters  */}
        {filters && (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {Object.keys(filters).map((key, index) => {
                return (
                  <View key={key} style={styles.filtersItem}>
                    {key == "colors" ? (
                      <View
                        style={{
                          height: 20,
                          width: 30,
                          borderRadius: 7,
                          backgroundColor: filters[key],
                        }}
                      />
                    ) : (
                      <Text style={styles.filterItemText}>{filters[key]}</Text>
                    )}

                    <Pressable
                      style={styles.filterCloseIcon}
                      onPress={() => clearThisFilter(key)}
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color={theme.colors.neutral(0.9)}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        {/* Images Masonry Grid */}
        <View>
          {images.length > 0 && <ImageGrid images={images} router={router} />}
        </View>
        {/* Loading  */}
        <View
          style={{ marginBottom: 70, marginTop: images.length > 0 ? 10 : 70 }}
        >
          <ActivityIndicator size="large" />
        </View>
      </ScrollView>
      {/* Filters Modal  */}
      <FilterModal
        modalRef={modalRef}
        filters={filters}
        setFilters={setFilters}
        onColse={closeFilterModal}
        onApplay={applayFilters}
        onReset={resetFilters}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
  header: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: hp(4),
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.neutral(0.9),
  },
  searchBar: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    backgroundColor: theme.colors.white,
    padding: 6,
    paddingLeft: 10,
    borderRadius: theme.radius.lg,
  },
  searchIcon: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    fontSize: hp(1.8),
    padding:15,
  },
  closeIcon: {
    backgroundColor: theme.colors.neutral(0.1),
    padding: 8,
    borderRadius: theme.radius.sm,
  },
  filters: {
    paddingHorizontal: wp(4),
    gap: 10,
  },
  filtersItem: {
    backgroundColor: theme.colors.grayBG,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.xs,
    padding: 8,
    gap: 10,
    paddingHorizontal: 10,
  },
  filterItemText: {
    fontSize: hp(1.7),
  },
  filterCloseIcon: {
    backgroundColor: theme.colors.neutral(0.2),
    padding: 4,
    borderRadius: 7,
  },
});

export default HomeScreen;
