import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course05() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 5 — Topics:', 'Cursul 5 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Inheritance: concepts, syntax, access modifiers, constructor/destructor order', 'Moștenire: concepte, sintaxă, modificatori de acces, ordinea constructorilor/destructorilor')}</li>
          <li>{t('Virtual methods: polymorphism, override, final, virtual destructors', 'Metode virtuale: polimorfism, override, final, destructori virtuali')}</li>
          <li>{t('How virtual methods are modeled by the C++ compiler (vtables, vfptr)', 'Cum sunt modelate metodele virtuale de compilatorul C++ (vtable, vfptr)')}</li>
          <li>{t('Covariance: covariant return types in virtual methods', 'Covarianță: tipuri de retur covariante în metode virtuale')}</li>
          <li>{t('Abstract classes (Interfaces): pure virtual methods', 'Clase abstracte (Interfețe): metode pur virtuale')}</li>
          <li>{t('Memory alignment in case of inheritance', 'Alinierea memoriei în cazul moștenirii')}</li>
        </ol>
      </Box>

      {/* ── 1. Inheritance ── */}
      <Section title={t('1. Inheritance', '1. Moștenire')} id="oop-course_5-inheritance" checked={!!checked['oop-course_5-inheritance']} onCheck={() => toggleCheck('oop-course_5-inheritance')}>
        <Box type="definition">
          <p className="font-bold">{t('Inheritance', 'Moștenire')}</p>
          <p className="text-sm">{t('Inheritance is a process that transfers class properties (methods and members) from one class (the base class) to another that inherits it (the derived class). The derived class may extend the base class by adding additional methods and/or members.', 'Moștenirea este un proces care transferă proprietățile clasei (metode și membri) de la o clasă (clasa de bază) la alta care o moștenește (clasa derivată). Clasa derivată poate extinde clasa de bază adăugând metode și/sau membri suplimentari.')}</p>
        </Box>

        <p className="mt-3">{t('Example: a class Automobile with properties (doors, wheels, size) can be derived into ElectricCar which adds battery lifetime.', 'Exemplu: o clasă Automobil cu proprietăți (uși, roți, dimensiune) poate fi derivată în MașinăElectrică care adaugă durata bateriei.')}</p>

        <p className="font-bold mt-3">{t('Inheritance syntax:', 'Sintaxa moștenirii:')}</p>
        <Code>{`// Simple Inheritance
class Derived : public Base { ... };

// Multiple Inheritance
class Derived : public Base1, public Base2, ... { ... };

// The access modifier is optional (default is private)`}</Code>

        <p className="mt-3">{t('The derived class inherits members and methods from the base class:', 'Clasa derivată moștenește membrii și metodele clasei de bază:')}</p>
        <Code>{`class Base {
public:
    int x;
    void SetX(int value);
};
class Derived : public Base {
    int y;
public:
    void SetY(int value);
};

void main() {
    Derived d;
    d.SetX(100);  // inherited from Base
    d.x = 10;     // inherited public member
    d.SetY(200);  // own method
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Private members are NOT accessible in derived classes!', 'Membrii private NU sunt accesibili în clasele derivate!')}</p>
          <p className="text-sm">{t('If "x" is private in Base, attempting to access it in Derived produces: error C2248: cannot access private member declared in class \'Base\'. Use "protected" instead — it allows access from derived classes but not from outside.', 'Dacă "x" este private în Base, încercarea de acces în Derived produce: error C2248: cannot access private member declared in class \'Base\'. Folosiți "protected" — permite accesul din clasele derivate dar nu din exterior.')}</p>
        </Box>

        <Code>{`class Base {
protected:          // accessible in derived classes
    int x;
};
class Derived : public Base {
    int y;
public:
    void SetX(int value);
};
void Derived::SetX(int value) {
    x = value;     // OK: x is protected
}
void main() {
    Derived d;
    d.SetX(100);   // OK
    // d.x = 100;  // ERROR: x is protected, not accessible outside
}`}</Code>

        <Box type="definition">
          <p className="font-bold">{t('Access Modifier Table', 'Tabelul modificatorilor de acces')}</p>
          <div className="overflow-x-auto mt-2">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <th className="text-left p-2">{t('Modifier', 'Modificator')}</th>
                  <th className="text-left p-2">{t('Same class', 'Aceeași clasă')}</th>
                  <th className="text-left p-2">{t('Derived class', 'Clasă derivată')}</th>
                  <th className="text-left p-2">{t('Outside', 'Exterior')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2"><strong>public</strong></td><td className="p-2">{t('Yes', 'Da')}</td><td className="p-2">{t('Yes', 'Da')}</td><td className="p-2">{t('Yes', 'Da')}</td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2"><strong>protected</strong></td><td className="p-2">{t('Yes', 'Da')}</td><td className="p-2">{t('Yes', 'Da')}</td><td className="p-2">{t('No', 'Nu')}</td>
                </tr>
                <tr>
                  <td className="p-2"><strong>private</strong></td><td className="p-2">{t('Yes', 'Da')}</td><td className="p-2">{t('No', 'Nu')}</td><td className="p-2">{t('No', 'Nu')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Box>

        <p className="font-bold mt-4">{t('Inheritance access modifier rules:', 'Regulile modificatorilor de acces la moștenire:')}</p>
        <p className="text-sm">{t('Access modifiers can also be applied to the inheritance relation itself. The resulting access level in the derived class follows this table:', 'Modificatorii de acces pot fi aplicați și relației de moștenire. Nivelul de acces rezultat în clasa derivată urmează acest tabel:')}</p>

        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Member \\ Inheritance', 'Membru \\ Moștenire')}</th>
                <th className="text-left p-2">public</th>
                <th className="text-left p-2">private</th>
                <th className="text-left p-2">protected</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2"><strong>public</strong></td><td className="p-2">public</td><td className="p-2">private</td><td className="p-2">protected</td>
              </tr>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <td className="p-2"><strong>private</strong></td><td className="p-2">private</td><td className="p-2">private</td><td className="p-2">private</td>
              </tr>
              <tr>
                <td className="p-2"><strong>protected</strong></td><td className="p-2">protected</td><td className="p-2">private</td><td className="p-2">protected</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Box type="formula">
          <p className="font-bold">{t('Rule:', 'Regulă:')}</p>
          <p className="text-sm font-mono">private {'>'} protected {'>'} public</p>
          <p className="text-sm">{t('The resulting access level is the more restrictive of the two.', 'Nivelul de acces rezultat este cel mai restrictiv dintre cele două.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Constructor / Destructor Order', 'Ordinea constructorilor / destructorilor')}</p>

        <Code>{`class A {
public:
    A() { printf("ctor: A is called!\\n"); }
    ~A() { printf("dtor: A is called!\\n"); }
};
class B : public A {
public:
    B() { printf("ctor: B is called!\\n"); }
    ~B() { printf("dtor: B is called!\\n"); }
};
int main() {
    B b;
    return 0;
}
// Output:
// ctor: A is called!
// ctor: B is called!
// dtor: B is called!
// dtor: A is called!`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Constructor/destructor order rules:', 'Regulile ordinii constructorilor/destructorilor:')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1 mt-1">
            <li>{t('First, all base class constructors are called in inheritance declaration order (left-to-right)', 'Mai întâi, toți constructorii claselor de bază sunt apelați în ordinea declarării moștenirii (stânga-dreapta)')}</li>
            <li>{t('Then, constructors for data members are called (top-to-bottom definition order)', 'Apoi, constructorii membrilor date sunt apelați (ordine de definiție de sus în jos)')}</li>
            <li>{t('Initialization values for basic types, references, constants are applied in definition order', 'Valorile de inițializare pentru tipuri de bază, referințe, constante sunt aplicate în ordinea definiției')}</li>
            <li>{t('Finally, the constructor body of the class itself executes', 'În final, corpul constructorului clasei se execută')}</li>
          </ol>
          <p className="text-sm mt-2">{t('Destructors are called in reverse order (4 → 1).', 'Destructorii sunt apelați în ordine inversă (4 → 1).')}</p>
        </Box>

        <Code>{`class A { public: A(int x) { printf("ctor: A\\n"); } ~A() { printf("dtor: A\\n"); } };
class B { public: B() { printf("ctor: B\\n"); } ~B() { printf("dtor: B\\n"); } };
class C { public: C(bool n) { printf("ctor: C\\n"); } ~C() { printf("dtor: C\\n"); } };
class D : public B, public A {
    C c;
public:
    D() : c(true), A(100), B() { printf("ctor: D\\n"); }
    ~D() { printf("dtor: D\\n"); }
};
int main() { D d; return 0; }
// Output: ctor: B → ctor: A → ctor: C → ctor: D
//         dtor: D → dtor: C → dtor: A → dtor: B`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Important:', 'Important:')}</p>
          <p className="text-sm">{t('The order in the member initializer list does NOT change the constructor call order! Even if you write A(100), B() in the initializer list, B::B() is still called first because B appears first in the inheritance declaration.', 'Ordinea din lista de inițializare NU schimbă ordinea apelurilor constructorilor! Chiar dacă scrieți A(100), B() în lista de inițializare, B::B() este apelat primul deoarece B apare prima în declarația de moștenire.')}</p>
        </Box>

        <Toggle
          question={t('If class C inherits from B and A (in that order) and has a data member of type D, what is the constructor call order?', 'Dacă clasa C moștenește din B și A (în această ordine) și are un membru de tip D, care este ordinea apelării constructorilor?')}
          answer={t('First B::B() (first base class), then A::A() (second base class), then D::D() (data member constructor), and finally C::C() body. Destructors are called in reverse: C body, D, A, B.', 'Mai întâi B::B() (prima clasă de bază), apoi A::A() (a doua clasă de bază), apoi D::D() (constructorul membrului dat), și în final corpul C::C(). Destructorii sunt apelați invers: corpul C, D, A, B.')}
        />
      </Section>

      {/* ── 2. Virtual Methods ── */}
      <Section title={t('2. Virtual Methods', '2. Metode Virtuale')} id="oop-course_5-virtual" checked={!!checked['oop-course_5-virtual']} onCheck={() => toggleCheck('oop-course_5-virtual')}>
        <p>{t('When a derived class defines a method with the same name as the base class, it hides the base method:', 'Când o clasă derivată definește o metodă cu același nume ca în clasa de bază, aceasta ascunde metoda de bază:')}</p>

        <Code>{`class A {
public:
    void Set() { printf("A"); }
};
class B : public A {
public:
    void Set() { printf("B"); }
};
void main() {
    B b;
    b.Set();       // prints "B" — B hides A::Set
    A* a = &b;
    a->Set();      // prints "A" — uses A*, not the actual type!
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Problem:', 'Problemă:')}</p>
          <p className="text-sm">{t('When using a base class pointer (A*) pointing to a derived object (B), non-virtual methods resolve based on the pointer type, not the actual object type.', 'Când se folosește un pointer de clasă de bază (A*) care indică un obiect derivat (B), metodele non-virtuale se rezolvă pe baza tipului pointerului, nu a tipului real al obiectului.')}</p>
        </Box>

        <Box type="definition">
          <p className="font-bold">{t('Virtual Methods', 'Metode virtuale')}</p>
          <p className="text-sm">{t('The "virtual" keyword makes a method part of the instance. When called through a pointer, the actual object\'s method is invoked (not the pointer type\'s method). The derived class overrides (not hides) the base method.', 'Cuvântul cheie "virtual" face metoda parte a instanței. Când este apelată prin pointer, metoda obiectului real este invocată (nu metoda tipului pointerului). Clasa derivată suprascrie (nu ascunde) metoda de bază.')}</p>
        </Box>

        <Code>{`class A {
public:
    virtual void Set() { printf("A"); }  // virtual!
};
class B : public A {
public:
    void Set() { printf("B"); }  // overrides A::Set
};
void main() {
    B b;
    A* a = &b;
    a->Set();  // prints "B" — virtual dispatch finds B::Set
}`}</Code>

        <p className="font-bold mt-4">{t('Polymorphism', 'Polimorfism')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Polymorphism', 'Polimorfism')}</p>
          <p className="text-sm">{t('The ability to access instances of different classes through the same interface. In C++, this translates into automatically casting a pointer to a derived class to its base class, with virtual dispatch calling the correct method.', 'Capacitatea de a accesa instanțe ale unor clase diferite prin aceeași interfață. În C++, aceasta se traduce prin conversia automată a unui pointer la o clasă derivată către clasa de bază, cu apelul virtual invocând metoda corectă.')}</p>
        </Box>

        <Code>{`class Figure {
public:
    virtual void Draw() { printf("Figure"); }
};
class Circle : public Figure {
public:
    void Draw() { printf("Circle"); }
};
class Square : public Figure {
public:
    void Draw() { printf("Square"); }
};
void main() {
    Figure *f[2];
    f[0] = new Circle();
    f[1] = new Square();
    for (int index = 0; index < 2; index++)
        f[index]->Draw();
    // prints "Circle" then "Square"
    // without virtual, would print "Figure" twice!
}`}</Code>

        <p className="font-bold mt-4">{t('Virtual Destructors', 'Destructori virtuali')}</p>

        <Code>{`class Figure {
public:
    virtual void Draw() { printf("Figure"); }
    ~Figure() { printf("Delete Figure\\n"); }         // non-virtual!
};
// ... Circle and Square derive from Figure ...
void main() {
    Figure *f[2];
    f[0] = new Circle();
    f[1] = new Square();
    for (int index = 0; index < 2; index++)
        delete f[index];
    // prints "Delete Figure" twice — Circle/Square destructors NOT called!
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Always make destructors virtual in base classes!', 'Faceți întotdeauna destructorii virtuali în clasele de bază!')}</p>
          <p className="text-sm">{t('Without a virtual destructor, deleting through a base pointer only calls the base destructor. If derived classes allocate memory, this causes memory leaks.', 'Fără un destructor virtual, ștergerea prin pointer de bază apelează doar destructorul de bază. Dacă clasele derivate alocă memorie, aceasta cauzează memory leak-uri.')}</p>
        </Box>

        <Code>{`class Figure {
public:
    virtual void Draw() { printf("Figure"); }
    virtual ~Figure() { printf("Delete Figure\\n"); }  // virtual!
};
// Now: delete f[0] prints "Delete Circle" then "Delete Figure"
//      delete f[1] prints "Delete Square" then "Delete Figure"`}</Code>

        <p className="font-bold mt-4">{t('override and final specifiers (C++11)', 'Specificatorii override și final (C++11)')}</p>

        <Code>{`class A {
public:
    virtual bool Odd(int x) { return x % 2 == 0; }
};
class B : public A {
public:
    // ERROR: does not override — parameter is char, not int!
    virtual bool Odd(char x) override { return x % 3 == 0; }
    // error C3668: method with override specifier did not override
    //              any base class methods
};

// Correct version:
class B : public A {
public:
    virtual bool Odd(int x) override { return x % 3 == 0; }
    // OK: same signature, override confirmed
};`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('override and final:', 'override și final:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li><strong>override</strong> — {t('Tells the compiler this method must override a base class virtual method. Compilation fails if signatures don\'t match.', 'Spune compilatorului că această metodă trebuie să suprascrie o metodă virtuală a clasei de bază. Compilarea eșuează dacă semnăturile nu corespund.')}</li>
            <li><strong>final</strong> ({t('on method', 'pe metodă')}) — {t('Prevents further derived classes from overriding this method.', 'Împiedică clasele derivate ulterioare să suprascrie această metodă.')}</li>
            <li><strong>final</strong> ({t('on class', 'pe clasă')}) — {t('Prevents any class from inheriting from this class.', 'Împiedică orice clasă să moștenească din această clasă.')}</li>
          </ul>
        </Box>

        <Code>{`struct A {
    virtual bool Odd(int x) = 0;
};
struct B : public A {
    virtual bool Odd(int x) override final { return x % 2 == 0; }
    // override: confirms it overrides A::Odd
    // final: no class derived from B can override Odd
};
struct C : public B {
    // virtual bool Odd(int x) { ... }
    // ERROR: 'B::Odd' declared as 'final' cannot be overridden
};

// final on class:
struct B final : public A {
    virtual bool Odd(int x) override { return x % 2 == 0; }
};
struct C : public B { };  // ERROR: cannot inherit from 'B' as 'final'`}</Code>

        <Toggle
          question={t('If A has virtual bool Odd(int x) and B inherits A but declares virtual bool Odd(char x), what happens when calling a->Odd(3) where a is A* pointing to a B instance?', 'Dacă A are virtual bool Odd(int x) și B moștenește A dar declară virtual bool Odd(char x), ce se întâmplă la apelul a->Odd(3) unde a este A* spre o instanță B?')}
          answer={t('B does NOT override A::Odd because the parameter types differ (char vs int). B will have 2 Odd methods. Since a is of type A*, it calls A::Odd(int), printing 0 (false). The override keyword would catch this mistake at compile time.', 'B NU suprascrie A::Odd deoarece tipurile parametrilor diferă (char vs int). B va avea 2 metode Odd. Deoarece a este de tip A*, se apelează A::Odd(int), afișând 0 (false). Cuvântul cheie override ar detecta această greșeală la compilare.')}
        />
      </Section>

      {/* ── 3. How Virtual Methods Are Modeled (vtables) ── */}
      <Section title={t('3. vtables — How the Compiler Models Virtual Methods', '3. vtable — Cum modelează compilatorul metodele virtuale')} id="oop-course_5-vtables" checked={!!checked['oop-course_5-vtables']} onCheck={() => toggleCheck('oop-course_5-vtables')}>
        <Box type="definition">
          <p className="font-bold">vfptr (Virtual Function Pointer)</p>
          <p className="text-sm">{t('Using the "virtual" keyword forces the compiler to add a hidden data member — a pointer to a list of function pointers (the vtable). This pointer, called vfptr, is the first field in the class. It points to a global table (VFTable) containing addresses of all virtual methods.', 'Utilizarea cuvântului cheie "virtual" forțează compilatorul să adauge un membru dat ascuns — un pointer la o listă de pointeri la funcții (vtable). Acest pointer, numit vfptr, este primul câmp din clasă. Indică spre un tabel global (VFTable) care conține adresele tuturor metodelor virtuale.')}</p>
        </Box>

        <Code>{`class A {
public:
    int a1, a2, a3;
    void Set() { printf("A"); }           // no virtual
};
// sizeof(A) = 12 (three ints)

class A {
public:
    int a1, a2, a3;
    virtual void Set() { printf("A"); }   // virtual!
};
// sizeof(A) = 16 on x86 (vfptr + three ints)
// sizeof(A) = 24 on x64 (vfptr is 8 bytes + padding)`}</Code>

        <Box type="formula">
          <p className="font-bold">{t('Memory layout with virtual methods:', 'Layout-ul memoriei cu metode virtuale:')}</p>
          <p className="text-sm font-mono">[vfptr][a1][a2][a3]</p>
          <p className="text-sm mt-1">{t('vfptr → VFTable: [ptr to A::Set][RTTI info]', 'vfptr → VFTable: [ptr la A::Set][info RTTI]')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Compiler behavior with constructors:', 'Comportamentul compilatorului cu constructorii:')}</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>{t('If a class has virtual methods but no constructor, the compiler auto-generates one to initialize vfptr', 'Dacă o clasă are metode virtuale dar niciun constructor, compilatorul generează automat unul pentru a inițializa vfptr')}</li>
          <li>{t('If a constructor exists, the compiler adds vfptr initialization code at the beginning', 'Dacă un constructor există, compilatorul adaugă codul de inițializare vfptr la început')}</li>
          <li>{t('The vfptr initialization code is added to every constructor (default, parameterized, copy constructor)', 'Codul de inițializare vfptr este adăugat la fiecare constructor (implicit, parametrizat, constructor de copiere)')}</li>
          <li>{t('The assignment operator does NOT get vfptr initialization code', 'Operatorul de atribuire NU primește cod de inițializare vfptr')}</li>
        </ul>

        <Code>{`// Pseudo C/C++ equivalent of what the compiler generates:
struct A_VirtualFunctions {
    int (*Calcul)();        // function pointer
};

class A {
public:
    A_VirtualFunctions *vfPtr;   // hidden first field
    int x;
    int A_Calcul() { return 0; }
    A() {
        vfPtr = &Global_A_vfPtr;  // compiler adds this!
        x = 0;
    }
};

A_VirtualFunctions Global_A_vfPtr;
Global_A_vfPtr.Calcul = &A::A_Calcul;

void main() {
    A a;
    A* a2 = &a;
    a2->vfPtr->Calcul();  // virtual dispatch via vfptr
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Direct call vs pointer call:', 'Apel direct vs apel prin pointer:')}</p>
          <p className="text-sm">{t('A virtual method is called via the vfptr table ONLY when accessed through a pointer. When called directly on an object (a.Calcul()), the compiler uses the method\'s exact address — no vtable lookup.', 'O metodă virtuală este apelată prin tabelul vfptr DOAR când este accesată printr-un pointer. Când este apelată direct pe un obiect (a.Calcul()), compilatorul folosește adresa exactă a metodei — fără căutare în vtable.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Overriding in vtables:', 'Suprascrierea în vtable:')}</p>
        <Code>{`class A {
public:
    int x, y;
    virtual int Suma() { return x + y; }
    virtual int Diferenta() { return x - y; }
    virtual int Produs() { return x * y; }
};
class B : public A {
public:
    int Suma() { return 1; }  // overrides A::Suma
};

// VFTable for A: [A::Suma] [A::Diferenta] [A::Produs]
// VFTable for B: [B::Suma] [A::Diferenta] [A::Produs]
//                 ^^^^^^^^ overridden!`}</Code>

        <p className="mt-3">{t('A derived class can also add new virtual methods to its vtable:', 'O clasă derivată poate adăuga și metode virtuale noi în vtable-ul său:')}</p>
        <Code>{`class B : public A {
public:
    int Suma() { return 1; }
    virtual int Modul() { return 0; }  // new virtual method
};
// VFTable for B: [B::Suma] [A::Diferenta] [A::Produs] [B::Modul]`}</Code>

        <p className="font-bold mt-4">{t('Multiple inheritance — multiple vfptrs:', 'Moștenire multiplă — vfptr-uri multiple:')}</p>
        <Code>{`class A {
public:
    int a1;
    virtual int Suma() { return 1; }
    virtual int Diferenta() { return 2; }
};
class B {
public:
    int b1, b2;
    virtual int Inmultire() { return 3; }
    virtual int Impartire() { return 4; }
};
class C : public A, public B {
public:
    int x, y;
};

// Memory layout of C (x86):
// Offset  Field
// +0      A::vfptr → [A::Suma, A::Diferenta]
// +4      A::a1
// +8      B::vfptr → [B::Inmultire, B::Impartire]
// +12     B::b1
// +16     B::b2
// +20     C::x
// +24     C::y`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('vfptr can be manipulated!', 'vfptr poate fi manipulat!')}</p>
          <p className="text-sm">{t('Since vfptr is just a pointer in memory, it can be overwritten using memcpy. For example, copying vfptr from object "b" of type B to object "a" of type A makes a->Print() call B::Print(). However, any constructor call (including copy constructor) resets vfptr to the correct value.', 'Deoarece vfptr este doar un pointer în memorie, poate fi suprascris cu memcpy. De exemplu, copierea vfptr din obiectul "b" de tip B în obiectul "a" de tip A face ca a->Print() să apeleze B::Print(). Totuși, orice apel de constructor (inclusiv constructorul de copiere) resetează vfptr la valoarea corectă.')}</p>
        </Box>

        <Toggle
          question={t('Why does a class with only 3 int members have sizeof=16 on x86 when it has virtual methods, instead of sizeof=12?', 'De ce are o clasă cu doar 3 membri int sizeof=16 pe x86 când are metode virtuale, în loc de sizeof=12?')}
          answer={t('The virtual keyword causes the compiler to add a hidden vfptr pointer (4 bytes on x86, 8 bytes on x64) as the first field. So the layout is: vfptr (4 bytes) + a1 (4) + a2 (4) + a3 (4) = 16 bytes on x86. On x64, vfptr is 8 bytes plus padding, giving 24 bytes.', 'Cuvântul cheie virtual face compilatorul să adauge un pointer vfptr ascuns (4 bytes pe x86, 8 bytes pe x64) ca prim câmp. Deci layout-ul este: vfptr (4 bytes) + a1 (4) + a2 (4) + a3 (4) = 16 bytes pe x86. Pe x64, vfptr are 8 bytes plus padding, dând 24 bytes.')}
        />
      </Section>

      {/* ── 4. Covariance ── */}
      <Section title={t('4. Covariance', '4. Covarianță')} id="oop-course_5-covariance" checked={!!checked['oop-course_5-covariance']} onCheck={() => toggleCheck('oop-course_5-covariance')}>
        <Box type="definition">
          <p className="font-bold">{t('Covariance', 'Covarianță')}</p>
          <p className="text-sm">{t('Covariance allows a virtual method in a derived class to change its return type to a pointer/reference of the derived class (instead of the base class). The new return type must be derived from the original return type.', 'Covarianța permite unei metode virtuale din clasa derivată să schimbe tipul de retur la un pointer/referință al clasei derivate (în loc de clasa de bază). Noul tip de retur trebuie să fie derivat din tipul de retur original.')}</p>
        </Box>

        <p>{t('Consider a clone() pattern:', 'Considerăm un pattern clone():')}</p>
        <Code>{`class A {
public:
    int a1, a2;
    virtual A* clone() { return new A(); }
};
class B : public A {
public:
    int b1, b2;
    virtual A* clone() { return new B(); }
};
void main() {
    B *b = new B();
    B *ptrB;
    ptrB = b->clone();  // ERROR: cannot convert A* to B*
}`}</Code>

        <p className="font-bold mt-3">{t('Two solutions:', 'Două soluții:')}</p>
        <Code>{`// Solution 1: Explicit cast
ptrB = (B*) b->clone();

// Solution 2: Covariance — change return type in B
class B : public A {
public:
    int b1, b2;
    virtual B* clone() { return new B(); }  // B* instead of A*
};
void main() {
    B *b = new B();
    B *ptrB;
    ptrB = b->clone();  // OK! B::clone returns B*
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Covariance is related to the pointer type:', 'Covarianța este legată de tipul pointerului:')}</p>
          <p className="text-sm">{t('Even if B::clone actually returns B*, when called through an A* pointer the compiler expects A*. So "A* a = (A*)b; ptrB = a->clone();" will NOT compile without a cast, because the compiler sees A*::clone returning A*.', 'Chiar dacă B::clone returnează de fapt B*, când este apelat prin pointer A* compilatorul se așteaptă la A*. Deci "A* a = (A*)b; ptrB = a->clone();" NU va compila fără cast, deoarece compilatorul vede A*::clone returnând A*.')}</p>
        </Box>

        <Code>{`// This will NOT compile:
class B : public A {
public:
    virtual int* clone() { return new int(); }
};
// error C2555: overriding virtual function return type differs
//              and is not covariant from 'A::clone'
// The return type can only be changed to a type derived from A*`}</Code>

        <Box type="theorem">
          <p>{t('Covariant return types must be pointers or references to classes derived from the original return type. Unrelated types (like int*) are not allowed.', 'Tipurile de retur covariante trebuie să fie pointeri sau referințe la clase derivate din tipul de retur original. Tipuri nerelaționate (precum int*) nu sunt permise.')}</p>
        </Box>

        <Toggle
          question={t('If A::clone returns A* and B (derived from A) uses covariance to return B*, what happens when calling clone through an A* pointer pointing to a B object?', 'Dacă A::clone returnează A* și B (derivat din A) folosește covarianța pentru a returna B*, ce se întâmplă la apelul clone printr-un pointer A* care indică un obiect B?')}
          answer={t('The compiler calls B::clone (via virtual dispatch), but since the pointer is A*, the result type is A* (not B*). You would need an explicit cast to assign the result to a B* variable. During execution, B::clone runs regardless.', 'Compilatorul apelează B::clone (prin dispatch virtual), dar deoarece pointerul este A*, tipul rezultat este A* (nu B*). Ar fi nevoie de un cast explicit pentru a atribui rezultatul unei variabile B*. La execuție, B::clone rulează indiferent.')}
        />
      </Section>

      {/* ── 5. Abstract Classes (Interfaces) ── */}
      <Section title={t('5. Abstract Classes (Interfaces)', '5. Clase Abstracte (Interfețe)')} id="oop-course_5-abstract" checked={!!checked['oop-course_5-abstract']} onCheck={() => toggleCheck('oop-course_5-abstract')}>
        <Box type="definition">
          <p className="font-bold">{t('Pure Virtual Method', 'Metodă pur virtuală')}</p>
          <p className="text-sm">{t('A virtual method without a body, defined by adding "= 0" at the end of its declaration. A class with at least one pure virtual method is an abstract class — it cannot be instantiated.', 'O metodă virtuală fără corp, definită prin adăugarea "= 0" la sfârșitul declarației. O clasă cu cel puțin o metodă pur virtuală este o clasă abstractă — nu poate fi instanțiată.')}</p>
        </Box>

        <Code>{`class A {
public:
    int a1, a2, a3;
    virtual void Set() = 0;  // pure virtual
};

void main() {
    A a;  // ERROR: cannot instantiate abstract class
}
// error C2259: 'A': cannot instantiate abstract class
// note: 'void A::Set(void)': is abstract`}</Code>

        <Code>{`class A {
public:
    int a1, a2, a3;
    virtual void Set() = 0;
};
class B : A {
public:
    void Set() { /* implementation */ }
};
void main() {
    B b;    // OK: B implements Set
    A* a;   // OK: pointers to abstract classes are allowed
}`}</Code>

        <Box type="theorem">
          <p>{t('To create an instance of a class, ALL pure virtual methods (defined in that class or inherited) MUST be implemented. A pointer to an abstract class is allowed and recommended for polymorphism.', 'Pentru a crea o instanță a unei clase, TOATE metodele pur virtuale (definite în acea clasă sau moștenite) TREBUIE implementate. Un pointer la o clasă abstractă este permis și recomandat pentru polimorfism.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Abstract Class vs Interface', 'Clasă abstractă vs Interfață')}</p>
        <Box type="definition">
          <p className="font-bold">{t('Differences:', 'Diferențe:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li><strong>{t('Abstract class', 'Clasă abstractă')}</strong> — {t('Has at least one pure virtual method. Can have data members, regular methods, constructors, destructors.', 'Are cel puțin o metodă pur virtuală. Poate avea membri date, metode obișnuite, constructori, destructori.')}</li>
            <li><strong>{t('Interface', 'Interfață')}</strong> ({t('Java/C# concept', 'concept Java/C#')}) — {t('Cannot have data members or non-pure-virtual methods. In C++ there is no "interface" keyword (except MSVC\'s __interface extension). Use structs for interfaces since default access is public.', 'Nu poate avea membri date sau metode non-pur-virtuale. În C++ nu există cuvântul cheie "interface" (cu excepția extensiei __interface din MSVC). Folosiți struct pentru interfețe deoarece accesul implicit este public.')}</li>
          </ul>
        </Box>

        <Code>{`// C++ "interface" using struct (all public by default)
struct IDrawable {
    virtual void Draw() = 0;
    virtual ~IDrawable() {}
};

struct IResizable {
    virtual void Resize(int w, int h) = 0;
    virtual ~IResizable() {}
};

class Widget : public IDrawable, public IResizable {
public:
    void Draw() { /* ... */ }
    void Resize(int w, int h) { /* ... */ }
};`}</Code>

        <Toggle
          question={t('Can you create a pointer of type A* if A is an abstract class? Can you create an instance of type A?', 'Puteți crea un pointer de tip A* dacă A este o clasă abstractă? Puteți crea o instanță de tip A?')}
          answer={t('You CAN create a pointer (A* a;) — this is valid and commonly used for polymorphism. You CANNOT create an instance (A a;) — this is a compilation error because abstract classes cannot be instantiated.', 'PUTEȚI crea un pointer (A* a;) — acesta este valid și folosit frecvent pentru polimorfism. NU PUTEȚI crea o instanță (A a;) — aceasta este o eroare de compilare deoarece clasele abstracte nu pot fi instanțiate.')}
        />
      </Section>

      {/* ── 6. Memory Alignment in Inheritance ── */}
      <Section title={t('6. Memory Alignment in Inheritance', '6. Alinierea Memoriei în Moștenire')} id="oop-course_5-memory" checked={!!checked['oop-course_5-memory']} onCheck={() => toggleCheck('oop-course_5-memory')}>
        <p>{t('When building a derived class in memory, base class fields are placed first using the left-to-right rule for inheritance order:', 'La construirea unei clase derivate în memorie, câmpurile clasei de bază sunt plasate primele folosind regula stânga-dreapta pentru ordinea moștenirii:')}</p>

        <Code>{`class A { public: int a1, a2, a3; };  // sizeof = 12
class B : public A { public: int b1, b2; };  // sizeof = 20

// Memory layout of B:
// Offset  Field
// +0      A::a1
// +4      A::a2
// +8      A::a3
// +12     B::b1
// +16     B::b2`}</Code>

        <Code>{`class A { public: int a1, a2, a3; };  // sizeof = 12
class B { public: int b1, b2; };     // sizeof = 8
class C : public A, public B { public: int c1, c2; };  // sizeof = 28

// Layout: [A::a1][A::a2][A::a3][B::b1][B::b2][C::c1][C::c2]

// If order is reversed:
class C : public B, public A { public: int c1, c2; };  // sizeof = 28
// Layout: [B::b1][B::b2][A::a1][A::a2][A::a3][C::c1][C::c2]`}</Code>

        <p className="font-bold mt-4">{t('The Diamond Problem', 'Problema Diamantului')}</p>
        <Box type="warning">
          <p className="font-bold">{t('Ambiguous fields in multiple inheritance:', 'Câmpuri ambigue în moștenirea multiplă:')}</p>
          <p className="text-sm">{t('If C inherits from both A and B, and B also inherits from A, the fields from A are duplicated in C. Accessing them causes ambiguity errors.', 'Dacă C moștenește din A și B, și B moștenește tot din A, câmpurile din A sunt duplicate în C. Accesarea lor cauzează erori de ambiguitate.')}</p>
        </Box>

        <Code>{`class A { public: int a1, a2, a3; };
class B : public A { public: int b1, b2; };
class C : public A, public B { public: int c1, c2; };
// warning C4584: 'C': base-class 'A' is already a base-class of 'B'

// Layout of C (A fields appear TWICE):
// +0  A::a1      (from direct A inheritance)
// +4  A::a2
// +8  A::a3
// +12 B::A::a1   (from B's inheritance of A)
// +16 B::A::a2
// +20 B::A::a3
// +24 B::b1
// +28 B::b2
// +32 C::c1
// +36 C::c2

void main() {
    C c;
    // c.a1 = 10;        // ERROR: ambiguous access of 'a1'
    c.A::a1 = 10;        // OK: direct A inheritance
    c.B::A::a1 = 20;     // OK: A via B inheritance
}`}</Code>

        <p className="font-bold mt-4">{t('Virtual Inheritance (solution to Diamond Problem)', 'Moștenirea virtuală (soluția problemei Diamantului)')}</p>

        <Box type="definition">
          <p className="font-bold">{t('Virtual Inheritance', 'Moștenirea virtuală')}</p>
          <p className="text-sm">{t('Using the "virtual" keyword in the inheritance declaration ensures that fields from the virtually-inherited base class appear only once. Both classes in the diamond must use virtual inheritance.', 'Utilizarea cuvântului cheie "virtual" în declarația de moștenire asigură că câmpurile din clasa de bază moștenită virtual apar o singură dată. Ambele clase din diamant trebuie să folosească moștenire virtuală.')}</p>
        </Box>

        <Code>{`class A { public: int a1, a2, a3; };
class B : public virtual A { public: int b1, b2; };
class C : public virtual A, public B { public: int c1, c2; };

void main() {
    C c;
    c.a1 = 10;  // OK: no ambiguity, A fields exist only once
    c.b1 = 20;  // OK
}`}</Code>

        <p className="mt-3">{t('With virtual inheritance, the compiler adds a pointer to an offset table as the first field. The virtually-inherited base class fields are placed at the end:', 'Cu moștenire virtuală, compilatorul adaugă un pointer la un tabel de offset-uri ca prim câmp. Câmpurile clasei de bază moștenite virtual sunt plasate la sfârșit:')}</p>

        <Code>{`// Memory layout with virtual inheritance:
// Offset  Field
// +0      Ptr to Class C Variable Offsets Table
// +4      B::b1
// +8      B::b2
// +12     C::c1
// +16     C::c2
// +20     A::a1    ← virtual base placed at end
// +24     A::a2
// +28     A::a3

// Offsets Table:
// +0  offset 0 (self)
// +4  offset 20 (Virtual A start)`}</Code>

        <Box type="theorem">
          <p>{t('Accessing a virtually-inherited field requires 3 steps: (1) read the offset table pointer, (2) read the offset from the table, (3) add offset to object address. This adds indirection compared to normal inheritance.', 'Accesarea unui câmp moștenit virtual necesită 3 pași: (1) citirea pointerului la tabelul de offset-uri, (2) citirea offset-ului din tabel, (3) adăugarea offset-ului la adresa obiectului. Aceasta adaugă indirecție comparativ cu moștenirea normală.')}</p>
        </Box>

        <Code>{`// Disassembly for c.a1 = 10:
// mov eax, dword ptr [c]        // step 1: get offset table ptr
// mov ecx, dword ptr [eax+4]    // step 2: read offset of A (=20)
// mov dword ptr [c+ecx], 10     // step 3: write to c + offset`}</Code>

        <Toggle
          question={t('In virtual inheritance, why does the compiler generate a constructor with a bool parameter, and what does it control?', 'În moștenirea virtuală, de ce generează compilatorul un constructor cu un parametru bool și ce controlează acesta?')}
          answer={t('The bool parameter tells the constructor whether to create the offset table for virtual base classes. When called with true (for the most-derived class), the table is initialized. When called with false (for intermediate base class constructors like B::B), the table setup is skipped because the most-derived class already handles it.', 'Parametrul bool spune constructorului dacă să creeze tabelul de offset-uri pentru clasele de bază virtuale. Când este apelat cu true (pentru clasa cea mai derivată), tabelul este inițializat. Când este apelat cu false (pentru constructorii claselor de bază intermediare precum B::B), configurarea tabelului este omisă deoarece clasa cea mai derivată o gestionează deja.')}
        />
      </Section>
    </>
  );
}
