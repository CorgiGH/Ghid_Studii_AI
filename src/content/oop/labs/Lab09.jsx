import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Lab09() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: OOP Lab 09 — Custom template Map with iterators & structured bindings. UAIC 2024-2025.',
          'Sursă: Lab POO 09 — Map template personalizat cu iteratori și legare structurată. UAIC 2024-2025.'
        )}
      </p>

      <Section
        title={t('Exercise: Custom Template Map', 'Exercițiul: Map Template Personalizat')}
        id="oop-lab_9-template-map"
        checked={!!checked['oop-lab_9-template-map']}
        onCheck={() => toggleCheck('oop-lab_9-template-map')}
      >
        <Box type="definition">
          <p className="font-semibold mb-2">{t('Problem statement', 'Enunțul problemei')}</p>
          <p className="text-sm mb-3">
            {t(
              'Write a C++ template Map that makes the following code work correctly:',
              'Scrieți un Map template C++ care face ca următorul cod să funcționeze corect:'
            )}
          </p>
          <Code>{`int main()
{
    Map<int, const char *> m;
    m[10] = "C++";
    m[20] = "test";
    m[30] = "Poo";
    for (auto[key, value, index] : m)
    {
        printf("Index:%d, Key=%d, Value=%s\\n", index, key, value);
    }
    m[20] = "result";
    for (auto[key, value, index] : m)
    {
        printf("Index:%d, Key=%d, Value=%s\\n", index, key, value);
    }
    return 0;
}`}</Code>
          <p className="text-sm mt-3 mb-1">{t('Expected output:', 'Ieșire așteptată:')}</p>
          <Code>{`Index:0, Key=10, Value=C++
Index:1, Key=20, Value=test
Index:2, Key=30, Value=Poo
Index:0, Key=10, Value=C++
Index:1, Key=20, Value=result
Index:2, Key=30, Value=Poo`}</Code>
        </Box>

        <Box type="warning">
          <p className="font-semibold mb-1">{t('Required features to use:', 'Facilități necesare de utilizat:')}</p>
          <ul className="list-disc ml-5 text-sm space-y-1">
            <li>{t('Structured binding (auto[key, value, index])', 'Legare structurată (auto[key, value, index])')}</li>
            <li>{t('auto keyword', 'Cuvântul cheie auto')}</li>
            <li>{t('Range-based for loop', 'Buclă for bazată pe range')}</li>
          </ul>
        </Box>

        <Box type="definition">
          <p className="font-semibold mb-2">{t('Required methods', 'Metode necesare')}</p>
          <ul className="list-disc ml-5 text-sm space-y-1">
            <li>
              <code>operator[]</code> — {t('access or create element by key', 'accesează sau creează element după cheie')}
            </li>
            <li>
              <code>Set(key, value)</code> — {t('associates a value to a key', 'asociază o valoare unei chei')}
            </li>
            <li>
              <code>{'bool Get(const K& key, V& value)'}</code> — {t('copies the value for key into value parameter; returns true if found, false otherwise', 'copiază valoarea pentru cheie în parametrul value; returnează true dacă găsit, false altfel')}
            </li>
            <li>
              <code>Count()</code> — {t('returns the number of elements', 'returnează numărul de elemente')}
            </li>
            <li>
              <code>Clear()</code> — {t('removes all elements', 'elimină toate elementele')}
            </li>
            <li>
              <code>{'bool Delete(const K& key)'}</code> — {t('deletes the element with the given key; returns true if deleted', 'șterge elementul cu cheia dată; returnează true dacă șters')}
            </li>
            <li>
              <code>{'bool Includes(const Map<K,V>& map)'}</code> — {t('returns true if all keys in the argument map exist in this map', 'returnează true dacă toate cheile din harta argument există în această hartă')}
            </li>
          </ul>
        </Box>

        <Box type="warning">
          <p className="text-sm font-semibold">
            {t(
              'YOU ARE NOT ALLOWED TO USE STL TEMPLATES (Vector, Map, List, etc.) for this problem. Implement the internal storage manually.',
              'NU AVEȚI VOIE SĂ FOLOSIȚI ȘABLOANE STL (Vector, Map, List, etc.) pentru această problemă. Implementați stocarea internă manual.'
            )}
          </p>
        </Box>

        <Toggle
          question={t('Show design hints', 'Arată indicii de design')}
          showLabel={t('Show hints', 'Arată indicii')}
          hideLabel={t('Hide hints', 'Ascunde indicii')}
          answer={
            <div className="space-y-3 text-sm">
              <p>
                {t(
                  'Store entries in a dynamically allocated array of structs (key, value, index). Keep a size and capacity field.',
                  'Stocați intrările într-un tablou alocat dinamic de structuri (cheie, valoare, index). Mențineți câmpuri de dimensiune și capacitate.'
                )}
              </p>
              <p>
                {t(
                  'For range-based for with structured bindings, your iterator must return something with 3 components. One approach: make the entry struct (key, value, index) implement get<N> via tuple_size / tuple_element / get specializations.',
                  'Pentru for bazat pe range cu legare structurată, iteratorul tău trebuie să returneze ceva cu 3 componente. O abordare: faceți structul de intrare (cheie, valoare, index) să implementeze get<N> prin specializări tuple_size / tuple_element / get.'
                )}
              </p>
              <Code>{`// Minimal iterator skeleton
template<typename K, typename V>
struct MapEntry {
    K key;
    V value;
    int index;
};

// For structured bindings to work on MapEntry,
// specialize std::tuple_size and std::tuple_element:
namespace std {
    template<typename K, typename V>
    struct tuple_size<MapEntry<K,V>> : integral_constant<size_t, 3> {};

    template<typename K, typename V>
    struct tuple_element<0, MapEntry<K,V>> { using type = K; };
    template<typename K, typename V>
    struct tuple_element<1, MapEntry<K,V>> { using type = V; };
    template<typename K, typename V>
    struct tuple_element<2, MapEntry<K,V>> { using type = int; };
}

template<size_t I, typename K, typename V>
auto get(const MapEntry<K,V>& e) {
    if constexpr (I == 0) return e.key;
    if constexpr (I == 1) return e.value;
    if constexpr (I == 2) return e.index;
}`}</Code>
            </div>
          }
        />
      </Section>
    </>
  );
}
