import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { mobileApi } from '../api/apiClient';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { LeafletWebViewMap } from '../components/LeafletWebViewMap';
import { SelectDropdown } from '../components/SelectDropdown';
import { Ionicons } from '@expo/vector-icons';
import {
  JHARKHAND_DISTRICTS,
  getCoordinatesForDistrict,
} from '../constants/jharkhandDistricts';

const CATEGORIES = [
  'All',
  'Water & sanitation',
  'Healthcare',
  'Education',
  'Agriculture',
  'Environment',
  'Energy',
  'Rural livelihoods',
  'Accessibility',
  'Urban infrastructure',
  'Public services',
];

const DEFAULT_CATEGORY_IMAGES = {
  'Water & sanitation':
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80',
  Environment:
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80',
  Energy:
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
  Agriculture:
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  Healthcare:
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  Education:
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
  Accessibility:
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80',
  'Urban infrastructure':
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  'Rural livelihoods':
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80',
  'Public services':
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
};

export const ExploreScreen = ({ navigation }) => {
  const [challenges, setChallenges] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list');
  const [refreshing, setRefreshing] = useState(false);

  const fetchChallenges = async () => {
    try {
      const res = await mobileApi.get('/challenges?limit=60');
      if (res.success && res.challenges) {
        setChallenges(res.challenges);
      }
    } catch (_) {
      // Fallback
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChallenges();
    setRefreshing(false);
  };

  const filtered = challenges.filter((c) => {
    const matchDist =
      selectedDistrict === 'All' || c.district === selectedDistrict;
    const matchCat =
      selectedCategory === 'All' || c.category === selectedCategory;
    const matchSearch =
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.location?.toLowerCase().includes(search.toLowerCase()) ||
      c.district?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    return matchDist && matchCat && matchSearch;
  });

  const mapCenter =
    selectedDistrict !== 'All'
      ? getCoordinatesForDistrict(selectedDistrict)
      : { lat: 23.6102, lng: 85.2799 };
  const mapZoom = selectedDistrict !== 'All' ? 11 : 8;

  const resetFilters = () => {
    setSelectedDistrict('All');
    setSelectedCategory('All');
    setSearch('');
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar & View Mode Toggle */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={15} color="#64748b" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search problems, districts, or keywords..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.mapToggleBtn}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={viewMode === 'list' ? 'map-outline' : 'list-outline'}
            size={15}
            color="#ffffff"
          />
          <Text style={styles.mapToggleBtnText}>
            {viewMode === 'list' ? 'GIS Map' : 'List'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Select Dropdown Filters (All 25 Jharkhand Districts & Categories) */}
      <View style={styles.selectBar}>
        <View style={{ flex: 1 }}>
          <SelectDropdown
            label="District"
            placeholder="All Districts"
            value={selectedDistrict === 'All' ? 'All Districts' : selectedDistrict}
            options={['All Districts', ...JHARKHAND_DISTRICTS]}
            onSelect={(val) => setSelectedDistrict(val === 'All Districts' ? 'All' : val)}
            icon="location-outline"
            searchable
            compact
          />
        </View>
        <View style={{ width: 8 }} />
        <View style={{ flex: 1 }}>
          <SelectDropdown
            label="Category"
            placeholder="All Categories"
            value={selectedCategory === 'All' ? 'All Categories' : selectedCategory}
            options={['All Categories', ...CATEGORIES.filter((c) => c !== 'All')]}
            onSelect={(val) => setSelectedCategory(val === 'All Categories' ? 'All' : val)}
            icon="grid-outline"
            compact
          />
        </View>
      </View>

      {/* Count & Status Strip */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCountText}>
          Showing {filtered.length} {filtered.length === 1 ? 'Challenge' : 'Challenges'} in Jharkhand
        </Text>
        {(selectedDistrict !== 'All' || selectedCategory !== 'All' || search) && (
          <TouchableOpacity onPress={resetFilters} style={styles.resetFiltersBtn}>
            <Ionicons name="refresh" size={12} color="#0f2c59" />
            <Text style={styles.resetFiltersText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content: Map or List */}
      {viewMode === 'map' ? (
        <View style={{ flex: 1, padding: 12 }}>
          <LeafletWebViewMap
            challenges={filtered}
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={38} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Challenges Found</Text>
              <Text style={styles.emptySub}>
                No civic challenges match the selected district or category filters.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={resetFilters}>
                <Text style={styles.emptyBtnText}>Show All Challenges</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const imageUrl =
              item.media?.[0]?.url ||
              DEFAULT_CATEGORY_IMAGES[item.category] ||
              DEFAULT_CATEGORY_IMAGES['Water & sanitation'];

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate('ChallengeDetail', { id: item._id, challenge: item })
                }
              >
                <Image source={{ uri: imageUrl }} style={styles.cardImage} />

                <View style={styles.cardBody}>
                  <View style={styles.cardMetaTop}>
                    <Text style={styles.cardMeta} numberOfLines={1}>
                      {item.category} • {item.district}
                    </Text>
                    <PriorityBadge priority={item.priority || item.urgency} />
                  </View>

                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.locationText} numberOfLines={1}>
                      📍 {item.location || `${item.district}, Jharkhand`}
                    </Text>
                    {item.affectedPeople ? (
                      <Text style={styles.affectedText} numberOfLines={1}>
                        👥 {item.affectedPeople}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.cardFooter}>
                    <StatusBadge status={item.status} />
                    <View style={styles.secondaryBtn}>
                      <Text style={styles.secondaryBtnText}>View Details →</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
  },
  mapToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0f2c59',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 38,
  },
  mapToggleBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 2,
    backgroundColor: '#ffffff',
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  resetFiltersText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f2c59',
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  resultsCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  listContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 135,
    resizeMode: 'cover',
    backgroundColor: '#e2e8f0',
  },
  cardBody: {
    padding: 14,
  },
  cardMetaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 6,
  },
  cardMeta: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0f2c59',
    textTransform: 'uppercase',
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  locationText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
  },
  affectedText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  secondaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f2c59',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  emptyBtn: {
    backgroundColor: '#0f2c59',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
