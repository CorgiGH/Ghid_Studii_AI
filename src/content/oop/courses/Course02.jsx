import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course02() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 2 — Topics:', 'Cursul 2 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Pointers and References', 'Pointeri și referințe')}</li>
          <li>{t('References: properties and constraints', 'Referințe: proprietăți și constrângeri')}</li>
          <li>{t('Method Overloading and Overload Resolution', 'Supraîncărcarea metodelor și rezoluția supraîncărcării')}</li>
          <li>{t('NULL pointer vs nullptr', 'Pointerul NULL vs nullptr')}</li>
          <li>{t('The "const" specifier (pointers, references, methods, data members, mutable)', 'Specificatorul "const" (pointeri, referințe, metode, membri date, mutable)')}</li>
          <li>{t('The "friend" specifier (functions, classes, methods)', 'Specificatorul "friend" (funcții, clase, metode)')}</li>
        </ol>
      </Box>

      {/* ── 1. Pointers and References ── */}
      <Section title={t('1. Pointers and References', '1. Pointeri și referințe')} id="oop-c2-pointers" checked={!!checked['oop-c2-pointers']} onCheck={() => toggleCheck('oop-c2-pointers')}>
        <p>{t('Pointers and references are two mechanisms to indirectly access a variable. Although they produce identical assembly code, references provide safer usage patterns.', 'Pointerii și referințele sunt două mecanisme de accesare indirectă a unei variabile. Deși produc cod assembler identic, referințele oferă modele de utilizare mai sigure.')}</p>

        <Code>{`// Pointer version
void SetInt(int *i) {
    (*i) = 5;
}
void main() {
    int x;
    SetInt(&x);
}

// Reference version
void SetInt(int &i) {
    i = 5;
}
void main() {
    int x;
    SetInt(x);
}`}</Code>

        <Box type="theorem">
          <p>{t('The resulting assembly code is identical for both pointer and reference versions. Both translate to the same machine instructions (push, mov, pop, ret).', 'Codul assembler rezultat este identic pentru ambele versiuni — pointer și referință. Ambele se traduc în aceleași instrucțiuni mașină (push, mov, pop, ret).')}</p>
        </Box>

        <p className="mt-3">{t('From the programmer\'s perspective, references fix several problems:', 'Din perspectiva programatorului, referințele rezolvă mai multe probleme:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('No need for the "->" operator — use "." instead', 'Nu este nevoie de operatorul "->" — se folosește "." în schimb')}</li>
          <li>{t('No need to check for NULL pointers', 'Nu este nevoie de verificarea pointerilor NULL')}</li>
        </ul>

        <Code>{`// With pointer: must use ->
struct Date { int X; };
void SetInt(Date *d) {
    d->X = 5;
}

// With reference: use . directly
struct Date { int X; };
void SetInt(Date &d) {
    d.X = 5;
}`}</Code>

        <Toggle
          question={t('What is the key advantage of references over pointers from a safety perspective?', 'Care este avantajul cheie al referințelor față de pointeri din perspectiva siguranței?')}
          answer={t('References must be initialized when declared and cannot be NULL. This guarantees that a reference always points to a valid memory location, eliminating an entire class of bugs related to null pointer dereferencing.', 'Referințele trebuie inițializate la declarare și nu pot fi NULL. Aceasta garantează că o referință indică întotdeauna o locație de memorie validă, eliminând o clasă întreagă de bug-uri legate de dereferențierea pointerilor nuli.')}
        />
      </Section>

      {/* ── 2. References: Properties and Constraints ── */}
      <Section title={t('2. References: Properties and Constraints', '2. Referințe: proprietăți și constrângeri')} id="oop-c2-references" checked={!!checked['oop-c2-references']} onCheck={() => toggleCheck('oop-c2-references')}>
        <Box type="definition">
          <p className="font-bold">{t('Pointer vs Reference — Key Differences', 'Pointer vs Referință — Diferențe cheie')}</p>
        </Box>

        <p className="font-bold mt-3">{t('1. Initialization', '1. Inițializare')}</p>
        <p className="text-sm">{t('Pointers can remain uninitialized. References must always be initialized.', 'Pointerii pot rămâne neinițializați. Referințele trebuie întotdeauna inițializate.')}</p>
        <Code>{`int i = 10;
int *p;          // OK: pointer can be uninitialized
int &refI;       // COMPILE ERROR: uninitialized reference`}</Code>

        <p className="font-bold mt-3">{t('2. Reassignment', '2. Reasignare')}</p>
        <p className="text-sm">{t('A pointer can be changed to point to different addresses. A reference, once initialized, cannot be reassigned.', 'Un pointer poate fi schimbat să indice diferite adrese. O referință, odată inițializată, nu poate fi reasignată.')}</p>
        <Code>{`int i = 10, j = 20;
int *p = &i;
p = &j;          // OK: pointer reassigned

int &refI = i;
&refI = j;       // COMPILE ERROR: cannot reassign reference`}</Code>

        <p className="font-bold mt-3">{t('3. NULL values', '3. Valori NULL')}</p>
        <p className="text-sm">{t('A pointer can be NULL. A reference must always point to an existing memory address.', 'Un pointer poate fi NULL. O referință trebuie să indice întotdeauna o adresă de memorie existentă.')}</p>

        <p className="font-bold mt-3">{t('4. Arithmetic operations', '4. Operații aritmetice')}</p>
        <p className="text-sm">{t('Pointers support arithmetic (+, -, ++, etc). References do not.', 'Pointerii suportă operații aritmetice (+, -, ++, etc). Referințele nu.')}</p>
        <Code>{`int i = 10, j = 20;
int *p = &i;
p++;              // OK: pointer arithmetic, now points to j
(*p) = 30;        // j is now 30

int &refI = i;
(&refI)++;        // COMPILE ERROR: no arithmetic on references`}</Code>

        <p className="font-bold mt-3">{t('5. Type casting', '5. Conversie de tip')}</p>
        <p className="text-sm">{t('A pointer can be cast to another pointer type (especially to void*). A reference cannot be converted to another reference type.', 'Un pointer poate fi convertit la alt tip de pointer (în special la void*). O referință nu poate fi convertită la alt tip de referință.')}</p>
        <Code>{`int i = 10;
char *p = (char *)&i;   // OK: pointer cast

int i = 10;
char &refI = i;          // COMPILE ERROR: cannot cast reference`}</Code>

        <p className="font-bold mt-3">{t('6. Multiple indirection', '6. Indirectare multiplă')}</p>
        <p className="text-sm">{t('A pointer can point to another pointer (int **). A reference cannot refer to another reference.', 'Un pointer poate indica alt pointer (int **). O referință nu poate referi altă referință.')}</p>
        <Code>{`int i = 10;
int *p = &i;
int **p_to_p = &p;      // OK: pointer to pointer
**p_to_p = 20;

int &refI = i;
int & &ref_to_refI = refI; // COMPILE ERROR`}</Code>

        <p className="font-bold mt-3">{t('7. Arrays', '7. Tablouri')}</p>
        <p className="text-sm">{t('Pointers can be used in arrays. References cannot.', 'Pointerii pot fi folosiți în tablouri. Referințele nu.')}</p>
        <Code>{`int *p[100];       // OK: array of pointers
int &ref[100];     // COMPILE ERROR: array of references not allowed`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Special case: reference to a temporary value', 'Caz special: referință la o valoare temporară')}</p>
          <p className="text-sm">{t('A reference can point to a temporary (constant) value, but only if the const specifier is used:', 'O referință poate indica o valoare temporară (constantă), dar doar dacă se folosește specificatorul const:')}</p>
        </Box>
        <Code>{`const int &refI = int(12);   // OK: const reference to temporary
int *p = (int *)&refI;      // Can create pointer from const reference`}</Code>

        <Toggle
          question={t('Why is "int & &ref" (reference to reference) different from "int &&ref" (rvalue reference)?', 'De ce este "int & &ref" (referință la referință) diferit de "int &&ref" (referință rvalue)?')}
          answer={t('"int & &ref" (with a space) attempts to create a reference to a reference, which is illegal in C++. "int &&ref" (no space, C++11) declares an rvalue reference, which is a completely different concept used for move semantics.', '"int & &ref" (cu spațiu) încearcă să creeze o referință la o referință, ceea ce este ilegal în C++. "int &&ref" (fără spațiu, C++11) declară o referință rvalue, un concept complet diferit folosit pentru semantica de mutare.')}
        />
      </Section>

      {/* ── 3. Method Overloading ── */}
      <Section title={t('3. Method Overloading', '3. Supraîncărcarea metodelor')} id="oop-c2-overloading" checked={!!checked['oop-c2-overloading']} onCheck={() => toggleCheck('oop-c2-overloading')}>
        <Box type="definition">
          <p className="font-bold">{t('Method Overloading', 'Supraîncărcarea metodelor')}</p>
          <p className="text-sm">{t('A technique in C++ where multiple functions/methods share the same name but differ in their parameters. A function signature consists of: (1) function name, and (2) parameter types. The return type is NOT part of the signature.', 'O tehnică în C++ în care mai multe funcții/metode au același nume dar diferă prin parametri. Semnătura unei funcții constă din: (1) numele funcției și (2) tipurile parametrilor. Tipul returnat NU face parte din semnătură.')}</p>
        </Box>

        <Code>{`class Math {
public:
    int   Add(int v1, int v2);
    int   Add(int v1, int v2, int v3);
    int   Add(int v1, int v2, int v3, int v4);
    float Add(float v1, float v2);
};`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Invalid overloading:', 'Supraîncărcare invalidă:')}</p>
          <p className="text-sm">{t('Functions with the same name and same parameter types but different return types are NOT valid overloads — they are considered duplicates. Default parameter values do NOT change the signature either.', 'Funcțiile cu același nume și aceleași tipuri de parametri dar tipuri de retur diferite NU sunt supraîncărcări valide — sunt considerate duplicate. Valorile implicite ale parametrilor NU schimbă nici ele semnătura.')}</p>
        </Box>

        <Code>{`// ERROR: same signature — return type doesn't matter
class Math {
public:
    int  Add(int v1, int v2);
    long Add(int v1, int v2);  // duplicate!
};

// ERROR: default values don't change the signature
class Math {
public:
    int  Add(int v1, int v2);
    long Add(int v1, int v2 = 0); // still same signature!
};`}</Code>

        <p className="font-bold mt-4">{t('Overload Resolution Steps', 'Pașii rezoluției supraîncărcării')}</p>
        <p className="text-sm mb-2">{t('When a call is made, the compiler resolves which overload to use:', 'Când se face un apel, compilatorul rezolvă care supraîncărcare să folosească:')}</p>
        <ol className="list-decimal pl-5 text-sm space-y-2">
          <li><strong>{t('Exact match', 'Potrivire exactă')}</strong> — {t('A method with the exact same parameter types exists.', 'Există o metodă cu exact aceleași tipuri de parametri.')}</li>
          <li><strong>{t('Numerical promotion', 'Promovare numerică')}</strong> — {t('Convert a type without losing precision: bool/char/short → int, float → double, enum → int.', 'Convertește un tip fără pierdere de precizie: bool/char/short → int, float → double, enum → int.')}</li>
          <li><strong>{t('Numerical conversion', 'Conversie numerică')}</strong> — {t('Convert a type with possible loss of precision (e.g., double → int).', 'Convertește un tip cu posibilă pierdere de precizie (ex: double → int).')}</li>
          <li><strong>{t('Casts', 'Cast-uri')}</strong> — {t('Non-const pointer → const pointer, non-const pointer → void*, NULL → 0.', 'Pointer non-const → pointer const, pointer non-const → void*, NULL → 0.')}</li>
          <li><strong>{t('Explicit casts', 'Cast-uri explicite')}</strong> — {t('User-defined explicit casts are applied.', 'Se aplică cast-uri explicite definite de utilizator.')}</li>
          <li><strong>{t('Fallback method', 'Metodă de rezervă')}</strong> — {t('A method with only variadic parameters (...) is used as last resort.', 'O metodă doar cu parametri variadici (...) este folosită ca ultimă soluție.')}</li>
          <li><strong>{t('Error', 'Eroare')}</strong> — {t('If nothing matches, the compiler produces an error.', 'Dacă nimic nu se potrivește, compilatorul produce o eroare.')}</li>
        </ol>

        <Box type="theorem">
          <p className="font-bold">{t('Ambiguity rule:', 'Regula de ambiguitate:')}</p>
          <p className="text-sm">{t('If during promotion the compiler does NOT find a match but there are at least two methods with the same name, it declares an ambiguity error. If there is only ONE method with that name, a conversion is attempted (even with precision loss).', 'Dacă în timpul promovării compilatorul NU găsește o potrivire dar există cel puțin două metode cu același nume, declară o eroare de ambiguitate. Dacă există doar O singură metodă cu acel nume, se încearcă o conversie (chiar cu pierdere de precizie).')}</p>
        </Box>

        <Code>{`// Exact match: 100 is int → uses Inc(int)
class Math {
public:
    int   Inc(int v1);
    float Inc(float v1);
};
Math m;
m.Inc(100);     // → Inc(int)

// Promotion: 'a' (char) promoted to int → uses Inc(int)
m.Inc('a');     // → Inc(int)

// Ambiguity: 1.0 (double) cannot be promoted to int or float
m.Inc(1.0);    // ERROR: ambiguous`}</Code>

        <Code>{`// Single method: conversion allowed even with precision loss
class Math {
public:
    int Inc(char v1) { return v1 + 1; }
};
Math m;
m.Inc(1.0);  // WARNING: double → char conversion, compiles`}</Code>

        <p className="font-bold mt-4">{t('Ambiguity with char promotion', 'Ambiguitate cu promovarea char')}</p>
        <p className="text-sm">{t('Promotion only works for int and double. A char promoted to int will NOT match a short parameter — if two overloads exist, this causes ambiguity:', 'Promovarea funcționează doar pentru int și double. Un char promovat la int NU va potrivi un parametru short — dacă există două supraîncărcări, aceasta cauzează ambiguitate:')}</p>
        <Code>{`class Math {
public:
    int   Inc(short v1);
    float Inc(float v1);
};
Math m;
m.Inc('a');  // ERROR: char → int, but no Inc(int) exists
             // ambiguity between Inc(short) and Inc(float)`}</Code>

        <p className="font-bold mt-4">{t('Variadic (fallback) methods', 'Metode variadice (de rezervă)')}</p>
        <p className="text-sm">{t('A method with only variadic parameters — Inc(...) — is used only when no promotion/conversion is possible:', 'O metodă doar cu parametri variadici — Inc(...) — este folosită doar când nicio promovare/conversie nu este posibilă:')}</p>
        <Code>{`class Math {
public:
    int Inc(int v1);
    int Inc(...);       // fallback
};
Math m;
m.Inc(123);      // → Inc(int): exact match
m.Inc('a');      // → Inc(int): char promoted to int
m.Inc(1.0);      // → Inc(int): double converted to int (NOT fallback!)
m.Inc("test");   // → Inc(...): no conversion from const char* to int
m.Inc(1.0, 2);   // → Inc(...): no 2-parameter overload available`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Beware: Inc(int) vs Inc(int,...)', 'Atenție: Inc(int) vs Inc(int,...)')}</p>
          <p className="text-sm">{t('When both Inc(int) and Inc(int,...) exist, calling Inc(123) is AMBIGUOUS — both match exactly. The code will NOT compile.', 'Când există atât Inc(int) cât și Inc(int,...), apelul Inc(123) este AMBIGUU — ambele se potrivesc exact. Codul NU va compila.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Multi-parameter overload resolution', 'Rezoluția supraîncărcării cu parametri multipli')}</p>
        <p className="text-sm">{t('When dealing with multiple parameters, promotion/conversion rules are evaluated per parameter. The compiler selects the combination covering the highest number of exact matches. If two solutions each uniquely match different parameters, it is ambiguous.', 'Când avem parametri multipli, regulile de promovare/conversie se evaluează per parametru. Compilatorul selectează combinația care acoperă cel mai mare număr de potriviri exacte. Dacă două soluții potrivesc exact parametri diferiți, este ambiguu.')}</p>

        <Code>{`struct Math {
    int Add(char x, int y, int z)  { return 1; }
    int Add(int x, char y, int z)  { return 2; }
    int Add(float x, bool y, int z){ return 3; }
};
Math m;

// 'a'=char(exact), 1.5→int(conv), 2.5→int(conv)
// Solution 1 wins: exact match on param 1
m.Add('a', 1.5, 2.5);  // → Add(char, int, int) = 1`}</Code>

        <p className="font-bold mt-4">{t('const in overload resolution', 'const în rezoluția supraîncărcării')}</p>
        <p className="text-sm">{t('For value types, const is ignored in the signature. For pointers and references, const IS part of the signature:', 'Pentru tipuri valoare, const este ignorat din semnătură. Pentru pointeri și referințe, const FACE parte din semnătură:')}</p>
        <Code>{`// ERROR: Inc(int) and Inc(const int) are the SAME signature
class Math {
public:
    int Inc(int x) { return x + 2; }
    int Inc(const int x) { return x + 1; }  // duplicate!
};

// OK: Inc(int*) and Inc(const int*) are DIFFERENT signatures
class Math {
public:
    int Inc(int * x)       { return *x + 2; }
    int Inc(const int * x) { return *x + 1; }
};
Math m;
int x = 10;
m.Inc(&x);         // → Inc(int*)
const int y = 10;
m.Inc(&y);         // → Inc(const int*)`}</Code>

        <Code>{`// References: same rules apply
class Math {
public:
    int Inc(int & x)       { return x + 2; }
    int Inc(const int & x) { return x + 1; }
};
Math m;
int x = 10;
m.Inc(x);     // → Inc(int&)
m.Inc(100);   // → Inc(const int&), 100 is a constant value`}</Code>

        <Toggle
          question={t('Why does m.Inc(100) fail to compile when only Inc(int&) exists, but compiles when Inc(const int&) also exists?', 'De ce nu compilează m.Inc(100) când există doar Inc(int&), dar compilează când există și Inc(const int&)?')}
          answer={t('The literal 100 is a constant value. A constant cannot be bound to a non-const reference (int&) because that would imply the function could modify a literal. It CAN be bound to a const reference (const int&) because that guarantees the value won\'t be modified.', 'Literalul 100 este o valoare constantă. O constantă nu poate fi legată de o referință non-const (int&) deoarece ar implica că funcția ar putea modifica un literal. POATE fi legată de o referință const (const int&) deoarece aceasta garantează că valoarea nu va fi modificată.')}
        />
      </Section>

      {/* ── 4. NULL Pointer ── */}
      <Section title={t('4. NULL Pointer vs nullptr', '4. Pointerul NULL vs nullptr')} id="oop-c2-null" checked={!!checked['oop-c2-null']} onCheck={() => toggleCheck('oop-c2-null')}>
        <p>{t('The NULL macro is defined differently in C and C++:', 'Macro-ul NULL este definit diferit în C și C++:')}</p>

        <Code>{`// In C++:
#ifdef __cplusplus
    #define NULL 0
#else
    #define NULL ((void*)0)
#endif`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Problem: NULL is a number in C++', 'Problema: NULL este un număr în C++')}</p>
          <p className="text-sm">{t('Since NULL is defined as 0 in C++, it behaves as an integer, not a pointer. This causes unexpected overload resolution:', 'Deoarece NULL este definit ca 0 în C++, se comportă ca un întreg, nu ca un pointer. Aceasta cauzează rezoluție neașteptată a supraîncărcării:')}</p>
        </Box>

        <Code>{`void Print(int value) {
    printf("Number: %d\\n", value);
}
void Print(const char* text) {
    printf("Text: %s\\n", text);
}
void main() {
    Print(10);          // Output: Number: 10
    Print("C++ test");  // Output: Text: C++ test
    Print(NULL);        // Output: Number: 0  ← NOT a pointer!
}`}</Code>

        <Box type="definition">
          <p className="font-bold">nullptr (C++11)</p>
          <p className="text-sm">{t('A new keyword that refers exclusively to null pointers. Unlike NULL, it cannot be implicitly converted to an integer.', 'Un cuvânt cheie nou care se referă exclusiv la pointeri nuli. Spre deosebire de NULL, nu poate fi convertit implicit la un întreg.')}</p>
        </Box>

        <Code>{`Print(nullptr);  // → Print(const char*) is called`}</Code>

        <p className="font-bold mt-3">{t('NULL vs nullptr — valid assignments', 'NULL vs nullptr — atribuiri valide')}</p>
        <Code>{`// NULL can be assigned to anything (it's just 0):
int x = NULL;           // OK: x = 0
char y = NULL;          // OK: y = 0
float f = NULL;         // OK: f = 0.0
bool b = NULL;          // OK: b = false
const char* p = NULL;   // OK: null pointer
int * i = NULL;         // OK: null pointer

// nullptr is restricted to pointers and bool:
int x = nullptr;        // ERROR
char y = nullptr;       // ERROR
float f = nullptr;      // ERROR
bool b = nullptr;       // OK: b = false
const char* p = nullptr;// OK: null pointer
int * i = nullptr;      // OK: null pointer`}</Code>

        <Box type="theorem">
          <p>{t('Even though nullptr can be converted to bool (false), when both a bool and a pointer overload exist, nullptr always prefers the pointer version:', 'Chiar dacă nullptr poate fi convertit la bool (false), când există atât o supraîncărcare bool cât și una pointer, nullptr preferă întotdeauna versiunea pointer:')}</p>
        </Box>

        <Code>{`void Print(bool value) { ... }
void Print(const char* text) { ... }
Print(nullptr);  // → Print(const char*), NOT Print(bool)

// But with TWO pointer overloads: AMBIGUOUS
void Print(bool value) { ... }
void Print(const char* text) { ... }
void Print(int* value) { ... }
Print(nullptr);  // ERROR: ambiguous (const char* or int*?)`}</Code>

        <Toggle
          question={t('Why should you prefer nullptr over NULL in modern C++?', 'De ce ar trebui să preferi nullptr în locul lui NULL în C++ modern?')}
          answer={t('NULL is defined as 0 in C++, making it an integer constant. This leads to incorrect overload resolution when both integer and pointer overloads exist. nullptr is type-safe — it can only be assigned to pointers and bool, ensuring the compiler always selects pointer overloads when a null pointer is intended.', 'NULL este definit ca 0 în C++, făcându-l o constantă de tip întreg. Aceasta duce la rezoluție incorectă a supraîncărcării când există atât supraîncărcări de tip întreg cât și de tip pointer. nullptr este type-safe — poate fi atribuit doar pointerilor și bool, asigurând că compilatorul selectează întotdeauna supraîncărcări pointer când se intenționează un pointer nul.')}
        />
      </Section>

      {/* ── 5. The "const" Specifier ── */}
      <Section title={t('5. The "const" Specifier', '5. Specificatorul "const"')} id="oop-c2-const" checked={!!checked['oop-c2-const']} onCheck={() => toggleCheck('oop-c2-const')}>
        <Box type="definition">
          <p className="font-bold">{t('The const specifier', 'Specificatorul const')}</p>
          <p className="text-sm">{t('Used to declare that a value, pointer, or method behavior is read-only. Follows the Clockwise/Spiral Rule for C/C++ declarations.', 'Folosit pentru a declara că o valoare, pointer sau comportament al metodei este doar-citire. Urmează Regula Spiralei în sensul acelor de ceasornic pentru declarațiile C/C++.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('const with methods — return value', 'const cu metode — valoarea returnată')}</p>
        <Code>{`class Date {
private:
    int x;
public:
    int& GetX();           // returns modifiable reference
    const int& GetY();     // returns read-only reference
};

Date d;
d.GetX()++;   // OK: modifies x through reference
d.GetY()++;   // ERROR: cannot modify const reference`}</Code>

        <p className="text-sm mt-2">{t('Returning a const reference is the recommended way to provide read-only access to a member variable, especially for non-basic types. Callers can still copy the value:', 'Returnarea unei referințe const este metoda recomandată pentru a oferi acces doar-citire la o variabilă membru, în special pentru tipuri non-bazice. Apelanții pot totuși copia valoarea:')}</p>
        <Code>{`int x = d.GetY(); // OK: copies the value
x++;              // OK: modifies the local copy`}</Code>

        <p className="font-bold mt-4">{t('const with pointers — the Clockwise/Spiral Rule', 'const cu pointeri — Regula Spiralei')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Expression', 'Expresie')}</th>
                <th className="text-left p-2">{t('Meaning', 'Semnificație')}</th>
                <th className="text-left p-2">{t('Change Value', 'Modific. valoare')}</th>
                <th className="text-left p-2">{t('Change Pointer', 'Modific. pointer')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2 font-mono text-xs">int * ptr</td>
                <td className="p-2">{t('Non-const pointer to non-const value', 'Pointer non-const la valoare non-const')}</td>
                <td className="p-2">{t('YES', 'DA')}</td><td className="p-2">{t('YES', 'DA')}</td>
              </tr>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2 font-mono text-xs">const int * ptr</td>
                <td className="p-2">{t('Non-const pointer to const value', 'Pointer non-const la valoare const')}</td>
                <td className="p-2">{t('NO', 'NU')}</td><td className="p-2">{t('YES', 'DA')}</td>
              </tr>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2 font-mono text-xs">int * const ptr</td>
                <td className="p-2">{t('Const pointer to non-const value', 'Pointer const la valoare non-const')}</td>
                <td className="p-2">{t('YES', 'DA')}</td><td className="p-2">{t('NO', 'NU')}</td>
              </tr>
              <tr>
                <td className="p-2 font-mono text-xs">const int * const ptr</td>
                <td className="p-2">{t('Const pointer to const value', 'Pointer const la valoare const')}</td>
                <td className="p-2">{t('NO', 'NU')}</td><td className="p-2">{t('NO', 'NU')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Box type="formula">
          <p className="text-sm"><code>int * const ptr</code> {t('is equivalent to a reference', 'este echivalent cu o referință')} (<code>int &</code>)</p>
          <p className="text-sm"><code>const int * const ptr</code> {t('is equivalent to', 'este echivalent cu')} <code>const int &</code></p>
        </Box>

        <Code>{`int x;

// const value, non-const pointer
const int * ptr;
ptr = &x;     // OK: can change pointer
*ptr = 1;     // ERROR: cannot change value
ptr += 1;     // OK: can change pointer

// const pointer, non-const value
int * const ptr2 = &x;  // must initialize immediately
*ptr2 = 1;    // OK: can change value
ptr2 += 1;    // ERROR: cannot change pointer

// both const
const int * const ptr3 = &x;
*ptr3 = 1;    // ERROR
ptr3 += 1;    // ERROR`}</Code>

        <p className="font-bold mt-4">{t('const at the end of a method', 'const la sfârșitul unei metode')}</p>
        <p className="text-sm">{t('When "const" appears after the method declaration, it means the method cannot modify any data members of the class (i.e., it cannot modify "this"):', 'Când "const" apare după declarația metodei, înseamnă că metoda nu poate modifica niciun membru date al clasei (adică nu poate modifica "this"):')}</p>

        <Code>{`class Date {
private:
    int x;
public:
    const int& GetX() const;  // const method
};

const int& Date::GetX() const {
    x = 0;       // ERROR: cannot modify x in const method
    return x;
}`}</Code>

        <Box type="definition">
          <p className="font-bold">mutable (C++11)</p>
          <p className="text-sm">{t('A specifier that allows a data member to be modified even inside a const method. Useful for multi-threading variables, lambda expressions, and selective write access.', 'Un specificator care permite modificarea unui membru date chiar și într-o metodă const. Util pentru variabile multi-threading, expresii lambda și acces selectiv de scriere.')}</p>
        </Box>

        <Code>{`class Date {
private:
    mutable int x;     // can be modified in const methods
    int y, z, t;       // cannot be modified in const methods
public:
    const int& GetX() const;
};

const int& Date::GetX() const {
    x = 0;       // OK: x is mutable
    return x;
}`}</Code>

        <p className="font-bold mt-4">{t('const with static members and other instances', 'const cu membri statici și alte instanțe')}</p>
        <Code>{`class Date {
private:
    static int x;
public:
    const int& GetX() const;
};
int Date::x = 100;
const int& Date::GetX() const {
    x = 0;       // OK: static members are not part of the instance
    return x;
}

// ERROR: const cannot be used on static methods
// (no "this" pointer to apply it to)
static const int& GetX() const;  // COMPILE ERROR`}</Code>

        <Code>{`// const applies only to "this", not other instances
class Date {
private:
    int x;
public:
    void ModifyX(Date * d) const {
        d->x = 0;      // OK: d is a different object
        this->x = 0;   // ERROR: "this" is const
    }
};`}</Code>

        <p className="font-bold mt-4">{t('const as part of object type', 'const ca parte a tipului obiectului')}</p>
        <Code>{`class Date {
private:
    int x;
public:
    void Inc();    // non-const method
};
void Date::Inc() { x++; }

void Increment(const Date &d) {
    d.Inc();       // ERROR: cannot call non-const method on const object
}`}</Code>

        <p className="font-bold mt-4">{t('const data members', 'Membri date const')}</p>
        <Code>{`class Data {
    const int x;       // ERROR: not initialized
public:
    int GetX() { return x; }
};

// Solution: initialize in the class definition
class Data {
    const int x = 10;  // OK
public:
    int GetX() { return x; }
};`}</Code>

        <Toggle
          question={t('Can a const method modify a static data member? Why?', 'Poate o metodă const să modifice un membru date static? De ce?')}
          answer={t('Yes. The "const" qualifier at the end of a method means the method cannot modify the current instance (this pointer). Static members belong to the class, not to any instance, so they are not affected by the const qualifier. However, a static method cannot have the const qualifier at all, because there is no "this" pointer to apply it to.', 'Da. Calificatorul "const" la sfârșitul unei metode înseamnă că metoda nu poate modifica instanța curentă (pointerul this). Membrii statici aparțin clasei, nu instanțelor, deci nu sunt afectați de calificatorul const. Totuși, o metodă statică nu poate avea deloc calificatorul const, deoarece nu există un pointer "this" căruia să i se aplice.')}
        />
      </Section>

      {/* ── 6. The "friend" Specifier ── */}
      <Section title={t('6. The "friend" Specifier', '6. Specificatorul "friend"')} id="oop-c2-friend" checked={!!checked['oop-c2-friend']} onCheck={() => toggleCheck('oop-c2-friend')}>
        <Box type="definition">
          <p className="font-bold">{t('friend specifier', 'Specificatorul friend')}</p>
          <p className="text-sm">{t('A "friend" function or class can access private and protected members of the class that declares it as a friend. A friend function does NOT belong to the class — access specifiers (public/private) are irrelevant for the friend declaration itself.', 'O funcție sau clasă "friend" poate accesa membrii privați și protejați ai clasei care o declară ca friend. O funcție friend NU aparține clasei — specificatorii de acces (public/private) sunt irelevanți pentru declarația friend în sine.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Friend function', 'Funcție friend')}</p>
        <Code>{`class Date {
    int x;
public:
    Date(int value) : x(value) {}
    friend void PrintDate(Date &d);  // friend declaration
};

// PrintDate is NOT a member of Date, but can access private x
void PrintDate(Date &d) {
    printf("X = %d\\n", d.x);  // OK: friend can access private
}

void main() {
    Date d1(1);
    PrintDate(d1);  // Output: X = 1
}`}</Code>

        <p className="font-bold mt-4">{t('Friend class', 'Clasă friend')}</p>
        <p className="text-sm">{t('The "friend" specifier can be applied to an entire class. All methods of the friend class can access private members of the original class:', 'Specificatorul "friend" poate fi aplicat unei clase întregi. Toate metodele clasei friend pot accesa membrii privați ai clasei originale:')}</p>

        <Code>{`class Date {
    int x;
public:
    Date(int value) : x(value) {}
    friend class Printer;  // entire Printer class is a friend
};

class Printer {
public:
    void PrintDecimal(Date &d) {
        printf("x = %d\\n", d.x);     // OK: Printer is friend of Date
    }
    void PrintHexadecimal(Date &d) {
        printf("x = %x\\n", d.x);     // OK
    }
};

void main() {
    Date d1(123);
    Printer p;
    p.PrintDecimal(d1);      // Output: x = 123
    p.PrintHexadecimal(d1);  // Output: x = 7b
}`}</Code>

        <p className="font-bold mt-4">{t('Friend method (specific method from another class)', 'Metodă friend (metodă specifică din altă clasă)')}</p>
        <p className="text-sm">{t('A single method from another class can be declared as a friend. The declaration must include the exact method signature and return type:', 'O singură metodă dintr-o altă clasă poate fi declarată ca friend. Declarația trebuie să includă semnătura exactă a metodei și tipul de retur:')}</p>

        <Code>{`class Data;  // forward declaration

class Modifier {
public:
    void SetX(Data & d, int value);
};

class Data {
    int x;
    int& GetXRef() { return x; }
public:
    int GetX() { return x; }
    friend void Modifier::SetX(Data &, int);  // only this method is friend
};

void Modifier::SetX(Data & d, int value) {
    d.GetXRef() = value;  // OK: can access private GetXRef()
}

void main() {
    Data d;
    Modifier m;
    m.SetX(d, 10);
    printf("%d\\n", d.GetX());  // Output: 10
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Important notes about friend:', 'Note importante despre friend:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>{t('Friendship is not symmetric: if A is a friend of B, B is NOT automatically a friend of A.', 'Prietenia nu este simetrică: dacă A este friend al lui B, B NU este automat friend al lui A.')}</li>
            <li>{t('Friendship is not transitive: if A is a friend of B and B is a friend of C, A is NOT automatically a friend of C.', 'Prietenia nu este tranzitivă: dacă A este friend al lui B și B este friend al lui C, A NU este automat friend al lui C.')}</li>
            <li>{t('The friend declaration can appear in any access section (public, private, protected) — it makes no difference.', 'Declarația friend poate apărea în orice secțiune de acces (public, private, protected) — nu face diferență.')}</li>
          </ul>
        </Box>

        <Toggle
          question={t('Why might you need a forward declaration ("class Data;") when using friend methods from another class?', 'De ce ai putea avea nevoie de o declarație forward ("class Data;") când folosești metode friend din altă clasă?')}
          answer={t('When class Modifier uses Data as a parameter type, the compiler needs to know that Data exists before Modifier is fully defined. However, Data cannot be fully defined first because it needs to reference Modifier::SetX in its friend declaration. The forward declaration "class Data;" tells the compiler that Data is a class that will be defined later, breaking the circular dependency.', 'Când clasa Modifier folosește Data ca tip de parametru, compilatorul trebuie să știe că Data există înainte ca Modifier să fie complet definit. Totuși, Data nu poate fi complet definit prima deoarece trebuie să refere Modifier::SetX în declarația friend. Declarația forward "class Data;" informează compilatorul că Data este o clasă care va fi definită mai târziu, rupând dependența circulară.')}
        />
      </Section>
    </>
  );
}
