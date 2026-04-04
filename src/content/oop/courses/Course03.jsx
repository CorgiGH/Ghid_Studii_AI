import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course03() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 3 — Topics:', 'Cursul 3 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Initialization Lists (recap)', 'Liste de inițializare (recapitulare)')}</li>
          <li>{t('Constructors', 'Constructori')}</li>
          <li>{t('Const & Reference Data Members', 'Membri date const și referință')}</li>
          <li>{t('Delegating Constructor', 'Constructor delegat')}</li>
          <li>{t('Value Types (glvalue, prvalue, xvalue, lvalue, rvalue)', 'Tipuri de valori (glvalue, prvalue, xvalue, lvalue, rvalue)')}</li>
          <li>{t('Copy & Move Constructors', 'Constructori de copiere și mutare')}</li>
          <li>{t('Constraints (delete, explicit, Singleton, friend)', 'Constrângeri (delete, explicit, Singleton, friend)')}</li>
        </ol>
      </Box>

      {/* ── 1. Initialization Lists ── */}
      <Section title={t('1. Initialization Lists', '1. Liste de inițializare')} id="oop-course_3-init-lists" checked={!!checked['oop-course_3-init-lists']} onCheck={() => toggleCheck('oop-course_3-init-lists')}>
        <Box type="definition">
          <p className="font-bold">{t('Initialization Lists', 'Liste de inițializare')}</p>
          <p className="text-sm">{t('Curly braces "{" and "}" can be used to initialize values. This method is called "Initialization lists".', 'Acoladele "{" și "}" pot fi folosite pentru a inițializa valori. Această metodă se numește "Liste de inițializare".')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Basic value initialization:', 'Inițializare de bază a valorilor:')}</p>
        <Code>{`// All three produce the same result: x = y = z = 5
int x = 5;
int y = { 5 };
int z = int { 5 };`}</Code>

        <p className="font-bold mt-3">{t('Array initialization:', 'Inițializarea tablourilor:')}</p>
        <Code>{`int x[3] = { 1, 2, 3 };        // x = [1, 2, 3]
int y[] = { 4, 5, 6 };         // y = [4, 5, 6] — size deduced as 3
int z[10] = { };                // z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
int t[10] = { 1, 2 };          // t = [1, 2, 0, 0, 0, 0, 0, 0, 0, 0]
int u[10] = { 15 };            // u = [15, 0, 0, 0, 0, 0, 0, 0, 0, 0]
int v[] = { 100 };             // v = [100] — size deduced as 1`}</Code>

        <Box type="theorem">
          <p>{t('If the initialization list is smaller than the array, the remaining elements are filled with the default value for that type (0 for int). The compiler tries to deduce the array size from the declaration when possible.', 'Dacă lista de inițializare este mai mică decât tabloul, elementele rămase sunt completate cu valoarea implicită pentru tipul respectiv (0 pentru int). Compilatorul încearcă să deducă dimensiunea tabloului din declarație când este posibil.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('Matrix initialization:', 'Inițializarea matricelor:')}</p>
        <Code>{`// OK — first dimension can be deduced
int x[][3] = { { 1, 2, 3 }, { 4, 5, 6 } };
int y[2][3] = { { 1, 2, 3 }, { 4, 5, 6 } };

// ERROR — only the first dimension can be left unknown
int x[][] = { { 1, 2, 3 }, { 4, 5, 6 } };
// error C2087: 'x': missing subscript`}</Code>

        <p className="font-bold mt-3">{t('Pointer initialization with new:', 'Inițializarea pointerilor cu new:')}</p>
        <Code>{`int *x = new int[3] {1, 2, 3};`}</Code>

        <Toggle
          question={t('What happens if you declare int arr[5] = { 1 }?', 'Ce se întâmplă dacă declari int arr[5] = { 1 }?')}
          answer={t('The first element is set to 1, and the remaining 4 elements are filled with 0 (the default value for int). Result: [1, 0, 0, 0, 0].', 'Primul element este setat la 1, iar celelalte 4 elemente sunt completate cu 0 (valoarea implicită pentru int). Rezultat: [1, 0, 0, 0, 0].')}
        />
      </Section>

      {/* ── 2. Constructors ── */}
      <Section title={t('2. Constructors', '2. Constructori')} id="oop-course_3-constructors" checked={!!checked['oop-course_3-constructors']} onCheck={() => toggleCheck('oop-course_3-constructors')}>
        <Box type="definition">
          <p className="font-bold">{t('Constructor', 'Constructor')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('A type-less function called whenever a class is created', 'O funcție fără tip apelată ori de câte ori o clasă este creată')}</li>
            <li>{t('Defined with the same name as the class and no return value', 'Definit cu același nume ca clasa și fără valoare returnată')}</li>
            <li>{t('A class may have multiple constructors (with different parameters)', 'O clasă poate avea mai mulți constructori (cu parametri diferiți)')}</li>
            <li>{t('A constructor cannot be static or constant', 'Un constructor nu poate fi static sau constant')}</li>
            <li>{t('A constructor without parameters is called the default constructor', 'Un constructor fără parametri se numește constructorul implicit')}</li>
            <li>{t('A constructor may have an access modifier (public, private, protected)', 'Un constructor poate avea un modificator de acces (public, private, protected)')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Three types of constructors:', 'Trei tipuri de constructori:')}</p>
        <Code>{`class MyClass {
    int x;
public:
    MyClass();                            // Default constructor
    MyClass(const MyClass & obj);         // Copy constructor
    MyClass(const MyClass && obj);        // Move constructor
};`}</Code>

        <p className="font-bold mt-3">{t('When is a constructor called?', 'Când este apelat un constructor?')}</p>
        <Code>{`class Date { ... };
void main() {
    Date d;                // constructor is called
    Date *d2 = new Date(); // constructor is called
    Date arr[100];         // constructor is called 100 times
    Date *d3;              // uninitialized pointer — constructor NOT called
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Constructor call order:', 'Ordinea apelurilor constructorului:')}</p>
          <p className="text-sm">{t('Global variables have their constructors called before main(). If a class contains member data with their own constructors, those constructors are called in the order of their declaration in the class, NOT the order they appear in the constructor initializer list.', 'Variabilele globale au constructorii apelați înainte de main(). Dacă o clasă conține membri date cu proprii constructori, acei constructori sunt apelați în ordinea declarării lor în clasă, NU în ordinea în care apar în lista de inițializare a constructorului.')}</p>
        </Box>

        <Code>{`class MyClass {
public:
    MyClass(const char * text) { printf("Ctor for: %s\\n", text); }
};

MyClass global("global variable");
void main() {
    printf("Entering main function\\n");
    MyClass local("local variable");
    MyClass * m = new MyClass("Heap variable");
}
// Output:
// Ctor for: global variable
// Entering main function
// Ctor for: local variable
// Ctor for: Heap variable`}</Code>

        <p className="font-bold mt-4">{t('Member initialization in constructors:', 'Inițializarea membrilor în constructori:')}</p>
        <Code>{`class Date {
    int x;
public:
    Date();
};
Date::Date() : x(100) { }  // x is initialized to 100`}</Code>

        <p className="mt-2">{t('If the data member type is another class, its constructor can be called similarly:', 'Dacă tipul membrului dat este altă clasă, constructorul acesteia poate fi apelat similar:')}</p>
        <Code>{`class MyClass {
    int x;
public:
    MyClass(int value) { this->x = value; }
};

class Date {
    MyClass m;
public:
    Date(): m(100) { }  // calls MyClass(100)
};`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Missing default constructor:', 'Constructor implicit lipsă:')}</p>
          <p className="text-sm">{t('If a class has no default constructor but has at least one other constructor, any class containing it as a data member must either: (A) explicitly call its constructor in ALL defined constructors, (B) add a default constructor, (C) remove all constructors, or (D) use initialization lists.', 'Dacă o clasă nu are constructor implicit dar are cel puțin un alt constructor, orice clasă care o conține ca membru dat trebuie fie: (A) să apeleze explicit constructorul în TOȚI constructorii definiți, (B) să adauge un constructor implicit, (C) să elimine toți constructorii, sau (D) să folosească liste de inițializare.')}</p>
        </Box>

        <Code>{`class MyClass {
    int x;
public:
    MyClass(int value) { this->x = value; }
    // NO default constructor!
};

class Date {
    MyClass m;
public:
    Date() : m(123) { }               // OK — explicitly calls MyClass(123)
    Date(int value) : m(value+10) { }  // OK — must also call it here!
};`}</Code>

        <p className="font-bold mt-4">{t('Initialization order matters:', 'Ordinea inițializării contează:')}</p>
        <Code>{`class Object {
    int x, y, z;
public:
    Object(int value) : x(value), y(x*x), z(value*y) {}
};
// Object o(10) => x=10, y=100, z=1000 (computed in declaration order)

class Object2 {
    int x, y, z;
public:
    Object2(int value) : y(value), z(value/2), x(y*z) {}
};
// Object2 o(10) => x=UNDEFINED! (x is first in declaration, but y,z not yet set)`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Important:', 'Important:')}</p>
          <p className="text-sm">{t('Data members are initialized in the order of their declaration in the class, NOT in the order they appear in the constructor initializer list. This can lead to undefined behavior if one member depends on another that has not been initialized yet.', 'Membrii date sunt inițializați în ordinea declarării lor în clasă, NU în ordinea în care apar în lista de inițializare a constructorului. Acest lucru poate duce la comportament nedefinit dacă un membru depinde de altul care nu a fost încă inițializat.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Composite object constructor order:', 'Ordinea constructorilor pentru obiecte compuse:')}</p>
        <Code>{`class Tree {
public:
    Tree(const char * name) { printf("Tree: %s\\n", name); }
};
class Car {
public:
    Car(const char * name) { printf("Car: %s\\n", name); }
};
class Animal {
public:
    Animal(const char * name) { printf("Animal: %s\\n", name); }
};

class Object {
    Tree t; Car c; Animal a;  // declaration order: Tree, Car, Animal
public:
    Object(): t("oak"), a("fox"), c("Toyota") {}
    // initializer list order: tree, animal, car
    // BUT actual order follows declaration: Tree, Car, Animal
};
// Output: Tree: oak / Car: Toyota / Animal: fox`}</Code>

        <Toggle
          question={t('If a class has no constructors and all data members have default constructors, what happens?', 'Dacă o clasă nu are constructori și toți membrii date au constructori impliciți, ce se întâmplă?')}
          answer={t('The compiler generates a default constructor that calls the default constructor for each data member, in the order of their declaration in the class.', 'Compilatorul generează un constructor implicit care apelează constructorul implicit pentru fiecare membru dat, în ordinea declarării lor în clasă.')}
        />
      </Section>

      {/* ── 3. Const & Reference Data Members ── */}
      <Section title={t('3. Const & Reference Data Members', '3. Membri date const și referință')} id="oop-course_3-const-ref" checked={!!checked['oop-course_3-const-ref']} onCheck={() => toggleCheck('oop-course_3-const-ref')}>
        <Box type="definition">
          <p className="font-bold">{t('Rule', 'Regulă')}</p>
          <p className="text-sm">{t('A class that contains at least one const data member or a reference data member must have a constructor where these members are initialized. They MUST be initialized in the constructor initializer list, NOT in the constructor body.', 'O clasă care conține cel puțin un membru dat const sau un membru dat referință trebuie să aibă un constructor în care acești membri sunt inițializați. Aceștia TREBUIE inițializați în lista de inițializare a constructorului, NU în corpul constructorului.')}</p>
        </Box>

        <Code>{`// This will NOT compile — const/reference members not initialized
class Date {
    int x;
    const int y;  // const member without initialization
public:
};
// error: 'Date::Date(void)': function was implicitly deleted because
// 'Date' has an uninitialized const-qualified data member`}</Code>

        <Code>{`// This will NOT compile — y not initialized in constructor
class Date {
    int x;
    const int y;
public:
    Date();
};
Date::Date() : x(100) { }  // ERROR: y must also be initialized`}</Code>

        <Code>{`// Correct: both x and y initialized
class Date {
    int x;
    const int y;
public:
    Date();
};
Date::Date() : x(100), y(123) { }  // OK!`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Every constructor must initialize const/reference members:', 'Fiecare constructor trebuie să inițializeze membrii const/referință:')}</p>
          <p className="text-sm">{t('If a class has multiple constructors, EVERY one of them must initialize all const and reference data members. A const member can be initialized with a non-constant expression (e.g., value*value).', 'Dacă o clasă are mai mulți constructori, FIECARE dintre ei trebuie să inițializeze toți membrii date const și referință. Un membru const poate fi inițializat cu o expresie non-constantă (ex: value*value).')}</p>
        </Box>

        <Code>{`class Date {
    int x;
    const int y;
public:
    Date();
    Date(int value);
};
Date::Date() : x(100), y(123) { }
Date::Date(int value) : x(value), y(value*value) { }  // const from non-const!`}</Code>

        <Code>{`// References work similarly:
class Date {
    int x;
    int & y;
public:
    Date();
    Date(int value);
};
Date::Date() : x(100), y(x) { }              // y references x
Date::Date(int value) : x(value), y(value) { } // y references value`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Cannot initialize in constructor body:', 'Nu se poate inițializa în corpul constructorului:')}</p>
          <p className="text-sm">{t('Const and reference members MUST be initialized using the constructor initializer list, not with assignment in the constructor body.', 'Membrii const și referință TREBUIE inițializați folosind lista de inițializare a constructorului, nu prin atribuire în corpul constructorului.')}</p>
        </Box>

        <Code>{`// ERROR — cannot assign in constructor body
Date::Date() : x(100) { y = 123; }
// error C2789: 'Date::y': an object of const-qualified type must be initialized`}</Code>

        <p className="font-bold mt-3">{t('C++11: In-class initialization:', 'C++11: Inițializare în clasă:')}</p>
        <Code>{`// Since C++11, const/reference members can be initialized at declaration
class Date {
    int x;
    const int y = 123;       // default value, can be overridden in constructor
    int & ref = x;           // default reference
public:
    Date();
    Date(int value);
};
Date::Date() : x(100) { }                           // y=123 (default)
Date::Date(int value) : x(value), y(value*value) { } // y overridden`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Danger: const reference to literal:', 'Pericol: referință const la literal:')}</p>
          <p className="text-sm">{t('Initializing a const reference with a literal (e.g., y(123)) creates a reference to a temporary value on the stack. After the constructor returns, the reference points to invalid memory. Calling methods that modify the stack can change the referenced value unexpectedly.', 'Inițializarea unei referințe const cu un literal (ex: y(123)) creează o referință la o valoare temporară pe stivă. După ce constructorul returnează, referința indică memorie invalidă. Apelarea metodelor care modifică stiva poate schimba valoarea referită în mod neașteptat.')}</p>
        </Box>

        <Code>{`class Date {
public:
    const int & y;
    Date() : y(123) {}        // y points to stack value 123
    void Test() {
        int a[1000];
        for (int tr = 0; tr < 1000; tr++) a[tr] = 50;
    }
};
void main() {
    Date d;
    printf("%d\\n", d.y);  // prints 123
    d.Test();              // overwrites stack
    printf("%d\\n", d.y);  // prints 50! (stack was overwritten)
}`}</Code>

        <Toggle
          question={t('Can a non-const reference member be initialized with a constant value like 123?', 'Poate un membru referință non-const să fie inițializat cu o valoare constantă precum 123?')}
          answer={t('No. A non-const reference cannot be bound to a literal/constant value. Only a const reference can (Date() : y(123) {} works only if y is "const int &"). However, even const references to literals are dangerous because they point to temporary stack values.', 'Nu. O referință non-const nu poate fi legată de o valoare literală/constantă. Doar o referință const poate (Date() : y(123) {} funcționează doar dacă y este "const int &"). Totuși, chiar și referințele const la literali sunt periculoase deoarece indică valori temporare pe stivă.')}
        />
      </Section>

      {/* ── 4. Delegating Constructor ── */}
      <Section title={t('4. Delegating Constructor', '4. Constructor delegat')} id="oop-course_3-delegating" checked={!!checked['oop-course_3-delegating']} onCheck={() => toggleCheck('oop-course_3-delegating')}>
        <Box type="definition">
          <p className="font-bold">{t('Delegating Constructor', 'Constructor delegat')}</p>
          <p className="text-sm">{t('A constructor can call another constructor of the same class during its initialization. This is called constructor delegation.', 'Un constructor poate apela un alt constructor al aceleiași clase în timpul inițializării sale. Aceasta se numește delegare de constructor.')}</p>
        </Box>

        <Code>{`class Object {
    int x, y;
public:
    Object(int value) : x(value), y(value) {}
    Object() : Object(0) { }  // delegates to Object(int)
};
// Object o; => calls Object() which calls Object(0) => x=0, y=0`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Restriction:', 'Restricție:')}</p>
          <p className="text-sm">{t('When calling a delegating constructor, no other member initializations are allowed in the same initializer list. The delegating call must be the ONLY item in the initializer list.', 'Când se apelează un constructor delegat, nu sunt permise alte inițializări de membri în aceeași listă de inițializare. Apelul delegat trebuie să fie SINGURUL element din lista de inițializare.')}</p>
        </Box>

        <Code>{`// ERROR — cannot mix delegation with other initializations
class Object {
    int x, y;
public:
    Object(int value) : x(value), y(value) {}
    Object() : Object(0), y(1) { }  // ERROR!
};
// error C3511: a call to a delegating constructor shall be
// the only member-initializer`}</Code>

        <p className="mt-3">{t('However, you CAN modify members in the constructor body after delegation:', 'Totuși, PUTEȚI modifica membrii în corpul constructorului după delegare:')}</p>
        <Code>{`class Object {
    int x, y;
public:
    Object(int value) : x(value), y(value+5) {}
    Object() : Object(0) { y = 1; }  // OK — y modified in body
};
// Object o; => y is first set to 5 by Object(0), then overwritten to 1`}</Code>

        <Code>{`// y is initialized by delegation, then modified in body
class Object {
    int x, y;
public:
    Object(int value) : x(value), y(value+5) {}
    Object() : Object(0) { y += 5; }  // y = 5 (from delegation) + 5 = 10
};`}</Code>

        <Box type="theorem">
          <p>{t('Const or reference data members must NOT be initialized in all constructors if delegation is used. Since the delegated constructor already initializes them, the delegating constructor must not do so again.', 'Membrii date const sau referință NU trebuie inițializați în toți constructorii dacă se folosește delegarea. Deoarece constructorul delegat îi inițializează deja, constructorul care deleghează nu trebuie să o facă din nou.')}</p>
        </Box>

        <Code>{`class Object {
    int x, y;
    const int z;
public:
    Object(int value) : x(value), y(value), z(value) {}
    Object() : Object(0) { y = 1; }  // z is already set by Object(0)
};`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Circular delegation:', 'Delegare circulară:')}</p>
          <p className="text-sm">{t('It is possible to create circular constructor delegation (A calls B which calls A). The code will compile, but at runtime the stack will overflow due to infinite recursion, causing a crash (e.g., segmentation fault).', 'Este posibil să se creeze delegare circulară de constructori (A apelează B care apelează A). Codul va compila, dar la rulare stiva se va umple din cauza recursiei infinite, provocând un crash (ex: segmentation fault).')}</p>
        </Box>

        <Code>{`// DANGER: circular delegation — compiles but crashes at runtime!
class Object {
    int x, y;
public:
    Object(int value) : Object() {}   // calls Object()
    Object() : Object(0) { }          // calls Object(int) => infinite loop!
};`}</Code>

        <Toggle
          question={t('Can you mix a delegating constructor call with other member initializations in the initializer list?', 'Poți combina un apel de constructor delegat cu alte inițializări de membri în lista de inițializare?')}
          answer={t('No. A delegating constructor call must be the only item in the initializer list. However, you can modify members in the constructor body after the delegation call.', 'Nu. Un apel de constructor delegat trebuie să fie singurul element din lista de inițializare. Totuși, puteți modifica membrii în corpul constructorului după apelul de delegare.')}
        />
      </Section>

      {/* ── 5. Value Types ── */}
      <Section title={t('5. Value Types', '5. Tipuri de valori')} id="oop-course_3-value-types" checked={!!checked['oop-course_3-value-types']} onCheck={() => toggleCheck('oop-course_3-value-types')}>
        <Box type="definition">
          <p className="font-bold">{t('Value Categories', 'Categorii de valori')}</p>
          <p className="text-sm">{t('When an expression is evaluated, each of its terms is associated with a value type. This helps the compiler understand how to use that value and what methods/functions can be used for overload resolution. There are 5 such types:', 'Când o expresie este evaluată, fiecărui termen i se asociază un tip de valoare. Acest lucru ajută compilatorul să înțeleagă cum să folosească valoarea și ce metode/funcții pot fi utilizate pentru rezoluția supraîncărcării. Există 5 astfel de tipuri:')}</p>
        </Box>

        <Box type="formula">
          <p className="font-bold">{t('Value type hierarchy:', 'Ierarhia tipurilor de valori:')}</p>
          <p className="text-sm font-mono mt-1">{'glvalue = lvalue OR xvalue'}</p>
          <p className="text-sm font-mono">{'rvalue  = prvalue OR xvalue'}</p>
          <p className="text-sm font-mono">{'lvalue  = glvalue AND NOT xvalue'}</p>
        </Box>

        <p className="font-bold mt-3">{t('glvalue (generalized lvalue)', 'glvalue (lvalue generalizat)')}</p>
        <p className="text-sm">{t('An expression that results in an object — refers to a memory location. Examples:', 'O expresie care rezultă într-un obiect — se referă la o locație de memorie. Exemple:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
          <li>{t('Assignment: a = <expression> (a is a glvalue)', 'Atribuire: a = <expresie> (a este un glvalue)')}</li>
          <li>{t('Pre-increment/decrement: ++a, --a', 'Pre-incrementare/decrementare: ++a, --a')}</li>
          <li>{t('Array element: a[n]', 'Element de tablou: a[n]')}</li>
          <li>{t('Function returning a reference: int& GetSomething()', 'Funcție care returnează referință: int& GetSomething()')}</li>
        </ul>

        <p className="font-bold mt-3">{t('prvalue (pure rvalue)', 'prvalue (rvalue pur)')}</p>
        <p className="text-sm">{t('An expression that reflects a value, not a memory location. Examples:', 'O expresie care reflectă o valoare, nu o locație de memorie. Exemple:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
          <li>{t('Numerical constants: 10, 100, true, false, nullptr', 'Constante numerice: 10, 100, true, false, nullptr')}</li>
          <li>{t('Post-increment/decrement: a++, a--', 'Post-incrementare/decrementare: a++, a--')}</li>
          <li>{t('Function returning a value: int GetSomething()', 'Funcție care returnează o valoare: int GetSomething()')}</li>
        </ul>

        <p className="font-bold mt-3">{t('xvalue (eXpiring value)', 'xvalue (valoare care expiră)')}</p>
        <p className="text-sm">{t('An expression that results in a temporary object that can be reused:', 'O expresie care rezultă într-un obiect temporar care poate fi reutilizat:')}</p>
        <Code>{`int a = 10 + 20 + 30;
// Step 1: 10 + 20 => Temp-1 (xvalue)
// Step 2: Temp-1 + 30 => Temp-2 (xvalue)
// Step 3: a = Temp-2
// "a" is a glvalue, "10","20","30" are prvalues
// Temp-1 and Temp-2 are xvalues`}</Code>

        <Box type="theorem">
          <p>{t('In practice, temporary values (xvalues) can be reused rather than creating new temporaries, improving performance. For example: Temp-1 = 10+20; Temp-1 = Temp-1+30; a = Temp-1.', 'În practică, valorile temporare (xvalues) pot fi reutilizate în loc să se creeze noi temporare, îmbunătățind performanța. De exemplu: Temp-1 = 10+20; Temp-1 = Temp-1+30; a = Temp-1.')}</p>
        </Box>

        <p className="font-bold mt-3">{t('lvalue and rvalue:', 'lvalue și rvalue:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>lvalue</strong> — {t('A glvalue that is NOT an xvalue. Named because it refers to the left side of an expression.', 'Un glvalue care NU este un xvalue. Numit astfel deoarece se referă la partea stângă a unei expresii.')}</li>
          <li><strong>rvalue</strong> — {t('A prvalue OR an xvalue. Named because it refers to the right side of an expression.', 'Un prvalue SAU un xvalue. Numit astfel deoarece se referă la partea dreaptă a unei expresii.')}</li>
        </ul>

        <Code>{`int a = 10;
int b;
b = (a += 20) + 10;
// "a" and "b" are lvalues (and glvalues)
// "20" and "10" are prvalues (and rvalues)`}</Code>

        <Box type="formula">
          <p className="font-bold">{t('Summary of categories:', 'Rezumatul categoriilor:')}</p>
          <p className="text-sm mt-1">{t('Primary categories: glvalue, xvalue, prvalue', 'Categorii primare: glvalue, xvalue, prvalue')}</p>
          <p className="text-sm">{t('Mixed categories: lvalue (= glvalue - xvalue), rvalue (= prvalue + xvalue)', 'Categorii mixte: lvalue (= glvalue - xvalue), rvalue (= prvalue + xvalue)')}</p>
          <p className="text-sm mt-1">{t('A glvalue can be converted to a prvalue (lvalue-to-rvalue conversion) — reading the value at a memory location.', 'Un glvalue poate fi convertit la un prvalue (conversie lvalue-la-rvalue) — citirea valorii la o locație de memorie.')}</p>
        </Box>

        <Toggle
          question={t('Is the expression "a++" an lvalue or a prvalue?', 'Expresia "a++" este un lvalue sau un prvalue?')}
          answer={t('a++ is a prvalue. Post-increment returns the old value (a copy), not a reference to the variable. In contrast, ++a is a glvalue because it returns a reference to the modified variable.', 'a++ este un prvalue. Post-incrementarea returnează valoarea veche (o copie), nu o referință la variabilă. În contrast, ++a este un glvalue deoarece returnează o referință la variabila modificată.')}
        />
      </Section>

      {/* ── 6. Copy & Move Constructors ── */}
      <Section title={t('6. Copy & Move Constructors', '6. Constructori de copiere și mutare')} id="oop-course_3-copy-move" checked={!!checked['oop-course_3-copy-move']} onCheck={() => toggleCheck('oop-course_3-copy-move')}>
        <Box type="definition">
          <p className="font-bold">{t('Copy Constructor', 'Constructorul de copiere')}</p>
          <p className="text-sm">{t('A constructor with only one parameter that is a reference (const or non-const) to the same class. Used when creating an object from an existing one.', 'Un constructor cu un singur parametru care este o referință (const sau non-const) la aceeași clasă. Folosit la crearea unui obiect dintr-unul existent.')}</p>
        </Box>

        <Code>{`class Date {
    int value;
public:
    Date(const Date &d) { value = d.value; }  // copy constructor
    Date(int v) { value = v; }
};

int main() {
    Date d(1);
    Date d2 = d;  // copy constructor called
    return 0;
}`}</Code>

        <p className="font-bold mt-3">{t('When is the copy constructor called?', 'Când este apelat constructorul de copiere?')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('When creating an object from another: Date d2 = d;', 'La crearea unui obiect din altul: Date d2 = d;')}</li>
          <li>{t('When passing an object by value to a function: void Process(Date d)', 'La transmiterea unui obiect prin valoare unei funcții: void Process(Date d)')}</li>
          <li>{t('When a function returns an object by value: Date Process() { ... return d; }', 'Când o funcție returnează un obiect prin valoare: Date Process() { ... return d; }')}</li>
        </ul>

        <Code>{`// Copy constructor called when passing by value
void Process(Date d) { ... }  // d is a COPY

int main() {
    Date d(1);
    Process(d);  // copy constructor called
    return 0;
}`}</Code>

        <p className="font-bold mt-3">{t('Const vs non-const copy constructor:', 'Constructor de copiere const vs non-const:')}</p>
        <Code>{`class Date {
    int x;
public:
    Date(const Date &d) { x = d.x; }       // const copy ctor
    Date(Date &d) { x = d.x * 2; }         // non-const copy ctor
    Date(int v) { x = v; }
};
// Warning: "multiple copy constructors specified"
// Best practice: use the const version (more generic)`}</Code>

        <Box type="theorem">
          <p>{t('If both const and non-const copy constructors exist, the compiler chooses the best fit. A non-const reference can be converted to const, but NOT vice versa. If only a non-const copy constructor exists and the source is const, the code will NOT compile.', 'Dacă ambii constructori de copiere const și non-const există, compilatorul alege cea mai bună potrivire. O referință non-const poate fi convertită la const, dar NU invers. Dacă există doar un constructor de copiere non-const și sursa este const, codul NU va compila.')}</p>
        </Box>

        <Code>{`// No copy constructor defined — compiler generates a memcpy-like copy
class Date {
    int x;
public:
    Date(int v) { x = v; }
};
const Date d(1);
Date d2 = d;  // compiler copies bytes: mov eax,[d] / mov [d2],eax`}</Code>

        <p className="font-bold mt-4">{t('Move Constructor', 'Constructorul de mutare')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Move Constructor', 'Constructor de mutare')}</p>
          <p className="text-sm">{t('Declared using "&&" to refer to a temporary (xvalue). Used to reuse allocated memory instead of copying it. If no move constructor exists but a copy constructor does, the compiler uses the copy constructor for temporary values.', 'Declarat folosind "&&" pentru a se referi la o valoare temporară (xvalue). Folosit pentru a reutiliza memoria alocată în loc să o copieze. Dacă nu există un constructor de mutare dar există unul de copiere, compilatorul folosește constructorul de copiere pentru valori temporare.')}</p>
        </Box>

        <Code>{`class Date {
    char * pointer;
public:
    Date(Date && d) {
        // "steal" the pointer instead of copying
        char * temp = d.pointer;
        d.pointer = nullptr;
        this->pointer = temp;
    }
};`}</Code>

        <p className="font-bold mt-3">{t('Why move constructors matter — the problem:', 'De ce contează constructorii de mutare — problema:')}</p>
        <Code>{`char * DuplicateString(const char * string) {
    char * result = new char[strlen(string) + 1];
    memcpy(result, string, strlen(string) + 1);
    return result;
}

class Date {
    char * sir;
public:
    Date(const Date &d) {
        sir = DuplicateString(d.sir);  // allocates NEW memory
        printf("COPY-CTOR: Copy sir from %p to %p\\n", d.sir, sir);
    }
    Date(const char * tmp) {
        sir = DuplicateString(tmp);
        printf("CTOR: Allocate sir to %p\\n", sir);
    }
};

Date Get(Date d) { return d; }
int main() {
    Date d = Get(Date("test"));  // allocates memory TWICE!
    return 0;
}
// Output (without move ctor):
// CTOR: Allocate sir to 00AB0610
// COPY-CTOR: Copy sir from 00AB0610 to 00AB0648`}</Code>

        <p className="font-bold mt-3">{t('The solution — move constructor:', 'Soluția — constructorul de mutare:')}</p>
        <Code>{`class Date {
    char * sir;
public:
    Date(const Date &d) {
        sir = DuplicateString(d.sir);
        printf("COPY-CTOR: Copy sir from %p to %p\\n", d.sir, sir);
    }
    Date(Date &&d) {
        printf("Move from %p to %p\\n", &d, this);
        sir = d.sir;
        d.sir = nullptr;  // "steal" the pointer
    }
    Date(const char * tmp) {
        sir = DuplicateString(tmp);
        printf("CTOR: Allocate sir to %p\\n", sir);
    }
};

Date Get(Date d) { return d; }
int main() {
    Date d = Get(Date("test"));  // only ONE allocation!
    return 0;
}
// Output (with move ctor):
// CTOR: Allocate sir to 00AB0610
// Move from 00AB0610 to 00D8FE04`}</Code>

        <Box type="theorem">
          <p>{t('The move constructor avoids unnecessary memory allocation by "stealing" resources from temporary objects. Instead of allocating new memory and copying data, it simply takes the pointer from the source and sets the source pointer to nullptr.', 'Constructorul de mutare evită alocarea inutilă de memorie prin "furtul" resurselor din obiectele temporare. În loc să aloce memorie nouă și să copieze datele, pur și simplu preia pointerul de la sursă și setează pointerul sursei la nullptr.')}</p>
        </Box>

        <Toggle
          question={t('When is the move constructor called instead of the copy constructor?', 'Când este apelat constructorul de mutare în loc de cel de copiere?')}
          answer={t('The move constructor is called for temporary values (xvalues) — objects that are about to expire and whose resources can be safely "stolen". If no move constructor is defined but a copy constructor exists, the copy constructor is used instead. The move constructor is never used for lvalues.', 'Constructorul de mutare este apelat pentru valori temporare (xvalues) — obiecte care urmează să expire și ale căror resurse pot fi "furate" în siguranță. Dacă nu este definit un constructor de mutare dar există un constructor de copiere, se folosește constructorul de copiere. Constructorul de mutare nu este niciodată folosit pentru lvalues.')}
        />
      </Section>

      {/* ── 7. Constraints ── */}
      <Section title={t('7. Constraints', '7. Constrângeri')} id="oop-course_3-constraints" checked={!!checked['oop-course_3-constraints']} onCheck={() => toggleCheck('oop-course_3-constraints')}>
        <Box type="definition">
          <p className="font-bold">{t('Singleton Pattern', 'Pattern-ul Singleton')}</p>
          <p className="text-sm">{t('A class that can only have one instance. Combines a private constructor with a static factory method.', 'O clasă care poate avea o singură instanță. Combină un constructor privat cu o metodă statică de fabricare.')}</p>
        </Box>

        <Code>{`class Object {
    int value;
    static Object* instance;
    Object() { value = 0; }  // private constructor!
public:
    static Object* GetInstance();
};
Object* Object::instance = nullptr;

Object* Object::GetInstance() {
    if (instance == nullptr)
        instance = new Object();  // static method CAN access private ctor
    return instance;
}

void main() {
    Object *obj1 = Object::GetInstance();
    Object *obj2 = Object::GetInstance();
    Object *obj3 = Object::GetInstance();
    // obj1 == obj2 == obj3 (same pointer!)

    // Object obj;             // ERROR: constructor is private
    // Object * o = new Object(); // ERROR: constructor is private
}`}</Code>

        <p className="font-bold mt-4">{t('Friend classes with private constructors:', 'Clase friend cu constructori privați:')}</p>
        <Code>{`class Object {
    int value;
    Object(): value(0) { }    // private constructor
    friend class ObjectUser;   // ObjectUser can access private members
};

class ObjectUser {
public:
    int GetValue();
};

int ObjectUser::GetValue() {
    Object o;          // OK — ObjectUser is a friend
    return o.value;    // OK — can access private members
}

void main() {
    ObjectUser ou;
    printf("%d\\n", ou.GetValue());  // prints 0

    // Object obj;  // ERROR: Object::Object is private
}`}</Code>

        <p className="font-bold mt-4">{t('The delete keyword:', 'Cuvântul cheie delete:')}</p>

        <Box type="definition">
          <p className="font-bold">= delete</p>
          <p className="text-sm">{t('Tells the compiler that a specific function/constructor does not exist and should not be generated. More restrictive than making it private — even static methods of the same class cannot call a deleted function.', 'Spune compilatorului că o funcție/constructor specific nu există și nu ar trebui generat. Mai restrictiv decât a-l face privat — nici măcar metodele statice ale aceleiași clase nu pot apela o funcție deleted.')}</p>
        </Box>

        <Code>{`// Prevent creating instances of a utility class
class Date {
public:
    Date() = delete;  // NO default constructor at all
    static int Suma(int x, int y) { return x + y; }
    static int Dif(int x, int y) { return x - y; }
    static int Mul(int x, int y) { return x * y; }
};

int main() {
    // Date d;  // ERROR: attempting to reference a deleted function
    printf("%d\\n", Date::Suma(10, 20));  // OK — static methods work
}`}</Code>

        <Code>{`// Prevent specific parameter types via delete
class Date {
    int value;
public:
    Date(char x) = delete;            // disallow char parameter
    Date(int x) { value = x; }        // allow int parameter
};

int main() {
    // Date d('0');  // ERROR: Date::Date(char) is deleted
    Date d2(100);    // OK
    return 0;
}`}</Code>

        <p className="font-bold mt-4">{t('The explicit keyword:', 'Cuvântul cheie explicit:')}</p>

        <Box type="definition">
          <p className="font-bold">explicit</p>
          <p className="text-sm">{t('Forces the use of constructor-based initialization instead of initialization lists. Prevents implicit conversions via constructors.', 'Forțează utilizarea inițializării bazate pe constructor în loc de liste de inițializare. Previne conversiile implicite prin constructori.')}</p>
        </Box>

        <Code>{`// Without explicit — initialization list works:
class Date {
    int value;
public:
    Date(int v1, int v2, int v3) { value = v1+v2+v3; }
};
Date d = { 1, 2, 3 };  // OK — calls constructor via init list`}</Code>

        <Code>{`// With explicit — initialization list is blocked:
class Date {
    int value;
public:
    explicit Date(int v1, int v2, int v3) { value = v1+v2+v3; }
};
// Date d = { 1, 2, 3 };  // ERROR: cannot use explicit constructor
Date d(1, 2, 3);           // OK — direct constructor call`}</Code>

        <Box type="theorem">
          <p>{t('The explicit keyword is useful for backward compatibility with older C++ standards and to prevent unintended implicit conversions. A single-parameter constructor without explicit allows "Date d = 100;" which may not be the desired behavior.', 'Cuvântul cheie explicit este util pentru compatibilitate cu standardele C++ mai vechi și pentru a preveni conversii implicite nedorite. Un constructor cu un singur parametru fără explicit permite "Date d = 100;" ceea ce poate să nu fie comportamentul dorit.')}</p>
        </Box>

        <Toggle
          question={t('What is the difference between making a constructor private and using "= delete"?', 'Care este diferența între a face un constructor privat și a folosi "= delete"?')}
          answer={t('A private constructor can still be called from within the class itself (e.g., by static methods or friend classes). A deleted constructor cannot be called by anyone — the compiler treats it as if it does not exist at all. Use private for patterns like Singleton; use delete to completely prevent instantiation.', 'Un constructor privat poate fi încă apelat din interiorul clasei (ex: de metode statice sau clase friend). Un constructor deleted nu poate fi apelat de nimeni — compilatorul îl tratează ca și cum nu ar exista deloc. Folosiți private pentru pattern-uri precum Singleton; folosiți delete pentru a preveni complet instanțierea.')}
        />
      </Section>
    </>
  );
}
