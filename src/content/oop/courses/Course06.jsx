import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course06() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 6 — Topics:', 'Cursul 6 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Casts: reinterpret_cast, static_cast, dynamic_cast, const_cast', 'Cast-uri: reinterpret_cast, static_cast, dynamic_cast, const_cast')}</li>
          <li>{t('Macros: definition, function-like macros, predefined macros, pitfalls', 'Macro-uri: definiție, macro-uri tip funcție, macro-uri predefinite, capcane')}</li>
          <li>{t('Literals: user-defined literal operators', 'Literali: operatori literali definiți de utilizator')}</li>
          <li>{t('Function Templates: definition, type deduction, multiple types', 'Șabloane de funcții: definiție, deducția tipului, tipuri multiple')}</li>
          <li>{t('Class Templates: definition, static members, default types, non-type parameters', 'Șabloane de clase: definiție, membri statici, tipuri implicite, parametri non-tip')}</li>
          <li>{t('Template Specialization & static_assert', 'Specializarea șabloanelor & static_assert')}</li>
        </ol>
      </Box>

      {/* ── 1. Casts ── */}
      <Section title={t('1. Casts', '1. Cast-uri')} id="oop-course_6-casts" checked={!!checked['oop-course_6-casts']} onCheck={() => toggleCheck('oop-course_6-casts')}>
        <p>{t('Assuming class A is derived from class B, an object of type A can be converted to an object of type B. The conversion rules are:', 'Presupunând că clasa A este derivată din clasa B, un obiect de tip A poate fi convertit într-un obiect de tip B. Regulile de conversie sunt:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('It is always possible to convert a class to any of the classes it inherits (upcast)', 'Este întotdeauna posibil să convertești o clasă la oricare din clasele pe care le moștenește (upcast)')}</li>
          <li>{t('It is NOT possible to convert from a base class to a derived class without an explicit cast (downcast)', 'NU este posibil să convertești de la o clasă de bază la o clasă derivată fără un cast explicit (downcast)')}</li>
          <li>{t('If the cast operator is overwritten, none of the above rules apply', 'Dacă operatorul de cast este suprascris, niciuna din regulile de mai sus nu se aplică')}</li>
        </ul>

        <Box type="definition">
          <p className="font-bold">{t('Upcast vs Downcast', 'Upcast vs Downcast')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li><strong>Upcast</strong> — {t('From child to parent. Always possible and safe.', 'De la copil la părinte. Întotdeauna posibil și sigur.')}</li>
            <li><strong>Downcast</strong> — {t('From parent to child. Requires explicit cast or dynamic_cast. Unsafe!', 'De la părinte la copil. Necesită cast explicit sau dynamic_cast. Nesigur!')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Pointer adjustment in multiple inheritance:', 'Ajustarea pointerului în moștenire multiplă:')}</p>
        <Code>{`class A { public: int a1, a2, a3; };
class B { public: int b1, b2; };
class C : public A, public B { public: int c1, c2; };

void main(void) {
    C* c = new C();
    B* b = &c;  // compiler adds +12 (sizeof(A)) to the pointer
    // Memory layout: [a1 a2 a3 b1 b2 c1 c2]
    //                 ^c               ^b points here (+12)
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Private inheritance blocks implicit casts:', 'Moștenirea privată blochează cast-urile implicite:')}</p>
          <p className="text-sm">{t('If class A is inherited privately, implicit conversion from C* to A* is not allowed. The compiler reports: "conversion exists, but is inaccessible".', 'Dacă clasa A este moștenită privat, conversia implicită de la C* la A* nu este permisă. Compilatorul raportează: „conversia există, dar este inaccesibilă".')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Object Slicing', 'Object Slicing')}</p>
        <p className="text-sm">{t('Upcasting produces an interesting secondary effect called object slicing. When passing a derived object by value to a function expecting the base type, only the base-class fields are copied:', 'Upcast-ul produce un efect secundar interesant numit object slicing. La transmiterea unui obiect derivat prin valoare unei funcții care așteaptă tipul de bază, doar câmpurile clasei de bază sunt copiate:')}</p>
        <Code>{`struct A {
    int a1, a2, a3;
    A(int value) : a1(value), a2(value), a3(value) {}
};
struct B : public A {
    int b1, b2;
    B(int value) : A(value*value), b1(value), b2(value) {}
};

void DoSomething(A object) {  // parameter by VALUE, not reference!
    printf("a1=%d, a2=%d, a3=%d\\n", object.a1, object.a2, object.a3);
}

void main(void) {
    B b_object(5);
    DoSomething(b_object); // prints: a1=25, a2=25, a3=25
    // b1 and b2 are "sliced off" — only A's fields are copied
}`}</Code>

        <p className="font-bold mt-4">{t('C++ Cast Keywords', 'Cuvinte cheie pentru cast în C++')}</p>

        <Box type="definition">
          <p className="font-bold">reinterpret_cast</p>
          <p className="text-sm">{t('The simplest cast — changes the type of a pointer while maintaining the same address. Equivalent to ((type*)((void*) ptr)). Fastest cast but allows casts between incompatible types. Cannot be used with constants or basic-type variables (int, float, double). Can be used with references and function pointers.', 'Cel mai simplu cast — schimbă tipul unui pointer păstrând aceeași adresă. Echivalent cu ((type*)((void*) ptr)). Cel mai rapid cast dar permite cast-uri între tipuri incompatibile. Nu poate fi folosit cu constante sau variabile de tip basic (int, float, double). Poate fi folosit cu referințe și pointeri la funcții.')}</p>
        </Box>

        <Code>{`// reinterpret_cast bypasses access modifiers
class C : private A, private B { public: int c1, c2; };
C c;
A* a = reinterpret_cast<A*>(&c); // compiles! ignores private inheritance

// Can copy pointer value to a variable
int x = reinterpret_cast<int>("test"); // x = address of "test"

// Can be used with references
int number = 10;
reinterpret_cast<int&>(number) = 20;  // number is now 20

// Can convert function pointer to data pointer
int addition(int x, int y) { return x + y; }
char* a = reinterpret_cast<char*>(addition); // points to machine code`}</Code>

        <Box type="definition">
          <p className="font-bold">static_cast</p>
          <p className="text-sm">{t('Implies a conversion where values can be truncated. In inheritance, the address where a pointer points to can be changed. Works with constants (conversion done at compile time). Does NOT check RTTI. Useful for resolving function overload ambiguity.', 'Implică o conversie unde valorile pot fi trunchiate. În moștenire, adresa la care pointează un pointer poate fi schimbată. Funcționează cu constante (conversia se face la compilare). NU verifică RTTI. Util pentru rezolvarea ambiguității la supraîncărcarea funcțiilor.')}</p>
        </Box>

        <Code>{`// static_cast with constants (done at compile time)
int x = static_cast<int>(1000);       // x = 1000
char x = static_cast<char>(1000);     // x = 232 (1000 % 256)
char x = static_cast<char>(3.75);     // x = 3

// Resolving function overload ambiguity
int Add(int x, char y) { return x + y; }
int Add(char x, int y) { return x + y; }
// int suma = Add(100, 200);  // ERROR: ambiguous!
int suma = static_cast<int(*)(int, char)>(Add)(100, 200); // OK!

// static_cast requires inheritance relationship
class A {}; class B {};
B b;
// A* a = static_cast<A*>(&b);  // ERROR: types are unrelated`}</Code>

        <Box type="definition">
          <p className="font-bold">dynamic_cast</p>
          <p className="text-sm">{t('Safely converts a pointer/reference using RTTI from the vfptr. Evaluation done at runtime (slower). Returns nullptr if cast is invalid. Requires at least one virtual method (polymorphic type). Works when there is a clear translation between classes.', 'Convertește în siguranță un pointer/referință folosind RTTI din vfptr. Evaluarea se face la runtime (mai lent). Returnează nullptr dacă cast-ul este invalid. Necesită cel puțin o metodă virtuală (tip polimorfic). Funcționează când există o traducere clară între clase.')}</p>
        </Box>

        <Code>{`class A { public: int a1, a2, a3; };
class B { public: int b1, b2; virtual void f() {}; };
class C : public A, public B { public: int c1, c2; };

B b;
C* c = dynamic_cast<C*>(&b);  // compiles, but c = nullptr (unsafe cast)

C c_obj;
B* b2 = (B*)&c_obj;
C* c2 = dynamic_cast<C*>(b2); // c2 points to c_obj (valid cast)

// Cross-cast: A and B unrelated, but both in C
A* a = (A*)&c_obj;
B* b3 = dynamic_cast<B*>(a);  // works! a actually points to a C object`}</Code>

        <Box type="definition">
          <p className="font-bold">const_cast</p>
          <p className="text-sm">{t('Used to remove the "const" characteristic of an object. Can only be used on data of the same type (does not convert between types). Can produce undefined behavior!', 'Folosit pentru a elimina caracteristica „const" a unui obiect. Poate fi folosit doar pe date de același tip (nu convertește între tipuri). Poate produce comportament nedefinit!')}</p>
        </Box>

        <Code>{`// Safe usage: const pointer from a non-const variable
int x = 100;
const int* ptr = &x;
int* non_const_ptr = const_cast<int*>(ptr);
*non_const_ptr = 200;  // x is now 200

// DANGEROUS: const pointer to read-only memory
const char* txt = "C++ exam";
char* p = const_cast<char*>(txt);
// p[0] = 'c';  // RUNTIME CRASH! String literal is in read-only memory

// Undefined behavior with const variables
const int x = 100;
*(const_cast<int*>(&x)) = 200;
printf("%d", x);  // prints 100! Compiler replaces x with the constant`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('const_cast and compiler optimization:', 'const_cast și optimizarea compilatorului:')}</p>
          <p className="text-sm">{t('Since x is defined as const, the compiler assumes it can replace x with its constant value. Even after using const_cast to change the memory, printf("%d", x) may still print the original value. However, for const class members, the compiler uses the actual memory content, so const_cast works as expected.', 'Deoarece x este definit ca const, compilatorul presupune că poate înlocui x cu valoarea sa constantă. Chiar și după folosirea const_cast pentru a schimba memoria, printf("%d", x) poate încă afișa valoarea originală. Totuși, pentru membrii const ai clasei, compilatorul folosește conținutul real al memoriei, deci const_cast funcționează conform așteptărilor.')}</p>
        </Box>

        <Toggle
          question={t('What is the difference between reinterpret_cast and static_cast when casting between inherited classes?', 'Care este diferența între reinterpret_cast și static_cast la cast-ul între clase moștenite?')}
          answer={t('reinterpret_cast keeps the same address (no pointer adjustment), while static_cast adjusts the pointer to account for the memory layout of multiple inheritance. For example, casting C* to B* with static_cast adds sizeof(A) to the pointer, but reinterpret_cast keeps the original address.', 'reinterpret_cast păstrează aceeași adresă (fără ajustare de pointer), în timp ce static_cast ajustează pointerul pentru a ține cont de layout-ul memoriei în moștenire multiplă. De exemplu, cast-ul de la C* la B* cu static_cast adaugă sizeof(A) la pointer, dar reinterpret_cast păstrează adresa originală.')}
        />
      </Section>

      {/* ── 2. Macros ── */}
      <Section title={t('2. Macros', '2. Macro-uri')} id="oop-course_6-macros" checked={!!checked['oop-course_6-macros']} onCheck={() => toggleCheck('oop-course_6-macros')}>
        <p>{t('Macros are methods used to modify (pre-process) C/C++ code before compiling. They work by text substitution in a preprocessor phase — think of it as a search-and-replace in an editor.', 'Macro-urile sunt metode folosite pentru a modifica (pre-procesa) codul C/C++ înainte de compilare. Funcționează prin substituție de text într-o fază de preprocesare — gândiți-vă la ele ca la un search-and-replace într-un editor.')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Macro Syntax', 'Sintaxa macro-urilor')}</p>
          <p className="text-sm font-mono">#define &lt;macro&gt; &lt;value&gt;</p>
          <p className="text-sm font-mono">#undef &lt;macro&gt;</p>
          <p className="text-sm mt-1">{t('Macros work sequentially (applied immediately after definition). During preprocessing, there is no notion of identifiers, so a variable and a macro can share the same name.', 'Macro-urile funcționează secvențial (aplicate imediat după definiție). În timpul preprocesării, nu există noțiunea de identificatori, deci o variabilă și un macro pot avea același nume.')}</p>
        </Box>

        <Code>{`// Simple macros
#define BUFFER_SIZE  1024
char Buffer[BUFFER_SIZE];  // becomes: char Buffer[1024];

// Sequential application — variable and macro share the same name
void main(void) {
    int value = 100;
    int temp;
    temp = value;       // temp = value (variable)
    #define value 200
    temp = value;       // temp = 200 (macro substitution!)
}`}</Code>

        <p className="font-bold mt-3">{t('Multi-line macros', 'Macro-uri pe mai multe linii')}</p>
        <p className="text-sm">{t('Use the backslash character (\\) at the end of each line. No characters should follow after the backslash (except EOL).', 'Folosiți caracterul backslash (\\) la sfârșitul fiecărei linii. Niciun caracter nu trebuie să urmeze după backslash (cu excepția EOL).')}</p>

        <Code>{`#define PRINT \\
    if (value > 100) printf("Greater!"); \\
    else printf("Smaller!");`}</Code>

        <p className="font-bold mt-3">{t('Function-like macros', 'Macro-uri tip funcție')}</p>
        <Code>{`#define MAX(x,y) ((x)>(y)?(x) : (y))

int v3 = MAX(v1, v2);
// After preprocessing: int v3 = ((v1)>(v2) ? (v1) : (v2));`}</Code>

        <p className="font-bold mt-3">{t('Variadic macros (...)', 'Macro-uri cu parametri variabili (...)')}</p>
        <Code>{`#define PRINT(format,...) \\
{ \\
    printf("\\nPrint values:"); \\
    printf(format, __VA_ARGS__); \\
}
PRINT("%d,%d", v1, v2);
// Expands to: printf("\\nPrint values:"); printf("%d,%d", v1, v2);`}</Code>

        <p className="font-bold mt-3">{t('Stringification (#) and Concatenation (##)', 'Stringificare (#) și Concatenare (##)')}</p>
        <Code>{`// # converts parameter to its string form
#define CHECK(condition) { \\
    if (!(condition)) \\
        printf("The condition '%s' failed", #condition); \\
}
CHECK(v1 > v2);
// Expands to: if (!(v1>v2)) printf("...", "v1 > v2");

// ## concatenates parameters
#define SUM(type) \\
    type add_##type(type v1, type v2) { return v1 + v2; }
SUM(int);    // generates: int add_int(int v1, int v2) { ... }
SUM(double); // generates: double add_double(double v1, double v2) { ... }`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Macro pitfalls:', 'Capcane ale macro-urilor:')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>{t('No overloading — last definition wins (previous one is replaced with a warning)', 'Fără supraîncărcare — ultima definiție câștigă (cea anterioară este înlocuită cu un warning)')}</li>
            <li>{t('Always use parentheses! #define DIV(x,y) x/y — DIV(10+10, 5+5) becomes 10+10/5+5 = 17 instead of 2', 'Folosiți întotdeauna paranteze! #define DIV(x,y) x/y — DIV(10+10, 5+5) devine 10+10/5+5 = 17 în loc de 2')}</li>
            <li>{t('Use braces {} for multi-statement macros, otherwise only the first statement is controlled by if/for/while', 'Folosiți acolade {} pentru macro-uri cu mai multe instrucțiuni, altfel doar prima instrucțiune este controlată de if/for/while')}</li>
            <li>{t('Beware of side effects: #define set_min(r,x,y) r=((x)>(y)?(x):(y)) — set_min(res, x++, y) increments x twice!', 'Atenție la efectele secundare: #define set_min(r,x,y) r=((x)>(y)?(x):(y)) — set_min(res, x++, y) incrementează x de două ori!')}</li>
          </ol>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Predefined Macros', 'Macro-uri predefinite')}</p>
          <div className="overflow-x-auto mt-2">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <th className="text-left p-2">Macro</th>
                  <th className="text-left p-2">{t('Value', 'Valoare')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">__FILE__</td><td className="p-2">{t('Current file name', 'Numele fișierului curent')}</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">__LINE__</td><td className="p-2">{t('Current line number', 'Numărul liniei curente')}</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">__DATE__</td><td className="p-2">{t('Compilation date', 'Data compilării')}</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">__TIME__</td><td className="p-2">{t('Compilation time', 'Ora compilării')}</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">__cplusplus</td><td className="p-2">{t('Defined if a C++ compiler is used', 'Definit dacă se folosește un compilator C++')}</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono">__COUNTER__</td><td className="p-2">{t('Unique identifier (0..n), increments on each use', 'Identificator unic (0..n), se incrementează la fiecare utilizare')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Box>

        <p className="font-bold mt-3">{t('Macros vs Inline', 'Macro-uri vs Inline')}</p>
        <p className="text-sm">{t('Using the inline specifier tells the compiler to insert the function code directly at the call site, eliminating the function call overhead (pushing parameters on stack, etc).', 'Folosirea specificatorului inline spune compilatorului să insereze codul funcției direct la locul apelului, eliminând overhead-ul apelului de funcție (push-ul parametrilor pe stivă, etc).')}</p>

        <Code>{`// Normal function — call overhead with stack push/pop
int Max(int x, int y) { return x > y ? x : y; }

// Inline function — code inserted at call site
inline int Max(int x, int y) { return x > y ? x : y; }`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Macros vs Inline:', 'Macro-uri vs Inline:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('Macros GUARANTEE inline replacement but debugging is tricky', 'Macro-urile GARANTEAZĂ înlocuirea inline dar debugging-ul este dificil')}</li>
            <li>{t('inline specifier does NOT guarantee inline replacement (it is a suggestion to the compiler). Debugging is easier.', 'specificatorul inline NU garantează înlocuirea inline (este o sugestie pentru compilator). Debugging-ul este mai ușor.')}</li>
            <li>{t('inline works only in release mode (with optimizations enabled: -O1, -O2, etc.)', 'inline funcționează doar în modul release (cu optimizări activate: -O1, -O2, etc.)')}</li>
            <li>{t('Recursive functions cannot be inlined', 'Funcțiile recursive nu pot fi inline')}</li>
            <li>{t('Class methods defined inside the class definition are implicitly inline', 'Metodele clasei definite în interiorul definiției clasei sunt implicit inline')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Volatile specifier', 'Specificatorul volatile')}</p>
        <p className="text-sm">{t('In release mode, the compiler may optimize away local variables. The volatile specifier prevents this optimization, forcing the compiler to always read/write the variable from memory.', 'În modul release, compilatorul poate optimiza variabilele locale. Specificatorul volatile previne această optimizare, forțând compilatorul să citească/scrie întotdeauna variabila din memorie.')}</p>

        <Code>{`// Without volatile: compiler may eliminate x entirely
int main() {
    int x = rand();
    printf("%d", x);       // may become printf("%d", rand())
}

// With volatile: x is always stored and read from memory
int main() {
    volatile int x = rand();
    printf("%d", x);       // x is kept in memory
}`}</Code>

        <Toggle
          question={t('Why does #define DIV(x,y) x/y produce wrong results with DIV(10+10, 5+5)?', 'De ce produce #define DIV(x,y) x/y rezultate greșite cu DIV(10+10, 5+5)?')}
          answer={t('Because macros do text substitution without analyzing expressions. DIV(10+10, 5+5) becomes 10+10/5+5 = 10+2+5 = 17 instead of (10+10)/(5+5) = 2. The correct form is #define DIV(x,y) ((x)/(y)).', 'Deoarece macro-urile fac substituție de text fără a analiza expresiile. DIV(10+10, 5+5) devine 10+10/5+5 = 10+2+5 = 17 în loc de (10+10)/(5+5) = 2. Forma corectă este #define DIV(x,y) ((x)/(y)).')}
        />
      </Section>

      {/* ── 3. Literals ── */}
      <Section title={t('3. Literals', '3. Literali')} id="oop-course_6-literals" checked={!!checked['oop-course_6-literals']} onCheck={() => toggleCheck('oop-course_6-literals')}>
        <p>{t('Literals are a way of providing a special meaning to numbers or strings by following them with a predefined suffix.', 'Literalii sunt o modalitate de a oferi un sens special numerelor sau string-urilor prin adăugarea unui sufix predefinit.')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Literal Operator Syntax', 'Sintaxa operatorului literal')}</p>
          <p className="text-sm font-mono">&lt;return_type&gt; operator"" _&lt;literal_name&gt;(parameter_type)</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('return_type — can be any type', 'return_type — poate fi orice tip')}</li>
            <li>{t('literal_name — should start with underscore (compiler warns otherwise)', 'literal_name — ar trebui să înceapă cu underscore (compilatorul avertizează altfel)')}</li>
            <li>{t('parameter_type — must be one of: const char*, unsigned long long int, long double, char, wchar_t, char8_t, char16_t, char32_t', 'parameter_type — trebuie să fie unul din: const char*, unsigned long long int, long double, char, wchar_t, char8_t, char16_t, char32_t')}</li>
            <li>{t('Can only be used with constant numbers or strings, NOT with variables', 'Poate fi folosit doar cu numere sau string-uri constante, NU cu variabile')}</li>
          </ul>
        </Box>

        <Code>{`// Custom base-3 literal (const char* parameter)
int operator"" _baza_3(const char* x) {
    int value = 0;
    while ((*x) != 0) {
        value = value * 3 + (*x) - '0';
        x++;
    }
    return value;
}
void main(void) {
    int x = 121102_baza_3;  // compiler passes "121102" as string
}`}</Code>

        <Code>{`// Literal with unsigned long long int parameter
int operator"" _Mega(unsigned long long int x) {
    return ((int)x) * 1024 * 1024;
}
void main(void) {
    int x = 3_Mega;  // x = 3 * 1024 * 1024 = 3145728
}

// NOTE: using int as parameter type is INVALID!
// int operator"" _Mega(int x) { ... }  // ERROR: invalid parameter list`}</Code>

        <Code>{`// Literals that print values (void return type)
void operator"" _print_dec(unsigned long long int x) {
    printf("Decimal: %d\\n", (int)x);
}
void operator"" _print_hex(unsigned long long int x) {
    printf("Hex: 0x%X\\n", (unsigned int)x);
}
void main(void) {
    150_print_dec;  // prints: Decimal: 150
    150_print_hex;  // prints: Hex: 0x96
}`}</Code>

        <p className="font-bold mt-3">{t('String literals with size parameter', 'Literali string cu parametru de dimensiune')}</p>
        <p className="text-sm">{t('For literals with a const char* parameter, a second size_t parameter can be added to receive the string length:', 'Pentru literali cu parametru const char*, se poate adăuga un al doilea parametru size_t pentru a primi lungimea string-ului:')}</p>

        <Code>{`char* operator"" _reverse(const char* sir, size_t sz) {
    char* txt = new char[sz + 1];
    txt[sz] = 0;
    for (size_t poz = 0; poz < sz; poz++)
        txt[sz - poz - 1] = sir[poz];
    return txt;
}
void main(void) {
    char* text = "c++ test today"_reverse;
    printf("%s\\n", text);   // prints: yadot tset ++c
    delete[] text;
}`}</Code>

        <Toggle
          question={t('Can you use a literal with a variable? For example: unsigned long long int a; int sum = a_to_int;', 'Poți folosi un literal cu o variabilă? De exemplu: unsigned long long int a; int sum = a_to_int;')}
          answer={t('No. The compiler will consider "a_to_int" as a new undeclared identifier. Literals can only be used with constant numbers or constant strings, not with variables.', 'Nu. Compilatorul va considera „a_to_int" ca un nou identificator nedeclarat. Literalii pot fi folosiți doar cu numere sau string-uri constante, nu cu variabile.')}
        />
      </Section>

      {/* ── 4. Function Templates ── */}
      <Section title={t('4. Function Templates', '4. Șabloane de funcții')} id="oop-course_6-func-templates" checked={!!checked['oop-course_6-func-templates']} onCheck={() => toggleCheck('oop-course_6-func-templates')}>
        <p>{t('Templates can be considered derived from the notion of macros, adapted for functions and classes. The goal is to define a model where the types of data can be modified at the precompilation stage through substitution. Just like macros, templates generate extra code at compilation, but the code is faster and more efficient.', 'Șabloanele pot fi considerate derivate din noțiunea de macro-uri, adaptate pentru funcții și clase. Scopul este de a defini un model în care tipurile de date pot fi modificate în faza de precompilare prin substituție. Ca și macro-urile, șabloanele generează cod suplimentar la compilare, dar codul este mai rapid și mai eficient.')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Function Template Syntax', 'Sintaxa șabloanelor de funcții')}</p>
          <p className="text-sm font-mono">template &lt;class T&gt; Return_type function_name(parameters)</p>
          <p className="text-sm mt-1">{t('Or equivalently: template <typename T>. At least one of Return_type or parameters must contain type T.', 'Sau echivalent: template <typename T>. Cel puțin Return_type sau parameters trebuie să conțină tipul T.')}</p>
        </Box>

        <Code>{`template <class T>
T Sum(T value_1, T value_2) {
    return value_1 + value_2;
}

void main(void) {
    double x = Sum(1.25, 2.5);  // x = 3.75, T deduced as double
    int y = Sum(1, 2);          // y = 3, T deduced as int
    // Two separate Sum functions are generated in the compiled code
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Type deduction must be unambiguous:', 'Deducția tipului trebuie să fie neambiguă:')}</p>
          <p className="text-sm">{t('Sum(1, 2.5) will NOT compile because 1 is int and 2.5 is double — the compiler cannot decide which type to use for T.', 'Sum(1, 2.5) NU va compila deoarece 1 este int și 2.5 este double — compilatorul nu poate decide ce tip să folosească pentru T.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Explicit type specification', 'Specificarea explicită a tipului')}</p>
        <p className="text-sm">{t('When the compiler cannot deduce T (e.g., T is only in the return type), you must specify it explicitly with angle brackets:', 'Când compilatorul nu poate deduce T (de ex., T este doar în tipul de retur), trebuie să-l specificați explicit cu paranteze unghiulare:')}</p>

        <Code>{`template <class T>
T Sum(int x, int y) {
    return (T)(x + y);
}

void main(void) {
    // Sum(1, 2);              // ERROR: can't deduce T from return type
    int x = Sum<int>(1, 2);      // OK: T = int, x = 3
    double d = Sum<double>(1, 2); // OK: T = double, d = 3.0
}`}</Code>

        <p className="font-bold mt-3">{t('Multiple template types', 'Tipuri multiple de șablon')}</p>
        <Code>{`template <class T1, class T2, class T3>
T1 Sum(T2 x, T3 y) {
    return (T1)(x + y);
}

void main(void) {
    // Return type T1 must always be specified (can't be deduced)
    int x = Sum<int>(1, 2);
    // Compiler deduces: Sum<int, int, int>

    double d = Sum<int, double, double>(1.5, 2.4);
    // d = 3 (result cast to int = T1)

    int z = Sum<int, char>(1, 10.5);
    // Compiler deduces T3 = double from 10.5
}`}</Code>

        <p className="font-bold mt-3">{t('Default parameter values', 'Valori implicite ale parametrilor')}</p>
        <Code>{`template <class T1, class T2, class T3>
T1 Sum(T2 x, T3 y = T3(5)) {
    return (T1)(x + y);
}

void main(void) {
    int x = Sum<int, char, int>(10);  // x = 15 (10 + 5 default)
}
// T3(5) calls the constructor for the type — requires T3 to have
// a constructor that accepts an int`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Important:', 'Important:')}</p>
          <p className="text-sm">{t('Templates must be stored in header files (.h) because the substitution is made during precompilation. If a template is in a .cpp file, other translation units will not be able to use it.', 'Șabloanele trebuie stocate în fișiere header (.h) deoarece substituția se face în timpul precompilării. Dacă un șablon este într-un fișier .cpp, alte unități de traducere nu vor putea să-l folosească.')}</p>
        </Box>

        <Toggle
          question={t('Why does Sum(1, 2.5) fail to compile when Sum is defined as template<class T> T Sum(T v1, T v2)?', 'De ce nu compilează Sum(1, 2.5) când Sum este definit ca template<class T> T Sum(T v1, T v2)?')}
          answer={t('Because 1 is deduced as int and 2.5 as double. Since both parameters must be the same type T, the compiler cannot decide whether T should be int or double — the code is ambiguous. You can fix it with Sum<double>(1, 2.5) or Sum<int>(1, 2.5).', 'Deoarece 1 este dedus ca int și 2.5 ca double. Deoarece ambii parametri trebuie să fie același tip T, compilatorul nu poate decide dacă T ar trebui să fie int sau double — codul este ambiguu. Se poate rezolva cu Sum<double>(1, 2.5) sau Sum<int>(1, 2.5).')}
        />
      </Section>

      {/* ── 5. Class Templates ── */}
      <Section title={t('5. Class Templates', '5. Șabloane de clase')} id="oop-course_6-class-templates" checked={!!checked['oop-course_6-class-templates']} onCheck={() => toggleCheck('oop-course_6-class-templates')}>
        <Box type="definition">
          <p className="font-bold">{t('Class Template Syntax', 'Sintaxa șabloanelor de clase')}</p>
          <p className="text-sm font-mono">template &lt;class T&gt; class MyClass {'{ ... }'}</p>
          <p className="text-sm mt-1">{t('The T variable can be used to define class members, method parameters, and local variables within methods.', 'Variabila T poate fi folosită pentru a defini membrii clasei, parametrii metodelor și variabilele locale din metode.')}</p>
        </Box>

        <Code>{`template <class T>
class Stack {
    T List[100];
    int count;
public:
    Stack() : count(0) {}
    void Push(T value) { List[count++] = value; }
    T Pop() { return List[--count]; }
};

void main(void) {
    Stack<int> s;
    s.Push(1); s.Push(2); s.Push(3);
    printf("%d", s.Pop());  // prints 3
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Watch out for reference parameters:', 'Atenție la parametrii referință:')}</p>
          <p className="text-sm">{t('If Push takes T& (reference), then s.Push(1) will NOT compile because 1 is not an lvalue. Use a variable: int x = 1; s.Push(x); or use const T& in the signature.', 'Dacă Push primește T& (referință), atunci s.Push(1) NU va compila deoarece 1 nu este un lvalue. Folosiți o variabilă: int x = 1; s.Push(x); sau folosiți const T& în semnătură.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Multiple template types', 'Tipuri multiple de șablon')}</p>
        <Code>{`template <class T1, class T2>
class Pair {
    T1 Key;
    T2 Value;
public:
    Pair() : Key(T1()), Value(T2()) {}  // default constructors
    Pair(const T1& v1, const T2& v2) : Key(v1), Value(v2) {}
    void SetKey(const T1& v) { Key = v; }
    void SetValue(const T2& v) { Value = v; }
};

void main(void) {
    Pair<const char*, int> p("exam_grade", 10);
}
// T1() and T2() call default constructors — both types must have one!`}</Code>

        <p className="font-bold mt-3">{t('Composing templates', 'Compunerea șabloanelor')}</p>
        <Code>{`// Templates can be nested and combined with macros
#define P(k,v) new Pair<const char*, int>(k, v)
#define Stack  MyStack<Pair<const char*, int>>

void main(void) {
    Stack s;
    s.Push(P("asm_grade", 10));
    s.Push(P("oop_grade", 9));
}`}</Code>

        <p className="font-bold mt-3">{t('Non-type template parameters (constants)', 'Parametri de șablon non-tip (constante)')}</p>
        <Code>{`template <class T, int Size>
class Stack {
    T List[Size];
    int count;
public:
    Stack() : count(0) {}
    void Push(const T& value) { List[count++] = value; }
    T& Pop() { return List[--count]; }
};

void main(void) {
    Stack<int, 10> s;    // 10 elements
    Stack<int, 100> s2;  // 100 elements
    // Two DIFFERENT classes are generated at compile time!
}

// With default value:
template <class T, int Size = 100>
class Stack2 { /* ... */ };
Stack2<int, 10> a;  // Size = 10
Stack2<int> b;      // Size = 100 (default)`}</Code>

        <p className="font-bold mt-3">{t('Default type parameters', 'Parametri de tip impliciți')}</p>
        <Code>{`template <class T = int>
class Stack { /* ... */ };

Stack<double> s;  // T = double
Stack<> s2;       // T = int (default) — the <> is REQUIRED!
// Stack s3;      // ERROR! Must use <> even with default type`}</Code>

        <p className="font-bold mt-3">{t('Methods with templates in non-template classes', 'Metode cu șabloane în clase non-șablon')}</p>
        <Code>{`class Integer {
    int value;
public:
    Integer() : value(0) {}
    template <class T>
    void SetValue(T v) { value = (int)v; }
};

void main(void) {
    Integer i;
    i.SetValue<float>(0.5f);   // explicit type
    i.SetValue(0.5f);          // deduced: float
    i.SetValue('a');           // deduced: char
}`}</Code>

        <p className="font-bold mt-3">{t('Static members in template classes', 'Membri statici în clase șablon')}</p>
        <Code>{`template<class T>
class Number {
    T Value;
public:
    static int Count;
};

// Each instantiation has its OWN static member
int Number<int>::Count = 10;
int Number<char>::Count = 20;
int Number<double>::Count = 30;

void main(void) {
    Number<int> n1; Number<char> n2; Number<double> n3;
    printf("%d,%d,%d", n1.Count, n2.Count, n3.Count);
    // prints: 10,20,30
}`}</Code>

        <Toggle
          question={t('Why does Stack s2; fail to compile even when the template has a default type (template <class T = int>)?', 'De ce nu compilează Stack s2; chiar dacă șablonul are un tip implicit (template <class T = int>)?')}
          answer={t('Even with a default type parameter, you must use angle brackets (<>) to tell the compiler that the variable is a template instantiation. The correct syntax is Stack<> s2; — the empty brackets indicate you want the default type.', 'Chiar și cu un parametru de tip implicit, trebuie să folosiți paranteze unghiulare (<>) pentru a spune compilatorului că variabila este o instanțiere de șablon. Sintaxa corectă este Stack<> s2; — parantezele goale indică că doriți tipul implicit.')}
        />
      </Section>

      {/* ── 6. Template Specialization & static_assert ── */}
      <Section title={t('6. Template Specialization & static_assert', '6. Specializarea șabloanelor & static_assert')} id="oop-course_6-specialization" checked={!!checked['oop-course_6-specialization']} onCheck={() => toggleCheck('oop-course_6-specialization')}>
        <p>{t('The biggest limitation of templates is that a method has exactly the same behavior for all types — only the type of parameters differs. Specialized templates overcome this by defining type-specific implementations.', 'Cea mai mare limitare a șabloanelor este că o metodă are exact același comportament pentru toate tipurile — diferă doar tipul parametrilor. Șabloanele specializate depășesc această limitare prin definirea de implementări specifice tipului.')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Template Specialization', 'Specializarea șabloanelor')}</p>
          <p className="text-sm">{t('A way to define a method/class that overwrites the initial template code with a more specific implementation for parameters of a certain type.', 'O modalitate de a defini o metodă/clasă care suprascrie codul inițial al șablonului cu o implementare mai specifică pentru parametri de un anumit tip.')}</p>
        </Box>

        <Code>{`// Problem: Get() returns ASCII code for char instead of digit value
template <class T>
class Number {
    T value;
public:
    void Set(T t) { value = t; }
    int Get() { return (int)value; }
};

// Specialized template for char
template <>
class Number<char> {
    char value;
public:
    void Set(char t) { value = t - '0'; }  // convert ASCII to digit
    int Get() { return (int)value; }
};

void main(void) {
    Number<int> n1;  n1.Set(5);
    Number<char> n2; n2.Set('7');
    printf("n1=%d, n2=%d", n1.Get(), n2.Get());
    // Without specialization: n1=5, n2=55 (ASCII of '7')
    // With specialization:    n1=5, n2=7  (correct!)
}`}</Code>

        <p className="font-bold mt-3">{t('Function template specialization', 'Specializarea șabloanelor de funcții')}</p>
        <Code>{`template <class T>
int ConvertToInt(T value) { return (int)value; }

template <>
int ConvertToInt<char>(char value) { return (int)(value - '0'); }

void main(void) {
    int x = ConvertToInt<double>(1.5);  // x = 1
    int y = ConvertToInt<char>('4');     // y = 4 (specialized version)
}`}</Code>

        <p className="font-bold mt-4">{t('Compile-time Assertion Checking', 'Verificarea asertiunilor la compilare')}</p>

        <Box type="definition">
          <p className="font-bold">static_assert (C++11)</p>
          <p className="text-sm font-mono">static_assert(condition, "error message");</p>
          <p className="text-sm mt-1">{t('Evaluates an expression during the compile phase and produces a compile error if the condition is false. Only works with constant values (values that can be evaluated at compile time).', 'Evaluează o expresie în faza de compilare și produce o eroare de compilare dacă condiția este falsă. Funcționează doar cu valori constante (valori care pot fi evaluate la compilare).')}</p>
        </Box>

        <Code>{`template <typename T, int size>
class Stack {
    T Elements[size];
public:
    Stack() {
        static_assert(size > 1, "Size for Stack must be bigger than 1");
        static_assert(size < 100, "Size for Stack must be smaller than 100");
    }
};

Stack<float, 200> a;
// ERROR C2338: Size for Stack must be smaller than 100`}</Code>

        <p className="font-bold mt-3">{t('Type checking with static_assert', 'Verificarea tipului cu static_assert')}</p>
        <p className="text-sm">{t('Using template specialization, we can build a type comparison utility and combine it with static_assert to restrict which types a template accepts:', 'Folosind specializarea șabloanelor, putem construi un utilitar de comparare a tipurilor și îl putem combina cu static_assert pentru a restricționa ce tipuri acceptă un șablon:')}</p>

        <Code>{`// Step 1: Define a type comparison template
template<typename T1, typename T2>
struct TypeCompare {
    static const bool equal = false;  // different types
};

template<typename T>
struct TypeCompare<T, T> {
    static const bool equal = true;   // specialized: same type
};

// Step 2: Use with static_assert in a template class
template <typename T, int size>
class Stack {
    T Elements[size];
public:
    Stack() {
        static_assert(TypeCompare<T, int>::equal,
            "Stack can only be used with type int");
    }
};

Stack<int, 10> a;     // OK: TypeCompare<int,int>::equal = true
Stack<float, 10> b;   // ERROR: "Stack can only be used with type int"`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('static_assert limitations:', 'Limitările static_assert:')}</p>
          <p className="text-sm">{t('static_assert only works with constant values that can be evaluated at compile time. Using it with runtime values (e.g., rand()) will produce a compile error: "expression did not evaluate to a constant".', 'static_assert funcționează doar cu valori constante care pot fi evaluate la compilare. Folosirea cu valori runtime (de ex., rand()) va produce o eroare de compilare: „expresia nu s-a evaluat la o constantă".')}</p>
        </Box>

        <Code>{`void main(void) {
    int x = rand();
    // static_assert(x != 0, "X should not be 0!");
    // ERROR C2131: expression did not evaluate to a constant
    // x is a runtime value — cannot be checked at compile time
}`}</Code>

        <Toggle
          question={t('How does the TypeCompare trick work to check if two types are the same at compile time?', 'Cum funcționează trucul TypeCompare pentru a verifica dacă două tipuri sunt identice la compilare?')}
          answer={t('It uses template specialization. The generic template TypeCompare<T1,T2> sets equal=false for any two different types. The specialized template TypeCompare<T,T> (both parameters the same type) sets equal=true. When the compiler instantiates TypeCompare<float,int>, it uses the generic version (false). For TypeCompare<int,int>, it uses the specialized version (true).', 'Folosește specializarea șabloanelor. Șablonul generic TypeCompare<T1,T2> setează equal=false pentru orice două tipuri diferite. Șablonul specializat TypeCompare<T,T> (ambii parametri același tip) setează equal=true. Când compilatorul instanțiază TypeCompare<float,int>, folosește versiunea generică (false). Pentru TypeCompare<int,int>, folosește versiunea specializată (true).')}
        />
      </Section>
    </>
  );
}
