import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course01() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 1 — Topics:', 'Cursul 1 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Glossary: API, Library, GUI, Compiler, Linker', 'Glosar: API, Bibliotecă, GUI, Compilator, Linker')}</li>
          <li>{t('OS Architecture: process memory layout', 'Arhitectura SO: layout-ul memoriei procesului')}</li>
          <li>{t('C++ history and revisions (C++98 → C++23)', 'Istoria C++ și revizii (C++98 → C++23)')}</li>
          <li>{t('From C to C++: why classes are needed', 'De la C la C++: de ce sunt necesare clasele')}</li>
          <li>{t('Classes — Data Members', 'Clase — Membri date')}</li>
          <li>{t('Classes — Methods', 'Clase — Metode')}</li>
        </ol>
      </Box>

      {/* ── 1. Glossary ── */}
      <Section title={t('1. Glossary', '1. Glosar')} id="oop-course_1-glossary" checked={!!checked['oop-course_1-glossary']} onCheck={() => toggleCheck('oop-course_1-glossary')}>
        <Box type="definition">
          <p className="font-bold">{t('Key Terms', 'Termeni cheie')}</p>
          <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
            <li><strong>API</strong> — Application Program Interface</li>
            <li><strong>{t('Library', 'Bibliotecă')}</strong> — {t('A set of functions that can be used by multiple programs (e.g., math functions: cos, sin, tan)', 'Un set de funcții care pot fi utilizate de mai multe programe (ex: funcții matematice: cos, sin, tan)')}</li>
            <li><strong>GUI</strong> — Graphic User Interface</li>
          </ul>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Compiler', 'Compilator')}</p>
          <p className="text-sm">{t('A program that translates source code (readable code) into machine code (binary code understood by a specific architecture — x86, x64, ARM, etc).', 'Un program care traduce codul sursă (cod lizibil) în cod mașină (cod binar înțeles de o arhitectură specifică — x86, x64, ARM, etc).')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Types of compilers:', 'Tipuri de compilatoare:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Native</strong> — {t('Result is native code for the specific architecture (faster, low level)', 'Rezultatul este cod nativ pentru arhitectura specifică (mai rapid, nivel scăzut)')}</li>
          <li><strong>{t('Interpreted', 'Interpretat')}</strong> — {t('Result is byte-code that requires an interpreter to execute. Portability depends on the interpreter (portable, high level)', 'Rezultatul este byte-code care necesită un interpretor. Portabilitatea depinde de interpretor (portabil, nivel înalt)')}</li>
          <li><strong>JIT (Just In Time)</strong> — {t('Result is byte-code, but during execution parts are converted to native code for performance', 'Rezultatul este byte-code, dar în timpul execuției părți sunt convertite în cod nativ pentru performanță')}</li>
        </ul>

        <Box type="definition">
          <p className="font-bold">Linker</p>
          <p className="text-sm">{t('A program that merges object files from the compiler into a single executable. It also merges libraries.', 'Un program care unește fișierele obiect obținute de la compilator într-un singur executabil. De asemenea, unește bibliotecile.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Library linking types:', 'Tipuri de legare a bibliotecilor:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>{t('Dynamic', 'Dinamică')}</strong> — {t('OS links libraries at execution time. Smaller code, but missing library = error.', 'SO leagă bibliotecile la execuție. Cod mai mic, dar bibliotecă lipsă = eroare.')}</li>
          <li><strong>{t('Static', 'Statică')}</strong> — {t('Executable contains library code. Portable but larger.', 'Executabilul conține codul bibliotecii. Portabil dar mai mare.')}</li>
          <li><strong>{t('Delayed', 'Întârziată')}</strong> — {t('Like dynamic, but libraries are loaded only when a function is first needed.', 'Ca dinamica, dar bibliotecile sunt încărcate doar când o funcție este necesară prima dată.')}</li>
        </ul>

        <Box type="formula">
          <p className="font-bold">{t('Compilation pipeline:', 'Fluxul de compilare:')}</p>
          <p className="text-sm font-mono">{t('Source files → Compiler → Object files → Linker (+Libraries) → Executable', 'Fișiere sursă → Compilator → Fișiere obiect → Linker (+Biblioteci) → Executabil')}</p>
        </Box>

        <Toggle
          question={t('What is the difference between static and dynamic linking?', 'Care este diferența între legarea statică și dinamică?')}
          answer={t('Static linking includes library code in the executable (larger but portable). Dynamic linking resolves library references at runtime (smaller executable but requires libraries to be present on the system).', 'Legarea statică include codul bibliotecii în executabil (mai mare dar portabil). Legarea dinamică rezolvă referințele la execuție (executabil mai mic dar necesită bibliotecile prezente pe sistem).')}
        />
      </Section>

      {/* ── 2. OS Architecture ── */}
      <Section title={t('2. OS Architecture', '2. Arhitectura SO')} id="oop-course_1-os-arch" checked={!!checked['oop-course_1-os-arch']} onCheck={() => toggleCheck('oop-course_1-os-arch')}>
        <p>{t('When the OS executes a native application compiled from C++, the process memory is organized into several regions:', 'Când SO execută o aplicație nativă compilată din C++, memoria procesului este organizată în mai multe regiuni:')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Process Memory Layout', 'Layout-ul memoriei procesului')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1 mt-1">
            <li><strong>{t('Executable code', 'Codul executabil')}</strong> — {t('Content of the .exe is copied into process memory', 'Conținutul .exe este copiat în memoria procesului')}</li>
            <li><strong>{t('Libraries (DLLs)', 'Biblioteci (DLL-uri)')}</strong> — {t('Required library code is loaded into memory, references are resolved', 'Codul bibliotecilor necesare este încărcat, referințele sunt rezolvate')}</li>
            <li><strong>Stack</strong> — {t('Local variables and function parameters. Not initialized. Each thread has its own stack.', 'Variabile locale și parametrii funcțiilor. Nu este inițializat. Fiecare thread are propriul stack.')}</li>
            <li><strong>Heap</strong> — {t('Large memory for dynamic allocation (new, malloc). Not initialized. Shared between threads.', 'Memorie mare pentru alocare dinamică (new, malloc). Nu este inițializat. Partajat între thread-uri.')}</li>
            <li><strong>{t('Global Variables', 'Variabile globale')}</strong> — {t('Initialized to 0 by default. Stores all global variables.', 'Inițializate cu 0 implicit. Stochează toate variabilele globale.')}</li>
            <li><strong>{t('Constants', 'Constante')}</strong> — {t('Read-only memory. Writing to it causes a crash. Stores string literals, etc.', 'Memorie doar-citire. Scrierea cauzează crash. Stochează literali string, etc.')}</li>
          </ol>
        </Box>

        <Box type="warning">
          <p className="font-bold">{t('Key insight:', 'Observație cheie:')}</p>
          <p className="text-sm">{t('Local variables (on the stack) are NOT initialized — they contain undefined/garbage values. Global variables ARE initialized to 0 by default.', 'Variabilele locale (pe stack) NU sunt inițializate — conțin valori nedefinite/gunoi. Variabilele globale SUNT inițializate cu 0 implicit.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Windows compilation example (cl.exe):', 'Exemplu de compilare Windows (cl.exe):')}</p>
        <p className="text-sm">{t('App.cpp → App.obj → App.exe. Libraries linked: msvcrt.lib (CRT, contains printf), kernel32.lib (Windows system functions), ntdll.lib (kernel/low-level API).', 'App.cpp → App.obj → App.exe. Biblioteci legate: msvcrt.lib (CRT, conține printf), kernel32.lib (funcții sistem Windows), ntdll.lib (kernel/API nivel scăzut).')}</p>

        <p className="font-bold mt-4">{t('Memory Alignment', 'Alinierea memoriei')}</p>
        <p className="text-sm">{t('Every type is aligned at the first offset that is a multiple of its size. The size of a struct is a multiple of its largest basic type member.', 'Fiecare tip este aliniat la primul offset care este multiplu al dimensiunii sale. Dimensiunea unei structuri este multiplu al celui mai mare tip de bază.')}</p>

        <Box type="formula">
          <p className="font-bold">{t('Alignment formula:', 'Formula de aliniere:')}</p>
          <p className="text-sm font-mono">ALIGN(position, type) = (((position - 1) / sizeof(type)) + 1) * sizeof(type)</p>
        </Box>

        <Code>{`// Example: sizeof(Test) = 8 (not 6!)
struct Test {
    char x;    // offset 0 (1 byte)
    char y;    // offset 1 (1 byte)
    // 2 bytes padding
    int  z;    // offset 4 (4 bytes, aligned to multiple of 4)
};
// Layout: x y ? ? z z z z

// With #pragma pack(1): sizeof(Test) = 6, no padding
#pragma pack(1)
struct Test {
    char x; char y; int z;
};
// Layout: x y z z z z`}</Code>

        <Toggle
          question={t('Why does struct { char x; double y; int z; } have sizeof = 24?', 'De ce are struct { char x; double y; int z; } sizeof = 24?')}
          answer={t('x is at offset 0 (1 byte), then 7 bytes padding so y aligns to offset 8 (double needs 8-byte alignment). y occupies 8-15. z aligns to offset 16 (int needs 4-byte alignment), occupies 16-19. Total = 20 bytes, but struct size must be a multiple of largest member (8), so padded to 24.', 'x este la offset 0 (1 byte), apoi 7 bytes padding ca y să fie aliniat la offset 8 (double necesită aliniere la 8). y ocupă 8-15. z se aliniază la offset 16 (int necesită aliniere la 4), ocupă 16-19. Total = 20 bytes, dar dimensiunea structurii trebuie să fie multiplu al celui mai mare membru (8), deci se completează la 24.')}
        />
      </Section>

      {/* ── 3. C++ History and Revisions ── */}
      <Section title={t('3. C++ History and Revisions', '3. Istoria C++ și revizii')} id="oop-course_1-cpp-history" checked={!!checked['oop-course_1-cpp-history']} onCheck={() => toggleCheck('oop-course_1-cpp-history')}>
        <Box type="definition">
          <p className="font-bold">{t('C++ Timeline', 'Cronologia C++')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li><strong>1979</strong> — {t('Bjarne Stroustrup starts "C with Classes"', 'Bjarne Stroustrup începe "C with Classes"')}</li>
            <li><strong>1983</strong> — {t('Name changed to C++', 'Numele schimbat în C++')}</li>
            <li><strong>1990</strong> — {t('Borland Turbo C++ released', 'Borland Turbo C++ lansat')}</li>
            <li><strong>1998</strong> — {t('First ISO standard: C++98', 'Primul standard ISO: C++98')}</li>
            <li><strong>2003</strong> — C++03</li>
            <li><strong>2011</strong> — C++11</li>
            <li><strong>2014</strong> — C++14</li>
            <li><strong>2017</strong> — C++17</li>
            <li><strong>2020</strong> — C++20</li>
            <li><strong>2023</strong> — C++23</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Major C++ Compilers', 'Compilatoare C++ majore')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Compiler', 'Compilator')}</th>
                <th className="text-left p-2">{t('Producer', 'Producător')}</th>
                <th className="text-left p-2">{t('Compatibility', 'Compatibilitate')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2">Visual C++</td><td className="p-2">Microsoft</td><td className="p-2">C++20 (C++23 partial)</td>
              </tr>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2">GCC/G++</td><td className="p-2">GNU</td><td className="p-2">C++20 (C++23 partial)</td>
              </tr>
              <tr>
                <td className="p-2">Clang (LLVM)</td><td className="p-2">LLVM Project</td><td className="p-2">C++20 (C++23 partial)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Toggle
          question={t('Who created C++ and what was its original name?', 'Cine a creat C++ și care a fost numele său original?')}
          answer={t('Bjarne Stroustrup started working on it in 1979 under the name "C with Classes". It was renamed to C++ in 1983.', 'Bjarne Stroustrup a început să lucreze la el în 1979 sub numele "C with Classes". A fost redenumit C++ în 1983.')}
        />
      </Section>

      {/* ── 4. From C to C++ ── */}
      <Section title={t('4. From C to C++', '4. De la C la C++')} id="oop-course_1-c-to-cpp" checked={!!checked['oop-course_1-c-to-cpp']} onCheck={() => toggleCheck('oop-course_1-c-to-cpp')}>
        <p>{t('Consider a C struct with no protection or initialization:', 'Considerăm o structură C fără protecție sau inițializare:')}</p>

        <Code>{`// C approach — problems:
struct Person {
    int Age;
    int Height;
};
void main() {
    Person p;
    printf("Age = %d", p.Age); // undefined value!
    p.Age = -5;        // no validation!
    p.Height = 100000; // nonsensical value!
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Problems with C structs:', 'Probleme cu structurile C:')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>{t('No initialization — local struct variables have undefined values', 'Fără inițializare — variabilele structură locale au valori nedefinite')}</li>
            <li>{t('No data protection — anyone can set invalid values', 'Fără protecția datelor — oricine poate seta valori invalide')}</li>
            <li>{t('Pointer validation needed in every function', 'Validarea pointerului necesară în fiecare funcție')}</li>
            <li>{t('Cannot prevent direct field access even with helper functions', 'Nu se poate preveni accesul direct la câmpuri chiar cu funcții ajutătoare')}</li>
          </ol>
        </Box>

        <p className="mt-3">{t('The C++ class solves all of these:', 'Clasa C++ rezolvă toate acestea:')}</p>

        <Code>{`// C++ approach — class with encapsulation
class Person {
private:
    int Age;
public:
    void SetAge(int value);
    Person(); // constructor
};

void Person::SetAge(int value) {
    if ((value > 0) && (value < 200))
        this->Age = value;
}

Person::Person() {
    this->Age = 10; // automatic initialization
}

void main() {
    Person p;       // constructor called automatically!
    p.SetAge(10);   // validated
    // p.Age = -1;  // COMPILER ERROR — Age is private
}`}</Code>

        <Box type="theorem">
          <p>{t('C++ classes provide: (1) access restriction via private/public, (2) automatic initialization via constructors, (3) the "this" pointer eliminates the need to pass a pointer to every function, (4) pointer validation is done at compile time.', 'Clasele C++ oferă: (1) restricție acces prin private/public, (2) inițializare automată prin constructori, (3) pointerul "this" elimină necesitatea de a pasa un pointer fiecărei funcții, (4) validarea pointerului se face la compilare.')}</p>
        </Box>

        <Toggle
          question={t('In C++, what is the difference between class and struct regarding access modifiers?', 'În C++, care este diferența între class și struct privind modificatorii de acces?')}
          answer={t('The only difference is the default access modifier: class members are private by default, struct members are public by default. Both support all access modifiers (public, private, protected).', 'Singura diferență este modificatorul de acces implicit: membrii class sunt private implicit, membrii struct sunt public implicit. Ambele suportă toți modificatorii de acces (public, private, protected).')}
        />
      </Section>

      {/* ── 5. Classes — Data Members ── */}
      <Section title={t('5. Classes — Data Members', '5. Clase — Membri date')} id="oop-course_1-data-members" checked={!!checked['oop-course_1-data-members']} onCheck={() => toggleCheck('oop-course_1-data-members')}>
        <Box type="definition">
          <p className="font-bold">{t('Data Members', 'Membri date')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('Variables defined within the class', 'Variabile definite în interiorul clasei')}</li>
            <li>{t('Each can have its own access modifier (public/private/protected)', 'Fiecare poate avea propriul modificator de acces (public/private/protected)')}</li>
            <li>{t('Can be static — belongs to the class, not to instances', 'Pot fi statice — aparțin clasei, nu instanțelor')}</li>
            <li>{t('A class may have no data members', 'O clasă poate să nu aibă membri date')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Access Modifiers:', 'Modificatori de acces:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>public</strong> — {t('accessible from everywhere', 'accesibil de oriunde')}</li>
          <li><strong>private</strong> — {t('only accessible from within the class (default for class)', 'accesibil doar din interiorul clasei (implicit pentru class)')}</li>
          <li><strong>protected</strong> — {t('accessible from within the class and derived classes', 'accesibil din interiorul clasei și clasele derivate')}</li>
        </ul>

        <p className="font-bold mt-4">{t('Static Data Members', 'Membri date statici')}</p>

        <Code>{`class Person {
private:
    int Age, Height;
    static int X;    // private static
public:
    const char *Name;
    static int Y;    // public static
};

// Static members MUST be defined outside the class:
int Person::X;
int Person::Y = 10;

void main() {
    Person p;
    p.Y = 5;          // access via instance
    Person::Y++;       // access via class name
    // p.X = 6;        // ERROR: X is private
}`}</Code>

        <Box type="theorem">
          <p>{t('Static data members belong to the class, not to instances. They do NOT count towards sizeof. A class with only static members (or no members) has sizeof = 1.', 'Membrii date statici aparțin clasei, nu instanțelor. NU contribuie la sizeof. O clasă cu doar membri statici (sau fără membri) are sizeof = 1.')}</p>
        </Box>

        <Code>{`class C1 { int X, Y; };                // sizeof = 8
class C2 { int X, Y; static int Z; }; // sizeof = 8 (Z not counted)
class C3 { static int T; };            // sizeof = 1
class C4 { };                          // sizeof = 1`}</Code>

        <Toggle
          question={t('Can you access d1.Z, d2.Z, and Date::Z if Z is a public static member? Are they the same variable?', 'Poți accesa d1.Z, d2.Z și Date::Z dacă Z este un membru static public? Sunt aceeași variabilă?')}
          answer={t('Yes, all three refer to the exact same memory location. Static members exist once per class, not once per instance. Changing any of them changes the value for all.', 'Da, toate trei se referă la exact aceeași locație de memorie. Membrii statici există o dată per clasă, nu o dată per instanță. Modificarea oricăruia schimbă valoarea pentru toți.')}
        />
      </Section>

      {/* ── 6. Classes — Methods ── */}
      <Section title={t('6. Classes — Methods', '6. Clase — Metode')} id="oop-course_1-methods" checked={!!checked['oop-course_1-methods']} onCheck={() => toggleCheck('oop-course_1-methods')}>
        <Box type="definition">
          <p className="font-bold">{t('Methods', 'Metode')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('Functions defined within the class', 'Funcții definite în interiorul clasei')}</li>
            <li>{t('Can have access modifiers (public/private/protected)', 'Pot avea modificatori de acces (public/private/protected)')}</li>
            <li>{t('A method can access ANY member or method in the same class, regardless of access modifier', 'O metodă poate accesa ORICE membru sau metodă din aceeași clasă, indiferent de modificatorul de acces')}</li>
            <li>{t('Can be static', 'Pot fi statice')}</li>
          </ul>
        </Box>

        <Code>{`class Person {
private:
    int Age;
    bool CheckValid(int val); // private method
public:
    void SetAge(int val);
};

bool Person::CheckValid(int val) {
    return ((val > 0) && (val < 200));
}

void Person::SetAge(int val) {
    if (CheckValid(val))       // can call private method!
        this->Age = val;       // can access private member!
}`}</Code>

        <p className="font-bold mt-4">{t('Static Methods', 'Metode statice')}</p>

        <Code>{`class Date {
private:
    int X;
    static int Y;
public:
    static void Increment();
};
int Date::Y = 0;

void Date::Increment() {
    Y++;    // OK: static method can access static member
    // X++; // ERROR: static method cannot access non-static member
    //       // (no 'this' pointer available)
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Important rule:', 'Regulă importantă:')}</p>
          <p className="text-sm">{t('A method can access private members of OTHER instances of the same class! This works because access control is per-class, not per-instance.', 'O metodă poate accesa membrii privați ai ALTOR instanțe ale aceleiași clase! Funcționează deoarece controlul accesului este per-clasă, nu per-instanță.')}</p>
        </Box>

        <Code>{`class Person {
private:
    int Age;
public:
    void SetAge(Person *p, int value) {
        p->Age = value; // OK! Can access private Age of another Person
    }
};

int main() {
    Person p1, p2;
    p1.SetAge(&p2, 10); // p1's method sets p2's private Age — valid!
    return 0;
}`}</Code>

        <Toggle
          question={t('Can a static method access the "this" pointer?', 'Poate o metodă statică să acceseze pointerul "this"?')}
          answer={t('No. A static method has no "this" pointer because it belongs to the class, not to an instance. It can only access static members and other static methods.', 'Nu. O metodă statică nu are pointer "this" deoarece aparține clasei, nu unei instanțe. Poate accesa doar membri statici și alte metode statice.')}
        />
      </Section>
    </>
  );
}
