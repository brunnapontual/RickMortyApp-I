import React, {useEffect, useState} from "react";
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, Modal, StyleSheet, Button, Dimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: { name: string };
  image: string;
  episode: string[];
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.round((width - 48) / 2);

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<Character | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = async (p = 1) => {
    try {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const res = await fetch(`https://rickandmortyapi.com/api/character?page=${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const results: Character[] = json.results;
      if (p === 1) setCharacters(results);
      else setCharacters(prev => [...prev, ...results]);
      setHasMore(!!json.info && !!json.info.next);
    } catch (e: any) {
      console.warn("fetch error", e);
      setError("Não foi possível carregar personagens. Tente novamente.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCharacters(1);
  }, []);

  const loadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchCharacters(next);
  };

  const renderCard = ({ item }: { item: Character }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => setSelected(item)}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>{item.species} • {item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rick & Morty - I</Text>
        <Text style={styles.subtitleHeader}>Personagens</Text>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text>{error}</Text>
          <Button title="Tentar novamente" onPress={() => fetchCharacters(1)} />
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={characters}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          ListFooterComponent={() => (
            <View style={{ paddingVertical: 12 }}>
              {loadingMore && <ActivityIndicator />}
              {!hasMore && <Text style={{ textAlign: "center", color: "#666" }}>Fim da lista</Text>}
            </View>
          )}
        />
      )}

      <Modal visible={!!selected} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          {selected && (
            <View style={styles.modalContent}>
              <Image source={{ uri: selected.image }} style={styles.modalImage} />
              <Text style={styles.modalName}>{selected.name}</Text>
              <Text style={styles.modalText}>Espécie: {selected.species}</Text>
              <Text style={styles.modalText}>Status: {selected.status}</Text>
              <Text style={styles.modalText}>Gênero: {selected.gender}</Text>
              <Text style={styles.modalText}>Origem: {selected.origin?.name}</Text>

              <View style={{ marginTop: 16 }}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={styles.backButton}
                  onPress={() => setSelected(null)}>
                  <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0a0f0d"
  },

  header: { 
    paddingHorizontal: 16, 
    paddingTop: 16, 
    paddingBottom: 16
  },

  title: { 
    fontSize: 28, 
    fontWeight: "700",
    color: "#2ecc71",
    textShadowColor: "#9b59b680",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },

  subtitleHeader: { 
    color: "#9b59b6",
    marginTop: 2
  },

  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },

  row: { 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    marginTop: 12 
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: "#111417",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    borderColor: "#2ecc71",
    borderWidth: 1.2,
    shadowColor: "#2ecc7180",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5
  },

  avatar: { 
    width: "100%", 
    height: CARD_WIDTH, 
    resizeMode: "cover"
  },

  cardBody: { 
    padding: 10 
  },

  name: { 
    fontWeight: "700", 
    fontSize: 15, 
    color: "#2ecc71",
    textAlign: "center",
  },

  subtitle: { 
    fontSize: 12, 
    color: "#9b59b6", 
    marginTop: 4,
    textAlign: "center",
  },

  modalContainer: { 
    flex: 1, 
    backgroundColor: "#0a0f0d" 
  },

  modalContent: { 
    padding: 16, 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },

  modalImage: { 
    width: 220, 
    height: 220, 
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2ecc71"
  },

  modalName: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginTop: 12,
    color: "#2ecc71" 
  },

  modalText: { 
    fontSize: 12, 
    color: "#9b59b6", 
    marginTop: 6
  },
  
  backButton: {
    marginTop: 40,
    paddingVertical: 8,
    paddingHorizontal: 22,
    backgroundColor: "#1a1d20",
    borderRadius: 50,
    borderWidth: 0.8,
    borderColor: "#4b556330",
    alignSelf: "center",
  },

  backButtonText: {
    color: "#e5e7ebb8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

});