import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course07() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 7 — Topics:', 'Cursul 7 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Sequence Containers: vector, deque, array, list, forward_list', 'Containere secvențiale: vector, deque, array, list, forward_list')}</li>
          <li>{t('Adaptors: stack, queue, priority_queue', 'Adaptori: stack, queue, priority_queue')}</li>
          <li>{t('I/O Streams: iostream, fstream, manipulators', 'Fluxuri I/O: iostream, fstream, manipulatoare')}</li>
          <li>{t('Strings: basic_string, string_view', 'Șiruri: basic_string, string_view')}</li>
          <li>{t('Initialization Lists: std::initializer_list, variadic macros', 'Liste de inițializare: std::initializer_list, macro-uri variadice')}</li>
          <li>{t('Iterators: forward, reverse, invalidation rules', 'Iteratori: forward, reverse, reguli de invalidare')}</li>
        </ol>
      </Box>

      {/* ── 1. Sequence Containers ── */}
      <Section title={t('1. Sequence Containers', '1. Containere secvențiale')} id="oop-c7-sequence" checked={!!checked['oop-c7-sequence']} onCheck={() => toggleCheck('oop-c7-sequence')}>
        <Box type="definition">
          <p className="font-bold">{t('Standard Template Library (STL)', 'Biblioteca Standard de Șabloane (STL)')}</p>
          <p className="text-sm mt-1">{t(
            'A set of templates that contains: Containers (class templates that may contain other classes), Iterators, Algorithms, Adaptors, Allocators, and more. To use an STL template, include its header. Use "using namespace std;" or the full scope "std::vector<int> x".',
            'Un set de șabloane care conține: Containere (șabloane de clase care pot conține alte clase), Iteratori, Algoritmi, Adaptori, Alocatori și altele. Pentru a folosi un șablon STL, includeți header-ul. Folosiți "using namespace std;" sau scope-ul complet "std::vector<int> x".'
          )}</p>
        </Box>

        <p className="font-bold mt-3">{t('STL Containers — Categories:', 'Containere STL — Categorii:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>{t('Sequence containers', 'Containere secvențiale')}</strong> — vector, array, list, forward_list, deque</li>
          <li><strong>{t('Adaptors', 'Adaptori')}</strong> — stack, queue, priority_queue</li>
          <li><strong>{t('Associative containers (ordered)', 'Containere asociative (ordonate)')}</strong> — set, multiset, map, multimap</li>
          <li><strong>{t('Associative containers (unordered)', 'Containere asociative (neordonate)')}</strong> — unordered_set, unordered_map, unordered_multiset, unordered_multimap</li>
        </ul>

        {/* ── Vector ── */}
        <p className="font-bold mt-4 text-base">{t('Vector', 'Vector')}</p>
        <p className="text-sm">{t(
          'A vector is a unidimensional dynamic array. Memory allocation and resizing is done dynamically. Every object added to a vector is actually a copy of the original.',
          'Un vector este un tablou dinamic unidimensional. Alocarea memoriei și redimensionarea se fac dinamic. Fiecare obiect adăugat într-un vector este de fapt o copie a originalului.'
        )}</p>

        <Code>{`#include <vector>
using namespace std;

vector<int> v;
v.push_back(1);
v.push_back(2);
int x = v[1];     // x = 2
int y = v.at(0);  // y = 1`}</Code>

        <p className="text-sm mt-2">{t(
          'Insertion: push_back, insert. Deletion: pop_back, erase, clear. Reallocation: resize, reserve. Access: operator[], at().',
          'Inserare: push_back, insert. Ștergere: pop_back, erase, clear. Realocare: resize, reserve. Acces: operator[], at().'
        )}</p>

        <Box type="warning">
          <p className="font-bold">{t('Vector reallocation cost:', 'Costul realocării vectorului:')}</p>
          <p className="text-sm">{t(
            'When push_back is called and the vector is full, it: (1) allocates space for count+1 elements, (2) copies/moves existing elements to the new space, (3) frees the old space, (4) copies/moves the new item. This makes repeated push_back without reserve() very expensive — O(n) copies per insertion!',
            'Când push_back este apelat și vectorul este plin: (1) alocă spațiu pentru count+1 elemente, (2) copiază/mută elementele existente în noul spațiu, (3) eliberează spațiul vechi, (4) copiază/mută noul element. Acest lucru face push_back repetat fără reserve() foarte costisitor — O(n) copii per inserare!'
          )}</p>
        </Box>

        <Code>{`// Performance test: vector without vs with reserve
// Vec-1: no reserve — ~1936ms for 100,000 insertions
vector<Integer> v;
Integer i;
for (int tr = 0; tr < 100000; tr++) {
    i.Set(tr);
    v.push_back(i);
}

// Vec-2: with reserve — ~517ms (3.7x faster!)
vector<Integer> v;
Integer i;
v.reserve(100000);
for (int tr = 0; tr < 100000; tr++) {
    i.Set(tr);
    v.push_back(i);
}`}</Code>

        <p className="font-bold mt-3">{t('emplace_back vs push_back:', 'emplace_back vs push_back:')}</p>
        <p className="text-sm">{t(
          'emplace_back constructs the object directly in the vector memory (in-place). push_back first constructs, then copies/moves into the vector.',
          'emplace_back construiește obiectul direct în memoria vectorului (in-place). push_back mai întâi construiește, apoi copiază/mută în vector.'
        )}</p>

        <Code>{`#include <vector>
class Test {
    int x, y, z, t;
public:
    Test(int v1, int v2) : x(v1), y(v2), z(v1+1), t(v2+1) {
        printf("CTOR(%d,%d)\\n", v1, v2);
    }
    Test(const Test& t) : x(t.x), y(t.y), z(t.z), t(t.t) {
        printf("COPY-CTOR(%d,%d,%d,%d)\\n", t.x, t.y, t.z, t.t);
    }
};

// push_back: prints CTOR(10,20) then COPY-CTOR(10,20,11,21)
v.push_back(Test(10,20));

// emplace_back: prints only CTOR(10,20) — no copy!
v.emplace_back(10,20);`}</Code>

        <p className="font-bold mt-3">{t('Useful vector methods:', 'Metode utile ale vectorului:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><code>size()</code> — {t('number of elements stored', 'numărul de elemente stocate')}</li>
          <li><code>capacity()</code> — {t('pre-allocated space', 'spațiu pre-alocat')}</li>
          <li><code>max_size()</code> — {t('maximum possible elements', 'numărul maxim posibil de elemente')}</li>
          <li><code>empty()</code> — {t('true if vector has no elements', 'true dacă vectorul nu are elemente')}</li>
          <li><code>data()</code> — {t('direct pointer to the internal array', 'pointer direct la tabloul intern')}</li>
          <li><code>swap()</code> — {t('exchanges internal data pointers between two vectors', 'schimbă pointerii interni între doi vectori')}</li>
        </ul>

        <Box type="theorem">
          <p className="font-bold">{t('Vector comparison operators:', 'Operatori de comparare vector:')}</p>
          <p className="text-sm">{t(
            'Two vectors are equal if they have the same number of elements and each pair of elements is equal (requires const operator==). For < comparison, vector uses lexicographic ordering (requires const operator<). Only operator== and operator< need to be defined — operator!= and operator> are derived from them.',
            'Doi vectori sunt egali dacă au același număr de elemente și fiecare pereche este egală (necesită const operator==). Pentru comparația <, vectorul folosește ordonare lexicografică (necesită const operator<). Doar operator== și operator< trebuie definiți — operator!= și operator> sunt derivați din aceștia.'
          )}</p>
        </Box>

        {/* ── Deque ── */}
        <p className="font-bold mt-4 text-base">{t('Deque', 'Deque')}</p>
        <p className="text-sm">{t(
          'Similar to vector, but elements do NOT have consecutive memory addresses. No data(), reserve(), or capacity() methods. Has additional push_front and pop_front. Header: #include <deque>.',
          'Similar cu vector, dar elementele NU au adrese de memorie consecutive. Nu are metodele data(), reserve(), capacity(). Are în plus push_front și pop_front. Header: #include <deque>.'
        )}</p>

        <Box type="formula">
          <p className="font-bold">{t('Performance comparison (100,000 insertions):', 'Comparație performanță (100.000 inserări):')}</p>
          <p className="text-sm font-mono">Vec-1 (no reserve): Init=0ms, Set=1936ms</p>
          <p className="text-sm font-mono">Vec-2 (with reserve): Init=120ms, Set=517ms</p>
          <p className="text-sm font-mono">Deq-1 (deque): Init=0ms, Set=651ms</p>
        </Box>

        {/* ── Array ── */}
        <p className="font-bold mt-4 text-base">{t('Array (C++11)', 'Array (C++11)')}</p>
        <p className="text-sm">{t(
          'Fixed-size array template. Has almost the same support as vector (iterators, overloaded operators), but no add/erase methods. Has a fill() method. Header: #include <array>.',
          'Șablon de tablou cu dimensiune fixă. Are aproape același suport ca vectorul (iteratori, operatori supraîncărcați), dar fără metode de adăugare/ștergere. Are metoda fill(). Header: #include <array>.'
        )}</p>

        <Code>{`#include <array>
array<Number, 5> v;
v.fill(Number(2));      // fill all elements with Number(2)
for (int tr = 0; tr < v.size(); tr++)
    printf("%d ", v[tr].Value);

for (array<Number, 5>::iterator it = v.begin(); it < v.end(); it++)
    it->Value = 10;
printf("%d ", v.at(3).Value);  // 10`}</Code>

        <Box type="definition">
          <p className="font-bold">{t('operator[] vs at()', 'operator[] vs at()')}</p>
          <p className="text-sm">{t(
            'Both return a reference (Type& or const Type&). The at() method always checks bounds and throws std::out_of_range. The [] operator checks bounds only in Debug mode (_ITERATOR_DEBUG_LEVEL == 2); in Release mode, no check is performed.',
            'Ambele returnează o referință (Type& sau const Type&). Metoda at() verifică întotdeauna limitele și aruncă std::out_of_range. Operatorul [] verifică limitele doar în modul Debug (_ITERATOR_DEBUG_LEVEL == 2); în modul Release, nu se face verificare.'
          )}</p>
        </Box>

        {/* ── List ── */}
        <p className="font-bold mt-4 text-base">{t('List', 'List')}</p>
        <p className="text-sm">{t(
          'A doubly-linked list. Elements do NOT share contiguous memory. Access only via iterators. The list iterator does NOT implement <, >, + or - operators — only ==, != and ++, --. Methods: push_back, push_front, erase, pop_front, pop_back, merge, splice. Header: #include <list>.',
          'O listă dublu înlănțuită. Elementele NU au memorie contiguă. Acces doar prin iteratori. Iteratorul de listă NU implementează operatorii <, >, + sau - — doar ==, != și ++, --. Metode: push_back, push_front, erase, pop_front, pop_back, merge, splice. Header: #include <list>.'
        )}</p>

        <Code>{`list<Number> v;
v.push_back(Number(0));  v.push_back(Number(1));  v.push_back(Number(2));
v.push_front(Number(3)); v.push_front(Number(4)); v.push_front(Number(5));

list<Number>::iterator it;
for (it = v.begin(); it != v.end(); it++)  // must use != not <
    printf("%d ", it->Value);
// Prints: 5 4 3 0 1 2

// To advance iterator: use ++ repeatedly (no + operator)
it = v.begin(); it++; it++; it++;
v.insert(it, Number(20));
// Result: 5 4 3 20 0 1 2`}</Code>

        {/* ── Forward List ── */}
        <p className="font-bold mt-4 text-base">{t('Forward List (C++11)', 'Forward List (C++11)')}</p>
        <p className="text-sm">{t(
          'A singly-linked list. Iterator only supports ++ (no --). No push_back or pop_back — only push_front, insert_after, erase_after. Header: #include <forward_list>.',
          'O listă simplu înlănțuită. Iteratorul suportă doar ++ (nu --). Fără push_back sau pop_back — doar push_front, insert_after, erase_after. Header: #include <forward_list>.'
        )}</p>

        <Code>{`forward_list<Number> v;
v.push_front(Number(0));
v.push_front(Number(1));
v.push_front(Number(2));
// Content: 2 1 0

forward_list<Number>::iterator it;
it = v.begin(); it++; it++;
v.insert_after(it, Number(20));
// Content: 2 1 0 20

it = ++v.begin();
v.erase_after(it);
// Content: 2 1 20`}</Code>

        <Toggle
          question={t('Why is vector without reserve() much slower than deque for many insertions?', 'De ce este vectorul fără reserve() mult mai lent decât deque pentru multe inserări?')}
          answer={t('Vector stores elements in contiguous memory. When it runs out of space, it must allocate a new block and copy ALL existing elements. Deque uses non-contiguous memory blocks, so adding elements only requires allocating a new small block without copying existing ones. With reserve(), vector pre-allocates enough space upfront, avoiding repeated reallocations.', 'Vectorul stochează elementele în memorie contiguă. Când rămâne fără spațiu, trebuie să aloce un nou bloc și să copieze TOATE elementele existente. Deque folosește blocuri de memorie necontigue, deci adăugarea elementelor necesită doar alocarea unui nou bloc mic fără copierea celor existente. Cu reserve(), vectorul pre-alocă suficient spațiu, evitând realocările repetate.')}
        />
      </Section>

      {/* ── 2. Adaptors ── */}
      <Section title={t('2. Adaptors', '2. Adaptori')} id="oop-c7-adaptors" checked={!!checked['oop-c7-adaptors']} onCheck={() => toggleCheck('oop-c7-adaptors')}>
        <Box type="definition">
          <p className="font-bold">{t('What are Adaptors?', 'Ce sunt Adaptorii?')}</p>
          <p className="text-sm mt-1">{t(
            'Adaptors are NOT containers — they do not store data themselves. They use an existing container internally for storage. Adaptors do NOT have iterators, but can access the internal container\'s iterators via _Get_container().',
            'Adaptorii NU sunt containere — nu stochează date ei înșiși. Folosesc intern un container existent pentru stocare. Adaptorii NU au iteratori, dar pot accesa iteratorii containerului intern prin _Get_container().'
          )}</p>
        </Box>

        {/* ── Stack ── */}
        <p className="font-bold mt-4 text-base">Stack (LIFO)</p>
        <p className="text-sm">{t(
          'Last In First Out. Default container: deque. Header: #include <stack>. Methods: push, pop, top, empty, size.',
          'Last In First Out. Container implicit: deque. Header: #include <stack>. Metode: push, pop, top, empty, size.'
        )}</p>

        <Code>{`#include <stack>
stack<int> s;              // uses deque internally
s.push(10); s.push(20); s.push(30);

stack<int, vector<int>> s2; // uses vector internally
s2.push(10); s2.push(20); s2.push(30);`}</Code>

        {/* ── Queue ── */}
        <p className="font-bold mt-4 text-base">Queue (FIFO)</p>
        <p className="text-sm">{t(
          'First In First Out. Default container: deque. Header: #include <queue>. Methods: push, pop, back, empty, size.',
          'First In First Out. Container implicit: deque. Header: #include <queue>. Metode: push, pop, back, empty, size.'
        )}</p>

        <Code>{`#include <queue>
queue<int> s;              // uses deque internally
s.push(10); s.push(20); s.push(30);

queue<int, list<int>> s2;  // uses list internally
s2.push(10); s2.push(20); s2.push(30);`}</Code>

        {/* ── Priority Queue ── */}
        <p className="font-bold mt-4 text-base">Priority Queue</p>
        <p className="text-sm">{t(
          'A queue where elements are sorted by priority (highest priority extracted first). Default container: vector. Header: #include <queue>. Methods: push, pop, top, empty, size.',
          'O coadă în care elementele sunt sortate după prioritate (prioritatea cea mai mare extrasă prima). Container implicit: vector. Header: #include <queue>. Metode: push, pop, top, empty, size.'
        )}</p>

        <Code>{`#include <queue>
priority_queue<int> s;
s.push(10); s.push(5); s.push(20); s.push(15);
while (s.empty() == false) {
    printf("%d ", s.top()); // prints: 20 15 10 5
    s.pop();
}`}</Code>

        <p className="text-sm mt-2">{t(
          'A custom comparator can be provided as a functor class implementing operator():',
          'Un comparator personalizat poate fi furnizat ca o clasă functor care implementează operator():'
        )}</p>

        <Code>{`class CompareModule {
    int modValue;
public:
    CompareModule(int v) : modValue(v) {}
    bool operator() (const int& v1, const int& v2) const {
        return (v1 % modValue) < (v2 % modValue);
    }
};

priority_queue<int, vector<int>, CompareModule> s(CompareModule(3));
s.push(10); s.push(5); s.push(20); s.push(15);
while (s.empty() == false) {
    printf("%d ", s.top());  // prints: 5 20 10 15
    s.pop();
}`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Adaptor — Container Compatibility:', 'Compatibilitate Adaptor — Container:')}</p>
          <div className="overflow-x-auto mt-2">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <th className="text-left p-2">{t('Adaptor', 'Adaptor')}</th>
                  <th className="text-left p-2">vector</th>
                  <th className="text-left p-2">deque</th>
                  <th className="text-left p-2">list</th>
                  <th className="text-left p-2">array</th>
                  <th className="text-left p-2">forward_list</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-bold">stack</td>
                  <td className="p-2">{t('YES', 'DA')}</td>
                  <td className="p-2">{t('YES', 'DA')}</td>
                  <td className="p-2">{t('YES', 'DA')}</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-bold">queue</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                  <td className="p-2">{t('YES', 'DA')}</td>
                  <td className="p-2">{t('YES', 'DA')}</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">priority_queue</td>
                  <td className="p-2">{t('YES', 'DA')}</td>
                  <td className="p-2">{t('YES', 'DA')}</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                  <td className="p-2">{t('NO', 'NU')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Adaptor method mapping:', 'Maparea metodelor adaptorilor:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li><strong>stack.push</strong> → Container.push_back | <strong>stack.pop</strong> → Container.pop_back | <strong>stack.top</strong> → Container.back</li>
            <li><strong>queue.push</strong> → Container.push_back | <strong>queue.pop</strong> → Container.pop_front | <strong>queue.back</strong> → Container.back</li>
            <li><strong>priority_queue.push</strong> → Container.push_back | <strong>priority_queue.pop</strong> → Container.pop_back | <strong>priority_queue.top</strong> → Container.front</li>
          </ul>
        </Box>

        <Toggle
          question={t('Why can\'t vector be used as the underlying container for queue?', 'De ce nu poate fi folosit vector ca și container de bază pentru queue?')}
          answer={t('Queue requires pop_front (to remove the first element), but vector does not implement pop_front. Only deque and list have pop_front, so only those can be used with queue.', 'Queue necesită pop_front (pentru a elimina primul element), dar vector nu implementează pop_front. Doar deque și list au pop_front, deci doar acestea pot fi folosite cu queue.')}
        />
      </Section>

      {/* ── 3. I/O Streams ── */}
      <Section title={t('3. I/O Streams', '3. Fluxuri I/O')} id="oop-c7-streams" checked={!!checked['oop-c7-streams']} onCheck={() => toggleCheck('oop-c7-streams')}>
        <Box type="definition">
          <p className="font-bold">{t('IOS Class Hierarchy', 'Ierarhia claselor IOS')}</p>
          <p className="text-sm mt-1">{t(
            'ios_base → ios → istream / ostream → iostream. Derived: ifstream, istringstream (from istream); ofstream, ostringstream (from ostream); fstream, stringstream (from iostream). Predefined objects: cin (istream), cout, cerr, clog (ostream).',
            'ios_base → ios → istream / ostream → iostream. Derivate: ifstream, istringstream (din istream); ofstream, ostringstream (din ostream); fstream, stringstream (din iostream). Obiecte predefinite: cin (istream), cout, cerr, clog (ostream).'
          )}</p>
        </Box>

        <p className="text-sm mt-2">{t(
          'Two operators are overloaded: operator>> (input from stream) and operator<< (output to stream). Manipulators can change how data is processed.',
          'Doi operatori sunt supraîncărcați: operator>> (intrare din flux) și operator<< (ieșire în flux). Manipulatoarele pot schimba modul de procesare a datelor.'
        )}</p>

        <p className="font-bold mt-3">{t('Manipulators:', 'Manipulatoare:')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Manipulator', 'Manipulator')}</th>
                <th className="text-left p-2">{t('Effect', 'Efect')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['endl', t('Adds line terminator and flushes', 'Adaugă terminator de linie și golește buffer-ul')],
                ['ends', t('Adds \\0 (NULL)', 'Adaugă \\0 (NULL)')],
                ['flush', t('Clears the stream\'s internal cache', 'Golește cache-ul intern al fluxului')],
                ['dec / hex / oct', t('Numbers in base 10 / 16 / 8', 'Numere în baza 10 / 16 / 8')],
                ['ws', t('Extracts and discards whitespace from input', 'Extrage și elimină spațiile din intrare')],
                ['showpoint / noshowpoint', t('Shows/hides decimal point', 'Afișează/ascunde punctul zecimal')],
                ['showpos / noshowpos', t('Shows/hides + for positive numbers', 'Afișează/ascunde + pentru numere pozitive')],
                ['boolalpha / noboolalpha', t('Bool as true/false vs 1/0', 'Bool ca true/false vs 1/0')],
                ['scientific / fixed', t('Scientific vs fixed-point notation', 'Notație științifică vs punct fix')],
                ['left / right', t('Left/right alignment', 'Aliniere stânga/dreapta')],
                ['setfill(char)', t('Sets fill character', 'Setează caracterul de umplere')],
                ['setprecision(n)', t('Sets precision for real numbers', 'Setează precizia pentru numere reale')],
                ['setbase(b)', t('Sets the numeric base', 'Setează baza numerică')],
              ].map(([m, e], i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">{m}</td>
                  <td className="p-2">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-bold mt-4">{t('Console vs File I/O:', 'I/O Consolă vs Fișier:')}</p>

        <Code>{`// Console I/O
#include <iostream>
using namespace std;
int main() {
    int x;
    cin >> x;
    for (int tr = 0; tr < x; tr++)
        cout << tr << ",";
    cout << endl;
    return 0;
}

// File I/O — almost identical!
#include <fstream>
using namespace std;
int main() {
    ifstream fin("input.txt");
    ofstream fout("output.txt");
    int x;
    fin >> x;
    for (int tr = 0; tr < x; tr++)
        fout << tr << ",";
    fout << endl;
    return 0;
}`}</Code>

        <p className="font-bold mt-3">{t('File open modes (ios_base::openmode):', 'Moduri de deschidere fișier (ios_base::openmode):')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><code>std::ios::in</code> — {t('open for reading', 'deschidere pentru citire')}</li>
          <li><code>std::ios::out</code> — {t('open for writing', 'deschidere pentru scriere')}</li>
          <li><code>std::ios::app</code> — {t('open for appending', 'deschidere pentru adăugare')}</li>
          <li><code>std::ios::ate</code> — {t('open and seek to end', 'deschidere și salt la sfârșit')}</li>
          <li><code>std::ios::trunc</code> — {t('truncate file if it exists', 'trunchiere fișier dacă există')}</li>
          <li><code>std::ios::binary</code> — {t('open in binary mode', 'deschidere în mod binar')}</li>
        </ul>

        <p className="font-bold mt-3">{t('Reading a file line by line:', 'Citirea unui fișier linie cu linie:')}</p>

        <Code>{`#include <iostream>
#include <fstream>
#include <string>

int main() {
    std::ifstream file("a.txt");
    if (file.is_open() == false) {
        printf("Fail to open the file !");
        return 1;
    }
    std::string line;
    while (std::getline(file, line)) {
        std::cout << line << std::endl;
    }
    file.close();
    return 0;
}`}</Code>

        <p className="font-bold mt-3">{t('Reading a binary file into a buffer:', 'Citirea unui fișier binar într-un buffer:')}</p>

        <Code>{`#include <iostream>
#include <fstream>
#include <vector>

int main() {
    std::ifstream file("a.exe", std::ios::binary);

    // Find the file size
    file.seekg(0, std::ios::end);
    std::streamsize size = file.tellg();
    file.seekg(0, std::ios::beg);

    // Read entire file into vector
    std::vector<char> buffer(size);
    file.read(buffer.data(), size);
    file.close();
    return 0;
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Important:', 'Important:')}</p>
          <p className="text-sm">{t(
            'File operations (open, read) might fail (e.g., file deleted, permissions). Always check the result with is_open() or the stream state.',
            'Operațiile cu fișiere (deschidere, citire) pot eșua (ex: fișier șters, permisiuni). Verificați întotdeauna rezultatul cu is_open() sau starea fluxului.'
          )}</p>
        </Box>

        <Toggle
          question={t('What is the difference between seekg/tellg and fseek/ftell?', 'Care este diferența între seekg/tellg și fseek/ftell?')}
          answer={t('seekg/tellg are the C++ stream equivalents of C\'s fseek/ftell. seekg(offset, direction) sets the read position and tellg() returns the current position. They work with ios_base::seekdir values (ios::beg, ios::cur, ios::end) and are particularly useful for binary file operations.', 'seekg/tellg sunt echivalentele C++ stream ale lui fseek/ftell din C. seekg(offset, direcție) setează poziția de citire iar tellg() returnează poziția curentă. Lucrează cu valori ios_base::seekdir (ios::beg, ios::cur, ios::end) și sunt deosebit de utile pentru operații cu fișiere binare.')}
        />
      </Section>

      {/* ── 4. Strings ── */}
      <Section title={t('4. Strings', '4. Șiruri de caractere')} id="oop-c7-strings" checked={!!checked['oop-c7-strings']} onCheck={() => toggleCheck('oop-c7-strings')}>
        <Box type="definition">
          <p className="font-bold">basic_string</p>
          <p className="text-sm mt-1">{t(
            'A template that provides common string operations. Declared as: template <class CharacterType, class traits = char_traits<CharacterType>> class basic_string. Most common typedefs: string (char), wstring (wchar_t). C++11 added: u16string (char16_t), u32string (char32_t).',
            'Un șablon care oferă operații comune asupra șirurilor. Declarat ca: template <class CharacterType, class traits = char_traits<CharacterType>> class basic_string. Cele mai comune typedef-uri: string (char), wstring (wchar_t). C++11 a adăugat: u16string (char16_t), u32string (char32_t).'
          )}</p>
        </Box>

        <p className="font-bold mt-3">{t('String initialization forms:', 'Forme de inițializare string:')}</p>

        <Code>{`string s1("Tomorrow");                        // "Tomorrow"
string s2(s1 + " I'll go ");                  // "Tomorrow I'll go "
string s3(s1, 3, 3);                          // "orr" (from index 3, length 3)
string s4("Tomorrow I'll go to my cousin.", 13); // "Tomorrow I'll" (first 13 chars)
string s5(s4.substr(9, 10));                  // "I'll go to"
string s6(10, '1');                           // "1111111111"`}</Code>

        <p className="font-bold mt-3">{t('String operations:', 'Operații cu string:')}</p>

        <Code>{`string s1;
s1 += "Now";
printf("Size = %d\\n", s1.length());    // Size = 3

s1 = s1 + " " + s1;
printf("S1 = %s\\n", s1.data());        // S1 = Now Now

s1.erase(2, 4);
printf("S1 = %s\\n", s1.c_str());       // S1 = Now

s1.insert(1, "_");
s1.insert(3, "__");
printf("S1 = %s\\n", s1.c_str());       // S1 = N_o__w

s1.replace(s1.begin(), s1.begin() + 2, "123456");
printf("S1 = %s\\n", s1.c_str());       // S1 = 123456o__w`}</Code>

        <p className="font-bold mt-3">{t('Supported methods/operators:', 'Metode/operatori suportați:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('Assignment: operator=', 'Atribuire: operator=')}</li>
          <li>{t('Append: operator+=, append, push_back', 'Adăugare: operator+=, append, push_back')}</li>
          <li>{t('Insert: insert method', 'Inserare: metoda insert')}</li>
          <li>{t('Access: operator[], at, front (C++11), back (C++11)', 'Acces: operator[], at, front (C++11), back (C++11)')}</li>
          <li>{t('Substrings: substr', 'Subșiruri: substr')}</li>
          <li>{t('Replace: replace', 'Înlocuire: replace')}</li>
          <li>{t('Delete: erase, clear, pop_back (C++11)', 'Ștergere: erase, clear, pop_back (C++11)')}</li>
          <li>{t('Search: find, rfind, find_first_of, find_last_of, find_first_not_of, find_last_not_of', 'Căutare: find, rfind, find_first_of, find_last_of, find_first_not_of, find_last_not_of')}</li>
          <li>{t('Compare: all relational operators + compare()', 'Comparare: toți operatorii relaționali + compare()')}</li>
          <li>{t('Info: size, length, empty, max_size, capacity', 'Informații: size, length, empty, max_size, capacity')}</li>
        </ul>

        <p className="font-bold mt-3">{t('char_traits — Custom string behavior:', 'char_traits — Comportament personalizat string:')}</p>
        <p className="text-sm">{t(
          'char_traits provides low-level operations (eq, lt, compare, length, assign, find, move, copy, eof) used by basic_string. By default, specializations for <char> and <wchar> use efficient functions like memcpy/memmove. You can create a custom char_traits for special behavior, such as case-insensitive comparison:',
          'char_traits oferă operații de nivel scăzut (eq, lt, compare, length, assign, find, move, copy, eof) folosite de basic_string. Implicit, specializările pentru <char> și <wchar> folosesc funcții eficiente ca memcpy/memmove. Puteți crea un char_traits personalizat pentru comportament special, cum ar fi compararea case-insensitive:'
        )}</p>

        <Code>{`struct IgnoreCase : public char_traits<char> {
    static bool eq(char c1, char c2) {
        return (upper(c1)) == (upper(c2));
    }
    static bool lt(char c1, char c2) {
        return (upper(c1)) < (upper(c2));
    }
    static int compare(const char* s1, const char* s2, size_t n) {
        while (n > 0) {
            char c1 = upper(*s1); char c2 = upper(*s2);
            if (c1 < c2) return -1;
            if (c1 > c2) return 1;
            s1++; s2++; n--;
        }
        return 0;
    }
};

basic_string<char, IgnoreCase> s1("Salut");
basic_string<char, IgnoreCase> s2("sAlUt");
if (s1 == s2)
    printf("Strings are equal!");  // This prints!`}</Code>

        {/* ── string_view ── */}
        <p className="font-bold mt-4 text-base">string_view (C++17)</p>
        <p className="text-sm">{t(
          'A lightweight, non-owning view into a character buffer. Holds a pointer and a size. Does NOT own the string. The pointer does not necessarily point to a null-terminated string.',
          'O vizualizare ușoară, fără proprietate, a unui buffer de caractere. Conține un pointer și o dimensiune. NU deține string-ul. Pointerul nu indică neapărat un string terminat cu null.'
        )}</p>

        <Code>{`#include <string>
#include <iostream>

std::string s = "C++ exam";
std::string_view sv = s;
std::cout << sv << std::endl;  // C++ exam

sv = sv.substr(1, 2);
std::cout << sv << std::endl;  // ++`}</Code>

        <p className="text-sm mt-2">{t(
          'string_view supports: iterators, substr, find/rfind/find_first_of/find_last_of, compare operators, operator[]/at, data(), empty(), size(). Also has templates for char16_t, char32_t, wchar_t.',
          'string_view suportă: iteratori, substr, find/rfind/find_first_of/find_last_of, operatori de comparare, operator[]/at, data(), empty(), size(). Are și șabloane pentru char16_t, char32_t, wchar_t.'
        )}</p>

        <Box type="warning">
          <p className="font-bold">{t('string_view danger — data() is not null-terminated!', 'Pericol string_view — data() nu este terminat cu null!')}</p>
          <p className="text-sm">{t(
            'string_view does not treat its content as ASCIIZ (null-terminated). Using .data() with printf("%s") can cause undefined behavior — printf will read past the string until it finds a \\0 in memory.',
            'string_view nu tratează conținutul ca ASCIIZ (terminat cu null). Folosirea .data() cu printf("%s") poate cauza comportament nedefinit — printf va citi dincolo de string până găsește un \\0 în memorie.'
          )}</p>
        </Box>

        <Code>{`char text[3] = {'C', '+', '+'};   // NOT null-terminated!
std::string_view sv(text, 3);
std::cout << sv << std::endl;      // OK: "C++"
printf("%s", sv.data());           // UNDEFINED: prints "C++<garbage>"`}</Code>

        <Toggle
          question={t('What is the advantage of using a custom char_traits with basic_string?', 'Care este avantajul folosirii unui char_traits personalizat cu basic_string?')}
          answer={t('Custom char_traits allows you to change how string comparisons and operations work at the type level. For example, IgnoreCase char_traits makes all comparisons case-insensitive automatically, without modifying the string content. This means operator==, find, and other operations all respect the custom behavior.', 'char_traits personalizat vă permite să schimbați modul în care funcționează comparările și operațiile cu string-uri la nivel de tip. De exemplu, char_traits IgnoreCase face toate comparările case-insensitive automat, fără a modifica conținutul string-ului. Aceasta înseamnă că operator==, find și alte operații respectă toate comportamentul personalizat.')}
        />
      </Section>

      {/* ── 5. Initialization Lists ── */}
      <Section title={t('5. Initialization Lists', '5. Liste de inițializare')} id="oop-c7-init-lists" checked={!!checked['oop-c7-init-lists']} onCheck={() => toggleCheck('oop-c7-init-lists')}>
        <Box type="definition">
          <p className="font-bold">{t('Initialization Lists with STL', 'Liste de inițializare cu STL')}</p>
          <p className="text-sm mt-1">{t(
            'STL containers can be initialized using brace-enclosed initializer lists (C++11). This works with vectors, maps, and any container supporting initializer_list constructors.',
            'Containerele STL pot fi inițializate folosind liste de inițializare între acolade (C++11). Funcționează cu vectori, map-uri și orice container care suportă constructori initializer_list.'
          )}</p>
        </Box>

        <Code>{`#include <vector>
#include <map>
using namespace std;

struct Student {
    const char* Name;
    int Grade;
};

vector<int> v = { 1, 2, 3 };
vector<string> s = { "POO", "C++" };
vector<Student> st = { { "Popescu", 10 }, { "Ionescu", 9 } };`}</Code>

        <p className="font-bold mt-3">{t('std::initializer_list as function parameter:', 'std::initializer_list ca parametru de funcție:')}</p>

        <Code>{`#include <initializer_list>
using namespace std;

int Sum(std::initializer_list<int> a) {
    int result = 0;
    std::initializer_list<int>::iterator it;
    for (it = a.begin(); it != a.end(); it++)
        result += (*it);
    return result;
}

printf("Sum = %d\\n", Sum({ 1, 2, 3, 4, 5 }));  // Sum = 15`}</Code>

        <p className="font-bold mt-3">{t('Using initializer_list in constructors:', 'Folosirea initializer_list în constructori:')}</p>

        <Code>{`#include <initializer_list>
using namespace std;

class Data {
    int v[10];
public:
    Data(std::initializer_list<int> a) {
        int index = 0;
        std::initializer_list<int>::iterator it;
        for (it = a.begin(); (it != a.end()) && (index < 10); it++, index++)
            v[index] = (*it);
    }
};

Data d1({ 1, 2, 3, 4, 5 });  // explicit call
Data d2 = { 1, 2, 3, 4, 5 }; // implicit conversion`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Macros and initialization lists:', 'Macro-uri și liste de inițializare:')}</p>
          <p className="text-sm">{t(
            'The preprocessor does not interpret braces { }. A macro like DO_SOMETHING(vector<int> x{1, 2, 3};) fails because the compiler sees 3 macro parameters split by commas. Solution: use variadic macros with __VA_ARGS__.',
            'Preprocesorul nu interpretează acoladele { }. Un macro precum DO_SOMETHING(vector<int> x{1, 2, 3};) eșuează deoarece compilatorul vede 3 parametri macro separați prin virgulă. Soluție: folosiți macro-uri variadice cu __VA_ARGS__.'
          )}</p>
        </Box>

        <Code>{`// Problem: compiler sees 3 arguments
#define DO_SOMETHING(x) x
DO_SOMETHING( vector<int> x{1, 2, 3}; );  // ERROR!

// Solution: variadic macro
#define DO_SOMETHING(...) __VA_ARGS__
DO_SOMETHING( vector<int> x{1, 2, 3}; );  // OK!`}</Code>

        <Toggle
          question={t('What is the difference between Data d1({1,2,3}) and Data d2 = {1,2,3}?', 'Care este diferența între Data d1({1,2,3}) și Data d2 = {1,2,3}?')}
          answer={t('Both create a Data object using the initializer_list constructor. d1 uses direct initialization (explicit constructor call), while d2 uses copy-initialization syntax. Both are valid when the constructor accepting std::initializer_list<int> exists.', 'Ambele creează un obiect Data folosind constructorul initializer_list. d1 folosește inițializare directă (apel explicit al constructorului), în timp ce d2 folosește sintaxa de inițializare prin copiere. Ambele sunt valide când există constructorul care acceptă std::initializer_list<int>.')}
        />
      </Section>

      {/* ── 6. Iterators ── */}
      <Section title={t('6. Iterators', '6. Iteratori')} id="oop-c7-iterators" checked={!!checked['oop-c7-iterators']} onCheck={() => toggleCheck('oop-c7-iterators')}>
        <Box type="definition">
          <p className="font-bold">{t('What are Iterators?', 'Ce sunt Iteratorii?')}</p>
          <p className="text-sm mt-1">{t(
            'An iterator is a special object (similar to a pointer) used to traverse container elements. It works by overloading operators: operator++ and operator-- (move forward/backward), and pointer operators (operator->, operator*) to access elements.',
            'Un iterator este un obiect special (similar cu un pointer) folosit pentru a parcurge elementele containerelor. Funcționează prin supraîncărcarea operatorilor: operator++ și operator-- (deplasare înainte/înapoi), și operatori de pointer (operator->, operator*) pentru accesarea elementelor.'
          )}</p>
        </Box>

        <Code>{`vector<int> v;
v.push_back(1); v.push_back(2); v.push_back(3);
v.push_back(4); v.push_back(5);

// Forward iteration
vector<int>::iterator it;
it = v.begin();
while (it < v.end()) {
    printf("%d ", (int)(*it));
    it++;
}
// Prints: 1 2 3 4 5`}</Code>

        <p className="font-bold mt-3">{t('Accessing elements via iterator:', 'Accesarea elementelor prin iterator:')}</p>

        <Code>{`class Number {
public:
    int Value;
    Number(int val) : Value(val) {}
};

vector<Number> v;
v.push_back(Number(1)); v.push_back(Number(2));
v.push_back(Number(3)); v.push_back(Number(4));
v.push_back(Number(5));

vector<Number>::iterator i = v.begin();
printf("%d\\n", i->Value);          // 1
printf("%d\\n", (i + 2)->Value);    // 3
printf("%d %d", v.front().Value, v.back().Value); // 1 5`}</Code>

        <p className="font-bold mt-3">{t('Reverse Iterator:', 'Iterator invers:')}</p>

        <Code>{`vector<Number>::iterator it;
for (it = v.begin(); it != v.end(); it++)
    printf("%d ", it->Value);         // 1 2 3 4 5

vector<Number>::reverse_iterator rit;
for (rit = v.rbegin(); rit != v.rend(); rit++)
    printf("%d ", rit->Value);        // 5 4 3 2 1`}</Code>

        <p className="font-bold mt-3">{t('Inserting and erasing with iterators:', 'Inserare și ștergere cu iteratori:')}</p>

        <Code>{`// Insert at position
vector<Number>::iterator i = v.begin();
v.insert(i + 2, Number(10));
// {1,2,3,4,5} -> {1,2,10,3,4,5}

// Erase at position
v.erase(v.begin() + 2);
// {1,2,10,3,4,5} -> {1,2,3,4,5}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Iterator invalidation!', 'Invalidarea iteratorului!')}</p>
          <p className="text-sm">{t(
            'After erasing an element, the iterator may become invalid. NEVER reuse an iterator after the container has been modified through erase. Always recompute the iterator using begin().',
            'După ștergerea unui element, iteratorul poate deveni invalid. NU reutilizați NICIODATĂ un iterator după ce containerul a fost modificat prin erase. Recalculați întotdeauna iteratorul folosind begin().'
          )}</p>
        </Box>

        <Code>{`// WRONG — reusing iterator after erase causes exception!
vector<Number>::iterator i = v.begin();
v.erase(i);       // i is now INVALID
v.erase(i + 1);   // CRASH! Exception!

// CORRECT — always use begin() after modification
v.erase(v.begin());       // removes first element
v.erase(v.begin() + 1);  // removes second element (of new state)`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Iterator capabilities by container:', 'Capabilități iterator per container:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li><strong>vector, array, deque</strong> — {t('Full: ++, --, +, -, <, >, ==, !=, ->, *', 'Complet: ++, --, +, -, <, >, ==, !=, ->, *')}</li>
            <li><strong>list</strong> — {t('Bidirectional: ++, --, ==, != only (no +, -, <, >)', 'Bidirecțional: doar ++, --, ==, != (fără +, -, <, >)')}</li>
            <li><strong>forward_list</strong> — {t('Forward only: ++ and ==, != only (no --, +, -, <, >)', 'Doar înainte: doar ++ și ==, != (fără --, +, -, <, >)')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Container method summary:', 'Sumar metode container:')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Feature', 'Funcționalitate')}</th>
                <th className="text-left p-2">vector</th>
                <th className="text-left p-2">deque</th>
                <th className="text-left p-2">array</th>
                <th className="text-left p-2">list</th>
                <th className="text-left p-2">forward_list</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2 font-bold">{t('Access', 'Acces')}</td>
                <td className="p-2">[], at, front, back, data</td>
                <td className="p-2">[], at, front, back</td>
                <td className="p-2">[], at, front, back, data</td>
                <td className="p-2">front, back</td>
                <td className="p-2">front</td>
              </tr>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2 font-bold">{t('Reverse iter', 'Iter invers')}</td>
                <td className="p-2">{t('Yes', 'Da')}</td>
                <td className="p-2">{t('Yes', 'Da')}</td>
                <td className="p-2">{t('Yes', 'Da')}</td>
                <td className="p-2">{t('Yes', 'Da')}</td>
                <td className="p-2">{t('No', 'Nu')}</td>
              </tr>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2 font-bold">{t('Add', 'Adăugare')}</td>
                <td className="p-2">push_back, insert</td>
                <td className="p-2">push_back, push_front, insert</td>
                <td className="p-2">-</td>
                <td className="p-2">push_back, push_front, insert</td>
                <td className="p-2">push_front, insert_after</td>
              </tr>
              <tr>
                <td className="p-2 font-bold">{t('Delete', 'Ștergere')}</td>
                <td className="p-2">pop_back, erase, clear</td>
                <td className="p-2">pop_back, pop_front, erase, clear</td>
                <td className="p-2">-</td>
                <td className="p-2">pop_back, pop_front, erase, clear</td>
                <td className="p-2">pop_front, erase_after, clear</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Toggle
          question={t('Why does list iterator not support operator< while vector iterator does?', 'De ce iteratorul de list nu suportă operator< în timp ce iteratorul de vector suportă?')}
          answer={t('Vector stores elements in contiguous memory, so iterator addresses can be meaningfully compared with < and >. List elements are scattered across memory in non-consecutive addresses, making address comparison meaningless. List iterators only support == and != to check if two iterators point to the same node.', 'Vectorul stochează elementele în memorie contiguă, deci adresele iteratorilor pot fi comparate semnificativ cu < și >. Elementele list sunt împrăștiate în memorie la adrese neconsecutive, făcând comparația de adrese lipsită de sens. Iteratorii list suportă doar == și != pentru a verifica dacă doi iteratori indică același nod.')}
        />
      </Section>
    </>
  );
}
